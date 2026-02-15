
import React, { Suspense, lazy, useState, useMemo, useEffect } from 'react';
import { useFilteredList } from '../../hooks/useFilteredList';
import { 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  Typography, 
  Box, 
  Stack, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField, 
  InputAdornment, 
  useTheme,
  Grid,
  Select,
  MenuItem,
  FormControl,
  Snackbar,
  Alert,
  Tooltip,
  Avatar,
  Paper,
  alpha,
  Skeleton,
  useMediaQuery,
} from '@/ui-bridge/material';
import { WarTeamDragDrop } from './components/WarTeamDragDrop';
import { TeamMemberCard } from '@/components/data-display';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';
import { ThemedTabControl } from '@/components/primitives/themed-controls/ThemedTabControl';
import { ThemedSortButtonGroup } from '@/components/primitives/themed-controls/ThemedSortButtonGroup';
import { ThemedPanelBox } from '@/components/primitives/themed-controls/ThemedPanelBox';
import { ThemedIconButton } from '@/components/primitives/themed-controls/ThemedIconButton';
import { 
  Security, 
  GridView, 
  Add, 
  People, 
  Shield, 
  Search, 
  History, 
  Delete, 
  Edit,
  BarChart,
  Close,
  EmojiEvents,
  Favorite,
  AutoAwesome,
  ElectricBolt,
  Undo,
} from '@/ui-bridge/icons-material';
import { formatPower, formatDateTime, sanitizeHtml, formatClassDisplayName, getMemberCardAccentColors, getClassPillTone, buildMemberAccentGradient } from '../../lib/utils';
import { useAuthStore, useUIStore } from '../../store';
import { User, WarTeam, ClassType } from '../../types';
import { useTranslation } from 'react-i18next';
import { useEvents, useMembers, useJoinEvent, useLeaveEvent } from '../../hooks/useServerState';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent, DragStartEvent, useSensors, useSensor, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { useWarTeams, useMovePoolToTeam, useMoveTeamToPool, useMoveTeamToTeam, useKickFromTeam, useKickFromPool } from './hooks/useWars';
import { CardGridSkeleton } from '@/components/feedback/Skeleton';
import { Toast } from '@/components/feedback';
import { useOnline } from '../../hooks/useOnline';
import {
  canCopyGuildWarAnalytics,
  canManageGuildWarActive,
  canViewGuildWarMemberDetail,
  canViewGuildWarAnalytics,
  getEffectiveRole,
} from '../../lib/permissions';
import {
  nextGuildWarSortState,
  sortGuildWarMembers,
  type GuildWarSortState,
} from './GuildWar.sorting';

type Tab = 'active' | 'history' | 'analytics';

const GuildWarActionDialogs = lazy(() => import('./components/GuildWarActionDialogs'));
const WarHistoryView = lazy(() =>
  import('./components/WarHistory').then((module) => ({ default: module.WarHistory })),
);
const WarAnalyticsMain = lazy(() =>
  import('./components/WarAnalytics').then((module) => ({ default: module.WarAnalyticsMain })),
);


const THEME_CARD_RADIUS = 'var(--cmp-card-radius)';

function getGuildWarPanelTokens(theme: any) {
  const custom = theme?.custom ?? {};
  const panel = custom?.components?.panel ?? {};
  const card = custom?.components?.card ?? {};
  const semanticSurface = custom?.semantic?.surface ?? {};
  const semanticBorder = custom?.semantic?.border ?? {};
  const semanticInteractive = custom?.semantic?.interactive ?? {};
  const semanticText = custom?.semantic?.text ?? {};

  return {
    panelBg: card.bg ?? panel.bg ?? semanticSurface.panel ?? 'var(--cmp-panel-bg)',
    panelHeaderBg: panel.headerBg ?? card.bg ?? semanticSurface.elevated ?? 'var(--cmp-panel-header-bg)',
    panelBorder: card.border ?? panel.border ?? semanticBorder.default ?? 'var(--cmp-panel-border)',
    dropTargetBg: panel.dropTargetBg ?? semanticInteractive.hover ?? 'var(--cmp-panel-drop-target-bg)',
    dropTargetBorder: panel.dropTargetBorder ?? semanticInteractive.accent ?? 'var(--cmp-panel-drop-target-border)',
    panelControlBg: panel.controlBg ?? semanticSurface.sunken ?? 'var(--cmp-panel-control-bg)',
    panelText: semanticText.primary ?? theme.palette.text.primary,
    panelMutedText: semanticText.secondary ?? theme.palette.text.secondary,
    inverseText: semanticText.inverse ?? theme.palette.common?.white ?? '#FFFFFF',
  };
}

function getGuildWarSegmentedTokens(theme: any) {
  const custom = theme?.custom ?? {};
  const segmented = custom?.components?.segmentedControl ?? {};
  const sortArrows = custom?.components?.sortArrows ?? {};
  const semanticText = custom?.semantic?.text ?? {};
  const semanticInteractive = custom?.semantic?.interactive ?? {};

  return {
    bg: segmented.bg ?? theme.palette.background.paper,
    border: segmented.border ?? theme.palette.divider,
    text: segmented.text ?? semanticText.secondary ?? theme.palette.text.secondary,
    selectedBg: segmented.selectedBg ?? semanticInteractive.hover ?? alpha(theme.palette.primary.main, 0.12),
    selectedText: segmented.selectedText ?? semanticText.primary ?? theme.palette.text.primary,
    indicator: sortArrows.active ?? semanticInteractive.accent ?? theme.palette.primary.main,
  };
}

type GuildWarRoleKey = 'lead' | 'dps' | 'tank' | 'heal';

function getGuildWarRoleColor(theme: any, role: GuildWarRoleKey): string {
  const roleTokens = theme.custom?.warRoles;
  const fallback: Record<GuildWarRoleKey, string> = {
    lead: theme.palette.warning.main,
    dps: theme.palette.error.main,
    tank: theme.palette.info.main,
    heal: theme.palette.success.main,
  };

  return roleTokens?.[role]?.main ?? fallback[role];
}

export function GuildWar() {
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [activeMemberSearchQuery, setActiveMemberSearchQuery] = useState('');
  const { user, viewRole } = useAuthStore();

  // 鉁?TanStack Query: Server state
  const { data: events = [], isLoading } = useEvents();

  const { setPageTitle } = useUIStore();
  const { t } = useTranslation();
  const theme = useTheme();
  const panelTokens = getGuildWarPanelTokens(theme);
  const online = useOnline();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const effectiveRole = getEffectiveRole(user?.role, viewRole);
  const canManageActive = canManageGuildWarActive(effectiveRole);
  const canViewMemberDetail = canViewGuildWarMemberDetail(effectiveRole);
  const canViewAnalytics = canViewGuildWarAnalytics(effectiveRole);
  const canCopyAnalytics = canCopyGuildWarAnalytics(effectiveRole);

  useEffect(() => {
    setPageTitle(t('nav.guild_war'));
  }, [setPageTitle, t]);



  const warFilterFn = useMemo(() => (e: any) => e.type === 'guild_war', []);
  const warSortFn = useMemo(
    () => (a: any, b: any) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
    []
  );

  const warEvents = useFilteredList({
    items: events || [],
    searchText: '',
    searchFields: [],
    filterFn: warFilterFn,
    sortFn: warSortFn,
  });

  const [selectedWarId, setSelectedWarId] = useState<string>('');

  useEffect(() => {
    // If no war selected, select first available
    if (!selectedWarId && warEvents.length > 0) {
      setSelectedWarId(warEvents[0].id);
    }
    // If selected war doesn't exist in available wars, reset to first or empty
    else if (selectedWarId && warEvents.length > 0 && !warEvents.find(w => w.id === selectedWarId)) {
      setSelectedWarId(warEvents[0].id);
    }
    // If no wars available, clear selection
    else if (warEvents.length === 0 && selectedWarId) {
      setSelectedWarId('');
    }
  }, [warEvents, selectedWarId]);

  if (isLoading && warEvents.length === 0) {
    return (
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <CardGridSkeleton count={3} />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6 }}>
      {/* Page Header Area */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
         <Stack direction="row" alignItems="center" gap={2}>
             <ThemedTabControl
                value={activeTab}
                onValueChange={(next) => setActiveTab(next as Tab)}
                sx={{
                  bgcolor: panelTokens.panelControlBg,
                  borderColor: panelTokens.panelBorder,
                }}
                options={[
                  {
                    value: 'active',
                    label: (
                      <Stack direction="row" gap={1} alignItems="center">
                        <ElectricBolt sx={{ fontSize: 16, color: 'var(--color-status-warning)' }} />
                        {t('guild_war.tab_active')}
                      </Stack>
                    ),
                  },
                  {
                    value: 'history',
                    label: (
                      <Stack direction="row" gap={1} alignItems="center">
                        <History sx={{ fontSize: 16 }} />
                        {t('guild_war.tab_history')}
                      </Stack>
                    ),
                  },
                  {
                    value: 'analytics',
                    label: (
                      <Stack direction="row" gap={1} alignItems="center">
                        <BarChart sx={{ fontSize: 16 }} />
                        {t('guild_war.tab_analytics')}
                      </Stack>
                    ),
                  },
                ]}
             />
         </Stack>

         {activeTab === 'active' && (
             <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
                 <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 240 } }}>
                     <Select
                       value={warEvents.length === 0 ? '' : selectedWarId}
                       onChange={(e: React.ChangeEvent<{ value: unknown }>) => setSelectedWarId(e.target.value as string)}
                       displayEmpty
                       sx={{
                           borderRadius: 2,
                           fontWeight: 700,
                           fontSize: '0.8rem',
                           bgcolor: 'background.paper',
                           boxShadow: 1,
                           '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' }
                       }}
                     >
                       {warEvents.length === 0 && <MenuItem value="">{t('guild_war.no_active_wars')}</MenuItem>}
                       {warEvents.map(war => (
                           <MenuItem key={war.id} value={war.id} sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{war.title}</MenuItem>
                       ))}
                     </Select>
                 </FormControl>
                 <TextField
                   size="small"
                   value={activeMemberSearchQuery}
                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActiveMemberSearchQuery(e.target.value)}
                   placeholder={t('guild_war.active_member_search_placeholder')}
                   InputProps={{
                     startAdornment: (
                       <InputAdornment position="start">
                         <Search sx={{ fontSize: 14 }} />
                       </InputAdornment>
                     ),
                   }}
                   sx={{ minWidth: { xs: '100%', md: 260 } }}
                 />
             </Stack>
         )}
      </Box>

      <Box sx={{ flex: 1 }}>
        {activeTab === 'active' && (
          <ActiveWarManagement
            warId={selectedWarId}
            canManageActive={canManageActive}
            canViewMemberDetail={canViewMemberDetail}
            memberSearchQuery={activeMemberSearchQuery}
          />
        )}
        {activeTab === 'history' && (
          <Suspense fallback={<CardGridSkeleton count={2} />}>
            <WarHistory />
          </Suspense>
        )}
        {activeTab === 'analytics' && canViewAnalytics && (
          <Suspense fallback={<CardGridSkeleton count={3} />}>
            <WarAnalytics canCopy={canCopyAnalytics} />
          </Suspense>
        )}
      </Box>
    </Box>
  );
}

type LastAction = { desc: string; undo: () => void; expiry: number; }

function ActiveWarManagement({
  warId,
  canManageActive,
  canViewMemberDetail,
  memberSearchQuery,
}: {
  warId: string;
  canManageActive: boolean;
  canViewMemberDetail: boolean;
  memberSearchQuery: string;
}) {
  // 鉁?TanStack Query: Server state and mutations
  const { data: events = [] } = useEvents();
  const { data: members = [] } = useMembers();
  const joinEventMutation = useJoinEvent();
  const leaveEventMutation = useLeaveEvent();
  const joinEvent = async (eventId: string, userId: string) => {
    await joinEventMutation.mutateAsync({ eventId, userId });
  };
  const leaveEvent = async (eventId: string, userId: string) => {
    await leaveEventMutation.mutateAsync({ eventId, userId });
  };

  const { t } = useTranslation();
  const theme = useTheme();
  const panelTokens = getGuildWarPanelTokens(theme);
  const online = useOnline();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const activeWar = useMemo(() => events.find(e => e.id === warId), [events, warId]);
  
  const {
    data: warData,
    refetch: refetchWar,
    isLoading: isLoadingTeams,
    isError: isWarTeamsError,
  } = useWarTeams(warId);
  const movePoolToTeam = useMovePoolToTeam();
  const moveTeamToPool = useMoveTeamToPool();
  const moveTeamToTeam = useMoveTeamToTeam();
  const kickFromTeam = useKickFromTeam();
  const kickFromPool = useKickFromPool();
  const [teams, setTeams] = useState<WarTeam[]>([]);
  const [pool, setPool] = useState<User[]>([]);
  const [etag, setEtag] = useState<string | undefined>(undefined);
  const [lastAction, setLastAction] = useState<LastAction | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [toastOpen, setToastOpen] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [memberDetailId, setMemberDetailId] = useState<string | null>(null);
  const [poolSort, setPoolSort] = useState<GuildWarSortState>({ field: 'power', direction: 'desc' });
  const [teamSort, setTeamSort] = useState<GuildWarSortState>({ field: 'power', direction: 'desc' });
  const [conflictOpen, setConflictOpen] = useState(false);
  const [kickPoolConfirmUserId, setKickPoolConfirmUserId] = useState<string | null>(null);
  const hasActionDialogOpen = conflictOpen || Boolean(kickPoolConfirmUserId);
  const normalizedMemberSearchQuery = memberSearchQuery.trim().toLowerCase();
  const matchesMemberSearch = (member: User) => {
    if (!normalizedMemberSearchQuery) return false;
    return [member.username, member.wechat_name, member.id]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(normalizedMemberSearchQuery);
  };

  // DnD sensors: pointer (mouse/touch) + keyboard (Space to grab, Arrow keys to move)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    if (warData?.teams) {
      setTeams(warData.teams);
    }
    if (warData?.pool) {
      setPool(
        warData.pool.map((p: any) => ({
          id: p.user_id,
          username: p.username,
          classes: [p.class_code],
          role: 'member',
          power: p.power || 0,
          active_status: 'active',
          wechat_name: p.wechat_name,
        }))
      );
    }
    if ((warData as any)?.etag) setEtag((warData as any).etag);
  }, [warData]);

  useEffect(() => {
      if (!lastAction) return;
      const interval = setInterval(() => {
          const remaining = Math.max(0, Math.ceil((lastAction.expiry - Date.now()) / 1000));
          setTimeLeft(remaining);
          if (remaining <= 0) setLastAction(null);
      }, 100);
      return () => clearInterval(interval);
  }, [lastAction]);

  useEffect(() => {
    if (lastAction) setToastOpen(true);
  }, [lastAction]);

  // 鉁?ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const assignedUserIds = useMemo(() => {
    const set = new Set<string>();
    teams.forEach(t => t.members.forEach(m => set.add(m.user_id)));
    return set;
  }, [teams]);

  const poolMembers = useMemo(() => {
    const source = pool.length > 0 ? pool : activeWar?.participants || [];
    const list = source.filter(p => !assignedUserIds.has(p.id));
    return sortGuildWarMembers(list, poolSort);
  }, [pool, activeWar?.participants, assignedUserIds, poolSort]);

  // Guard: Return early AFTER all hooks
  if (!warId) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t('guild_war.no_active_wars')}
        </Typography>
      </Box>
    );
  }

  if (isLoadingTeams) return <ActiveWarSkeleton />;

  if (isWarTeamsError) {
    return (
      <Box
        data-testid="guildwar-active-error-state"
        sx={{
          p: 3,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 3,
          bgcolor: 'action.hover',
        }}
      >
        <Typography variant="overline" display="block" color="text.secondary" fontWeight={900} letterSpacing="0.2em">
          {t('guild_war.no_active_wars')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('common.placeholder_msg')}
        </Typography>
        <Stack
          data-testid="guildwar-active-error-actions"
          direction="row"
          spacing={1.5}
          justifyContent="center"
          sx={{ mt: 3, flexWrap: 'wrap', rowGap: 1 }}
        >
          {/* Retry re-runs the war teams query so transient API failures recover without page navigation. */}
          <Button type="button" variant="outlined" onClick={() => void refetchWar()}>
            {t('common.retry')}
          </Button>
        </Stack>
      </Box>
    );
  }

  const toggleSelection = (id: string, multi: boolean) => {
    if (!canManageActive) return;
    const newSet = new Set(multi ? selectedIds : []);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleMemberClick = (id: string, e: React.MouseEvent) => {
    const multi = e.ctrlKey || e.metaKey || e.shiftKey;
    toggleSelection(id, multi);
  };

  const handleMemberDoubleClick = (id: string, e: React.MouseEvent) => {
     e.stopPropagation();
     if (canViewMemberDetail) setMemberDetailId(id);
  };

  const handleConflict = (err: any) => {
    if (err?.response?.error === 'ETAG_MISMATCH' || err?.status === 409) {
      setConflictOpen(true);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (!canManageActive || !online) return;
    const id = event.active.id as string;
    setActiveDragId(id);
    if (!selectedIds.has(id)) setSelectedIds(new Set([id]));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!canManageActive || !online) return;
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;
    
    // Target Identification
    const droppingToPool = over.id === 'pool_droppable';
    const targetTeamId = over.id as string; // if not pool_droppable, it's team ID
    
    const previousTeams = JSON.parse(JSON.stringify(teams));
    // Collect moved IDs
    const idsToMove = selectedIds.has(active.id as string) ? Array.from(selectedIds) : [active.id as string];
    let hasChanged = false;

    setTeams(prev => {
        let nextState = prev.map(t => ({...t, members: [...t.members]}));
        
        // Remove from source teams
        nextState = nextState.map(t => ({ ...t, members: t.members.filter(m => !idsToMove.includes(m.user_id)) }));

        // Add to target if it's a team
        if (!droppingToPool) {
             nextState = nextState.map(t => {
                if (t.id === targetTeamId) {
                   const existing = new Set(t.members.map(m => m.user_id));
                   const newMembers = idsToMove.filter(id => !existing.has(id)).map(id => ({ user_id: id }));
                   return { ...t, members: [...t.members, ...newMembers] };
                }
                return t;
             });
        }
        
        if (JSON.stringify(prev) !== JSON.stringify(nextState)) {
             hasChanged = true;
             return nextState;
        }
        return prev;
    });
    
    if (hasChanged) {
      setLastAction({ desc: `Moved ${idsToMove.length} operative(s)`, undo: () => setTeams(previousTeams), expiry: Date.now() + 5000 });

      // Determine precise mutations
      const movesPoolToTeam: { userId: string, teamId: string }[] = [];
      const movesTeamToTeam: { userId: string, sourceTeamId: string, targetTeamId: string }[] = [];
      const movesTeamToPool: string[] = [];

      // Find source for each ID
      // Helper to find team ID for a user in 'previousTeams'
      const findSourceTeamId = (uid: string): string | null => {
          for (const t of previousTeams) {
              if (t.members.find((m: any) => m.user_id === uid)) return t.id;
          }
          return null; // implies pool
      };

      idsToMove.forEach(uid => {
          const sourceId = findSourceTeamId(uid);
          
          if (droppingToPool) {
              if (sourceId) {
                  // Team -> Pool
                  movesTeamToPool.push(uid);
              } 
              // else Pool -> Pool (no-op)
          } else {
              if (sourceId && sourceId !== targetTeamId) {
                  // Team -> Team
                  movesTeamToTeam.push({ userId: uid, sourceTeamId: sourceId, targetTeamId });
              } else if (!sourceId) {
                  // Pool -> Team
                  movesPoolToTeam.push({ userId: uid, teamId: targetTeamId });
              }
              // else Team -> Same Team (no-op)
          }
      });

      try {
        if (movesPoolToTeam.length > 0) {
            await movePoolToTeam.mutateAsync({ warId, moves: movesPoolToTeam } as any);
        }
        if (movesTeamToTeam.length > 0) {
            await moveTeamToTeam.mutateAsync({ warId, moves: movesTeamToTeam } as any);
        }
        if (movesTeamToPool.length > 0) {
            await moveTeamToPool.mutateAsync({ warId, userIds: movesTeamToPool } as any);
        }
      } catch (err: any) {
        handleConflict(err);
      }
    }
    setSelectedIds(new Set());
  };

  const handleKickFromPool = async (userId: string) => {
      if (!canManageActive || !online) return;
      setKickPoolConfirmUserId(userId);
  };

  const confirmKickFromPool = async () => {
      if (!canManageActive) return;
      if (!kickPoolConfirmUserId) return;
      try {
        await kickFromPool.mutateAsync({ warId, userId: kickPoolConfirmUserId });
      } catch(e) {
        console.error(e);
      } finally {
        setKickPoolConfirmUserId(null);
      }
  };

  const handleKickFromTeam = async (userId: string) => {
      if (!canManageActive || !online) return;
      // Optimistic
      const prevTeams = teams;
      const targetTeam = teams.find(t => t.members.find(m => m.user_id === userId));
      
      setTeams(prev => prev.map(t => ({...t, members: t.members.filter(m => m.user_id !== userId)})));
      
      try {
        if (targetTeam) {
          await kickFromTeam.mutateAsync({ warId, userId, teamId: targetTeam.id });
        }
      } catch (e: any) {
          setTeams(prevTeams);
          handleConflict(e);
      }
  };

  const handleAssignRole = (teamId: string, role: string) => {
     if (!canManageActive || !online) return;
     setTeams(prev => prev.map(t => {
        if (t.id !== teamId) return t;
        return { ...t, members: t.members.map(m => selectedIds.has(m.user_id) ? { ...m, role_tag: role } : m) };
     }));
     setSelectedIds(new Set());
  };

  const handleUndo = () => {
      if (lastAction) {
          lastAction.undo();
          setLastAction(null);
      }
  }

  if (!activeWar) return (
    <PlaceholderPage
        title={t('guild_war.no_active_wars')}
        description={t('guild_war.no_active_wars')}
        icon={Security}
      />
  );

  if (isMobile) {
    return (
      <Stack spacing={2}>
        <WarTeamDragDrop
          warId={warId}
          teams={teams.map(t => ({
            id: t.id,
            name: t.name,
            members: t.members.map(m => members.find(mm => mm.id === m.user_id) || { id: m.user_id, username: m.user_id, role: 'member', power: 0, classes: [], active_status: 'active' })
          }))}
          unassignedMembers={pool}
          disabled={!online || !canManageActive}
          onAssign={async (userId, teamId) => {
            if (!online || !canManageActive) return;
            try {
              if (teamId) {
                // Determine source
                const sourceTeam = teams.find(t => t.members.find(m => m.user_id === userId));
                if (sourceTeam) return; // Legacy simple mode doesn't support move? Or treat as move?
                
                await movePoolToTeam.mutateAsync({ warId, userId, teamId });
              } else {
                // Unassign = move to pool
                const sourceTeam = teams.find(t => t.members.find(m => m.user_id === userId));
                if (sourceTeam) {
                    await moveTeamToPool.mutateAsync({ warId, userId });
                }
              }
              refetchWar();
            } catch (err: any) {
              handleConflict(err);
            }
          }}
        />
        <AddMemberModal 
           open={addMemberModalOpen}
           onClose={() => setAddMemberModalOpen(false)} 
           members={members} 
           currentParticipants={activeWar.participants || []}
           onAdd={(userId: string) => { if (!online || !canManageActive) return; joinEvent(activeWar.id, userId); }}
        />
      </Stack>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2, position: 'relative' }}>
        <Grid data-testid="guildwar-war-teams-grid" container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
            {/* LEFT COLUMN: POOL */}
            <Grid data-testid="guildwar-pool-column" size={{ xs: 12, md: 3 }} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <DroppablePool id="pool_droppable">
                  <ThemedPanelBox
                    variant="pool"
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                    left={
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800} textTransform="uppercase">{t('guild_war.reserves')}</Typography>
                          <Typography variant="caption" fontFamily="monospace" color="text.secondary">{t('guild_war.operatives_count', { count: poolMembers.length })}</Typography>
                        </Box>
                      </Stack>
                    }
                    right={
                    <Stack data-testid="guildwar-assignment-controls" direction="row" spacing={0.5}>
                        <ThemedSortButtonGroup
                          sortState={poolSort}
                          onFieldChange={(field) =>
                            setPoolSort((prev) => nextGuildWarSortState(prev, field as GuildWarSortState['field']))
                          }
                          options={[
                            { value: 'power', label: t('guild_war.sort_pwr') },
                            { value: 'class', label: t('guild_war.sort_cls') },
                          ]}
                          sx={{
                            bgcolor: panelTokens.panelControlBg,
                            borderColor: panelTokens.panelBorder,
                          }}
                        />
                        {canManageActive && (
                          <ThemedIconButton
                            size="small"
                            onClick={() => setAddMemberModalOpen(true)}
                            sx={{
                              border: '1px solid',
                              borderColor: panelTokens.panelBorder,
                              bgcolor: panelTokens.panelControlBg,
                              color: panelTokens.panelText,
                              '&:hover': { bgcolor: panelTokens.dropTargetBg },
                            }}
                          >
                            <Add sx={{ fontSize: 16 }} />
                          </ThemedIconButton>
                        )}
                      </Stack>
                    }
                    contentSx={{ p: 2, minHeight: 120, display: 'grid', gridTemplateColumns: '1fr', gap: 1.5, flex: 1, overflowY: 'auto', bgcolor: panelTokens.panelBg }}
                  >
                      {poolMembers.map(member => (
                        <DraggableMemberCard
                          key={member.id}
                          member={member}
                          selected={selectedIds.has(member.id)}
                          highlighted={matchesMemberSearch(member)}
                          onClick={handleMemberClick}
                          onDoubleClick={handleMemberDoubleClick}
                          onKick={() => handleKickFromPool(member.id)}
                          canManage={canManageActive}
                        />
                      ))}
                      {poolMembers.length === 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed', borderColor: panelTokens.panelBorder, borderRadius: 2 }}>
                          <Typography variant="caption" fontWeight={900} color="text.disabled" textTransform="uppercase">{t('guild_war.empty_pool')}</Typography>
                        </Box>
                      )}
                  </ThemedPanelBox>
                </DroppablePool>
            </Grid>

            {/* RIGHT COLUMN: TEAMS BOARD */}
            <Grid size={{ xs: 12, md: 9 }} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <GridView sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                        <Typography variant="h6" fontWeight={900} textTransform="uppercase" fontStyle="italic">{t('guild_war.tactical_squads')}</Typography>
                        <Tooltip title={t('guild_war.squad_controls_hint')}><Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>{t('guild_war.squad_controls_hint')}</Typography></Tooltip>
                    </Stack>
                    
                    <ThemedSortButtonGroup
                      data-testid="guildwar-assignment-controls"
                      sortState={teamSort}
                      onFieldChange={(field) =>
                        setTeamSort((prev) => nextGuildWarSortState(prev, field as GuildWarSortState['field']))
                      }
                      options={[
                        { value: 'power', label: t('guild_war.sort_pwr') },
                        { value: 'class', label: t('guild_war.sort_cls') },
                      ]}
                      sx={{
                        bgcolor: panelTokens.panelControlBg,
                        borderColor: panelTokens.panelBorder,
                      }}
                    />
                </Box>

                <Box sx={{ flex: 1, overflowY: 'auto', pr: 1, pb: 2 }}>
                    <Stack spacing={2}>
                        {teams.map(team => (
	                            <DroppableTeam 
	                                key={team.id} 
	                                team={team} 
	                                members={members} 
	                                selectedIds={selectedIds}
	                                onMemberClick={handleMemberClick}
	                                onMemberDoubleClick={handleMemberDoubleClick}
	                                onMemberKick={handleKickFromTeam}
	                                onAssignRole={(role: string) => handleAssignRole(team.id, role)}
	                                sortState={teamSort}
	                                canManage={canManageActive}
                                  memberSearchQuery={normalizedMemberSearchQuery}
	                            />
	                        ))}
	                        
	                        {canManageActive && (
	                          <Button 
	                              variant="outlined" 
	                              fullWidth 	                              startIcon={<Add sx={{ fontSize: 16 }} />}
	                              sx={{ borderStyle: 'dashed', height: 48, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
	                          >
	                              {t('guild_war.new_squad')}
	                          </Button>
	                        )}
	                    </Stack>
	                </Box>

            </Grid>
        </Grid>
        
        {/* UNDO SNACKBAR */}
        <Snackbar 
            open={!!lastAction} 
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <Alert 
                severity="info" 
                icon={<Undo className="animate-pulse" sx={{ fontSize: 16 }} />}
                action={
                    <Button color="inherit" size="small" onClick={handleUndo} sx={{ fontSize: '0.65rem', fontWeight: 900 }}>
                        {t('common.undo')} ({timeLeft})
                    </Button>
                }
                sx={{ borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'primary.main', alignItems: 'center' }}
            >
                <Typography variant="body2" fontWeight={700}>{lastAction?.desc}</Typography>
            </Alert>
        </Snackbar>
        <Toast open={toastOpen && !!lastAction} message={lastAction?.desc || ''} severity="info" onClose={() => setToastOpen(false)} />

        {hasActionDialogOpen ? (
          <Suspense fallback={null}>
            <GuildWarActionDialogs
              conflictOpen={conflictOpen}
              kickPoolConfirmOpen={Boolean(kickPoolConfirmUserId)}
              t={t}
              onCloseConflict={() => setConflictOpen(false)}
              onRefreshConflict={() => {
                setConflictOpen(false);
                void refetchWar();
              }}
              onOverrideConflict={() => {
                setConflictOpen(false);
                setEtag(undefined);
              }}
              onCloseKickFromPool={() => setKickPoolConfirmUserId(null)}
              onConfirmKickFromPool={confirmKickFromPool}
            />
          </Suspense>
        ) : null}

      </Box>

	      <DragOverlay modifiers={[snapCenterToCursor]}>
	         {activeDragId ? (
	            <Paper sx={{ width: 220, opacity: 0.98, borderRadius: 2 }}>
	               <MemberCardOverlay id={activeDragId} members={members} count={selectedIds.size} />
	            </Paper>
	         ) : null}
	      </DragOverlay>

	      <AddMemberModal 
	         open={addMemberModalOpen}
	         onClose={() => setAddMemberModalOpen(false)} 
	         members={members} 
	         currentParticipants={activeWar.participants || []}
	         onAdd={(userId: string) => { if (!online || !canManageActive) return; joinEvent(activeWar.id, userId); }}
	      />

      {canViewMemberDetail && (
        <MemberDetailModal
          userId={memberDetailId}
          members={members}
          onClose={() => setMemberDetailId(null)}
        />
      )}
    </DndContext>
  );
}

function DraggableMemberCard({
  member,
  selected,
  onClick,
  onDoubleClick,
  onKick,
  role,
  canManage = true,
  highlighted = false,
}: {
  member: User;
  selected?: boolean;
  highlighted?: boolean;
  onClick: (id: string, e: React.MouseEvent) => void;
  onDoubleClick: (id: string, e: React.MouseEvent) => void;
  onKick: () => void;
  role?: string;
  canManage?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: member.id,
    disabled: !canManage,
    attributes: { roleDescription: 'draggable member' },
  });

  return (
    <TeamMemberCard
      member={member}
      variant="draggable"
      selected={selected}
      highlighted={highlighted}
      role={role}
      canManage={canManage}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onKick={onKick}
      draggableProps={{
        attributes,
        listeners,
        setNodeRef,
        isDragging,
      }}
    />
  );
}

function MemberCardOverlay({ id, members, count }: { id: string, members: User[], count: number }) {
   const member = members.find(m => m.id === id);
   if (!member) return null;
   
   return (
      <Box sx={{ position: 'relative' }}>
         {count > 1 && (
            <Box sx={{ 
                position: 'absolute', top: -8, right: -8, zIndex: 10, width: 20, height: 20, 
                borderRadius: '50%', bgcolor: 'primary.main', color: 'primary.contrastText',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 900,
                border: '2px solid', borderColor: 'background.paper'
            }}>
               {count}
            </Box>
         )}
         <TeamMemberCard member={member} variant="default" />
      </Box>
   );
}

function DroppablePool({ id, children }: { id: string, children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const theme = useTheme();
  const panelTokens = getGuildWarPanelTokens(theme);
  return (
    <Box 
        ref={setNodeRef} 
        sx={{ 
            borderRadius: THEME_CARD_RADIUS, 
            transition: 'all 0.2s', 
            minHeight: '100%',
            p: 1,
            bgcolor: isOver ? panelTokens.dropTargetBg : 'transparent',
            outline: isOver ? `2px dashed ${panelTokens.dropTargetBorder}` : 'none'
        }}
    >
      {children}
    </Box>
  );
}

interface DroppableTeamProps {
  team: WarTeam;
  members: User[];
  selectedIds: Set<string>;
  onMemberClick: (id: string, e: React.MouseEvent) => void;
  onMemberDoubleClick: (id: string, e: React.MouseEvent) => void;
  onMemberKick: (id: string) => void;
  onAssignRole: (role: string) => void;
  sortState: GuildWarSortState;
  canManage: boolean;
  memberSearchQuery?: string;
}

function DroppableTeam({ 
    team, 
    members, 
    selectedIds, 
    onMemberClick, 
    onMemberDoubleClick, 
    onMemberKick, 
    onAssignRole,
    sortState,
    canManage,
    memberSearchQuery = '',
}: DroppableTeamProps) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: team.id });
  const theme = useTheme();
  const panelTokens = getGuildWarPanelTokens(theme);
  
  const totalPower = team.members.reduce((acc: number, tm: { user_id: string }) => {
     const m = members.find((u: User) => u.id === tm.user_id);
     return acc + (m?.power || 0);
  }, 0);

  const teamMembers = useMemo(() => {
      let list = team.members.map((tm: { user_id: string, role_tag?: string }) => ({
         ...members.find((m: User) => m.id === tm.user_id),
         role_tag: tm.role_tag
      })).filter((m: any) => m.id) as any[];

      return sortGuildWarMembers(list, sortState);
  }, [team.members, members, sortState]);

  return (
    <ThemedPanelBox
      variant="team"
      rootRef={setNodeRef}
      dropOver={isOver}
      sx={{ mb: 2 }}
      left={
        <Stack direction="row" alignItems="center" spacing={1}>
          <TextField
            variant="standard"
            defaultValue={team.name}
            placeholder={t('guild_war.squad_name_placeholder')}
            disabled={!canManage}
            InputProps={{ disableUnderline: true, sx: { fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' } }}
          />
        </Stack>
      }
      right={
        <Stack direction="row" alignItems="center" spacing={1}>
          {canManage && (
            <Box sx={{ display: 'flex', gap: 0.5, p: 0.5, bgcolor: panelTokens.panelControlBg, borderRadius: 1, border: '1px solid', borderColor: panelTokens.panelBorder }}>
              <ThemedIconButton size="small" onClick={() => onAssignRole('lead')} sx={{ p: 0.5, color: getGuildWarRoleColor(theme, 'lead') }}><EmojiEvents sx={{ fontSize: 14 }} /></ThemedIconButton>
              <ThemedIconButton size="small" onClick={() => onAssignRole('dmg')} sx={{ p: 0.5, color: getGuildWarRoleColor(theme, 'dps') }}><ElectricBolt sx={{ fontSize: 14 }} /></ThemedIconButton>
              <ThemedIconButton size="small" onClick={() => onAssignRole('tank')} sx={{ p: 0.5, color: getGuildWarRoleColor(theme, 'tank') }}><Shield sx={{ fontSize: 14 }} /></ThemedIconButton>
              <ThemedIconButton size="small" onClick={() => onAssignRole('healer')} sx={{ p: 0.5, color: getGuildWarRoleColor(theme, 'heal') }}><Favorite sx={{ fontSize: 14 }} /></ThemedIconButton>
            </Box>
          )}

          <Chip
            icon={<ElectricBolt sx={{ fontSize: 12 }} />}
            label={formatPower(totalPower)}
            size="small"
            variant="outlined"
            sx={{
              height: 24,
              borderColor: panelTokens.panelBorder,
              bgcolor: panelTokens.panelControlBg,
              color: panelTokens.panelText,
              '& .MuiChip-label': { fontSize: '0.6rem', fontFamily: 'monospace' },
            }}
          />
          <Chip
            icon={<People sx={{ fontSize: 12 }} />}
            label={team.members.length}
            size="small"
            variant="outlined"
            sx={{
              height: 24,
              borderColor: panelTokens.panelBorder,
              bgcolor: panelTokens.panelControlBg,
              color: panelTokens.panelText,
              '& .MuiChip-label': { fontSize: '0.6rem', fontFamily: 'monospace' },
            }}
          />
          {canManage && (
            <>
              <ThemedIconButton size="small" sx={{ color: panelTokens.panelText }}>
                <Edit sx={{ fontSize: 14 }} />
              </ThemedIconButton>
              <ThemedIconButton variant="overlayDanger" size="small">
                <Delete sx={{ fontSize: 14 }} />
              </ThemedIconButton>
            </>
          )}
        </Stack>
      }
      contentSx={{
        p: 2,
        minHeight: 120,
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)', xl: 'repeat(5, 1fr)' },
        gap: 1.5,
      }}
    >
          {teamMembers.map((member: User & { role_tag?: string }) => {
            const isHighlighted = !!memberSearchQuery && [member.username, member.wechat_name, member.id]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(memberSearchQuery);
            return (
              <DraggableMemberCard
                key={member.id}
                member={member}
                selected={selectedIds.has(member.id)}
                highlighted={isHighlighted}
                onClick={onMemberClick}
                onDoubleClick={onMemberDoubleClick}
                onKick={() => onMemberKick(member.id)}
                role={member.role_tag}
                canManage={canManage}
              />
            );
          })}
          {teamMembers.length === 0 && (
             <Box sx={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed', borderColor: panelTokens.panelBorder, borderRadius: 2 }}>
                <Typography variant="caption" fontWeight={900} color="text.disabled" letterSpacing="0.1em">{t('guild_war.drop_operatives_here')}</Typography>
             </Box>
          )}
    </ThemedPanelBox>
  );
}

function WarHistory() {
  return <WarHistoryView />;
}

const WarAnalytics = ({ canCopy }: { canCopy: boolean }) => <WarAnalyticsMain canCopy={canCopy} />;

function AddMemberModal({ open, onClose, members, currentParticipants, onAdd }: any) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const available = members.filter((m: User) => !currentParticipants.find((p: User) => p.id === m.id));
  const filtered = available.filter((m: User) => m.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <Typography variant="overline" fontWeight={900} letterSpacing="0.1em">{t('guild_war.deploy_operative')}</Typography>
         <IconButton size="small" onClick={onClose}><Close sx={{ fontSize: 18 }} /></IconButton>
      </DialogTitle>
      <DialogContent>
         <TextField 
             fullWidth 
             placeholder={`${t('common.search')}...`} 
             value={search} 
             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
             InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16 }} /></InputAdornment> }}
             sx={{ mb: 2, mt: 1 }}
         />
         <Stack spacing={1} sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {filtered.map((m: User) => (
               <Box 
                  key={m.id} 
                  onClick={() => onAdd(m.id)}
                  sx={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                      p: 1, borderRadius: 1, cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                  }}
               >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                     <Avatar src={m.avatar_url} alt={m.username} variant="rounded" sx={{ width: 32, height: 32 }} />
                     <Box>
                        <Typography variant="body2" fontWeight={700} dangerouslySetInnerHTML={sanitizeHtml(m.username)} />
                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">{formatPower(m.power)}</Typography>
                     </Box>
                  </Stack>
                  <Add sx={{ fontSize: 16 }} />
               </Box>
            ))}
         </Stack>
      </DialogContent>
    </Dialog>
  )
}

function MemberDetailModal({
  userId,
  members,
  onClose,
}: {
  userId: string | null;
  members: User[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const member = members.find((m: User) => m.id === userId);
  if(!member) return null;

  const renderAvailability = () => {
    if (!member.availability || member.availability.length === 0) {
      return <Typography variant="caption" color="text.secondary">{t('admin.no_schedule')}</Typography>;
    }

    const days = member.availability
      .filter((d) => d.blocks && d.blocks.length > 0)
      .map((d) => `${d.day}: ${d.blocks.map((b) => `${b.start}-${b.end}`).join(', ')}`);

    if (days.length === 0) {
      return <Typography variant="caption" color="text.secondary">{t('admin.no_schedule')}</Typography>;
    }

    return (
      <Stack spacing={0.5}>
        {days.map((line) => (
          <Typography key={line} variant="caption" color="text.secondary">{line}</Typography>
        ))}
      </Stack>
    );
  };

  const sumRecord = (obj?: Record<string, number>) =>
    Object.values(obj || {}).reduce((acc, n) => acc + (n || 0), 0);

  const renderProgressionTotal = () => {
    const p = member.progression;
    if (!p) return 0;
    return sumRecord(p.qishu) + sumRecord(p.wuxue) + sumRecord(p.xinfa);
  };

  return (
    <Dialog open={!!userId} onClose={onClose} fullWidth maxWidth="md">
       <Card sx={{ overflow: 'hidden' }}>
          <Box sx={{ height: 120, background: 'linear-gradient(to right bottom, #1e3a8a, #581c87)', position: 'relative' }}>
             <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}><Close sx={{ fontSize: 20 }} /></IconButton>
          </Box>
          <Box sx={{ px: 3, pb: 3, mt: -5 }}>
             <Avatar
                src={member.avatar_url}
                alt={member.username}
                variant="rounded"
                sx={{ width: 80, height: 80, border: '4px solid', borderColor: 'background.paper', boxShadow: 3, mb: 2 }}
             />
             <Typography variant="h5" fontWeight={900} fontStyle="italic" textTransform="uppercase" gutterBottom dangerouslySetInnerHTML={sanitizeHtml(member.username)} />
             <Stack direction="row" spacing={1} mb={3} flexWrap="wrap" useFlexGap>
                {(member.classes || []).map((cls: string) => (
                  <Chip
                    key={cls}
                    label={formatClassDisplayName(cls)}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase' }}
                  />
                ))}
                <Chip label={`${t('admin.label_power').toUpperCase()}: ${formatPower(member.power)}`} size="small" variant="filled" sx={{ fontSize: '0.6rem', fontWeight: 900 }} />
             </Stack>

             <Grid container spacing={2}>
               <Grid size={6}>
                 <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                   <Typography variant="caption" color="text.secondary" fontWeight={900} letterSpacing="0.1em">{t('admin.label_role')}</Typography>
                   <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                     <EmojiEvents sx={{ fontSize: 14, color: theme.palette.warning.main }} />
                     <Typography variant="body2" fontWeight={700}>{member.role.toUpperCase()}</Typography>
                   </Stack>
                 </Box>
               </Grid>
               <Grid size={6}>
                 <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                   <Typography variant="caption" color="text.secondary" fontWeight={900} letterSpacing="0.1em">{t('common.status')}</Typography>
                   <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                     <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: member.active_status === 'active' ? 'success.main' : member.active_status === 'vacation' ? 'warning.main' : 'text.disabled' }} />
                     <Typography variant="body2" fontWeight={700}>
                       {member.active_status === 'active'
                         ? t('common.active').toUpperCase()
                         : member.active_status === 'vacation'
                           ? t('common.vacation').toUpperCase()
                           : t('common.inactive').toUpperCase()}
                     </Typography>
                   </Stack>
                 </Box>
               </Grid>
               <Grid size={6}>
                 <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                   <Typography variant="caption" color="text.secondary" fontWeight={900} letterSpacing="0.1em">{t('profile.label_wechat')}</Typography>
                   <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>{member.wechat_name || t('admin.no_wechat')}</Typography>
                 </Box>
               </Grid>
               <Grid size={6}>
                 <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                   <Typography variant="caption" color="text.secondary" fontWeight={900} letterSpacing="0.1em">ID</Typography>
                   <Typography variant="body2" fontFamily="monospace" sx={{ mt: 0.5 }}>{member.id}</Typography>
                 </Box>
               </Grid>
             </Grid>

             <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
               <Typography variant="caption" color="text.secondary" fontWeight={900} letterSpacing="0.1em">{t('profile.label_title')}</Typography>
               <Typography variant="body2" sx={{ mt: 0.75 }} dangerouslySetInnerHTML={sanitizeHtml(member.title_html || '-')}/>
             </Box>

             <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
               <Typography variant="caption" color="text.secondary" fontWeight={900} letterSpacing="0.1em">{t('profile.label_bio')}</Typography>
               <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, whiteSpace: 'pre-wrap' }}>
                 {member.bio || t('roster.no_bio')}
               </Typography>
             </Box>

             <Grid container spacing={2} sx={{ mt: 0.5 }}>
               <Grid size={6}>
                 <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider', minHeight: 120 }}>
                   <Typography variant="caption" color="text.secondary" fontWeight={900} letterSpacing="0.1em">{t('admin.availability_matrix')}</Typography>
                   <Box sx={{ mt: 0.75 }}>
                     {renderAvailability()}
                   </Box>
                 </Box>
               </Grid>
               <Grid size={6}>
                 <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider', minHeight: 120 }}>
                   <Typography variant="caption" color="text.secondary" fontWeight={900} letterSpacing="0.1em">{t('admin.progression_summary')}</Typography>
                   <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
                    <Chip size="small" label={`QISHU: ${sumRecord(member.progression?.qishu)}`} />
                    <Chip size="small" label={`WUXUE: ${sumRecord(member.progression?.wuxue)}`} />
                    <Chip size="small" label={`XINFA: ${sumRecord(member.progression?.xinfa)}`} />
                     <Chip size="small" color="primary" label={`TOTAL: ${renderProgressionTotal()}`} />
                   </Stack>
                 </Box>
               </Grid>
             </Grid>

             <Grid container spacing={2} sx={{ mt: 0.5 }}>
               <Grid size={6}>
                 <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                   <Typography variant="caption" color="text.secondary" fontWeight={900} letterSpacing="0.1em">CREATED</Typography>
                   <Typography variant="body2" sx={{ mt: 0.75 }}>
                     {member.created_at ? formatDateTime(member.created_at) : '-'}
                   </Typography>
                 </Box>
               </Grid>
               <Grid size={6}>
                 <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                   <Typography variant="caption" color="text.secondary" fontWeight={900} letterSpacing="0.1em">UPDATED</Typography>
                   <Typography variant="body2" sx={{ mt: 0.75 }}>
                     {member.updated_at ? formatDateTime(member.updated_at) : '-'}
                   </Typography>
                 </Box>
               </Grid>
             </Grid>
          </Box>
       </Card>
    </Dialog>
  )
}

function ActiveWarSkeleton() {
  return (
    <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
      {/* Left Column: Pool Skeleton */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Skeleton variant="circular" width={32} height={32} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={16} />
            </Box>
          </Stack>
        </Paper>
        <Stack spacing={1}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      </Grid>

      {/* Right Column: Teams Board Skeleton */}
      <Grid size={{ xs: 12, md: 9 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="text" width="30%" height={32} />
          <Skeleton variant="rectangular" width={100} height={28} sx={{ borderRadius: 1 }} />
        </Box>
        <Stack spacing={2}>
          {[1, 2].map((i) => (
            <Card key={i}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Skeleton variant="text" width="20%" height={24} />
              </Box>
              <CardContent>
                <Grid container spacing={1}>
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Grid key={j} size={{ xs: 12, sm: 6, lg: 4 }}>
                      <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Grid>
    </Grid>
  );
}

