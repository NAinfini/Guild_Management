import React, { useState, useMemo, useEffect } from 'react';

import { 

  Typography, 
  Box, 
  Stack,  
  TextField, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  InputAdornment, 
  useTheme,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
  Alert
} from '@mui/material';
import { 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent, 
  TooltipProvider,
  Button,
  Card, 
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Avatar,
  BottomSheetDialog, 
  DecorativeGlyph, 
  EnhancedButton, 
  MarkdownContent, 
  CardGridSkeleton, 
  Badge, 
  ScrollArea, 
  PageFilterBar, 
  type PageFilterOption 
} from "@/components";
import { 
  AccessTime as AccessTimeIcon, 
  Groups as GroupsIcon, 
  ContentCopy as ContentCopyIcon, 
  Lock as LockIcon, 
  PushPin as PushPinIcon, 
  Archive as ArchiveIcon,
  LibraryAdd as LibraryAddIcon, 
  Delete as DeleteIcon, 
  PersonAdd as PersonAddIcon, 
  PersonRemove as PersonRemoveIcon, 
  ReportProblem as WarningIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  FlashOn as FlashOnIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  MilitaryTech as MilitaryTechIcon,
  CalendarToday as CalendarDaysIcon,
  FilterList as FilterIcon,
  LockOpen as LockOpenIcon
} from '@mui/icons-material';
import { formatDateTime, formatPower, formatClassDisplayName, getMemberCardAccentColors, getClassPillTone, cn } from '../../lib/utils';
import { useAuthStore, useUIStore } from '../../store';
import { useTranslation } from 'react-i18next';
import { User, Event, ClassType } from '../../types';
import { useMobileOptimizations, useOnline } from '../../hooks';

import { storage, STORAGE_KEYS } from '../../lib/storage';
import { filterEventsByCategory, type EventFilter } from './Events.filtering';
import { getVisibleParticipants } from './Events.participants';
import {
  canArchiveEvent,
  canCreateEvent,
  canCopyEventSignup,
  canDeleteEvent,
  canEditEvent,
  canJoinEvents,
  canLockEvent,
  canManageEventParticipants,
  canPinEvent,
  getEffectiveRole,
} from '../../lib/permissions';
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
import { useFilteredList } from '../../hooks/useFilteredList';

export function isArchivedEventFilter(filter: EventFilter): boolean {
  return filter === 'archived';
}

export function getEventFilterCategories(t: (key: string) => string): PageFilterOption[] {
  return [
    { value: 'all', label: t('events.filter_all') },
    { value: 'weekly_mission', label: t('events.filter_weekly') },
    { value: 'guild_war', label: t('events.filter_guild') },
    { value: 'other', label: t('events.filter_other') },
    { value: 'archived', label: t('events.filter_archived') },
  ];
}

export function getEventTypeLabel(eventType: Event['type'], t: (key: string) => string): string {
  switch (eventType) {
    case 'weekly_mission':
      return t('events.filter_weekly');
    case 'guild_war':
      return t('events.filter_guild');
    case 'other':
    default:
      return t('events.filter_other');
  }
}

export function getEventTypeFallbackTone(eventType: Event['type']) {
  switch (eventType) {
    case 'weekly_mission':
      return { bg: 'info.main', text: 'info.contrastText', border: 'info.dark' } as const;
    case 'guild_war':
      return { bg: 'error.main', text: 'error.contrastText', border: 'error.dark' } as const;
    case 'other':
    default:
      return { bg: 'secondary.main', text: 'secondary.contrastText', border: 'secondary.dark' } as const;
  }
}

function buildMemberAccentGradient(accentColors: string[]): string {
  const [first, second, third] = accentColors;
  const opacity = 0.5;

  if (third) {
    // Three colors: diagonal sections with sharp cuts
    return `
      linear-gradient(135deg, ${alpha(first, opacity)} 0%, ${alpha(first, opacity)} 33.33%, transparent 33.33%),
      linear-gradient(225deg, ${alpha(second, opacity)} 0%, ${alpha(second, opacity)} 33.33%, transparent 33.33%),
      linear-gradient(315deg, ${alpha(third, opacity)} 0%, ${alpha(third, opacity)} 33.33%, transparent 33.33%)
    `.replace(/\s+/g, ' ').trim();
  }
  if (second) {
    // Two colors: diagonal split with sharp cut at 50%
    return `linear-gradient(135deg, ${alpha(first, opacity)} 0%, ${alpha(first, opacity)} 50%, ${alpha(second, opacity)} 50%, ${alpha(second, opacity)} 100%)`;
  }
  // Single color
  return alpha(first, opacity);
}

export function Events() {
  const { user, viewRole } = useAuthStore();
  const { timezoneOffset, setPageTitle } = useUIStore();
  const { t } = useTranslation();
  const theme = useTheme();
  const mobile = useMobileOptimizations();
  const online = useOnline();

  const [filter, setFilter] = useState<EventFilter>('all');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const includeArchived = isArchivedEventFilter(filter);

  // ✅ TanStack Query: Server state with automatic caching and refetching
  const { data: events = [], isLoading: isLoadingEvents } = useEvents({ 
    includeArchived,
    type: filter === 'all' || filter === 'archived' ? undefined : filter,
    search,
    startDate,
    endDate
  });
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

  useEffect(() => {
    setPageTitle(t('nav.events'));
  }, [setPageTitle, t]);
  
  const [addMemberModalOpen, setAddMemberModalOpen] = useState<string | null>(null); // Event ID if open
  
  // Confirmation dialog states
  const [conflictDialog, setConflictDialog] = useState<{ event: Event; conflictingEvent: Event } | null>(null);
  const [withdrawDialog, setWithdrawDialog] = useState<string | null>(null); // Event ID
  const [kickDialog, setKickDialog] = useState<{ eventId: string; userId: string; username: string } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null); // Event ID

  const effectiveRole = getEffectiveRole(user?.role, viewRole);
  const canCreate = canCreateEvent(effectiveRole);
  const canJoin = canJoinEvents(effectiveRole);
  const canCopy = canCopyEventSignup(effectiveRole);
  const canEdit = canEditEvent(effectiveRole);
  const canDelete = canDeleteEvent(effectiveRole);
  const canPin = canPinEvent(effectiveRole);
  const canLock = canLockEvent(effectiveRole);
  const canArchive = canArchiveEvent(effectiveRole);
  const canManageParticipants = canManageEventParticipants(effectiveRole);
  
  const lastSeenKey = STORAGE_KEYS.EVENTS_LAST_SEEN;
  const lastSeen = storage.get<string>(
    lastSeenKey,
    storage.get<string>('last_seen_events_at', new Date(0).toISOString())
  );

  useEffect(() => {
    storage.set(lastSeenKey, lastSeen);
    storage.remove('last_seen_events_at');
  }, [lastSeen, lastSeenKey]);

  const eventSortFn = useMemo(
    () => (a: any, b: any) => {
      if (!includeArchived && a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    },
    [includeArchived]
  );

  const filteredEvents = useFilteredList({
    items: filterEventsByCategory(events, filter),
    searchText: '',
    searchFields: [],
    sortFn: eventSortFn,
  });

  const categories: PageFilterOption[] = getEventFilterCategories(t);

  const getConflictingEvent = (event: Event) => {
    if (!user) return undefined;
    const myJoinedEvents = events.filter(e => e.participants?.some(p => p.id === user.id));
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
    if (!canJoin) return;
    const conflict = getConflictingEvent(event);
    if (conflict) {
      setConflictDialog({ event, conflictingEvent: conflict });
    } else {
      joinEvent(event.id, user!.id);
    }
  };

  const confirmJoinWithConflict = () => {
    if (canJoin && conflictDialog && user) {
      joinEvent(conflictDialog.event.id, user.id);
      setConflictDialog(null);
    }
  };

  const confirmWithdraw = () => {
    if (withdrawDialog && user) {
      leaveEvent(withdrawDialog, user.id);
      setWithdrawDialog(null);
    }
  };

  const confirmKick = () => {
    if (canManageParticipants && kickDialog) {
      leaveEvent(kickDialog.eventId, kickDialog.userId);
      setKickDialog(null);
    }
  };

  const confirmDelete = () => {
    if (canDelete && deleteDialog) {
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
      <PageFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('events.search_placeholder') || 'Search events...'}
        category={filter}
        onCategoryChange={(val) => setFilter(val as EventFilter)}
        categories={categories}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        resultsCount={filteredEvents.length}
        isLoading={isLoading}
        extraActions={
          <Stack direction="row" spacing={1}>
             {canCreate && (
              <Button
                size="sm"
                onClick={() => setAddMemberModalOpen(null)}
                disabled={!online}
                className="font-black rounded-lg"
              >
                <AddIcon sx={{ fontSize: 14 }} className="mr-2" />
                {t('events.new_deployment')}
              </Button>
            )}
          </Stack>
        }
      />

      {(isLoading && filteredEvents.length === 0) ? (
        <CardGridSkeleton count={3} aspectRatio="16/9" />
      ) : (
        <Stack spacing={4}>
          {filteredEvents.map(event => {
            const isUpdated = event.updated_at && new Date(event.updated_at) > new Date(lastSeen);
            const conflict = getConflictingEvent(event);
            
            return (
              <EventOperationCard 
                key={event.id} 
                event={event} 
                user={user}
                isUpdated={isUpdated}
                conflict={conflict}
                canJoin={canJoin}
                canCopy={canCopy}
                canManageParticipants={canManageParticipants}
                canEdit={canEdit}
                canDelete={canDelete}
                canPin={canPin}
                canLock={canLock}
                canArchive={canArchive}
                onJoin={() => handleJoin(event)}
                onLeave={() => setWithdrawDialog(event.id)}
                onKick={(userId: string, username: string) => setKickDialog({ eventId: event.id, userId, username })}
                onAdd={() => setAddMemberModalOpen(event.id)}
                onToggleArchive={() => archiveEvent(event.id, !event.is_archived)}
                onTogglePin={() => togglePinEvent(event.id)}
                onToggleLock={() => toggleLockEvent(event.id)}
                onDelete={() => setDeleteDialog(event.id)}
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
                  <GroupsIcon sx={{ fontSize: 48, opacity: 0.2, mb: 2 }} />
              </Box>
              <Typography variant="overline" display="block" color="text.secondary" fontWeight={900} letterSpacing="0.2em">
                  {t('events.no_operations')}
              </Typography>
            </Box>
          )}
        </Stack>
      )}

      {addMemberModalOpen && (
         <AddMemberModal 
           open={!!addMemberModalOpen}
           onClose={() => setAddMemberModalOpen(null)} 
           members={members}
           currentUserId={user?.id}
           currentParticipants={events.find(e => e.id === addMemberModalOpen)?.participants || []}
           onAdd={(userId: string) => joinEvent(addMemberModalOpen!, userId)}
         />
      )}

      {/* Conflict Confirmation Dialog */}
      <Dialog 
        open={!!conflictDialog} 
        onOpenChange={(open: boolean) => !open && setConflictDialog(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
           <WarningIcon sx={{ fontSize: 20, color: theme.palette.warning.main }} />
           <Typography variant="overline" fontWeight={900} letterSpacing="0.1em" component="span">
            {t('events.conflict_detected')}
           </Typography>
          </DialogTitle>
          <DialogDescription>
            {t('events.conflict_warning')}
          </DialogDescription>
          </DialogHeader>
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
        <DialogFooter>
          <Button onClick={() => setConflictDialog(null)} variant="ghost">
            {t('common.cancel')}
          </Button>
          <Button onClick={confirmJoinWithConflict} variant="default" className="bg-warning-main hover:bg-warning-dark text-warning-contrastText">
            {t('events.join_anyway')}
          </Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Confirmation Dialog */}
      <Dialog 
        open={!!withdrawDialog} 
        onOpenChange={(open: boolean) => !open && setWithdrawDialog(null)}
      >
        <DialogContent>
        <DialogHeader>
        <DialogTitle>
          <Typography variant="overline" fontWeight={900} letterSpacing="0.1em" component="span">
            {t('events.withdraw_title')}
          </Typography>
        </DialogTitle>
        <DialogDescription>
             {t('events.withdraw_confirm')}
        </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setWithdrawDialog(null)} variant="ghost">
            {t('common.cancel')}
          </Button>
          <Button onClick={confirmWithdraw} variant="destructive">
            {t('events.withdraw')}
          </Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kick Member Confirmation Dialog */}
      <Dialog 
        open={!!kickDialog} 
        onOpenChange={(open: boolean) => !open && setKickDialog(null)}
      >
        <DialogContent>
        <DialogHeader>
        <DialogTitle>
          <Typography variant="overline" fontWeight={900} letterSpacing="0.1em" component="span">
            {t('events.kick_title')}
          </Typography>
        </DialogTitle>
        <DialogDescription>
            {t('events.kick_confirm_message', { username: kickDialog?.username || '' })}
        </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setKickDialog(null)} variant="ghost">
            {t('common.cancel')}
          </Button>
          <Button onClick={confirmKick} variant="destructive">
            {t('events.kick')}
          </Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Event Confirmation Dialog */}
      <Dialog 
        open={!!deleteDialog} 
        onOpenChange={(open: boolean) => !open && setDeleteDialog(null)}
      >
        <DialogContent>
        <DialogHeader>
        <DialogTitle>
          <Typography variant="overline" fontWeight={900} letterSpacing="0.1em" component="span">
            {t('events.delete_title')}
          </Typography>
        </DialogTitle>
        <DialogDescription>
            {t('events.delete_confirm')}
        </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setDeleteDialog(null)} variant="ghost">
            {t('common.cancel')}
          </Button>
          <Button onClick={confirmDelete} variant="destructive">
            {t('common.delete')}
          </Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

function AddMemberModal({ open, onClose, members, currentParticipants, currentUserId, onAdd }: any) {
   const [searchQuery, setSearchQuery] = useState('');
   const { t } = useTranslation();
   const theme = useTheme();
   const mobile = useMobileOptimizations();
   
   const availableMembers = members
      .filter((m: User) => m.id !== currentUserId)
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
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16 }} /></InputAdornment>,
                  sx: { borderRadius: 2, fontSize: '0.85rem' }
                }}
                sx={{ mb: 2, mt: 1 }}
            />
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            <List sx={{ bgcolor: 'background.default', borderRadius: 2 }}>
               {availableMembers.map((m: User) => (
                  <ListItem 
                    key={m.id} 
                    secondaryAction={
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => onAdd(m.id)}>
                              <AddIcon sx={{ fontSize: 18 }} />
                          </Button>
                    }
                    sx={{ '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, mx: 1, width: 'auto' }}
                  >
                     <ListItemAvatar>
                        <Avatar src={m.avatar_url} alt={m.username} variant="rounded" sx={{ width: 32, height: 32 }} />
                     </ListItemAvatar>
                     <ListItemText 
                        primary={<Typography variant="body2" fontWeight={800}>{m.username}</Typography>}
                        secondary={<Typography variant="caption" fontFamily="monospace">{formatPower(m.power)}</Typography>}
                     />
                  </ListItem>
               ))}
               {availableMembers.length === 0 && (
                  <Typography variant="caption" display="block" textAlign="center" color="text.disabled" sx={{ py: 4 }}>
                      {t('events.no_operations')}
                  </Typography>
               )}
            </List>
            </ScrollArea>
         </Box>
      </BottomSheetDialog>
   );
}

function EventOperationCard({
  event,
  user,
  isUpdated,
  conflict,
  canJoin,
  canCopy,
  canManageParticipants,
  canEdit,
  canDelete,
  canPin,
  canLock,
  canArchive,
  onJoin,
  onLeave,
  onKick,
  onAdd,
  onToggleArchive,
  onTogglePin,
  onToggleLock,
  onDelete,
}: any) {
  const { t } = useTranslation();
  const { timezoneOffset } = useUIStore();
  const theme = useTheme();
  const mobile = useMobileOptimizations();
  const online = useOnline();
  
  const isJoined = user && event.participants?.some((p: any) => p.id === user.id);
  const isFull = event.capacity && (event.participants?.length || 0) >= event.capacity;
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  
  const totalPower = event.participants?.reduce((acc: number, p: User) => acc + (p.power || 0), 0) || 0;
  const glyphIcon = event.type === 'guild_war' ? MilitaryTechIcon : CalendarDaysIcon;
  const glyphColor = event.type === 'guild_war'
    ? alpha(theme.palette.primary.main, 0.5)
    : alpha(theme.palette.secondary.main, 0.5);
  const eventTypeFallbackTone = getEventTypeFallbackTone(event.type);

  const handleCopyRoster = () => {
    const names = event.participants
      .map((p: any) => `@${p.wechat_name || p.username}`)
      .join(', ');
    const text = `${event.title} Roster:\n${names}`;
    navigator.clipboard.writeText(text);
  };

  const { visibleParticipants, hiddenCount } = getVisibleParticipants(
    event.participants,
    showAllParticipants,
  );
  const participantCount = event.participants?.length || 0;
  const canToggleParticipants = participantCount > 10;
  const showExpandControl = hiddenCount > 0 && !showAllParticipants;
  const showCollapseControl = canToggleParticipants && showAllParticipants;
  const showActionColumn = showExpandControl || showCollapseControl || canManageParticipants;
  
  return (
    <Card sx={{ 
        position: 'relative', 
        overflow: 'hidden',
        opacity: event.is_archived ? 0.6 : 1,
        borderStyle: event.is_archived ? 'dashed' : 'solid',
        transition: 'all 0.3s'
    }}>
      <DecorativeGlyph icon={glyphIcon} color={glyphColor} size={190} opacity={0.06} right={-30} top={-30} />
      <CardContent className="p-6">
         <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            
            <Box flex={1}>
               <Stack direction="row" flexWrap="wrap" alignItems="center" justifyContent="space-between" mb={2} gap={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                     <Badge
                        variant="outline"
                        sx={{
                          height: 20,
                          fontSize: '0.6rem',
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          bgcolor:
                            theme.custom?.eventTypes?.[event.type as keyof typeof theme.custom.eventTypes]?.bg
                            || eventTypeFallbackTone.bg,
                          color:
                            theme.custom?.eventTypes?.[event.type as keyof typeof theme.custom.eventTypes]?.text
                            || eventTypeFallbackTone.text,
                          borderColor:
                            theme.custom?.eventTypes?.[event.type as keyof typeof theme.custom.eventTypes]?.main
                            || eventTypeFallbackTone.border,
                         }}
                     >
                        {getEventTypeLabel(event.type, t)}
                     </Badge>
                     {event.is_pinned && <PushPinIcon sx={{ fontSize: 14, color: theme.palette.primary.main }} />}
                     {isUpdated && (
                        <Badge
                            variant="outline"
                            className="h-[18px] text-[0.55rem] font-black"
                            sx={{
                              height: 18,
                              fontSize: '0.55rem',
                              fontWeight: 900,
                              bgcolor: theme.custom?.chips?.updated?.bg || 'rgba(0,255,255,0.1)',
                              color: theme.custom?.chips?.updated?.text || theme.palette.text.secondary,
                              borderColor: theme.custom?.chips?.updated?.main || theme.palette.divider
                            }}
                        >
                            {t('common.label_updated')}
                        </Badge>
                     )}
                  </Stack>
                  
                  <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
                      {canCopy && (
                        <Tooltip content={t('dashboard.copy_roster')}>
                          <Button 
                              size="icon"
                              variant="outline"
                              onClick={handleCopyRoster} 
                              className="h-7 w-7 rounded-md bg-background border-border"
                          >
                              <ContentCopyIcon sx={{ fontSize: 14 }} />
                          </Button>
                        </Tooltip>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                          <FlashOnIcon sx={{ fontSize: 12, color: theme.palette.primary.main }} />
                          <Typography variant="caption" fontWeight={900}>{formatPower(totalPower)}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                          <GroupsIcon sx={{ fontSize: 12 }} />
                          <Typography variant="caption" fontWeight={900} color={isFull ? 'error.main' : 'text.primary'}>
                              {event.participants?.length || 0} / {event.capacity || '∞'}
                          </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 12 }} />
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
                  <MarkdownContent
                    content={event.description}
                    maxLines={2}
                    variant="body2"
                    color="text.secondary"
                  />
               </Box>
               
               <Box
                 sx={{
                   display: 'grid',
                   gridTemplateColumns: { xs: '1fr', md: showActionColumn ? '1fr auto' : '1fr' },
                   gap: 1.5,
                 }}
               >
                 <Box
                   sx={{
                     display: 'grid',
                     gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(5, minmax(0, 1fr))' },
                     gap: 1.5,
                   }}
                   data-testid="participant-grid"
                 >
                  {visibleParticipants.map((p) => {
                     const participant = p as User;
                     const primaryClass = participant.classes?.[0] as ClassType | undefined;
                     const accentColors = getMemberCardAccentColors(participant.classes as ClassType[] | undefined, theme);
                     const cardBaseColor = accentColors[0];
                     const classTone = getClassPillTone(primaryClass, theme);
                     const classLabel = primaryClass ? formatClassDisplayName(primaryClass) : t('common.unknown');

                     return (
                     <Box
                        key={participant.id} 
                        sx={{ 
                            position: 'relative',
                            p: 1.25,
                            pr: 1,
                            borderRadius: 2, 
                            overflow: 'hidden',
                            bgcolor: alpha(cardBaseColor, 0.24),
                            border: '1px solid', 
                            borderColor: alpha(cardBaseColor, 0.42),
                            transition: 'all 0.2s',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                inset: 0,
                                background: buildMemberAccentGradient(accentColors),
                                pointerEvents: 'none',
                            },
                            '&:hover': {
                                boxShadow: 1.5,
                                transform: 'translateY(-1px)'
                            }
                        }}
                     >
                        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.2} sx={{ position: 'relative', zIndex: 1 }}>
                           <Box sx={{ minWidth: 0, flex: 1 }}>
                             <Typography variant="body2" noWrap sx={{ fontWeight: 900, color: 'common.white', mb: 0.5 }}>
                               {participant.username}
                             </Typography>
                             <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center', flexWrap: 'nowrap' }}>
                               <Box sx={{
                                   px: 1, py: 0.15, borderRadius: 6,
                                   fontSize: '0.62rem', fontWeight: 900, lineHeight: 1.2,
                                   bgcolor: classTone.bg,
                                   color: classTone.text,
                                   border: 1,
                                   borderColor: alpha(classTone.main, 0.55)
                               }}>
                                   {classLabel}
                               </Box>
                               <Box sx={{
                                   px: 1, py: 0.15, borderRadius: 6,
                                   fontSize: '0.62rem', fontWeight: 800, lineHeight: 1.2, fontFamily: 'monospace',
                                  bgcolor: alpha(theme.palette.primary.light, 0.14),
                                  color: 'common.white',
                                  border: 1,
                                  borderColor: alpha(theme.palette.primary.light, 0.4),
                                  flexShrink: 0,
                               }}>
                                   {formatPower(participant.power)}
                                </Box>
                             </Stack>
                           </Box>
                           {canManageParticipants && (
                             <Button 
                                size="icon"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onKick(participant.id, participant.username);
                                }}
                                className="h-7 w-7 rounded-md bg-destructive/10 border-destructive/75 text-destructive hover:bg-destructive/20"
                              >
                                <LogoutIcon sx={{ fontSize: 12 }} />
                              </Button>
                           )}
                        </Stack>
                     </Box>
                  )})}
                 </Box>

                 {showActionColumn && (
                   <Stack sx={{ minWidth: { md: 92 } }} spacing={1}>
                     {showExpandControl && (
                       <Button
                         variant="outline"
                         onClick={() => setShowAllParticipants(true)}
                         className="border-dashed rounded-lg text-muted-foreground border-border min-h-[80px] font-black"
                       >
                         {t('events.expand_members', { count: hiddenCount })}
                       </Button>
                     )}

                     {showCollapseControl && (
                       <Button
                         variant="outline"
                         onClick={() => setShowAllParticipants(false)}
                         className="border-dashed rounded-lg text-muted-foreground border-border min-h-[80px] font-black"
                       >
                         {t('events.collapse_members')}
                       </Button>
                     )}

                     {canManageParticipants && (
                       <Button
                          variant="outline"
                          onClick={onAdd}
                          className="border-dashed flex-col gap-1 rounded-lg text-muted-foreground border-border min-h-[80px] font-black"
                       >
                           <AddIcon sx={{ fontSize: 16 }} />
                           <Typography variant="caption" fontWeight={900}>{t('events.add_operative')}</Typography>
                       </Button>
                     )}
                   </Stack>
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
               {user && canJoin && !event.is_archived && (
                  <Button 
                     className={cn("w-full h-14 font-black rounded-xl tracking-widest", isJoined ? "border-destructive text-destructive hover:bg-destructive/10" : "")}
                     size="lg"
                     variant={isJoined ? "outline" : "default"}
                     onClick={isJoined ? onLeave : onJoin}
                     disabled={!online || event.is_locked || (!isJoined && isFull)}
                  >
                     {isJoined ? <PersonRemoveIcon sx={{ fontSize: 18 }} className="mr-2" /> : <PersonAddIcon sx={{ fontSize: 18 }} className="mr-2" />}
                     {isJoined ? t('events.withdraw') : t('events.enlist')}
                  </Button>
               )}
               {(canEdit || canPin || canLock || canArchive || canDelete) && (
                   <Stack direction="row" spacing={1} justifyContent="center">
                       {canEdit && (
                         <Tooltip content={t('common.edit')}>
                          <Button size="icon" variant="outline" className="h-7 w-7 bg-accent/50 border-border">
                             <EditIcon sx={{ fontSize: 16 }} />
                          </Button>
                        </Tooltip>
                       )}
                      {canPin && (
                        <Tooltip content={event.is_pinned ? t('common.unpin') : t('common.pin')}>
                          <Button 
                             size="icon" 
                             variant="outline"
                             onClick={onTogglePin}
                             className={cn("h-7 w-7 border", event.is_pinned ? "bg-primary/20 border-primary/50 text-primary" : "bg-accent/50 border-border text-muted-foreground")}
                           >
                              <PushPinIcon sx={{ fontSize: 16 }} />
                           </Button>
                        </Tooltip>
                      )}
                      {canLock && (
                        <Tooltip content={event.is_locked ? t('common.unlock') : t('common.lock')}>
                          <Button 
                             size="icon" 
                             variant="outline"
                             onClick={onToggleLock}
                             className={cn("h-7 w-7 border", event.is_locked ? "bg-destructive/20 border-destructive/50 text-destructive" : "bg-accent/50 border-border text-muted-foreground")}
                           >
                              {event.is_locked ? <LockIcon sx={{ fontSize: 16 }} /> : <LockOpenIcon sx={{ fontSize: 16 }} />}
                           </Button>
                        </Tooltip>
                      )}
                      {canArchive && (
                        <Tooltip content={event.is_archived ? t('announcements.restore') : t('announcements.archive')}>
                          <Button 
                             size="icon" 
                             variant="outline"
                             onClick={onToggleArchive}
                             className={cn("h-7 w-7 border", event.is_archived ? "bg-warning-main/18 border-warning-main/50 text-warning-main" : "bg-accent/50 border-border text-muted-foreground")}
                           >
                              <ArchiveIcon sx={{ fontSize: 16 }} />
                           </Button>
                        </Tooltip>
                      )}
                      {canDelete && (
                        <Tooltip content={t('common.delete')}>
                          <Button 
                             size="icon" 
                             variant="outline"
                             onClick={onDelete}
                             className="h-7 w-7 bg-destructive/5 border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive"
                           >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                           </Button>
                        </Tooltip>
                      )}
                   </Stack>
               )}
            </Stack>
         </Stack>
      </CardContent>
    </Card>
  );
}
