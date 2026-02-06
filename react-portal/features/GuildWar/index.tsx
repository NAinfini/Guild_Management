
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
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
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
  Paper,
  alpha
} from '@mui/material';
import { WarAnalyticsMain } from './components/WarAnalytics';
import { WarHistory as WarHistoryView } from './components/WarHistory';
import { WarTeamDragDrop } from './components/WarTeamDragDrop';
import { Toast } from '../../components/Toast';
import { PlaceholderPage } from '../../components/PlaceholderPage';
import { 
  Swords, 
  LayoutGrid, 
  Plus, 
  Users, 
  Shield, 
  ChevronDown, 
  Search, 
  GripVertical, 
  History as HistoryIcon, 
  Trash2, 
  Edit3,
  BarChart3,
  X,
  Crown,
  Heart,
  Sparkles,
  Zap,
  Undo2,
  Trophy
} from 'lucide-react';
import { cn, getClassColor, formatPower, formatDateTime, getOptimizedMediaUrl, sanitizeHtml } from '../../lib/utils';
import { useAuthStore, useUIStore } from '../../store';
import { User, WarTeam } from '../../types';
import { useTranslation } from 'react-i18next';
import { useEvents, useMembers, useJoinEvent, useLeaveEvent } from '../../hooks/useServerState';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useWarHistory, useWarTeams, useMovePoolToTeam, useMoveTeamToPool, useMoveTeamToTeam, useKickFromTeam, useKickFromPool } from './hooks/useWars';
import { usePush } from '../../hooks/usePush';
import { Skeleton, useMediaQuery } from '@mui/material';
import { CardGridSkeleton } from '../../components/SkeletonLoaders';
import { useOnline } from '../../hooks/useOnline';

type Tab = 'active' | 'history' | 'analytics';

export function GuildWar() {
  const [activeTab, setActiveTab] = useState<Tab>('active');

  // ✅ TanStack Query: Server state
  const { data: events = [], isLoading } = useEvents();

  const { setPageTitle } = useUIStore();
  const { t } = useTranslation();
  const theme = useTheme();
  const online = useOnline();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setPageTitle(t('nav.guild_war'));
  }, [setPageTitle, t]);


  
  const warEvents = useMemo(() => 
    events.filter(e => e.type === 'guild_war').sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()),
  [events]);

  const [selectedWarId, setSelectedWarId] = useState<string>('');

  useEffect(() => {
    if (!selectedWarId && warEvents.length > 0) {
      setSelectedWarId(warEvents[0].id);
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
             <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                 <ToggleButtonGroup
                    value={activeTab}
                    exclusive
                    onChange={(_, val) => val && setActiveTab(val)}
                    size="small"
                    sx={{ 
                        '& .MuiToggleButton-root': {
                            border: 0,
                            borderRadius: 0,
                            px: 3,
                            py: 1,
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            color: 'text.secondary',
                            '&.Mui-selected': {
                                bgcolor: 'action.selected',
                                color: 'primary.main',
                                boxShadow: 'inset 0 -2px 0 0 currentColor'
                            }
                        }
                    }}
                 >
                    <ToggleButton value="active">
                        <Stack direction="row" gap={1} alignItems="center">
                            <Swords size={16} /> {t('guild_war.tab_active')}
                        </Stack>
                    </ToggleButton>
                    <ToggleButton value="history">
                        <Stack direction="row" gap={1} alignItems="center">
                            <HistoryIcon size={16} /> {t('guild_war.tab_history')}
                        </Stack>
                    </ToggleButton>
                    <ToggleButton value="analytics">
                        <Stack direction="row" gap={1} alignItems="center">
                            <BarChart3 size={16} /> {t('guild_war.tab_analytics')}
                        </Stack>
                    </ToggleButton>
                 </ToggleButtonGroup>
             </Paper>
         </Stack>

         {activeTab === 'active' && (
             <FormControl size="small" sx={{ minWidth: 240 }}>
                 <Select
                   value={selectedWarId}
                   onChange={(e) => setSelectedWarId(e.target.value)}
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
         )}
      </Box>

      <Box sx={{ flex: 1 }}>
        {activeTab === 'active' && <ActiveWarManagement warId={selectedWarId} />}
        {activeTab === 'history' && <WarHistory />}
        {activeTab === 'analytics' && <WarAnalytics />}
      </Box>
    </Box>
  );
}

type LastAction = { desc: string; undo: () => void; expiry: number; }

function ActiveWarManagement({ warId }: { warId: string }) {
  // ✅ TanStack Query: Server state and mutations
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
  const online = useOnline();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const activeWar = useMemo(() => events.find(e => e.id === warId), [events, warId]);
  
  const { data: warData, refetch: refetchWar, isLoading: isLoadingTeams } = useWarTeams(warId);
  const movePoolToTeam = useMovePoolToTeam();
  const moveTeamToPool = useMoveTeamToPool();
  const moveTeamToTeam = useMoveTeamToTeam();
  const kickFromTeam = useKickFromTeam();
  const kickFromPool = useKickFromPool();
  const [teams, setTeams] = useState<WarTeam[]>([]);
  const [pool, setPool] = useState<User[]>([]);
  const [etag, setEtag] = useState<string | undefined>(undefined);

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

  if (isLoadingTeams) return <ActiveWarSkeleton />;
  
  const [lastAction, setLastAction] = useState<LastAction | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [toastOpen, setToastOpen] = useState(false);

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

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [memberDetailId, setMemberDetailId] = useState<string | null>(null);

  const [poolSort, setPoolSort] = useState<'power' | 'class'>('power');
  const [teamSort, setTeamSort] = useState<'power' | 'class'>('power');

  const assignedUserIds = useMemo(() => {
    const set = new Set<string>();
    teams.forEach(t => t.members.forEach(m => set.add(m.user_id)));
    return set;
  }, [teams]);

  const legacyTeams = useMemo(() => {
    return teams.map(t => ({
      id: t.id,
      name: t.name,
      members: t.members
        .map(m => members.find(u => u.id === m.user_id))
        .filter(Boolean) as User[],
    }));
  }, [teams, members]);

  const poolMembers = useMemo(() => {
    const source = pool.length > 0 ? pool : activeWar?.participants || [];
    let list = source.filter(p => !assignedUserIds.has(p.id));
    if (poolSort === 'power') list = list.sort((a, b) => b.power - a.power);
    else if (poolSort === 'class') list = list.sort((a, b) => (a.classes?.[0] || 'z').localeCompare(b.classes?.[0] || 'z'));
    return list;
  }, [activeWar, assignedUserIds, poolSort, pool]);

  const toggleSelection = (id: string, multi: boolean) => {
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
     setMemberDetailId(id);
  };

  const [conflictOpen, setConflictOpen] = useState(false);
  const handleConflict = (err: any) => {
    if (err?.response?.error === 'ETAG_MISMATCH' || err?.status === 409) {
      setConflictOpen(true);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveDragId(id);
    if (!selectedIds.has(id)) setSelectedIds(new Set([id]));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!online) return;
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
      if (!online) return;
      if(confirm(t('guild_war.remove_confirm'))) {
          try {
            await kickFromPool.mutateAsync({ warId, userId });
          } catch(e) { console.error(e); }
      }
  };

  const handleKickFromTeam = async (userId: string) => {
      if (!online) return;
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
     if (!online) return;
     setTeams(prev => prev.map(t => {
        if (t.id !== teamId) return t;
        return { ...t, members: t.members.map(m => selectedIds.has(m.user_id) ? { ...m, role_tag: role } : m) };
     }));
     setSelectedIds(new Set());
  };

  const handleLegacyAssign = async (userId: string, teamId?: string) => {
      // Optimistic Update
      setTeams(prev => {
         const next = prev.map(t => ({ ...t, members: t.members.filter(m => m.user_id !== userId) }));
         if (teamId) {
            const target = next.find(t => t.id === teamId);
            if (target && !target.members.find(m => m.user_id === userId)) {
               target.members.push({ user_id: userId } as any);
            }
         }
         return next;
      });

      try {
          if (teamId) {
             // Treat as Move Pool->Team or Team->Team
             // Simplification: Assume Pool->Team if not in team map?
             // Since this is "Legacy Assign", it might be safer to use specific endpoint if we know source.
             // But UI doesn't give source easily here.
             // Let's Find source from PREVIOUS state (which we just mutated? no, we mutated via setTeams callback)
             // We need current teams state before mutation.
             
             // Actually, for simplicity on mobile/legacy:
             // If we just use movePoolToTeam, it might fail if user is already in team.
             // We should find user's current team first.
             const sourceTeam = teams.find(t => t.members.find(m => m.user_id === userId));
             if (sourceTeam) {
                 if (sourceTeam.id !== teamId) {
                     await moveTeamToTeam.mutateAsync({ warId, userId, sourceTeamId: sourceTeam.id, targetTeamId: teamId });
                 }
             } else {
                 await movePoolToTeam.mutateAsync({ warId, userId, teamId });
             }
          } else {
             // Unassign -> Move to Pool
             const sourceTeam = teams.find(t => t.members.find(m => m.user_id === userId));
             if (sourceTeam) {
                 await moveTeamToPool.mutateAsync({ warId, userId });
             } else {
                 // Already in pool?
                 // maybe kickFromPool if we want to remove? 
                 // But 'unassign' usually implies 'back to pool'.
             }
          }
      } catch (e: any) {
          handleConflict(e);
          refetchWar();
      }
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
        icon={Swords}
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
          disabled={!online}
          onAssign={async (userId, teamId) => {
            if (!online) return;
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
           onAdd={(userId: string) => { if (!online) return; joinEvent(activeWar.id, userId); }}
        />
      </Stack>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2, position: 'relative' }}>
        <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
            {/* LEFT COLUMN: POOL */}
            <Grid size={{ xs: 12, md: 3 }} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Paper sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, mb: 2, bgcolor: 'background.paper' }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Users size={16} className="text-muted-foreground" />
                      </Box>
                      <Box>
                          <Typography variant="subtitle2" fontWeight={800} textTransform="uppercase">{t('guild_war.reserves')}</Typography>
                          <Typography variant="caption" fontFamily="monospace" color="text.secondary">{t('guild_war.operatives_count', { count: poolMembers.length })}</Typography>
                      </Box>
                  </Stack>
                  <Stack direction="row" spacing={0.5}>
                       <ToggleButtonGroup size="small" value={poolSort} exclusive onChange={(_, v) => v && setPoolSort(v)} sx={{ height: 28 }}>
                          <ToggleButton value="power" sx={{ fontSize: '0.5rem', px: 1 }}>{t('guild_war.sort_pwr')}</ToggleButton>
                          <ToggleButton value="class" sx={{ fontSize: '0.5rem', px: 1 }}>{t('guild_war.sort_cls')}</ToggleButton>
                       </ToggleButtonGroup>
                       <IconButton size="small" onClick={() => setAddMemberModalOpen(true)}><Plus size={16} /></IconButton>
                  </Stack>
                </Paper>

                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    <DroppablePool id="pool_droppable">
                        <Stack spacing={1} sx={{ minHeight: 200 }}>
                            {poolMembers.map(member => (
                            <DraggableMemberCard 
                                key={member.id} 
                                member={member} 
                                selected={selectedIds.has(member.id)}
                                onClick={handleMemberClick}
                                onDoubleClick={handleMemberDoubleClick}
                                onKick={() => handleKickFromPool(member.id)}
                            />
                            ))}
                            {poolMembers.length === 0 && (
                            <Box sx={{ py: 4, textAlign: 'center', border: '2px dashed', borderColor: 'divider', borderRadius: 2 }}>
                                <Typography variant="caption" fontWeight={900} color="text.disabled" textTransform="uppercase">{t('guild_war.empty_pool')}</Typography>
                            </Box>
                            )}
                        </Stack>
                    </DroppablePool>
                </Box>
            </Grid>

            {/* RIGHT COLUMN: TEAMS BOARD */}
            <Grid size={{ xs: 12, md: 9 }} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <LayoutGrid size={20} style={{ color: theme.palette.primary.main }} />
                        <Typography variant="h6" fontWeight={900} textTransform="uppercase" fontStyle="italic">{t('guild_war.tactical_squads')}</Typography>
                        <Tooltip title={t('guild_war.squad_controls_hint')}><Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>{t('guild_war.squad_controls_hint')}</Typography></Tooltip>
                    </Stack>
                    
                    <ToggleButtonGroup size="small" value={teamSort} exclusive onChange={(_, v) => v && setTeamSort(v)} sx={{ height: 28 }}>
                        <ToggleButton value="power" sx={{ fontSize: '0.5rem', px: 1 }}>{t('guild_war.sort_pwr')}</ToggleButton>
                        <ToggleButton value="class" sx={{ fontSize: '0.5rem', px: 1 }}>{t('guild_war.sort_cls')}</ToggleButton>
                    </ToggleButtonGroup>
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
                                sortMode={teamSort}
                            />
                        ))}
                        
                        <Button 
                            variant="outlined" 
                            fullWidth 
                            startIcon={<Plus size={16} />}
                            sx={{ borderStyle: 'dashed', height: 48, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                        >
                            {t('guild_war.new_squad')}
                        </Button>
                    </Stack>
                </Box>

                <Box sx={{ mt: 2, p: 2, borderRadius: 3, border: '1px dashed', borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Typography variant="caption" fontWeight={900} letterSpacing="0.1em" sx={{ display: 'block', mb: 1 }}>
                    {t('guild_war.quick_assign_legacy') || 'Quick Assign'}
                  </Typography>
                  <WarTeamDragDrop
                    warId={warId}
                    teams={legacyTeams}
                    unassignedMembers={poolMembers}
                    onAssign={(userId: string, teamId?: string) => handleLegacyAssign(userId, teamId)}
                  />
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
                icon={<Undo2 className="animate-pulse" size={16} />}
                action={
                    <Button color="inherit" size="small" onClick={handleUndo} sx={{ fontSize: '0.65rem', fontWeight: 900 }}>
                        UNDO ({timeLeft})
                    </Button>
                }
                sx={{ borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'primary.main', alignItems: 'center' }}
            >
                <Typography variant="body2" fontWeight={700}>{lastAction?.desc}</Typography>
            </Alert>
        </Snackbar>
        <Toast open={toastOpen && !!lastAction} message={lastAction?.desc || ''} severity="info" onClose={() => setToastOpen(false)} />

        <Dialog open={conflictOpen} onClose={() => setConflictOpen(false)}>
          <DialogTitle>{t('guild_war.conflict_title') || 'Conflict detected'}</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              {t('guild_war.conflict_body') || 'Another moderator changed this war. Refresh data or force override?'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setConflictOpen(false); refetchWar(); }}>{t('common.refresh') || 'Refresh'}</Button>
            <Button variant="contained" color="warning" onClick={() => { setConflictOpen(false); setEtag(undefined); }}>{t('guild_war.override') || 'Override'}</Button>
          </DialogActions>
        </Dialog>

      </Box>

      <DragOverlay>
         {activeDragId ? (
            <Paper sx={{ width: 220, opacity: 0.9, transform: 'rotate(2deg)', borderRadius: 2 }}>
               <MemberCardOverlay id={activeDragId} members={members} count={selectedIds.size} />
            </Paper>
         ) : null}
      </DragOverlay>

      <AddMemberModal 
         open={addMemberModalOpen}
         onClose={() => setAddMemberModalOpen(false)} 
         members={members} 
         currentParticipants={activeWar.participants || []}
         onAdd={(userId: string) => { if (!online) return; joinEvent(activeWar.id, userId); }}
      />

      <MemberDetailModal 
         userId={memberDetailId} 
         members={members} 
         onClose={() => setMemberDetailId(null)} 
      />
    </DndContext>
  );
}

function DraggableMemberCard({ member, selected, onClick, onDoubleClick, onKick, role }: { member: User, selected?: boolean, onClick: (id: string, e: React.MouseEvent) => void, onDoubleClick: (id: string, e: React.MouseEvent) => void, onKick: () => void, role?: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: member.id });
  const theme = useTheme();

  const getRoleIcon = (r?: string) => {
     switch(r) {
        case 'lead': return <Crown size={12} color={theme.custom?.warRoles.lead.main} />;
        case 'dmg': return <Swords size={12} color={theme.custom?.warRoles.dps.main} />;
        case 'tank': return <Shield size={12} color={theme.custom?.warRoles.tank.main} />;
        case 'healer': return <Heart size={12} color={theme.custom?.warRoles.heal.main} />;
        case 'support': return <Sparkles size={12} color="#a855f7" />;
        default: return null;
     }
  };

  return (
    <Card
      ref={setNodeRef} 
      {...listeners} 
      {...attributes}
      onClick={(e) => onClick(member.id, e)} 
      onDoubleClick={(e) => onDoubleClick(member.id, e)}
      sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          cursor: 'grab',
          opacity: isDragging ? 0.3 : 1,
          border: '1px solid',
          borderRadius: 2,
          borderColor: (() => {
             if (selected) return theme.palette.primary.main;
             const c = member.classes?.[0];
             if (c && c.includes('qiansilin')) return alpha(theme.palette.success.main, 0.2);
             if (c && c.includes('lieshiwei')) return alpha(theme.palette.warning.main, 0.2);
             if (c && c.includes('tianwei')) return alpha(theme.palette.warning.dark, 0.2);
             return alpha(theme.palette.info.main, 0.2);
          })(),
          bgcolor: (() => {
             if (selected) return alpha(theme.palette.primary.main, 0.1);
             const c = member.classes?.[0];
             if (c && c.includes('qiansilin')) return alpha(theme.palette.success.main, 0.05);
             if (c && c.includes('lieshiwei')) return alpha(theme.palette.warning.main, 0.05);
             if (c && c.includes('tianwei')) return alpha(theme.palette.warning.dark, 0.05);
             return alpha(theme.palette.info.main, 0.05);
          })(),
          transition: 'all 0.2s',
          '&:active': { cursor: 'grabbing' },
          '&:hover': { borderColor: theme.palette.primary.main, boxShadow: 1 }
      }}
    >
       <Box sx={{ flex: 1, overflow: 'hidden', mr: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
             <Typography variant="body2" noWrap fontWeight={700} sx={{ color: 'text.primary' }} dangerouslySetInnerHTML={sanitizeHtml(member.username)} />
             {role && <Box sx={{ p: 0.5, borderRadius: '50%', bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', display: 'flex' }}>{getRoleIcon(role)}</Box>}
          </Stack>
          
          <Stack direction="row" alignItems="center" spacing={1}>
              {member.classes && member.classes.length > 0 && (
                 <Box sx={{ 
                     px: 1, py: 0.25, borderRadius: 4, 
                     fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase',
                     bgcolor: (() => {
                         const c = member.classes[0];
                         if (c && c.includes('qiansilin')) return 'success.main';
                         if (c && c.includes('lieshiwei')) return 'warning.main';
                         return 'info.main';
                     })(),
                     color: '#fff'
                 }}>
                     {member.classes[0].replace(/_/g, ' ')}
                 </Box>
              )}
              <Box sx={{
                  px: 1, py: 0.25, borderRadius: 4,
                  fontSize: '0.6rem', fontWeight: 700, fontFamily: 'monospace',
                  bgcolor: theme.custom?.warRoles.lead.bg,
                  color: theme.custom?.warRoles.lead.text,
                  border: 1,
                  borderColor: alpha(theme.custom?.warRoles.lead.main as string, 0.3)
              }}>
                  {formatPower(member.power)}
              </Box>
          </Stack>
       </Box>
       
       <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton 
             size="small"
             onPointerDown={(e) => e.stopPropagation()}
             onClick={(e) => { e.stopPropagation(); onKick(); }}
             sx={{ 
                 p: 0.5, 
                 color: 'error.main', 
                 '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' }
             }}
          >
             <Trash2 size={12} />
          </IconButton>
       </Stack>
       
       {selected && <GripVertical size={14} style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', color: theme.palette.primary.main }} />}
    </Card>
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
         <Card sx={{ p: 1.5, border: '1px solid', borderColor: 'primary.main', boxShadow: 4 }}>
             <Typography variant="body2" fontWeight={700} noWrap>{member.username}</Typography>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.6rem', fontFamily: 'monospace' }}>
                 <Zap size={10} /> {formatPower(member.power)}
             </Box>
         </Card>
      </Box>
   )
}

function DroppablePool({ id, children }: { id: string, children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const theme = useTheme();
  return (
    <Box 
        ref={setNodeRef} 
        sx={{ 
            borderRadius: 3, 
            transition: 'all 0.2s', 
            minHeight: '100%',
            p: 1,
            bgcolor: isOver ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
            outline: isOver ? `2px dashed ${theme.palette.primary.main}` : 'none'
        }}
    >
      {children}
    </Box>
  );
}

function DroppableTeam({ 
    team, 
    members, 
    selectedIds, 
    onMemberClick, 
    onMemberDoubleClick, 
    onMemberKick, 
    onAssignRole,
    sortMode 
}: any) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: team.id });
  const theme = useTheme();
  
  const totalPower = team.members.reduce((acc: any, tm: any) => {
     const m = members.find((u: any) => u.id === tm.user_id);
     return acc + (m?.power || 0);
  }, 0);

  const teamMembers = useMemo(() => {
      let list = team.members.map((tm: any) => ({
         ...members.find((m: any) => m.id === tm.user_id),
         role_tag: tm.role_tag
      })).filter((m: any) => m.id) as any[];

      if (sortMode === 'power') list = list.sort((a: any, b: any) => b.power - a.power);
      else if (sortMode === 'class') list = list.sort((a: any, b: any) => (a.classes?.[0] || 'z').localeCompare(b.classes?.[0] || 'z'));
      return list;
  }, [team.members, members, sortMode]);

  return (
    <Box 
        ref={setNodeRef} 
        sx={{ 
            borderRadius: 3, 
            border: `2px solid`, 
            borderColor: isOver ? 'primary.main' : 'divider',
            bgcolor: isOver ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.background.paper, 0.4),
            transition: 'all 0.2s',
            mb: 2
        }}
    >
       <Box sx={{ 
           px: 2, py: 1.5, 
           display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
           borderBottom: '1px solid', borderColor: 'divider',
           bgcolor: 'action.hover',
           borderTopLeftRadius: 10, borderTopRightRadius: 10
       }}>
          <Stack direction="row" alignItems="center" spacing={1}>
             <Box sx={{ width: 4, height: 24, borderRadius: 1, bgcolor: 'primary.main' }} />
             <TextField 
                variant="standard" 
                defaultValue={team.name} 
                placeholder={t('guild_war.squad_name_placeholder')}
                InputProps={{ disableUnderline: true, sx: { fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' } }}
             />
          </Stack>
          
          <Stack direction="row" alignItems="center" spacing={1}>
             <Box sx={{ display: 'flex', gap: 0.5, p: 0.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <IconButton size="small" onClick={() => onAssignRole('lead')} sx={{ p: 0.5, color: theme.custom?.warRoles.lead.main }}><Crown size={14} /></IconButton>
                <IconButton size="small" onClick={() => onAssignRole('dmg')} sx={{ p: 0.5, color: theme.custom?.warRoles.dps.main }}><Swords size={14} /></IconButton>
                <IconButton size="small" onClick={() => onAssignRole('tank')} sx={{ p: 0.5, color: theme.custom?.warRoles.tank.main }}><Shield size={14} /></IconButton>
                <IconButton size="small" onClick={() => onAssignRole('healer')} sx={{ p: 0.5, color: theme.custom?.warRoles.heal.main }}><Heart size={14} /></IconButton>
             </Box>

             <Chip icon={<Zap size={12} />} label={formatPower(totalPower)} size="small" variant="outlined" sx={{ height: 24, '& .MuiChip-label': { fontSize: '0.6rem', fontFamily: 'monospace' } }} />
             <Chip icon={<Users size={12} />} label={team.members.length} size="small" variant="outlined" sx={{ height: 24, '& .MuiChip-label': { fontSize: '0.6rem', fontFamily: 'monospace' } }} />
             <IconButton size="small"><Edit3 size={14} /></IconButton>
             <IconButton size="small" color="error"><Trash2 size={14} /></IconButton>
          </Stack>
       </Box>
       
       <Box sx={{ 
           p: 2, 
           minHeight: 120, 
           display: 'grid', 
           gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)', xl: 'repeat(5, 1fr)' }, 
           gap: 1.5 
       }}>
          {teamMembers.map((member: any) => (
             <DraggableMemberCard 
                key={member.id} 
                member={member}
                selected={selectedIds.has(member.id)}
                onClick={onMemberClick}
                onDoubleClick={onMemberDoubleClick}
                onKick={() => onMemberKick(member.id)}
                role={member.role_tag}
             />
          ))}
          {teamMembers.length === 0 && (
             <Box sx={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="caption" fontWeight={900} color="text.disabled" letterSpacing="0.1em">{t('guild_war.drop_operatives_here')}</Typography>
             </Box>
          )}
       </Box>
    </Box>
  );
}

function WarHistory() {
  return <WarHistoryView />;
}

const WarAnalytics = () => <WarAnalyticsMain />;

function AddMemberModal({ open, onClose, members, currentParticipants, onAdd }: any) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const available = members.filter((m: User) => !currentParticipants.find((p: User) => p.id === m.id));
  const filtered = available.filter((m: User) => m.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <Typography variant="overline" fontWeight={900} letterSpacing="0.1em">{t('guild_war.deploy_operative')}</Typography>
         <IconButton size="small" onClick={onClose}><X size={18} /></IconButton>
      </DialogTitle>
      <DialogContent>
         <TextField 
             fullWidth 
             placeholder={`${t('common.search')}...`} 
             value={search} 
             onChange={e => setSearch(e.target.value)}
             InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> }}
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
                     <Avatar src={m.avatar_url} variant="rounded" sx={{ width: 32, height: 32 }} />
                     <Box>
                        <Typography variant="body2" fontWeight={700} dangerouslySetInnerHTML={sanitizeHtml(m.username)} />
                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">{formatPower(m.power)}</Typography>
                     </Box>
                  </Stack>
                  <Plus size={16} />
               </Box>
            ))}
         </Stack>
      </DialogContent>
    </Dialog>
  )
}

function MemberDetailModal({ userId, members, onClose }: any) {
  const { t } = useTranslation();
  const member = members.find((m: User) => m.id === userId);
  if(!member) return null;

  return (
    <Dialog open={!!userId} onClose={onClose} fullWidth maxWidth="sm">
       <Card sx={{ overflow: 'hidden' }}>
          <Box sx={{ height: 120, background: 'linear-gradient(to right bottom, #1e3a8a, #581c87)', position: 'relative' }}>
             <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}><X size={20} /></IconButton>
          </Box>
          <Box sx={{ px: 3, pb: 3, mt: -5 }}>
             <Avatar 
                src={member.avatar_url} 
                variant="rounded" 
                sx={{ width: 80, height: 80, border: '4px solid', borderColor: 'background.paper', boxShadow: 3, mb: 2 }} 
             />
             <Typography variant="h5" fontWeight={900} fontStyle="italic" textTransform="uppercase" gutterBottom dangerouslySetInnerHTML={sanitizeHtml(member.username)} />
             <Stack direction="row" spacing={1} mb={3}>
                {member.classes && member.classes[0] && <Chip label={member.classes[0].replace('_', ' ')} size="small" variant="outlined" sx={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase' }} />}
                <Chip label={`${t('admin.label_power').toUpperCase()}: ${formatPower(member.power)}`} size="small" variant="filled" sx={{ fontSize: '0.6rem', fontWeight: 900 }} />
             </Stack>
             
             <Grid container spacing={2}>
                 <Grid size={6}>
                    <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                       <Typography variant="caption" color="text.secondary" fontWeight={900} letterSpacing="0.1em">{t('admin.label_role')}</Typography>
                       <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                          <Crown size={14} color="#eab308" />
                          <Typography variant="body2" fontWeight={700}>{member.role.toUpperCase()}</Typography>
                       </Stack>
                    </Box>
                 </Grid>
                 <Grid size={6}>
                    <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                       <Typography variant="caption" color="text.secondary" fontWeight={900} letterSpacing="0.1em">{t('common.status')}</Typography>
                       <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                           <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: member.status === 'online' ? 'success.main' : 'text.disabled' }} />
                           <Typography variant="body2" fontWeight={700}>{member.status?.toUpperCase() || 'OFFLINE'}</Typography>
                       </Stack>
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
