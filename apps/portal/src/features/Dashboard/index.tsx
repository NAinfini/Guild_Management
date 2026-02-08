
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useFilteredList } from '../../hooks/useFilteredList';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  Typography,
  Box,
  IconButton,
  Stack,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
  Grid,
  Skeleton,
  Alert
} from '@mui/material';
import { 
  BellRing, 
  Swords, 
  ArrowRight, 
  CalendarDays, 
  AlertTriangle, 
  Copy, 
  Activity, 
  Plus, 
  Clock, 
  Zap, 
  Target, 
  Map, 
  Shield, 
  Coins, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  CheckCircle2
} from 'lucide-react';
import { formatDateTime, cn, getClassColor, formatPower } from '../../lib/utils';
import { useAuthStore, useUIStore } from '../../store';
import { useAuth } from '../../features/Auth/hooks/useAuth';
import { useMobileOptimizations, useLocaleDate } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from '@tanstack/react-router';
import { Announcement, Event, User, WarHistoryEntry } from '../../types';
import { formatDistanceToNow, isAfter, isBefore, addHours, addDays, isSameDay } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWarHistory } from '../../features/GuildWar/hooks/useWars';
import { warsAPI } from '../../lib/api';
import { DecorativeGlyph } from '../../components/DecorativeGlyph';
import { MarkdownContent } from '../../components/MarkdownContent';
import { useMembers, useEvents, useAnnouncements } from '../../hooks/useServerState';
import { storage, STORAGE_KEYS } from '../../lib/storage';
import { ErrorState } from '../../components/ErrorState';
import { canAccessAdminArea, canCopyEventSignup, getEffectiveRole } from '../../lib/permissions';

export type DashboardLastSeenState = {
  events: string;
  announcements: string;
};

export function applyNotificationSeen(
  previous: DashboardLastSeenState,
  noteType: 'event' | 'announcement',
  now: string
): DashboardLastSeenState {
  if (noteType === 'event') {
    return { ...previous, events: now };
  }
  if (noteType === 'announcement') {
    return { ...previous, announcements: now };
  }
  return previous;
}

export function getLatestCompletedWar(
  warHistory: WarHistoryEntry[] | undefined,
  nowIso: string = new Date().toISOString(),
  guildWarEvents?: Event[],
): WarHistoryEntry | undefined {
  return getRecentCompletedWars(warHistory, guildWarEvents, 1, nowIso)[0];
}

export function getWarEventTime(war: WarHistoryEntry, guildWarEvents?: Event[]): string {
  if (!Array.isArray(guildWarEvents) || guildWarEvents.length === 0) {
    return war.date;
  }
  const linkedGuildWar = guildWarEvents.find(
    (event) => event.type === 'guild_war' && event.id === war.event_id,
  );
  return linkedGuildWar?.start_time || war.date;
}

export function getRecentCompletedWars(
  warHistory: WarHistoryEntry[] | undefined,
  guildWarEvents: Event[] | undefined,
  limit: number = 4,
  nowIso: string = new Date().toISOString(),
): WarHistoryEntry[] {
  const nowTime = new Date(nowIso).getTime();
  if (!Array.isArray(warHistory) || warHistory.length === 0) {
    return [];
  }

  return warHistory
    .filter((war) => {
      if (!war || war.result === 'pending') return false;
      const warTime = new Date(getWarEventTime(war, guildWarEvents)).getTime();
      return Number.isFinite(warTime) && warTime <= nowTime;
    })
    .sort((a, b) => {
      const bTime = new Date(getWarEventTime(b, guildWarEvents)).getTime();
      const aTime = new Date(getWarEventTime(a, guildWarEvents)).getTime();
      return bTime - aTime;
    })
    .slice(0, Math.max(1, limit));
}

export function Dashboard() {
  const { t } = useTranslation();
  const { formatDateTime: formatDateLocalized, formatDate, formatTime } = useLocaleDate();
  const queryClient = useQueryClient();

  // ✅ TanStack Query: Auto-fetches and caches server state
  const { data: members = [], isLoading: isLoadingMembers, error: membersError, refetch: refetchMembers } = useMembers();
  const { data: announcements = [], isLoading: isLoadingAnnouncements, error: announcementsError, refetch: refetchAnnouncements } = useAnnouncements();
  const { data: events = [], isLoading: isLoadingEvents, error: eventsError, refetch: refetchEvents } = useEvents();
  
  const isLoading = isLoadingMembers || isLoadingAnnouncements || isLoadingEvents;
  const hasError = membersError || announcementsError || eventsError;

  const { user } = useAuth();
  const { viewRole } = useAuthStore();
  const { setPageTitle } = useUIStore();
  const navigate = useNavigate();
  const theme = useTheme();
  const mobile = useMobileOptimizations();
  const isSmallMobile = mobile.isSmallMobile;

  useEffect(() => {
    setPageTitle(t('nav.dashboard'));
  }, [setPageTitle, t]);

  const effectiveRole = getEffectiveRole(user?.role, viewRole);

  // --- PERSISTENCE: Notification Logic ---
  const [lastSeen, setLastSeen] = useState(() => ({
    events: storage.get(STORAGE_KEYS.EVENTS_LAST_SEEN, new Date(0).toISOString()),
    announcements: storage.get(STORAGE_KEYS.ANNOUNCEMENTS_LAST_SEEN, new Date(0).toISOString()),
  }));

  const handleMarkAllRead = useCallback(() => {
    const now = new Date().toISOString();
    setLastSeen({
        events: now,
        announcements: now,
    });
    storage.set(STORAGE_KEYS.EVENTS_LAST_SEEN, now);
    storage.set(STORAGE_KEYS.ANNOUNCEMENTS_LAST_SEEN, now);
  }, []);

  const handleNotificationClick = useCallback(
    (note: { type: 'event' | 'announcement'; path: string }) => {
      const now = new Date().toISOString();
      setLastSeen((prev) => applyNotificationSeen(prev, note.type, now));
      if (note.type === 'event') storage.set(STORAGE_KEYS.EVENTS_LAST_SEEN, now);
      if (note.type === 'announcement') storage.set(STORAGE_KEYS.ANNOUNCEMENTS_LAST_SEEN, now);
      navigate({ to: note.path as any });
    },
    [navigate]
  );

  const handleRetry = () => {
    refetchMembers();
    refetchAnnouncements();
    refetchEvents();
  };

  // Upcoming Events: Next 7 days, limit 3
  const upcomingFilterFn = useMemo(() => {
    const now = new Date();
    const sevenDaysLater = addDays(now, 7);
    return (e: any) => {
      const start = new Date(e.start_time);
      return isAfter(start, now) && isBefore(start, sevenDaysLater) && !e.is_archived;
    };
  }, []);
  const upcomingSortFn = useMemo(
    () => (a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    []
  );
  const upcomingEvents = useFilteredList({
    items: events || [],
    searchText: '',
    searchFields: [],
    filterFn: upcomingFilterFn,
    sortFn: upcomingSortFn,
  }).slice(0, 3);

  const notifications = useMemo(() => {
    const list: { id: string; title: string; type: 'event' | 'announcement'; time: string; path: string; isNew: boolean }[] = [];

    // Recent announcements
    if (announcements && announcements.length > 0) {
      announcements
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .forEach(a => {
          list.push({
              id: a.id,
              title: a.title,
              type: 'announcement',
              time: a.created_at,
              path: '/announcements',
              isNew: isAfter(new Date(a.created_at), new Date(lastSeen.announcements))
          });
      });
    }

    // Recent event updates
    if (events && events.length > 0) {
      events
        .filter(e => e.updated_at)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5)
        .forEach(e => {
            list.push({
                id: e.id,
                title: t('dashboard.notification_update', { title: e.title }),
                type: 'event',
                time: e.updated_at!,
                path: '/events',
                isNew: isAfter(new Date(e.updated_at!), new Date(lastSeen.events))
            });
      });
    }

    return list.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 3);
  }, [announcements, events, lastSeen, t]);

  const myJoinedEvents = useMemo(() => {
    if (!events || events.length === 0 || !user) return [];
    return events.filter(e => e.participants?.some(p => p.id === user.id));
  }, [events, user]);

  const hasConflict = useCallback((event: Event) => {
    const start = new Date(event.start_time);
    const end = event.end_time ? new Date(event.end_time) : addHours(start, 1);
    
    return myJoinedEvents.some(e => {
      if (e.id === event.id) return false;
      const eStart = new Date(e.start_time);
      const eEnd = e.end_time ? new Date(e.end_time) : addHours(eStart, 1);
      return (start < eEnd && end > eStart);
    });
  }, [myJoinedEvents]);

  const handleCopySignup = useCallback((event: Event) => {
    const names = event.participants
      .map(p => `@${p.wechat_name || p.username}`)
      .join(', ');
    const text = `${event.title}: ${names}`;
    navigator.clipboard.writeText(text);
  }, []);

  if (isLoading) return <DashboardSkeleton />;
  if (hasError) return <ErrorState message={t('dashboard.error_loading')} onRetry={handleRetry} />;

  return (
    <Box sx={{ pb: { xs: 'calc(88px + env(safe-area-inset-bottom))', sm: 3 } }} data-testid="dashboard-root">
      <Stack spacing={{ xs: 3, sm: 4, md: 6, lg: 8 }}>

      <Box sx={{
        display: 'grid',
        gap: { xs: 3, sm: 4, md: 6, lg: 8 },
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }
      }} data-testid="dashboard-grid">
        {/* LEFT COLUMN: MAIN CONTENT */}
        <Stack spacing={{ xs: 3, sm: 4, md: 6, lg: 8 }}>
          
          {/* My Signups Section */}
          {user && (
            <Stack spacing={{ xs: 2, sm: 3 }}>
              <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5, md: 2 }}>
                 <Box sx={{
                    position: 'relative',
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                 }}>
                    <Box sx={{
                       position: 'absolute', inset: 0,
                       bgcolor: 'primary.main', opacity: 0.15, borderRadius: 2
                    }} />
                    <Target size={isSmallMobile ? 16 : 20} color={theme.palette.primary.main} strokeWidth={2.5} />
                 </Box>
                 <Typography
                   variant={isSmallMobile ? "subtitle1" : "h6"}
                   fontWeight={900}
                   letterSpacing="0.05em"
                   sx={{ textTransform: 'uppercase' }}
                 >
                    {t('dashboard.my_schedule')}
                 </Typography>
              </Stack>
              <MyScheduleStrip events={events} userId={user.id} formatDate={formatDate} />
            </Stack>
          )}

          {/* Upcoming Events Section */}
          <Stack spacing={{ xs: 2, sm: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, sm: 2 }}>
                 <Box sx={{
                    position: 'relative',
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                 }}>
                    <Box sx={{
                       position: 'absolute', inset: 0,
                       bgcolor: 'secondary.main', opacity: 0.15, borderRadius: 2
                    }} />
                    <CalendarDays size={isSmallMobile ? 16 : 20} color={theme.palette.secondary.main} strokeWidth={2.5} />
                 </Box>
                 <Typography
                   variant={isSmallMobile ? "subtitle1" : "h6"}
                   fontWeight={900}
                   letterSpacing="0.05em"
                   sx={{ textTransform: 'uppercase' }}
                >
                  {t('dashboard.upcoming_events')}
                </Typography>
              </Stack>
              <Link to="/events">
                <Button
                   variant="text"
                   size="small"
                   endIcon={<ArrowRight size={isSmallMobile ? 12 : 16} />}
                   sx={{
                     fontWeight: 800,
                     letterSpacing: '0.05em',
                     color: 'text.secondary',
                     '&:hover': { color: 'primary.main', bgcolor: 'transparent' }
                   }}
                >
                  {t('dashboard.view_all_events')}
                </Button>
              </Link>
            </Stack>

            <Stack spacing={{ xs: 2, sm: 2.5 }}>
              {upcomingEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  user={user}
                  onCopy={() => handleCopySignup(event)}
                  isConflicted={hasConflict(event)}
                  formatDateLocalized={formatDateLocalized}
                  canCopy={canCopyEventSignup(effectiveRole)}
                />
              ))}
              {upcomingEvents.length === 0 && (
                <EmptyState
                  icon={CalendarDays}
                  message={t('dashboard.no_events')}
                  action={
                    canAccessAdminArea(effectiveRole) ? (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Plus size={16} />}
                        onClick={() => navigate({ to: '/events' as any })}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                      >
                         {t('events.new_deployment')}
                      </Button>
                    ) : null
                  }
                />
              )}
            </Stack>
          </Stack>
        </Stack>

        {/* RIGHT COLUMN: SIDEBAR */}
        <Stack spacing={{ xs: 3, sm: 4, md: 6, lg: 8 }}>
          
          {/* Notifications Card */}
          <Card sx={{ position: 'relative', overflow: 'hidden' }}>
            <CardHeader 
              title={
                <Stack direction="row" alignItems="center" gap={1}>
                   <BellRing size={16} color={theme.palette.primary.main} />
                   <Typography variant="overline" fontWeight={900} letterSpacing="0.2em" color="text.secondary">
                      {t('dashboard.notifications')}
                   </Typography>
                </Stack>
              }
              action={
                <Button
                  variant="text"
                  size="small"
                  onClick={handleMarkAllRead}
                  sx={{
                    fontSize: '0.6rem',
                    fontWeight: 900,
                  }}>
                    {t('common.mark_all_read')}
                </Button>
              }
              sx={{ p: 3, pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}
            />
            <CardContent sx={{ p: '0 !important', position: 'relative' }}>
              <DecorativeGlyph icon={BellRing} color={alpha(theme.palette.primary.main, 0.35)} size={160} opacity={0.1} right={-30} top={-10} />
              {notifications.length > 0 ? (
                <Stack divider={<Box sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}` }} />}>
                  {notifications.map(note => (
                    <Box 
                      key={note.id} 
                      onClick={() => handleNotificationClick(note)}
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        gap: 2, 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                       <Box sx={{ 
                          width: 8, height: 8, borderRadius: '50%', mt: 0.8,
                          bgcolor: note.isNew ? 'primary.main' : 'text.disabled'
                       }} />
                      <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 800, textTransform: 'uppercase', color: note.isNew ? 'text.primary' : 'text.secondary' }}>
                          {note.title}
                        </Typography>
                        <Stack direction="row" alignItems="center" gap={1} mt={0.5}>
                          <Typography variant="caption" sx={{ fontWeight: 700, px: 0.5, py: 0.25, borderRadius: 0.5, bgcolor: 'action.selected', color: 'primary.main', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                            {note.type}
                          </Typography>
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem', fontWeight: 700 }}>
                            {formatDistanceToNow(new Date(note.time))} {t('common.ago')}
                          </Typography>
                        </Stack>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Stack alignItems="center" justifyContent="center" py={4} spacing={1} sx={{ opacity: 0.5 }}>
                  <Activity size={24} />
                  <Typography variant="overline" fontWeight={900}>{t('dashboard.no_new_signals')}</Typography>
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Last Guild War Section */}
          <LastWarStats formatDateLocalized={formatDateLocalized} guildWarEvents={events} />

        </Stack>
      </Box>
      </Stack>
    </Box>
  );
}

// --- SUBCOMPONENTS ---

function MyScheduleStrip({ events, userId, formatDate }: { events: Event[], userId: string, formatDate: (date: string, monthsOffset?: number, includeYear?: boolean) => string }) {
  const { t } = useTranslation();
  const theme = useTheme();

  const days = useMemo(() => 
    Array.from({ length: 8 }, (_, i) => addDays(addDays(new Date(), -1), i)),
  []);

  const myJoinedEvents = useMemo(() => 
    events.filter(e => e.participants?.some(p => p.id === userId)),
  [events, userId]);

  return (
    <Box
      sx={{ 
        display: 'flex', 
        gap: { xs: 2, sm: 3 }, 
        overflowX: 'auto', 
        pb: { xs: 3, sm: 4 },
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none'
      }}
    >
      {days.map((date, i) => {
        const dateStr = date.toISOString();
        const isToday = isSameDay(date, new Date());
        const isYesterday = isSameDay(date, addDays(new Date(), -1));
        const dayEvents = myJoinedEvents.filter(e => isSameDay(new Date(e.start_time), date));

        const tooltipContent = dayEvents.length > 0 
           ? dayEvents.map(e => `• ${e.title}`).join('\n') 
           : t('dashboard.no_operations', 'No scheduled operations');

        return (
          <Tooltip key={i} title={<div style={{ whiteSpace: 'pre-wrap' }}>{tooltipContent}</div>} arrow>
             <Box
               sx={{
                 minWidth: { xs: 100, sm: 120 },
                 height: { xs: 95, sm: 110 },
                 borderRadius: 'var(--radiusCard)',
                 border: '1px solid',
                 borderColor: isToday ? 'var(--accent0)' : 'var(--divider)',
                 bgcolor: isToday ? 'var(--surface2)' : 'var(--surface1)',
                 p: { xs: 1.25, sm: 1.5 },
                 display: 'flex',
                 flexDirection: 'column',
                 opacity: isYesterday ? 0.6 : 1,
                 transition: 'all var(--motionFast) var(--ease)',
                 cursor: 'default',
                 boxShadow: isToday ? 'var(--glow)' : 'none',
                 '&:hover': {
                    borderColor: 'var(--accent0)',
                    bgcolor: 'var(--surface2)',
                    transform: 'translateY(-2px)',
                    boxShadow: 'var(--shadow1)'
                 }
               }}
             >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={{ xs: 0.75, sm: 1 }}>
                   <Typography
                     variant="caption"
                     sx={{
                       fontWeight: 900,
                       textTransform: 'uppercase',
                       color: isToday ? 'primary.main' : 'text.secondary',
                       fontSize: { xs: '0.6rem', sm: '0.65rem' }
                     }}
                   >
                      {isToday ? t('common.today') : formatDate(dateStr, 0, false)}
                   </Typography>
                   <Typography
                     variant="caption"
                     sx={{
                       fontWeight: 900,
                       fontFamily: 'monospace',
                       color: isToday ? 'text.primary' : 'text.disabled',
                     }}
                   >
                      {date.getDate()}
                   </Typography>
                </Stack>

                <Stack spacing={{ xs: 0.4, sm: 0.5 }} sx={{ flex: 1, overflow: 'hidden' }}>
                   {dayEvents.slice(0, 3).map(e => (
                      <Box
                          key={e.id}
                          sx={{
                             px: { xs: 0.75, sm: 1 },
                             py: 0.25,
                             borderRadius: 1,
                             bgcolor: 'action.selected',
                             fontSize: { xs: '0.6rem', sm: '0.65rem' },
                             fontWeight: 800,
                             overflow: 'hidden',
                             textOverflow: 'ellipsis',
                             whiteSpace: 'nowrap'
                          }}
                      >
                         {e.title}
                      </Box>
                   ))}
                   {dayEvents.length > 3 && (
                      <Typography
                        variant="caption"
                        align="center"
                        color="text.secondary"
                        sx={{ fontSize: '0.6rem', fontWeight: 900, mt: 'auto' }}
                      >
                         +{dayEvents.length - 3} {t('common.more')}
                      </Typography>
                   )}
                   {dayEvents.length === 0 && (
                      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Typography
                           variant="caption"
                           color="text.disabled"
                           sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                         >
                            {t('common.free')}
                         </Typography>
                      </Box>
                   )}
                </Stack>
             </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

function EventCard({ event, user, onCopy, isConflicted, formatDateLocalized, canCopy }: { event: any; user: any; onCopy: () => void; isConflicted: boolean; formatDateLocalized: (date: string) => string; canCopy: boolean }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isJoined = user && event.participants?.some((p: any) => p.id === user.id);
  const isSoon = isBefore(new Date(event.start_time), addHours(new Date(), 6));
  const glyphIcon = event.type === 'guild_war' ? Swords : CalendarDays;
  const glyphColor = event.type === 'guild_war'
    ? alpha(theme.palette.primary.main, 0.5)
    : alpha(theme.palette.secondary.main, 0.45);

  return (
    <Card sx={{ position: 'relative', overflow: 'hidden' }}>
       <DecorativeGlyph icon={glyphIcon} color={glyphColor} size={170} opacity={0.06} right={-20} top={-30} />
       <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
             <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
                <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                   <Chip
                      label={event.type.replace('_', ' ')}
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: 900, textTransform: 'uppercase', borderRadius: 1 }}
                   />
                   {isSoon && (
                      <Chip
                          label={t('common.soon')}
                          size="small"
                          sx={{ fontWeight: 900, bgcolor: 'warning.light', color: 'warning.dark', textTransform: 'uppercase' }}
                       />
                   )}
                   {isConflicted && isJoined && (
                      <Chip
                          label={t('dashboard.overlap')}
                          icon={<AlertTriangle size={10} />}
                          size="small"
                          color="error"
                          sx={{ fontWeight: 900, textTransform: 'uppercase' }}
                       />
                   )}
                </Stack>

                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                   <Link to="/events">
                      <Button variant="text" size="small" endIcon={<ExternalLink size={12} />} sx={{ fontWeight: 800 }}>
                          {t('common.details')}
                      </Button>
                   </Link>
                   {canCopy && (
                     <Tooltip title={t('dashboard.copy_roster')}>
                        <IconButton size="small" onClick={onCopy} sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
                           <Copy size={14} />
                        </IconButton>
                     </Tooltip>
                   )}
                   <Typography
                     variant="overline"
                     sx={{
                       display: { xs: 'none', sm: 'flex' },
                       alignItems: 'center',
                       gap: 1,
                       fontWeight: 800,
                       color: 'text.secondary',
                     }}
                   >
                      <Clock size={14} />
                      {formatDateLocalized(event.start_time)}
                   </Typography>
                </Stack>
             </Stack>

             <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase' }}>
                   {event.title}
                </Typography>
                <MarkdownContent
                  content={event.description}
                  maxLines={2}
                  variant="body2"
                  color="text.secondary"
                  sx={{ maxWidth: '90%', mt: 0.5 }}
                />
             </Box>
          </Stack>
       </CardContent>
    </Card>
  );
}

function LastWarStats({
  formatDateLocalized,
  guildWarEvents,
}: {
  formatDateLocalized: (date: string) => string;
  guildWarEvents: Event[];
}) {
    const { t } = useTranslation();
    const theme = useTheme();
    const { data: warHistory = [], isLoading: isLoadingHistory } = useWarHistory();

    const recentWars = useMemo(
      () => getRecentCompletedWars(warHistory, guildWarEvents, 4),
      [warHistory, guildWarEvents],
    );
    const [selectedWarIndex, setSelectedWarIndex] = useState(0);

    useEffect(() => {
      setSelectedWarIndex((previous) => {
        if (recentWars.length === 0) return 0;
        if (previous >= recentWars.length) return 0;
        return previous;
      });
    }, [recentWars]);

    const latestWar = recentWars[selectedWarIndex];
    
    const { data: warStats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['warStats', latestWar?.id],
        queryFn: async () => {
            if (!latestWar?.id) return null;
            return await warsAPI.getMemberStats(latestWar.id);
        },
        enabled: !!latestWar?.id,
    });

    const topPerformers = useMemo(() => {
        if (!warStats || warStats.length === 0) return null;
        const sortedDmg = [...warStats].sort((a, b) => b.damage - a.damage);
        const sortedTaken = [...warStats].sort((a, b) => b.damage_taken - a.damage_taken);
        const sortedHealing = [...warStats].sort((a, b) => b.healing - a.healing);
        const sortedCredits = [...warStats].sort((a, b) => b.credits - a.credits);

        return {
            topDamage: sortedDmg[0],
            topDamageTaken: sortedTaken[0],
            topHealing: sortedHealing[0],
            topCredits: sortedCredits[0]
        };
    }, [warStats]);

    if (isLoadingHistory) return <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />;

    if (!latestWar) return (
        <Card sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover', border: '1px dashed', borderColor: 'divider' }}>
            <Swords size={48} opacity={0.3} style={{ margin: '0 auto 16px' }} />
            <Typography variant="body2" color="text.secondary">{t('dashboard.no_war_data')}</Typography>
        </Card>
    );

    const isVictory = latestWar.result === 'victory';

    return (
        <Card sx={{ 
            position: 'relative', 
            overflow: 'hidden',
            border: 'var(--stroke) solid var(--accent0)',
            borderRadius: 'var(--radiusCard)',
            boxShadow: 'var(--shadow3)',
            background: 'var(--surface1)',
            '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                border: '1px solid var(--sigA)', // Signature line if theme defines it
                opacity: 0.5,
                pointerEvents: 'none',
                borderRadius: 'inherit'
            }
        }}>
            <DecorativeGlyph icon={Swords} color={theme.palette.primary.main} size={180} opacity={0.05} right={-20} top={-20} />
            <CardHeader 
                title={
                    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Swords size={16} color="var(--accent0)" />
                          <Typography variant="overline" fontWeight={900} letterSpacing="0.15em" color="var(--text1)">
                            {t('dashboard.latest_conflict')}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setSelectedWarIndex((previous) =>
                                recentWars.length > 0
                                  ? (previous - 1 + recentWars.length) % recentWars.length
                                  : 0,
                              )
                            }
                            disabled={recentWars.length <= 1}
                          >
                            <ChevronLeft size={16} />
                          </IconButton>
                          <Typography variant="caption" fontWeight={800} color="text.secondary">
                            {recentWars.length === 0 ? '0/0' : `${selectedWarIndex + 1}/${recentWars.length}`}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setSelectedWarIndex((previous) =>
                                recentWars.length > 0 ? (previous + 1) % recentWars.length : 0,
                              )
                            }
                            disabled={recentWars.length <= 1}
                          >
                            <ChevronRight size={16} />
                          </IconButton>
                        </Stack>
                    </Stack>
                }
                sx={{ p: 3, pb: 1 }}
            />
            <CardContent sx={{ p: 3, pt: 1 }}>
                <Stack spacing={3}>
                    <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2" fontWeight={900}>{latestWar.title}</Typography>
                            <Chip 
                                size="small" 
                                label={t(`dashboard.${latestWar.result}`)} 
                                color={isVictory ? 'success' : 'error'} 
                                sx={{ fontWeight: 900, textTransform: 'uppercase', height: 20, fontSize: '0.6rem' }}
                            />
                        </Stack>
                        <Typography variant="caption" color="text.disabled" fontWeight={700}>
                            {formatDateLocalized(getWarEventTime(latestWar, guildWarEvents))}
                        </Typography>
                    </Box>

                    <Stack direction="row" justifyContent="space-around" alignItems="center">
                        <Box textAlign="center">
                            <Typography variant="h4" fontWeight={900} color="primary.main">{latestWar.own_stats.kills}</Typography>
                            <Typography variant="caption" fontWeight={900} color="text.secondary">{t('dashboard.alliance')}</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={900} sx={{ opacity: 0.3 }}>VS</Typography>
                        <Box textAlign="center">
                            <Typography variant="h4" fontWeight={900} color="error.main">{latestWar.enemy_stats.kills}</Typography>
                            <Typography variant="caption" fontWeight={900} color="text.secondary">{t('dashboard.enemy')}</Typography>
                        </Box>
                    </Stack>

                    <Box>
                        <Typography variant="caption" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1, color: 'text.disabled', mb: 1 }}>
                            <Zap size={12} /> {t('dashboard.performer_top')}
                        </Typography>
                        {isLoadingStats ? (
                            <Stack spacing={1}><Skeleton height={40} /><Skeleton height={40} /></Stack>
                        ) : topPerformers ? (
                            <Stack spacing={1}>
                                <MVPFullRow type={t('dashboard.dmg')} name={topPerformers.topDamage.username} val={topPerformers.topDamage.damage.toLocaleString()} color="error.main" />
                                <MVPFullRow type={t('dashboard.healing')} name={topPerformers.topHealing.username} val={topPerformers.topHealing.healing.toLocaleString()} color="success.main" />
                            </Stack>
                        ) : null}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

function MVPFullRow({ type, name, val, color }: any) {
    const theme = useTheme();
    return (
       <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 1.5, py: 1, borderRadius: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider'
       }}>
          <Stack direction="row" alignItems="center" gap={1.5}>
             <Box sx={{ px: 0.75, py: 0.25, borderRadius: 0.5, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, color: color }}>{type}</Typography>
             </Box>
             <Typography variant="caption" fontWeight={900} color="text.primary">{name}</Typography>
          </Stack>
          <Typography variant="caption" sx={{ fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: 600 }}>{val}</Typography>
       </Box>
    );
}

function EmptyState({ icon: Icon, message, action }: any) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ py: 6, border: '2px dashed', borderColor: 'divider', borderRadius: 4, bgcolor: 'action.hover' }}>
      <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'background.paper' }}>
        <Icon size={32} opacity={0.3} />
      </Box>
      <Typography variant="overline" color="text.disabled" fontWeight={900}>{message}</Typography>
      {action}
    </Stack>
  );
}

function DashboardSkeleton() {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Stack spacing={3}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4 }} />
          <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 4 }} />
          {[1, 2].map(i => <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 4 }} />)}
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Stack spacing={3}>
           <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} />
           <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} />
        </Stack>
      </Grid>
    </Grid>
  );
}
