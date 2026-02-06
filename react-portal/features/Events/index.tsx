
import React, { useState, useMemo, useEffect } from 'react';
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
  DialogContentText,
  TextField, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  InputAdornment, 
  useTheme,
  alpha,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Alert
} from '@mui/material';
import { 
  Clock, 
  Users, 
  Copy, 
  Lock, 
  Pin, 
  Archive, 
  CopyPlus, 
  Trash2, 
  UserPlus, 
  UserMinus, 
  AlertTriangle,
  RefreshCw,
  Check,
  Zap,
  Search,
  X,
  Plus,
  LogOut,
  Edit,
  Swords,
  CalendarDays
} from 'lucide-react';
import { formatDateTime, getClassColor, cn, formatPower } from '../../lib/utils';
import { useAuthStore, useUIStore } from '../../store';
import { useTranslation } from 'react-i18next';
import { User, Event } from '../../types';
import { useMobileOptimizations, useOnline, usePush } from '../../hooks';
import { BottomSheetDialog } from '../../components/BottomSheetDialog';
import { DecorativeGlyph } from '../../components/DecorativeGlyph';
import { EnhancedButton } from '../../components/EnhancedButton';
import { Skeleton } from '@mui/material';
import { CardGridSkeleton } from '../../components/SkeletonLoaders';
import {
  useEvents,
  useMembers,
  useJoinEvent,
  useLeaveEvent,
  useArchiveEvent,
  useTogglePinEvent,
  useToggleLockEvent,
  useDeleteEvent
} from '../../hooks/useServerState';

type EventFilter = 'all' | 'weekly_mission' | 'guild_war' | 'other';

export function Events() {
  const { user, viewRole } = useAuthStore();

  // ✅ TanStack Query: Server state with automatic caching and refetching
  const { data: events = [], isLoading: isLoadingEvents } = useEvents();
  const { data: members = [], isLoading: isLoadingMembers } = useMembers();
  const isLoading = isLoadingEvents || isLoadingMembers;

  // ✅ TanStack Query: Mutations with automatic cache invalidation
  const joinEventMutation = useJoinEvent();
  const leaveEventMutation = useLeaveEvent();
  const archiveEventMutation = useArchiveEvent();
  const togglePinMutation = useTogglePinEvent();
  const toggleLockMutation = useToggleLockEvent();
  const deleteEventMutation = useDeleteEvent();

  // Wrapper functions to match existing API
  const joinEvent = async (eventId: string, userId: string) => {
    await joinEventMutation.mutateAsync({ eventId, userId });
  };
  const leaveEvent = async (eventId: string, userId: string) => {
    await leaveEventMutation.mutateAsync({ eventId, userId });
  };
  const archiveEvent = async (id: string, isArchived: boolean) => {
    await archiveEventMutation.mutateAsync({ id, isArchived });
  };
  const togglePinEvent = async (id: string) => {
    await togglePinMutation.mutateAsync(id);
  };
  const toggleLockEvent = async (id: string) => {
    await toggleLockMutation.mutateAsync(id);
  };
  const deleteEvent = async (id: string) => {
    await deleteEventMutation.mutateAsync(id);
  };

  const { timezoneOffset, setPageTitle } = useUIStore();
  const { t } = useTranslation();
  const theme = useTheme();
  const mobile = useMobileOptimizations();
  const online = useOnline();

  useEffect(() => {
    setPageTitle(t('nav.events'));
  }, [setPageTitle, t]);
  
  const [filter, setFilter] = useState<EventFilter>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState<string | null>(null); // Event ID if open
  
  // Confirmation dialog states (replacing browser confirm())
  const [conflictDialog, setConflictDialog] = useState<{ event: Event; conflictingEvent: Event } | null>(null);
  const [withdrawDialog, setWithdrawDialog] = useState<string | null>(null); // Event ID
  const [kickDialog, setKickDialog] = useState<{ eventId: string; userId: string; username: string } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null); // Event ID

  const effectiveRole = viewRole || user?.role;
  const isAdmin = effectiveRole === 'admin' || effectiveRole === 'moderator';
  
  const lastSeenKey = 'last_seen_events_at';
  const lastSeen = localStorage.getItem(lastSeenKey) || new Date(0).toISOString();

  const filteredEvents = useMemo(() => {
    return events
      .filter(e => (showArchived ? e.is_archived : !e.is_archived))
      .filter(e => filter === 'all' || e.type === filter)
      .sort((a, b) => {
          if (!showArchived && a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
          return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      });
  }, [events, filter, showArchived]);



  const handleMarkAllAsRead = () => {
    setIsMarkingAllAsRead(true);
    localStorage.setItem(lastSeenKey, new Date().toISOString());
    setTimeout(() => setIsMarkingAllAsRead(false), 500);
  };

  const getConflictingEvent = (event: Event) => {
    const myJoinedEvents = events.filter(e => user && e.participants?.some(p => p.id === user.id));
    const start = new Date(event.start_time).getTime();
    const end = event.end_time ? new Date(event.end_time).getTime() : start + (3600 * 1000);
    
    return myJoinedEvents.find(e => {
      if (e.id === event.id) return false;
      const eStart = new Date(e.start_time).getTime();
      const eEnd = e.end_time ? new Date(e.end_time).getTime() : eStart + (3600 * 1000);
      return (start < eEnd && end > eStart);
    });
  };

  // Handle join with conflict check
  const handleJoin = (event: Event) => {
    const conflict = getConflictingEvent(event);
    if (conflict) {
      setConflictDialog({ event, conflictingEvent: conflict });
    } else {
      joinEvent(event.id, user!.id);
    }
  };

  const confirmJoinWithConflict = () => {
    if (conflictDialog) {
      joinEvent(conflictDialog.event.id, user!.id);
      setConflictDialog(null);
    }
  };

  const handleWithdraw = (eventId: string) => {
    setWithdrawDialog(eventId);
  };

  const confirmWithdraw = () => {
    if (withdrawDialog) {
      leaveEvent(withdrawDialog, user!.id);
      setWithdrawDialog(null);
    }
  };

  const handleKick = (eventId: string, userId: string, username: string) => {
    setKickDialog({ eventId, userId, username });
  };

  const confirmKick = () => {
    if (kickDialog) {
      leaveEvent(kickDialog.eventId, kickDialog.userId);
      setKickDialog(null);
    }
  };

  const handleDelete = (eventId: string) => {
    setDeleteDialog(eventId);
  };

  const confirmDelete = () => {
    if (deleteDialog) {
      deleteEvent(deleteDialog);
      setDeleteDialog(null);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        pb: { xs: 'calc(96px + env(safe-area-inset-bottom))', md: 10 },
        px: { xs: 1.5, sm: 2.5 },
      }}
      data-testid="events-root"
    >

      {isLoading && events.length === 0 && <CardGridSkeleton count={3} aspectRatio="16/9" />}

      <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center" justifyContent="space-between" mb={4}>
        <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(_, newFilter) => newFilter && setFilter(newFilter)}
            aria-label="event filters"
            size="small"
            sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 2,
                '& .MuiToggleButton-root': { 
                    border: 'none', 
                    borderRadius: 2, 
                    mx: 0.5,
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    letterSpacing: '0.1em',
                    py: 1,
                    minHeight: mobile.touchTargetSize,
                    px: 2,
                    textTransform: 'uppercase',
                    '&.Mui-selected': {
                        bgcolor: 'background.default',
                        color: 'primary.main',
                        boxShadow: 2
                    }
                }
            }}
        >
            {(['all', 'weekly_mission', 'guild_war', 'other'] as const).map(f => (
               <ToggleButton key={f} value={f}>
                  {t(`events.filter_${f.split('_')[0]}`)}
               </ToggleButton>
            ))}
        </ToggleButtonGroup>
        
        <Button 
            variant={showArchived ? "contained" : "outlined"} 
            size="small" 
            onClick={() => setShowArchived(!showArchived)} 
            startIcon={<Archive size={14} />}
            sx={{ 
                height: 40,
                fontSize: '0.65rem', 
                fontWeight: 900, 
                letterSpacing: '0.1em'
            }}
        >
          {showArchived ? t('events.active_archive') : t('events.historical_data')}
        </Button>
        {isAdmin && (
           <EnhancedButton 
               size="small" 
               onClick={() => setAddMemberModalOpen(null)} 
               startIcon={<Plus size={14} />}
               disabled={!online}
               sx={{ 
                   height: 40, 
                   fontSize: '0.65rem', 
                   letterSpacing: '0.1em'
               }}
           >
             {t('events.new_deployment')}
           </EnhancedButton>
        )}
      </Stack>

      {isLoading && filteredEvents.length === 0 && <CardGridSkeleton count={3} aspectRatio="16/9" />}

      <Stack spacing={4}>
        {filteredEvents.map(event => {
          const isUpdated = event.updated_at && new Date(event.updated_at) > new Date(lastSeen);
          const conflict = getConflictingEvent(event);
          
          return (
            <EventOperationCard 
              key={event.id} 
              event={event} 
              user={user}
              isAdmin={isAdmin}
              isUpdated={isUpdated}
              conflict={conflict}
              onJoin={() => handleJoin(event)}
              onLeave={() => handleWithdraw(event.id)}
              onKick={(userId: string, username: string) => handleKick(event.id, userId, username)}
              onAdd={() => setAddMemberModalOpen(event.id)}
              onToggleArchive={() => archiveEvent(event.id, !event.is_archived)}
              onTogglePin={() => togglePinEvent(event.id)}
              onToggleLock={() => toggleLockEvent(event.id)}
              onDelete={() => handleDelete(event.id)}
            />
          );
        })}
        
        {filteredEvents.length === 0 && (
          <Box sx={{ 
              py: 8, 
              textAlign: 'center', 
              border: '2px dashed', 
              borderColor: 'divider', 
              borderRadius: 4, 
              bgcolor: 'action.hover' 
          }}>
            <Box sx={{ p: 4, mb: 2, borderRadius: '50%', bgcolor: 'background.paper', display: 'inline-flex' }}>
                <Clock className="opacity-40" size={48} />
            </Box>
            <Typography variant="overline" display="block" color="text.secondary" fontWeight={900} letterSpacing="0.2em">
                {t('events.no_operations')}
            </Typography>
          </Box>
        )}
      </Stack>

      {addMemberModalOpen && (
         <AddMemberModal 
           open={!!addMemberModalOpen}
           onClose={() => setAddMemberModalOpen(null)} 
           members={members}
           currentParticipants={events.find(e => e.id === addMemberModalOpen)?.participants || []}
           onAdd={(userId: string) => joinEvent(addMemberModalOpen!, userId)}
         />
      )}

      {/* Conflict Confirmation Dialog */}
      <Dialog 
        open={!!conflictDialog} 
        onClose={() => setConflictDialog(null)}
        PaperProps={{ sx: { borderRadius: 4, border: `1px solid ${theme.palette.divider}` } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlertTriangle size={20} color={theme.palette.warning.main} />
          <Typography variant="overline" fontWeight={900} letterSpacing="0.1em">
            {t('events.conflict_detected')}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t('events.conflict_warning')}
          </DialogContentText>
          {conflictDialog && (
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary" fontWeight={900} letterSpacing="0.1em">
                {t('events.conflicting_event')}:
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {conflictDialog.conflictingEvent.title}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConflictDialog(null)} color="inherit">
            {t('common.cancel')}
          </Button>
          <Button onClick={confirmJoinWithConflict} variant="contained" color="warning">
            {t('events.join_anyway')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Confirmation Dialog */}
      <Dialog 
        open={!!withdrawDialog} 
        onClose={() => setWithdrawDialog(null)}
        PaperProps={{ sx: { borderRadius: 4, border: `1px solid ${theme.palette.divider}` } }}
      >
        <DialogTitle>
          <Typography variant="overline" fontWeight={900} letterSpacing="0.1em">
            {t('events.withdraw_title')}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('events.withdraw_confirm')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setWithdrawDialog(null)} color="inherit">
            {t('common.cancel')}
          </Button>
          <Button onClick={confirmWithdraw} variant="contained" color="error">
            {t('events.withdraw')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Kick Member Confirmation Dialog */}
      <Dialog 
        open={!!kickDialog} 
        onClose={() => setKickDialog(null)}
        PaperProps={{ sx: { borderRadius: 4, border: `1px solid ${theme.palette.divider}` } }}
      >
        <DialogTitle>
          <Typography variant="overline" fontWeight={900} letterSpacing="0.1em">
            {t('events.kick_title')}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('events.kick_confirm_message', { username: kickDialog?.username || '' })}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setKickDialog(null)} color="inherit">
            {t('common.cancel')}
          </Button>
          <Button onClick={confirmKick} variant="contained" color="error">
            {t('events.kick')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Event Confirmation Dialog */}
      <Dialog 
        open={!!deleteDialog} 
        onClose={() => setDeleteDialog(null)}
        PaperProps={{ sx: { borderRadius: 4, border: `1px solid ${theme.palette.divider}` } }}
      >
        <DialogTitle>
          <Typography variant="overline" fontWeight={900} letterSpacing="0.1em">
            {t('events.delete_title')}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('events.delete_confirm')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialog(null)} color="inherit">
            {t('common.cancel')}
          </Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function AddMemberModal({ open, onClose, members, currentParticipants, onAdd }: any) {
   const [searchQuery, setSearchQuery] = useState('');
   const { t } = useTranslation();
   const theme = useTheme();
   const mobile = useMobileOptimizations();
   
   const availableMembers = members
      .filter((m: User) => !currentParticipants.some((p: User) => p.id === m.id))
      .filter((m: User) => m.username.toLowerCase().includes(searchQuery.toLowerCase()));

   return (
      <BottomSheetDialog 
        open={open} 
        onClose={onClose} 
        title={t('events.add_operative')}
        fullWidth
        maxWidth="xs"
      >
         <Box sx={{ px: 2, pb: 3 }}>
            <TextField 
                fullWidth 
                placeholder={`${t('common.search')}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                    startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment>,
                    sx: { borderRadius: 2, fontSize: '0.85rem' }
                }}
                sx={{ mb: 2, mt: 1 }}
            />
            <List sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.default', borderRadius: 2 }}>
               {availableMembers.map((m: User) => (
                  <ListItem 
                    key={m.id} 
                    secondaryAction={
                        <IconButton edge="end" size="small" color="primary" onClick={() => onAdd(m.id)}>
                            <Plus size={18} />
                        </IconButton>
                    }
                    sx={{ '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, mx: 1, width: 'auto' }}
                  >
                     <ListItemAvatar>
                        <Avatar src={m.avatar_url} variant="rounded" sx={{ width: 32, height: 32 }} />
                     </ListItemAvatar>
                     <ListItemText 
                        primary={<Typography variant="body2" fontWeight={800}>{m.username}</Typography>}
                        secondary={<Typography variant="caption" fontFamily="monospace">{formatPower(m.power)}</Typography>}
                     />
                  </ListItem>
               ))}
               {availableMembers.length === 0 && (
                  <Typography variant="caption" display="block" textAlign="center" color="text.disabled" sx={{ py: 4 }}>
                      NO OPERATIVES FOUND
                  </Typography>
               )}
            </List>
         </Box>
      </BottomSheetDialog>
   );
}

function EventOperationCard({ event, user, isAdmin, isUpdated, conflict, onJoin, onLeave, onKick, onAdd, onToggleArchive, onTogglePin, onToggleLock, onDelete }: any) {
  const { t } = useTranslation();
  const { timezoneOffset } = useUIStore();
  const theme = useTheme();
  const mobile = useMobileOptimizations();
  const online = useOnline();
  
  const isJoined = user && event.participants?.some((p: any) => p.id === user.id);
  const isFull = event.capacity && (event.participants?.length || 0) >= event.capacity;
  
  const totalPower = event.participants?.reduce((acc: number, p: User) => acc + (p.power || 0), 0) || 0;
  const glyphIcon = event.type === 'guild_war' ? Swords : CalendarDays;
  const glyphColor = event.type === 'guild_war'
    ? alpha(theme.palette.primary.main, 0.5)
    : alpha(theme.palette.secondary.main, 0.5);

  const handleCopyRoster = () => {
    const names = event.participants
      .map((p: any) => `@${p.wechat_name || p.username}`)
      .join(', ');
    const text = `${event.title} Roster:\n${names}`;
    navigator.clipboard.writeText(text);
  };
  
  return (
    <Card sx={{ 
        position: 'relative', 
        overflow: 'hidden',
        opacity: event.is_archived ? 0.6 : 1,
        borderStyle: event.is_archived ? 'dashed' : 'solid',
        transition: 'all 0.3s'
    }}>
      <DecorativeGlyph icon={glyphIcon} color={glyphColor} size={190} opacity={0.06} right={-30} top={-30} />
      <CardContent sx={{ p: 3 }}>
         <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            
            <Box flex={1}>
               <Stack direction="row" flexWrap="wrap" alignItems="center" justifyContent="space-between" mb={2} gap={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                     <Chip
                        label={event.type.replace('_', ' ')}
                        size="small"
                        variant="outlined"
                        sx={{
                          height: 20,
                          fontSize: '0.6rem',
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          bgcolor: theme.custom?.eventTypes[event.type as keyof typeof theme.custom.eventTypes]?.bg,
                          color: theme.custom?.eventTypes[event.type as keyof typeof theme.custom.eventTypes]?.text,
                          borderColor: theme.custom?.eventTypes[event.type as keyof typeof theme.custom.eventTypes]?.main
                        }}
                     />
                     {event.is_pinned && <Pin size={14} style={{ color: theme.palette.primary.main }} />}
                     {isUpdated && (
                        <Chip
                            label={t('common.label_updated')}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.55rem',
                              fontWeight: 900,
                              bgcolor: theme.custom?.chips.updated.bg,
                              color: theme.custom?.chips.updated.text,
                              borderColor: theme.custom?.chips.updated.main
                            }}
                        />
                     )}
                  </Stack>
                  
                  <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
                      <Tooltip title="Copy Roster">
                        <IconButton 
                            size="small" 
                            onClick={handleCopyRoster} 
                            sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
                        >
                            <Copy size={14} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Copy Roster">
                        <IconButton 
                            size="small" 
                            onClick={handleCopyRoster} 
                            sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
                        >
                            <Copy size={14} />
                        </IconButton>
                      </Tooltip>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                          <Zap size={12} color={theme.palette.primary.main} />
                          <Typography variant="caption" fontWeight={900}>{formatPower(totalPower)}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                          <Users size={12} />
                          <Typography variant="caption" fontWeight={900} color={isFull ? 'error.main' : 'text.primary'}>
                              {event.participants?.length || 0} / {event.capacity || '∞'}
                          </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Clock size={12} />
                          <Typography variant="caption" fontWeight={900} textTransform="uppercase">
                              {formatDateTime(event.start_time, timezoneOffset)}
                          </Typography>
                      </Box>
                  </Stack>
               </Stack>
               
               <Box mb={3}>
                  <Typography variant="h5" sx={{ fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', mb: 1 }}>
                      {event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {event.description}
                  </Typography>
               </Box>
               
               <Box sx={{ 
                   display: 'grid', 
                   gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, 
                   gap: 1.5 
               }} data-testid="participant-grid" data-cols={mobile.isMobile ? '1' : '3'}>
                  {event.participants?.map((p: User) => (
                     <Box 
                        key={p.id} 
                        sx={{ 
                            position: 'relative',
                            p: 1.5, 
                            borderRadius: 2, 
                            bgcolor: (() => {
                                const c = p.classes?.[0] || '';
                                if (c.includes('qiansilin')) return alpha(theme.palette.success.main, 0.05);
                                if (c.includes('lieshiwei')) return alpha(theme.palette.warning.main, 0.05);
                                if (c.includes('tianwei')) return alpha(theme.palette.warning.dark, 0.05);
                                return alpha(theme.palette.info.main, 0.05);
                            })(),
                            border: '1px solid', 
                            borderColor: (() => {
                                const c = p.classes?.[0] || '';
                                if (c.includes('qiansilin')) return alpha(theme.palette.success.main, 0.2);
                                if (c.includes('lieshiwei')) return alpha(theme.palette.warning.main, 0.2);
                                if (c.includes('tianwei')) return alpha(theme.palette.warning.dark, 0.2);
                                return alpha(theme.palette.info.main, 0.2);
                            })(),
                            transition: 'all 0.2s',
                            '&:hover': {
                                boxShadow: 1
                            }
                        }}
                     >
                        <Stack spacing={1} overflow="hidden">
                           <Stack direction="row" alignItems="center" justifyContent="space-between">
                               <Typography variant="body2" noWrap sx={{ fontWeight: 800 }}>{p.username}</Typography>
                               {isAdmin && (
                                  <IconButton 
                                      size="small" 
                                      onClick={(e) => { e.stopPropagation(); onKick(p.id, p.username); }}
                                      sx={{ 
                                          p: 0.5, 
                                          color: 'text.secondary',
                                          minWidth: mobile.touchTargetSize,
                                          minHeight: mobile.touchTargetSize,
                                          '&:hover': { color: 'error.main' }
                                      }}
                                  >
                                      <LogOut size={12} />
                                  </IconButton>
                               )}
                           </Stack>
                           
                           <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" gap={0.5}>
                               {p.classes && p.classes.length > 0 && (
                                  <Box sx={{
                                      px: 1, py: 0.25, borderRadius: 4,
                                      fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase',
                                      bgcolor: (() => {
                                          const c = p.classes[0];
                                          if (c.includes('qiansilin')) return theme.custom?.classes.qiansi.bg;
                                          if (c.includes('lieshiwei')) return theme.custom?.classes.lieshi.bg;
                                          if (c.includes('mingjin')) return theme.custom?.classes.mingjin.bg;
                                          if (c.includes('pozhu')) return theme.custom?.classes.pozhu.bg;
                                          return alpha(theme.palette.info.main, 0.15);
                                      })(),
                                      color: (() => {
                                          const c = p.classes[0];
                                          if (c.includes('qiansilin')) return theme.custom?.classes.qiansi.text;
                                          if (c.includes('lieshiwei')) return theme.custom?.classes.lieshi.text;
                                          if (c.includes('mingjin')) return theme.custom?.classes.mingjin.text;
                                          if (c.includes('pozhu')) return theme.custom?.classes.pozhu.text;
                                          return theme.palette.info.light;
                                      })(),
                                      border: 1,
                                      borderColor: (() => {
                                          const c = p.classes[0];
                                          if (c.includes('qiansilin')) return alpha(theme.custom?.classes.qiansi.main as string, 0.3);
                                          if (c.includes('lieshiwei')) return alpha(theme.custom?.classes.lieshi.main as string, 0.3);
                                          if (c.includes('mingjin')) return alpha(theme.custom?.classes.mingjin.main as string, 0.3);
                                          if (c.includes('pozhu')) return alpha(theme.custom?.classes.pozhu.main as string, 0.3);
                                          return alpha(theme.palette.info.main, 0.3);
                                      })()
                                  }}>
                                      {p.classes[0].replace(/_/g, ' ')}
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
                                   {formatPower(p.power)}
                               </Box>
                           </Stack>
                        </Stack>
                     </Box>
                  ))}
                  
                  {isAdmin && (
                     <Button 
                        variant="outlined" 
                        onClick={onAdd}
                        sx={{ 
                            borderStyle: 'dashed', 
                            flexDirection: 'column', 
                            gap: 0.5,
                            borderRadius: 2,
                            color: 'text.secondary',
                            borderColor: 'divider',
                            minHeight: mobile.touchTargetSize * 1.2
                        }}
                     >
                         <Plus size={16} />
                         <Typography variant="caption" fontWeight={900}>{t('events.add_operative')}</Typography>
                     </Button>
                  )}

                  {(!event.participants || event.participants.length === 0) && !isAdmin && (
                      <Box sx={{ gridColumn: '1 / -1', py: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                         <Typography variant="caption" fontWeight={900} color="text.disabled" letterSpacing="0.1em">
                             {t('events.awaiting_deployment')}
                         </Typography>
                      </Box>
                  )}
               </Box>
            </Box>
            
            <Stack 
                spacing={2} 
                justifyContent="center" 
                sx={{ 
                    minWidth: { md: 160 }, 
                    borderLeft: { md: `1px solid ${theme.palette.divider}` }, 
                    borderTop: { xs: `1px solid ${theme.palette.divider}`, md: 'none' },
                    pl: { md: 3 }, 
                    pt: { xs: 3, md: 0 } 
                }}
            >
               {user && !event.is_archived && (
                 <Button 
                    fullWidth 
                    size="large"
                    variant={isJoined ? "outlined" : "contained"}
                    color={isJoined ? "error" : "primary"}
                    onClick={isJoined ? onLeave : onJoin}
                    disabled={!online || event.is_locked || (!isJoined && isFull)}
                    startIcon={isJoined ? <UserMinus size={16} /> : <UserPlus size={16} />}
                    sx={{ height: mobile.touchTargetSize + 8, fontWeight: 900, borderRadius: 3, letterSpacing: '0.1em' }}
                 >
                    {isJoined ? t('events.withdraw') : t('events.enlist')}
                 </Button>
               )}
               {isAdmin && (
                   <Stack direction="row" spacing={1} justifyContent="center">
                   <IconButton onClick={() => { /* Edit logic */ }} sx={{ minWidth: mobile.touchTargetSize, minHeight: mobile.touchTargetSize }}><Edit size={18} /></IconButton>
                     <IconButton onClick={onTogglePin} color={event.is_pinned ? "primary" : "default"} disabled={!online} sx={{ minWidth: mobile.touchTargetSize, minHeight: mobile.touchTargetSize }}><Pin size={18} /></IconButton>
                    <IconButton onClick={onToggleLock} color={event.is_locked ? "error" : "default"} disabled={!online} sx={{ minWidth: mobile.touchTargetSize, minHeight: mobile.touchTargetSize }}><Lock size={18} /></IconButton>
                    <IconButton onClick={onToggleArchive} disabled={!online} sx={{ minWidth: mobile.touchTargetSize, minHeight: mobile.touchTargetSize }}><Archive size={18} /></IconButton>
                    <IconButton onClick={onDelete} color="error" disabled={!online} sx={{ minWidth: mobile.touchTargetSize, minHeight: mobile.touchTargetSize }}><Trash2 size={18} /></IconButton>
                  </Stack>
               )}
               
               {conflict && isJoined && (
                  <Alert severity="warning" icon={<AlertTriangle size={14} />} sx={{ py: 0, px: 2, alignItems: 'center', '& .MuiAlert-message': { fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' } }}>
                     {t('events.overlap_detected')}
                  </Alert>
               )}
            </Stack>

         </Stack>
      </CardContent>
    </Card>
  )
}

// Utility to map class types to visual styles
function getBadgeStyle(classType: string, theme: any) {
    // This is a simplified mapping, ideally this logic is centralized or based on the theme palette
    let color = theme.palette.text.secondary;
    let bgcolor = theme.palette.action.hover;
    
    if (classType.includes('tianwei')) { color = '#fcd34d'; bgcolor = 'rgba(252, 211, 77, 0.1)'; }
    if (classType.includes('tieyi')) { color = '#60a5fa'; bgcolor = 'rgba(96, 165, 250, 0.1)'; }
    if (classType.includes('susu')) { color = '#34d399'; bgcolor = 'rgba(52, 211, 153, 0.1)'; }
    
    return { color, bgcolor };
}
