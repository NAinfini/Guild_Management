
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { isWithinInterval, formatDistanceToNow } from 'date-fns';
import { getOptimizedMediaUrl, getAvatarInitial } from '@/lib/media-conversion';
import { sanitizeHtml, cn } from '@/lib/utils';
import { useOnline } from '@/hooks/useOnline';
import { useFilteredList } from '@/hooks/useFilteredList';
import type { User } from '@/types';
import { formatPower } from '@/lib/utils';
import { RosterFilterPanel } from './components/RosterFilterPanel';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Slider,
  Skeleton,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components';

import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PeopleIcon from '@mui/icons-material/People';

import { PageFilterBar, MarkdownContent } from '@/components';
import { useUIStore } from '../../store';
import type { RosterFilterState } from '../../hooks/useFilterPresets';
import { useMembers } from '../../hooks/useServerState';
import { storage, STORAGE_KEYS } from '../../lib/storage';
import { membersAPI } from '../../lib/api';

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

export function Roster() {
  const { data: members = [], isLoading } = useMembers();
  const { audioSettings, setAudioSettings, setPageTitle } = useUIStore();
  const { t } = useTranslation();
  const audioController = useGlobalAudio();

  useEffect(() => {
    setPageTitle(t('nav.roster'));
  }, [setPageTitle, t]);

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

  const memberSortFn = useMemo(() => {
    if (sort === 'power') return (a: any, b: any) => (b.power || 0) - (a.power || 0);
    if (sort === 'name') return (a: any, b: any) => a.username.localeCompare(b.username);
    if (sort === 'class') return (a: any, b: any) => (a.classes?.[0] || '').localeCompare(b.classes?.[0] || '');
    return undefined;
  }, [sort]);

  const filteredMembers = useFilteredList({
    items: members || [],
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

  if (isLoading && (!members || members.length === 0)) {
     return (
       <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
         {Array.from({ length: 12 }).map((_, i) => (
           <Skeleton key={i} className="aspect-square rounded-xl h-full w-full" />
         ))}
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

  const hasAdvancedFilters = (
    filters.roles.length +
    filters.classes.length +
    (filters.status !== 'all' ? 1 : 0) +
    (filters.hasMedia ? 1 : 0) +
    (filters.powerRange[0] > 0 || filters.powerRange[1] < 999999999 ? 1 : 0)
  ) > 0;

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

  return (
    <div className="p-0 sm:p-2 md:p-4 lg:p-8 pb-8 md:pb-0">
      <div className="min-h-[420px] flex flex-col rounded-none sm:rounded-2xl md:rounded-3xl border-0 sm:border border-border bg-card">
        
        <PageFilterBar
          search={search}
          onSearchChange={setSearch}
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
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('roster.audio_mute')}
                    className={cn("h-6 w-6 p-0 shrink-0", audioSettings.mute ? "text-destructive" : "text-primary")}
                    onClick={() => setAudioSettings({ mute: !audioSettings.mute })}
                >
                    {audioSettings.mute ? <VolumeOffIcon sx={{ fontSize: 18 }} /> : <VolumeUpIcon sx={{ fontSize: 18 }} />}
                </Button>
            </div>
          }
        />

        <div className="flex-1 p-3 sm:p-4 md:p-6 bg-background">
          {filteredMembers.length > 0 ? (
            <div className="space-y-4">
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
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-50 gap-4 min-h-[300px]">
                 <PeopleIcon sx={{ fontSize: 48, opacity: 0.5 }} />
                <h3 className="text-xl font-bold">{t('roster.empty_title')}</h3>
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
          <ProfileModal 
            member={selectedMember} 
            onClose={() => {
              setSelectedMember(null);
              hoveredMemberIdRef.current = null;
              audioController.stop();
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RosterCard({
  member,
  onClick,
  audio,
  onHoverAudio,
  onLeaveAudio,
}: {
  member: User;
  onClick: () => void;
  audio: ReturnType<typeof useGlobalAudio>;
  onHoverAudio: (member: User) => void;
  onLeaveAudio: (memberId: string) => void;
}) {
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
}

function ProfileModal({ member, onClose }: { member: User, onClose: () => void }) {
   const [activeIndex, setActiveIndex] = useState(0);
   const { t } = useTranslation();

   const mediaList = useMemo(() => {
      if (member.media && member.media.length > 0) return member.media;
      return [] as any[];
   }, [member]);

   const activeItem = mediaList.length > 0 ? mediaList[activeIndex] : null;

   const handleNext = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (mediaList.length === 0) return;
      setActiveIndex((prev) => (prev + 1) % mediaList.length);
   };

   const handlePrev = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (mediaList.length === 0) return;
      setActiveIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
   };

   return (
      <Dialog open onOpenChange={(open: boolean) => !open && onClose()}>
        <DialogContent
          data-testid="roster-member-detail-panel"
          hideCloseButton
          maxWidth={false}
          fullWidth
          className="w-[min(1800px,calc(100vw-1rem))] max-w-none h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] p-0 overflow-hidden rounded-2xl border border-[color:var(--cmp-dialog-border)]"
        >
          <DialogTitle className="sr-only">Profile of {member.username}</DialogTitle>
          <div className="relative flex h-full w-full flex-col">
            <section
              className="shrink-0 border-b p-4 sm:p-6"
              style={{
                backgroundColor: 'var(--cmp-dialog-bg)',
                borderColor: 'var(--cmp-dialog-border)',
                color: 'var(--sys-text-primary)',
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border shrink-0"
                    style={{
                      borderColor: 'color-mix(in srgb, var(--sys-text-primary) 14%, transparent)',
                      backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 72%, transparent)',
                    }}
                  >
                    {member.avatar_url ? (
                      <img
                        src={getOptimizedMediaUrl(member.avatar_url, 'image')}
                        className="w-full h-full object-cover"
                        alt={member.username}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-black text-2xl">
                        {getAvatarInitial(member.username)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-black leading-tight truncate">{member.username}</h2>
                    <div
                      className="font-semibold text-primary mt-1 text-sm sm:text-base"
                      dangerouslySetInnerHTML={sanitizeHtml(member.title_html || t('roster.operative_title'))}
                    />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full shrink-0"
                  aria-label={t('common.close')}
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </Button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div
                  className="flex items-center gap-1 px-2 py-1 border rounded-full"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 68%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--sys-text-primary) 14%, transparent)',
                  }}
                >
                  <ElectricBoltIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                  <span className="text-xs font-mono font-bold text-[color:var(--sys-text-primary)]">{formatPower(member.power)}</span>
                </div>

                <div
                  className="px-2 py-1 rounded-full text-[0.65rem] font-black border uppercase"
                  style={
                    member.active_status === 'active'
                      ? {
                          backgroundColor: 'color-mix(in srgb, var(--color-status-success-bg) 84%, transparent)',
                          color: 'var(--color-status-success-fg)',
                          borderColor: 'color-mix(in srgb, var(--color-status-success) 36%, transparent)',
                        }
                      : {
                          backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 74%, transparent)',
                          color: 'var(--sys-text-secondary)',
                          borderColor: 'color-mix(in srgb, var(--sys-text-primary) 18%, transparent)',
                        }
                  }
                >
                  {member.active_status}
                </div>
              </div>

              <div
                className="rounded-xl border p-3 sm:p-4"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--sys-surface-raised) 72%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--sys-text-primary) 12%, transparent)',
                }}
              >
                <MarkdownContent
                  content={member.bio}
                  fallback={t('roster.no_bio')}
                  className="text-sm text-[color:var(--sys-text-secondary)] leading-relaxed"
                />
              </div>
            </section>

            <div
              className="relative flex-1 min-w-0 flex items-center justify-center p-4 sm:p-6 lg:p-8"
              style={{ backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 62%, transparent)' }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-3 sm:left-5 z-20 rounded-full h-10 w-10 sm:h-12 sm:w-12"
                onClick={handlePrev}
                disabled={mediaList.length === 0}
                aria-label={t('common.prev')}
              >
                <ChevronLeftIcon sx={{ fontSize: 30 }} />
              </Button>

              {activeItem ? (
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className="relative max-w-full max-h-full flex items-center justify-center"
                >
                  <img
                    src={getOptimizedMediaUrl(activeItem.url || activeItem.thumbnail, activeItem.type)}
                    className="max-w-full max-h-[78vh] object-contain rounded-xl border"
                    style={{
                      borderColor: 'color-mix(in srgb, var(--sys-text-primary) 14%, transparent)',
                      boxShadow: '0 22px 40px color-mix(in srgb, var(--sys-surface-sunken) 80%, transparent)',
                    }}
                    alt=""
                  />
                  {activeItem.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border flex items-center justify-center backdrop-blur-sm"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--sys-surface-raised) 54%, transparent)',
                          borderColor: 'color-mix(in srgb, var(--sys-text-primary) 30%, transparent)',
                        }}
                      >
                        <PlayArrowIcon sx={{ fontSize: 40, ml: 0.25 }} />
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div
                  className="w-full max-w-2xl h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--sys-text-primary) 20%, transparent)',
                    color: 'var(--sys-text-secondary)',
                    backgroundColor: 'color-mix(in srgb, var(--sys-surface-raised) 40%, transparent)',
                  }}
                >
                  <ImageIcon sx={{ fontSize: 56 }} />
                  <span className="font-semibold">{t('gallery.empty')}</span>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 sm:right-5 z-20 rounded-full h-10 w-10 sm:h-12 sm:w-12"
                onClick={handleNext}
                disabled={mediaList.length === 0}
                aria-label={t('common.next')}
              >
                <ChevronRightIcon sx={{ fontSize: 30 }} />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
   );
}
