
import React, { Suspense, lazy, useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { List as VirtualList } from 'react-window';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'motion/react';
import { isWithinInterval, formatDistanceToNow } from 'date-fns';
import { getOptimizedMediaUrl, getAvatarInitial } from '@/lib/media-conversion';
import { sanitizeHtml, cn } from '@/lib/utils';
import { useFilteredList } from '@/hooks/useFilteredList';
import type { User } from '@/types';
import { formatPower } from '@/lib/utils';
import { RosterFilterPanel } from './components/RosterFilterPanel';
import {
  Card,
  CardContent,
  Button,
  PrimitiveButton,
  Badge,
  Slider,
  Skeleton,
} from '@/components';

import {
  Volume2,
  VolumeX,
  Image,
  Play,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { PageFilterBar } from '@/components';
import { useUIStore } from '../../store';
import type { RosterFilterState } from '../../hooks/useFilterPresets';
import { useMembers } from '../../hooks/useServerState';
import { storage, STORAGE_KEYS } from '../../lib/storage';
import { membersAPI } from '../../lib/api';

const VIRTUAL_MEMBER_THRESHOLD = 200;
const VIRTUAL_MEMBER_ROW_HEIGHT = 120;

type LegacyIconProps = React.SVGProps<SVGSVGElement> & { sx?: Record<string, unknown> };

function resolveLegacyIconColor(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  switch (value) {
    case 'primary.main':
      return '#7c3aed';
    case 'error.main':
      return '#ef4444';
    case 'warning.main':
      return '#f59e0b';
    default:
      return value;
  }
}

function toLegacyIcon(Icon: LucideIcon) {
  return function LegacyIcon({ sx, style, ...rest }: LegacyIconProps) {
    const nextStyle: React.CSSProperties = { ...(style ?? {}) };
    if (sx && typeof sx === 'object') {
      for (const [key, value] of Object.entries(sx)) {
        if (value == null || typeof value === 'object') {
          continue;
        }
        if (key === 'fontSize') {
          nextStyle.width = value as React.CSSProperties['width'];
          nextStyle.height = value as React.CSSProperties['height'];
          continue;
        }
        if (key === 'ml') {
          nextStyle.marginLeft = typeof value === 'number' ? `${value * 8}px` : (value as React.CSSProperties['marginLeft']);
          continue;
        }
        if (key === 'color') {
          const resolvedColor = resolveLegacyIconColor(value);
          if (resolvedColor) {
            nextStyle.color = resolvedColor;
          }
          continue;
        }
        (nextStyle as Record<string, unknown>)[key] = value;
      }
    }
    return <Icon {...rest} style={nextStyle} aria-hidden={rest['aria-hidden'] ?? true} />;
  };
}

const VolumeUpIcon = toLegacyIcon(Volume2);
const VolumeOffIcon = toLegacyIcon(VolumeX);
const ImageIcon = toLegacyIcon(Image);
const PlayArrowIcon = toLegacyIcon(Play);
const PeopleIcon = toLegacyIcon(Users);
const RosterProfileDialog = lazy(() => import('./components/RosterProfileDialog'));

// Helper to determine active status based on availability
function getAvailabilityStatus(member: User): 'active' | 'inactive' | 'unknown' {
  // 1. Check vacation status
  if (member.vacation_start && member.vacation_end) {
    const now = new Date();
    try {
      const start = new Date(member.vacation_start);
      const end = new Date(member.vacation_end);
      if (isWithinInterval(now, { start, end })) {
        return 'inactive';
      }
    } catch {
      console.warn('Invalid vacation dates for member', member.id);
    }
  }

  // 2. Check scheduled availability if present
  if (member.availability && member.availability.length > 0) {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., 'Monday'
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes from midnight

    const todaySchedule = member.availability.find(d => d.day === currentDay);
    if (todaySchedule?.blocks) {
      const isAvailable = todaySchedule.blocks.some(block => {
        try {
          const [startH, startM] = block.start.split(':').map(Number);
          const [endH, endM] = block.end.split(':').map(Number);
          const startTotal = startH * 60 + startM;
          const endTotal = endH * 60 + endM;
          
          if (endTotal < startTotal) {
             return currentTime >= startTotal || currentTime <= endTotal;
          }
          return currentTime >= startTotal && currentTime <= endTotal;
        } catch { return false; }
      });
      return isAvailable ? 'active' : 'inactive';
    }
    return 'inactive';
  }

  // 3. Fallback to global active status if no specific availability data
  return member.active_status === 'active' ? 'unknown' : 'inactive';
}

function applyRosterFilters(members: User[], filters: RosterFilterState): User[] {
  return members.filter((member) => {
    if (filters.roles.length > 0 && !filters.roles.includes(member.role || '')) {
      return false;
    }

    if (filters.classes.length > 0) {
      const memberClasses = member.classes || [];
      const hasClassMatch = memberClasses.some((value) => filters.classes.includes(value));
      if (!hasClassMatch) {
        return false;
      }
    }

    const power = member.power || 0;
    if (power < filters.powerRange[0] || power > filters.powerRange[1]) {
      return false;
    }

    if (filters.status !== 'all') {
      const availability = getAvailabilityStatus(member);
      if (availability !== filters.status) {
        return false;
      }
    }

    if (filters.hasMedia) {
      const imageCount = member.media_counts?.images || 0;
      const videoCount = member.media_counts?.videos || 0;
      const mediaCount = member.media?.length || 0;
      if (imageCount + videoCount + mediaCount <= 0) {
        return false;
      }
    }

    return true;
  });
}

const DEFAULT_ROSTER_FILTERS: RosterFilterState = {
  roles: [],
  classes: [],
  powerRange: [0, 999999999],
  status: 'all',
  hasMedia: false,
};

export async function resolveRosterHoverAudioUrl(
  member: User,
  cache: Map<string, string | null>,
  getMemberDetail: (memberId: string) => Promise<User>
): Promise<string | null> {
  if (member.audio_url) {
    return member.audio_url;
  }

  if (cache.has(member.id)) {
    return cache.get(member.id) || null;
  }

  try {
    const detail = await getMemberDetail(member.id);
    const resolved =
      detail.media?.find((item) => item.type === 'audio')?.url ||
      detail.audio_url ||
      null;
    cache.set(member.id, resolved);
    return resolved;
  } catch {
    cache.set(member.id, null);
    return null;
  }
}

function useGlobalAudio() {
  const { audioSettings } = useUIStore();
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
    if (playerRef.current) {
      playerRef.current.pause();
      playerRef.current.currentTime = 0;
    }
    setActiveId(null);
  }, []);

  const play = useCallback((url: string, id: string) => {
    if (audioSettings.mute || !url) return;
    
    stop(); // Ensure previous is stopped

    if (!playerRef.current) {
      playerRef.current = new Audio();
    }

    if (playerRef.current.src !== url) {
      playerRef.current.src = url;
    }

    playerRef.current.volume = audioSettings.volume / 100;
    playerRef.current.play().catch(e => console.debug('Autoplay blocked:', e));
    setActiveId(id);
  }, [audioSettings, stop]);

  const playOnHover = useCallback((url: string, id: string) => {
    if (!url) return;
    // Debounce hover play
    hoverTimeoutRef.current = window.setTimeout(() => {
       play(url, id);
    }, 100); 
  }, [play]);

  return { play, stop, activeId, playOnHover };
}

export function shouldUseVirtualMemberList(memberCount: number): boolean {
  return memberCount >= VIRTUAL_MEMBER_THRESHOLD;
}

function VirtualMemberRow({
  index,
  style,
  members,
  onSelect,
  onHoverAudio,
  onLeaveAudio,
  activeAudioId,
}: {
  index: number;
  style: React.CSSProperties;
  members: User[];
  onSelect: (member: User) => void;
  onHoverAudio: (member: User) => void;
  onLeaveAudio: (memberId: string) => void;
  activeAudioId: string | null;
}) {
  const member = members[index];
  if (!member) {
    return null;
  }

  const isPlaying = activeAudioId === member.id;

  return (
    <div style={style} className="pb-2">
      <Card
        className="h-[112px] cursor-pointer border border-border bg-card transition-all hover:border-primary hover:shadow-md"
        onClick={() => onSelect(member)}
        onMouseEnter={() => onHoverAudio(member)}
        onMouseLeave={() => onLeaveAudio(member.id)}
      >
        {/* Virtual row card uses 8px-grid spacing to match roster card rhythm in non-virtual mode. */}
        <CardContent className="h-full p-4">
          <div className="flex h-full items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/50">
              {member.avatar_url ? (
                <img
                  src={getOptimizedMediaUrl(member.avatar_url, 'image')}
                  alt={member.username}
                  width={64}
                  height={64}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary text-xl font-black">
                  {getAvatarInitial(member.username)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-black">{member.username}</div>
              <div
                className="truncate text-xs font-semibold text-muted-foreground"
                dangerouslySetInnerHTML={sanitizeHtml(member.title_html || '')}
              />
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="text-[0.65rem] font-bold">
                  {formatPower(member.power)}
                </Badge>
                {isPlaying ? (
                  <Badge variant="default" className="text-[0.6rem] uppercase tracking-wide">
                    Audio
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function Roster() {
  const {
    data: members = [],
    isLoading,
    isError = false,
    refetch,
  } = useMembers();
  const { audioSettings, setAudioSettings, setPageTitle } = useUIStore();
  const { t } = useTranslation();
  const audioController = useGlobalAudio();

  useEffect(() => {
    setPageTitle(t('nav.roster'));
  }, [setPageTitle, t]);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'power' | 'name' | 'class'>('power');
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const audioUrlCacheRef = useRef<Map<string, string | null>>(new Map());
  const hoveredMemberIdRef = useRef<string | null>(null);
  
  // Advanced filter state
  const [filters, setFilters] = useState<RosterFilterState>(() => {
    const preferred = storage.get<RosterFilterState | null>(STORAGE_KEYS.ROSTER_FILTERS, null);
    if (preferred) return preferred;
    return storage.get<RosterFilterState>(STORAGE_KEYS.ROSTER_FILTERS_LEGACY, DEFAULT_ROSTER_FILTERS);
  });

  useEffect(() => {
    storage.set(STORAGE_KEYS.ROSTER_FILTERS, filters);
  }, [filters]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const memberSortFn = useMemo(() => {
    if (sort === 'power') return (a: any, b: any) => (b.power || 0) - (a.power || 0);
    if (sort === 'name') return (a: any, b: any) => a.username.localeCompare(b.username);
    if (sort === 'class') return (a: any, b: any) => (a.classes?.[0] || '').localeCompare(b.classes?.[0] || '');
    return undefined;
  }, [sort]);

  const membersAfterAdvancedFilters = useMemo(
    () => applyRosterFilters(members || [], filters),
    [filters, members],
  );

  const filteredMembers = useFilteredList({
    items: membersAfterAdvancedFilters,
    searchText: search,
    searchFields: ['username', 'wechat_name'] as any,
    sortFn: memberSortFn,
  });

  // Calculate distinct roles/classes for filter panel
  const { availableRoles, availableClasses } = useMemo(() => {
    const roles = Array.from(new Set(members.map((m) => m.role)));
    const classes = Array.from(new Set(members.flatMap((m) => m.classes || [])));
    return { availableRoles: roles, availableClasses: classes };
  }, [members]);

  const [page, setPage] = useState(1);
  const useVirtualList = shouldUseVirtualMemberList(filteredMembers.length);
  // Responsive pageSize handling isn't strictly necessary to be exact, simplified:
  const pageSize = 24; 
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  
  const pagedMembers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, sort, filteredMembers.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const hasAdvancedFilters = (
    filters.roles.length +
    filters.classes.length +
    (filters.status !== 'all' ? 1 : 0) +
    (filters.hasMedia ? 1 : 0) +
    (filters.powerRange[0] > 0 || filters.powerRange[1] < 999999999 ? 1 : 0)
  ) > 0;
  const hasSearchFilter = search.trim().length > 0;

  const resolveMemberAudioUrl = useCallback(async (member: User): Promise<string | null> => {
    return resolveRosterHoverAudioUrl(member, audioUrlCacheRef.current, membersAPI.get);
  }, []);

  const handleMemberHover = useCallback(
    async (member: User) => {
      hoveredMemberIdRef.current = member.id;
      const audioUrl = await resolveMemberAudioUrl(member);
      if (!audioUrl) return;

      if (hoveredMemberIdRef.current === member.id) {
        audioController.playOnHover(getOptimizedMediaUrl(audioUrl, 'audio'), member.id);
      }
    },
    [audioController, resolveMemberAudioUrl]
  );

  const handleMemberLeave = useCallback(
    (memberId: string) => {
      if (hoveredMemberIdRef.current === memberId) {
        hoveredMemberIdRef.current = null;
      }
      audioController.stop();
    },
    [audioController]
  );

  if (isLoading && (!members || members.length === 0)) {
     return (
       <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
         {Array.from({ length: 12 }).map((_, i) => (
           <Skeleton key={i} className="aspect-square rounded-xl h-full w-full" />
         ))}
       </div>
     );
  }

  // Query-failure fallback gives users a direct recovery path before entering filter/roster flows.
  if (isError && (!members || members.length === 0)) {
    return (
      <div data-testid="roster-error-state" className="p-8 text-center space-y-3">
        <h3 className="text-xl font-black">{t('roster.empty_title')}</h3>
        <p className="text-muted-foreground">{t('common.placeholder_msg')}</p>
        <div data-testid="roster-error-actions">
          <PrimitiveButton
            type="button"
            variant="secondary"
            // Retry routes back into TanStack Query refetch so roster flow can recover without navigation.
            onClick={() => {
              void refetch?.();
            }}
          >
            {t('common.retry')}
          </PrimitiveButton>
        </div>
      </div>
    );
  }

  if (!isLoading && (!members || members.length === 0)) {
    return (
      <div className="p-8 text-center space-y-2">
        <h3 className="text-xl font-black">{t('roster.empty_title')}</h3>
        <p className="text-muted-foreground">{t('roster.empty_hint')}</p>
      </div>
    );
  }

  return (
    <div className="p-0 sm:p-2 md:p-4 lg:p-8 pb-8 md:pb-0">
      <div className="min-h-[420px] flex flex-col rounded-none sm:rounded-2xl md:rounded-3xl border-0 sm:border border-border bg-card">
        
        <PageFilterBar
          search={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder={t('roster.search_placeholder')}
          category={sort}
          onCategoryChange={(v) => setSort(v as any)}
          categories={[
            { value: 'power', label: t('roster.sort_power') },
            { value: 'name', label: t('roster.sort_name') },
            { value: 'class', label: t('roster.sort_class') },
          ]}
          onAdvancedClick={() => setFilterPanelOpen(true)}
          advancedOpen={filterPanelOpen}
          hasAdvancedFilters={hasAdvancedFilters}
          resultsCount={filteredMembers.length}
          isLoading={isLoading}
          extraActions={
            <div
              data-testid="roster-audio-controls"
              className="flex items-center gap-4 px-3 py-1.5 rounded-xl border border-border bg-background"
            >
                <Slider
                    aria-label={t('roster.audio_volume')}
                    value={[audioSettings.volume]}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(_e: any, v: number | number[]) => setAudioSettings({ volume: typeof v === 'number' ? v : v[0] })}
                    className="w-32 min-w-[128px] mr-1"
                />
                <div data-testid="roster-audio-divider" className="h-5 w-px bg-border/70" aria-hidden="true" />
                {/* Primitive button preserves keyboard/button semantics for audio control tests and a11y. */}
                <PrimitiveButton
                    variant="ghost"
                    aria-label={t('roster.audio_mute')}
                    className={cn("h-6 w-6 p-0 shrink-0", audioSettings.mute ? "text-destructive" : "text-primary")}
                    onClick={() => setAudioSettings({ mute: !audioSettings.mute })}
                >
                    {audioSettings.mute ? <VolumeOffIcon sx={{ fontSize: 18 }} /> : <VolumeUpIcon sx={{ fontSize: 18 }} />}
                </PrimitiveButton>
            </div>
          }
        />

        <div className="flex-1 p-4 sm:p-4 md:p-6 bg-background">
          {filteredMembers.length > 0 ? (
            <div className="space-y-4">
              {useVirtualList ? (
                <div className="space-y-2" data-testid="roster-virtual-list">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Virtualized roster view ({filteredMembers.length})
                  </p>
                  <div className="h-[70vh] min-h-[560px] rounded-xl border border-border/60 p-2">
                    <AutoSizer
                      renderProp={({ height, width }) => (
                        <VirtualList
                          rowCount={filteredMembers.length}
                          rowHeight={VIRTUAL_MEMBER_ROW_HEIGHT}
                          rowComponent={VirtualMemberRow as any}
                          rowProps={{
                            members: filteredMembers,
                            onSelect: setSelectedMember,
                            onHoverAudio: handleMemberHover,
                            onLeaveAudio: handleMemberLeave,
                            activeAudioId: audioController.activeId,
                          } as any}
                          style={{ height: height ?? 0, width: width ?? 0 }}
                        />
                      )}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {pagedMembers.map((member) => (
                      <RosterCard
                        key={member.id}
                        member={member}
                        onClick={() => setSelectedMember(member)}
                        audio={audioController}
                        onHoverAudio={handleMemberHover}
                        onLeaveAudio={handleMemberLeave}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-between items-center pt-4">
                      <span className="text-sm font-bold text-muted-foreground">
                        {page} / {totalPages}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page <= 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                          {t('common.prev')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page >= totalPages}
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                          {t('common.next')}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-50 gap-4 min-h-[300px]">
                 <PeopleIcon sx={{ fontSize: 48, opacity: 0.5 }} />
                <h3 className="text-xl font-bold">{t('roster.empty_title')}</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">{t('roster.empty_hint')}</p>
                <div data-testid="roster-empty-actions">
                  {/* Empty-state reset action routes users back to an unfiltered roster in one click. */}
                  {(hasAdvancedFilters || hasSearchFilter) ? (
                    <PrimitiveButton
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setFilters(DEFAULT_ROSTER_FILTERS);
                        setSearchInput('');
                        setSearch('');
                      }}
                    >
                      {t('common.clear_filters')}
                    </PrimitiveButton>
                  ) : null}
                </div>
            </div>
          )}
        </div>
      </div>

      <RosterFilterPanel
         open={filterPanelOpen}
         onClose={() => setFilterPanelOpen(false)}
         filters={filters}
         onChange={setFilters}
         availableRoles={availableRoles}
         availableClasses={availableClasses}
       />

      <AnimatePresence>
        {selectedMember && (
          <Suspense fallback={null}>
            <RosterProfileDialog
              member={selectedMember}
              onClose={() => {
                setSelectedMember(null);
                hoveredMemberIdRef.current = null;
                audioController.stop();
              }}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}

type RosterCardProps = {
  member: User;
  onClick: () => void;
  audio: ReturnType<typeof useGlobalAudio>;
  onHoverAudio: (member: User) => void;
  onLeaveAudio: (memberId: string) => void;
};

const RosterCard = React.memo(function RosterCard({
  member,
  onClick,
  audio,
  onHoverAudio,
  onLeaveAudio,
}: RosterCardProps) {
  const { t } = useTranslation();
  const isPlaying = audio.activeId === member.id;
  
  // Logic from original file adapted for Tailwind
  const getClassStyle = (classes?: string[]) => {
      const c = classes?.[0] || '';
      if (c.startsWith('mingjin')) return { bg: 'bg-info/10', border: 'border-info/30' };
      if (c.startsWith('qiansi')) return { bg: 'bg-success/10', border: 'border-success/30' };
      if (c.startsWith('pozhu')) return { bg: 'bg-secondary/10', border: 'border-secondary/30' };
      if (c.startsWith('lieshi')) return { bg: 'bg-destructive/10', border: 'border-destructive/40' };
      return { bg: 'bg-info/5', border: 'border-info/20' };
  };

  const style = getClassStyle(member.classes);

  return (
    <Card 
      className={cn(
          "cursor-pointer transition-all hover:shadow-lg hover:border-primary relative overflow-hidden",
          style.bg,
          style.border
      )}
      onClick={onClick}
      onMouseEnter={() => onHoverAudio(member)}
      onMouseLeave={() => onLeaveAudio(member.id)}
    >
      {/* Active Audio Glow Background */}
      {isPlaying && (
          <div className="absolute inset-0 bg-primary/10 animate-pulse z-0 pointer-events-none" />
      )}

      <CardContent className="p-2">
          {/* Image Section */}
          <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-muted/50 border border-border/50">
             {member.avatar_url ? (
               <img
                 src={getOptimizedMediaUrl(member.avatar_url, 'image')}
                 alt={member.username}
                 width={320}
                 height={320}
                 loading="lazy"
                 decoding="async"
                 className="w-full h-full object-cover"
               />
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-black text-2xl tracking-wide select-none">
                 {getAvatarInitial(member.username)}
               </div>
             )}
          </div>

          {/* Badges Row */}
          <div className="flex items-center gap-1 mb-2 relative z-10">
             <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-background border border-border">
                 <ImageIcon sx={{ fontSize: 12, color: "primary.main" }} />
                <span className="text-[0.65rem] font-bold text-primary leading-none">{member.media_counts?.images || 0}</span>
             </div>
             <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-background border border-border">
                 <PlayArrowIcon sx={{ fontSize: 12, color: "error.main" }} />
                <span className="text-[0.65rem] font-bold text-destructive leading-none">{member.media_counts?.videos || 0}</span>
             </div>

             <div className="flex-grow" />

             {/* Status Badge */}
             {(() => {
                if (member.last_seen) {
                     const date = new Date(member.last_seen);
                     const timeAgo = formatDistanceToNow(date, { addSuffix: true });
                     const isOnline = new Date().getTime() - date.getTime() < 5 * 60 * 1000;

                     return (
                        <div className={cn(
                            "px-2 py-0.5 rounded-full text-[0.6rem] font-black tracking-wider border",
                            isOnline ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-border"
                        )}>
                           {isOnline ? 'ONLINE' : timeAgo.toUpperCase()}
                        </div>
                     );
                }
                const status = getAvailabilityStatus(member);
                return (
                   <div className={cn(
                       "px-2 py-0.5 rounded-full text-[0.6rem] font-black tracking-wider border",
                       status === 'active'
                         ? "bg-success/10 text-success border-success/20"
                         : status === 'inactive'
                           ? "bg-error/10 text-error border-error/20"
                           : "bg-muted text-muted-foreground border-border"
                   )}>
                       {status.toUpperCase()}
                   </div>
                );
             })()}
          </div>

          {/* Text Info */}
          <div className="relative z-10">
             <div className="flex items-center justify-between mb-1 gap-1">
                <span className="font-black text-sm truncate">{member.username}</span>
             </div>
             <span 
                className="block text-xs font-semibold text-muted-foreground truncate"
                dangerouslySetInnerHTML={sanitizeHtml(member.title_html || t('roster.operative_title'))} 
             />
          </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Keep roster cards stable unless the rendered member or active-audio state changes.
  return (
    prevProps.member === nextProps.member &&
    prevProps.audio.activeId === nextProps.audio.activeId &&
    prevProps.onClick === nextProps.onClick &&
    prevProps.onHoverAudio === nextProps.onHoverAudio &&
    prevProps.onLeaveAudio === nextProps.onLeaveAudio
  );
});

RosterCard.displayName = 'RosterCard';

