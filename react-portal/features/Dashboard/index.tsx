
import React, { useMemo, useState, useEffect } from 'react';
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
  CircularProgress,
  Skeleton
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
  TowerControl
} from 'lucide-react';
import { formatDateTime, cn, getClassColor, formatPower } from '../../lib/utils';
import { useAuthStore, useUIStore } from '../../store';
import { useAuth } from '../../features/Auth/hooks/useAuth';
import { useMobileOptimizations } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from '@tanstack/react-router';
import { Announcement, Event, User } from '../../types';
import { formatDistanceToNow, isAfter, isBefore, addHours, addDays, isSameDay } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useWarHistory } from '../../features/GuildWar/hooks/useWars';
import { warsAPI } from '../../lib/api';
import { DecorativeGlyph } from '../../components/DecorativeGlyph';
import { useMembers, useEvents, useAnnouncements } from '../../hooks/useServerState';

export function Dashboard() {
  const { t } = useTranslation();

  // ✅ TanStack Query: Auto-fetches and caches server state
  const { data: members = [], isLoading: isLoadingMembers } = useMembers();
  const { data: announcements = [], isLoading: isLoadingAnnouncements } = useAnnouncements();
  const { data: events = [], isLoading: isLoadingEvents } = useEvents();
  const isLoading = isLoadingMembers || isLoadingAnnouncements || isLoadingEvents;

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

  const effectiveRole = viewRole || user?.role;

  // --- PERSISTENCE: Notification Logic ---
  const [lastSeen, setLastSeen] = useState({
    events: localStorage.getItem('last_seen_events') || new Date(0).toISOString(),
    announcements: localStorage.getItem('last_seen_announcements') || new Date(0).toISOString(),
    members: localStorage.getItem('last_seen_members') || new Date(0).toISOString(),
  });

  useEffect(() => {
    // Update last seen on unmount/leave
    const now = new Date().toISOString();
    return () => {
      localStorage.setItem('last_seen_events', now);
      localStorage.setItem('last_seen_announcements', now);
      localStorage.setItem('last_seen_members', now);
    };
  }, []);

  // Upcoming Events: Next 7 days, limit 3
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const sevenDaysLater = addDays(now, 7);
    return events
      .filter(e => {
        const start = new Date(e.start_time);
        return isAfter(start, now) && isBefore(start, sevenDaysLater);
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 3);
  }, [events]);

  // Pinned / Featured strip (spec: show if any pinned)
  const pinnedEvents = useMemo(() => {
    return events
      .filter(e => e.is_pinned && !e.is_archived)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 4);
  }, [events]);

  const notifications = useMemo(() => {
    const list: { id: string; title: string; type: 'event' | 'announcement' | 'member'; time: string; path: string; isNew: boolean }[] = [];
    
    // Include recent announcements (last 5)
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

    // Include recent event updates (last 5)
    events
      .filter(e => e.updated_at)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5)
      .forEach(e => {
          list.push({ 
              id: e.id, 
              title: t('dashboard.notification_update', { title: e.title }), 
              type: 'event', 
              time: e.updated_at, 
              path: '/events',
              isNew: isAfter(new Date(e.updated_at), new Date(lastSeen.events))
          });
    });

    return list.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 3);
  }, [announcements, events, lastSeen, t]);

  const myJoinedEvents = useMemo(() => 
    events.filter(e => user && e.participants?.some(p => p.id === user.id)), 
  [events, user]);

  const hasConflict = (event: Event) => {
    const start = new Date(event.start_time);
    const end = event.end_time ? new Date(event.end_time) : addHours(start, 1);
    
    return myJoinedEvents.some(e => {
      if (e.id === event.id) return false;
      const eStart = new Date(e.start_time);
      const eEnd = e.end_time ? new Date(e.end_time) : addHours(eStart, 1);
      return (start < eEnd && end > eStart);
    });
  };

  const handleCopySignup = (event: Event) => {
    const names = event.participants
      .map(p => `@${p.wechat_name || p.username}`)
      .join(', ');
    const text = `${event.title}: ${names}`;
    navigator.clipboard.writeText(text);
  };

  const handleMarkAllRead = () => {
    const now = new Date().toISOString();
    setLastSeen({
        events: now,
        announcements: now,
        members: now
    });
    localStorage.setItem('last_seen_events', now);
    localStorage.setItem('last_seen_announcements', now);
    localStorage.setItem('last_seen_members', now);
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <Box sx={{ pb: { xs: 'calc(88px + env(safe-area-inset-bottom))', sm: 3 } }} data-testid="dashboard-root">
      <Stack spacing={{ xs: 3, sm: 4, md: 6, lg: 8 }}>

      <Box sx={{
        display: 'grid',
        gap: { xs: 3, sm: 4, md: 6, lg: 8 },
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }
      }} data-testid="dashboard-grid" data-grid-cols={mobile.isMobile ? '1' : '2'}>
        {/* LEFT COLUMN: MAIN CONTENT */}
        <Stack spacing={{ xs: 3, sm: 4, md: 6, lg: 8 }}>
          
          {/* My Signups Section (8-Day Strip) */}
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
                   sx={{
                     textTransform: 'uppercase',
                     fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
                   }}
                 >
                    {t('dashboard.my_schedule')}
                 </Typography>
              </Stack>
              <MyScheduleStrip events={events} userId={user.id} />
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
                   sx={{
                     textTransform: 'uppercase',
                     fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
                   }}
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
                     fontSize: { xs: '0.7rem', sm: '0.75rem' },
                     minHeight: mobile.touchTargetSize,
                     minWidth: mobile.touchTargetSize,
                     '&:hover': { color: 'primary.main', bgcolor: 'transparent' }
                   }}
                >
                  {t('dashboard.view_all_events')}
                </Button>
              </Link>
            </Stack>

            {pinnedEvents.length > 0 && (
              <Card 
                variant="outlined" 
                sx={{ 
                  borderRadius: 3, 
                  borderColor: alpha(theme.palette.secondary.main, 0.3),
                  background: `linear-gradient(90deg, ${alpha(theme.palette.secondary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                  px: { xs: 2, sm: 3 }, 
                  py: { xs: 1.5, sm: 2 },
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <DecorativeGlyph icon={CalendarDays} color={alpha(theme.palette.secondary.main, 0.35)} size={140} opacity={0.12} right={-10} top={-20} />
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: { xs: 1, sm: 1.5 }, flexWrap: 'wrap' }}>
                  <Chip 
                    size="small" 
                    label={t('dashboard.featured_events')}
                    sx={{ fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                    icon={<TowerControl size={14} />}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {t('dashboard.featured_hint')}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 0.5 }}>
                  {pinnedEvents.map(event => (
                    <Box
                      key={event.id}
                      onClick={() => navigate({ to: '/events' as any })}
                      sx={{
                        minWidth: 180,
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.4)}`,
                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: theme.palette.secondary.main,
                          boxShadow: `0 10px 24px ${alpha(theme.palette.secondary.main, 0.15)}`,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <Stack spacing={0.5}>
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <Chip
                            size="small"
                            label={event.type === 'guild_war' ? t('events.filter_guild') : t('events.title')}
                            sx={{ height: 22, fontSize: '0.65rem', fontWeight: 800 }}
                          />
                          <Chip
                            size="small"
                            label={t('dashboard.featured_tag')}
                            color="secondary"
                            sx={{ height: 22, fontSize: '0.65rem', fontWeight: 900 }}
                          />
                        </Stack>
                        <Typography variant="subtitle2" fontWeight={900} noWrap>
                          {event.title}
                        </Typography>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <CalendarDays size={14} />
                          <Typography variant="caption" fontWeight={700}>
                            {formatDateTime(event.start_time)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Clock size={14} color={theme.palette.text.secondary} />
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            {formatDistanceToNow(new Date(event.start_time), { addSuffix: true })}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Card>
            )}

            <Stack spacing={{ xs: 2, sm: 2.5 }}>
              {upcomingEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  user={user}
                  onCopy={() => handleCopySignup(event)}
                  isConflicted={hasConflict(event)}
                />
              ))}
              {upcomingEvents.length === 0 && (
                <EmptyState
                  icon={CalendarDays}
                  message={t('dashboard.no_events')}
                  action={
                    (effectiveRole !== 'member' && effectiveRole !== 'external') ? (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Plus size={16} />}
                        onClick={() => navigate({ to: '/events' as any })}
                        sx={{ borderRadius: 2, fontWeight: 700, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
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
                  data-testid="notifications-mark-all"
                  variant="text"
                  size="small"
                  onClick={handleMarkAllRead}
                  sx={{
                    fontSize: '0.6rem',
                    fontWeight: 900,
                    letterSpacing: '0.1em',
                    minWidth: mobile.touchTargetSize,
                    minHeight: mobile.touchTargetSize,
                  }}>
                    {t('common.mark_all_read')}
                </Button>
              }
              sx={{ p: 3, pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}
            />
            <CardContent sx={{ p: '0 !important', position: 'relative' }}>
              <DecorativeGlyph icon={BellRing} color={alpha(theme.palette.primary.main, 0.35)} size={160} opacity={0.1} right={-30} top={-10} />
              {notifications.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {notifications.map(note => (
                    <Box 
                      key={note.id} 
                      onClick={() => navigate({ to: note.path as any })}
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
                </div>
              ) : (
                <Stack alignItems="center" justifyContent="center" py={4} spacing={1} sx={{ opacity: 0.5 }}>
                  <Activity size={24} />
                  <Typography variant="overline" fontWeight={900}>{t('dashboard.no_new_signals')}</Typography>
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Last Guild War Section */}
          <LastWarStats />

        </Stack>
      </Box>
      </Stack>
    </Box>
  );
}

// --- SUBCOMPONENTS ---

function MyScheduleStrip({ events, userId }: { events: Event[], userId: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Yesterday + Today + Next 6 days = 8 days
  const days = Array.from({ length: 8 }, (_, i) => addDays(addDays(new Date(), -1), i));

  const myJoinedEvents = events.filter(e =>
    e.participants?.some(p => p.id === userId)
  );

  return (
    <div
      data-testid="schedule-strip"
      className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 sm:pb-4 no-scrollbar"
      style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
    >
      {days.map((date, i) => {
        const isToday = isSameDay(date, new Date());
        const isYesterday = isSameDay(date, addDays(new Date(), -1));
        const dayEvents = myJoinedEvents.filter(e => isSameDay(new Date(e.start_time), date));

        // Prepare tooltip content (list of events)
        const tooltipContent = dayEvents.map(e => `• ${e.title}`).join('\n') || 'No scheduled operations';

        return (
          <Tooltip key={i} title={<div style={{ whiteSpace: 'pre-wrap' }}>{tooltipContent}</div>} arrow>
             <Box
               sx={{
                 minWidth: { xs: 100, sm: 120 },
                 height: { xs: 95, sm: 110 },
                 borderRadius: { xs: 3, sm: 4 },
                 border: '1px solid',
                 borderColor: isToday ? 'primary.main' : 'divider',
                 bgcolor: isToday ? 'action.hover' : 'background.paper',
                 p: { xs: 1.25, sm: 1.5 },
                 display: 'flex',
                 flexDirection: 'column',
                 opacity: isYesterday ? 0.6 : 1,
                 transition: 'all 0.2s',
                 '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover'
                 },
                 '&:active': {
                    transform: 'scale(0.98)'
                 }
               }}
             >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={{ xs: 0.75, sm: 1 }}>
                   <Typography
                     variant="caption"
                     sx={{
                       fontWeight: 900,
                       textTransform: 'uppercase',
                       letterSpacing: '0.1em',
                       color: isToday ? 'primary.main' : 'text.secondary',
                       fontSize: { xs: '0.6rem', sm: '0.65rem' }
                     }}
                   >
                      {isToday ? t('common.today') : formatDateTime(date.toISOString()).split(',')[0]}
                   </Typography>
                   <Typography
                     variant="caption"
                     sx={{
                       fontWeight: 900,
                       fontFamily: 'monospace',
                       color: isToday ? 'text.primary' : 'text.disabled',
                       fontSize: { xs: '0.75rem', sm: '0.8rem' }
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
                            py: { xs: 0.2, sm: 0.25 },
                            borderRadius: 1,
                            bgcolor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider',
                            fontSize: { xs: '0.6rem', sm: '0.65rem' },
                            fontWeight: 800,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                      >
                         <Typography
                           noWrap
                           variant="caption"
                           display="block"
                           sx={{
                             fontWeight: 700,
                             fontSize: { xs: '0.6rem', sm: '0.65rem' }
                           }}
                         >
                           {e.title}
                         </Typography>
                      </Box>
                   ))}
                   {dayEvents.length > 3 && (
                      <Typography
                        variant="caption"
                        align="center"
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: '0.55rem', sm: '0.6rem' },
                          fontWeight: 900,
                          mt: 'auto !important'
                        }}
                      >
                         +{dayEvents.length - 3} {t('common.more')}
                      </Typography>
                   )}
                   {dayEvents.length === 0 && (
                      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Typography
                           variant="caption"
                           color="text.disabled"
                           sx={{
                             fontSize: { xs: '0.6rem', sm: '0.65rem' },
                             fontWeight: 900,
                             textTransform: 'uppercase',
                             letterSpacing: '0.1em'
                           }}
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
    </div>
  );
}

function EventCard({ event, user, onCopy, isConflicted }: any) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isJoined = user && event.participants?.some((p: any) => p.id === user.id);
  const currentCount = event.participants?.length || 0;
  const isFull = event.capacity && currentCount >= event.capacity;
  const isSoon = isBefore(new Date(event.start_time), addHours(new Date(), 6));
  const glyphIcon = event.type === 'guild_war' ? Swords : CalendarDays;
  const glyphColor = event.type === 'guild_war'
    ? alpha(theme.palette.primary.main, 0.5)
    : alpha(theme.palette.secondary.main, 0.45);

  return (
    <Card sx={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s',
    }}>
       <DecorativeGlyph icon={glyphIcon} color={glyphColor} size={170} opacity={0.06} right={-20} top={-30} />
       <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
             <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={{ xs: 1, sm: 1.5, md: 2 }}>
                <Stack direction="row" gap={{ xs: 0.75, sm: 1 }} alignItems="center" flexWrap="wrap">
                   <Chip
                      label={event.type.replace('_', ' ')}
                      variant="outlined"
                      size="small"
                      sx={{
                          height: { xs: 18, sm: 20 },
                          fontSize: { xs: '0.6rem', sm: '0.65rem' },
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          borderRadius: 1,
                          letterSpacing: '0.05em'
                      }}
                   />
                   {isSoon && (
                      <Chip
                          label={t('common.soon')}
                          size="small"
                          sx={{
                              height: { xs: 18, sm: 20 },
                              fontSize: { xs: '0.6rem', sm: '0.65rem' },
                              fontWeight: 900,
                              bgcolor: 'warning.light',
                              color: 'warning.dark',
                              textTransform: 'uppercase'
                          }}
                       />
                   )}
                   {isConflicted && isJoined && (
                      <Chip
                          label={isSmallMobile ? t('dashboard.overlap') : t('dashboard.overlap_detected')}
                          icon={<AlertTriangle size={isSmallMobile ? 8 : 10} />}
                          size="small"
                          color="error"
                          sx={{
                              height: { xs: 18, sm: 20 },
                              fontSize: { xs: '0.6rem', sm: '0.65rem' },
                              fontWeight: 900,
                              textTransform: 'uppercase'
                          }}
                       />
                   )}
                </Stack>

                <Stack direction="row" alignItems="center" gap={{ xs: 0.75, sm: 1 }} flexWrap="wrap">
                   <Link to="/events">
                      <Button
                        variant="text"
                        size="small"
                        endIcon={<ExternalLink size={isSmallMobile ? 10 : 12} />}
                        sx={{
                          fontSize: { xs: '0.65rem', sm: '0.7rem' },
                          fontWeight: 800,
                          px: { xs: 1, sm: 1.5 },
                          minWidth: { xs: 'auto', sm: 'auto' }
                        }}
                      >
                          {isSmallMobile ? t('common.view') : t('common.details')}
                      </Button>
                   </Link>
                   <Tooltip title={t('dashboard.copy_roster')}>
                      <IconButton
                        size="small"
                        onClick={onCopy}
                        sx={{
                          bgcolor: 'action.hover',
                          borderRadius: 2,
                          p: { xs: 0.75, sm: 1 }
                        }}
                      >
                         <Copy size={isSmallMobile ? 12 : 14} />
                      </IconButton>
                   </Tooltip>
                   <Typography
                     variant="overline"
                     sx={{
                       display: { xs: 'none', sm: 'flex' },
                       alignItems: 'center',
                       gap: 1,
                       fontWeight: 800,
                       ml: 1,
                       color: 'text.secondary',
                       fontSize: { sm: '0.65rem', md: '0.7rem' }
                     }}
                   >
                      <Clock size={14} />
                      {formatDateTime(event.start_time)}
                   </Typography>
                </Stack>
             </Stack>

             <Box>
                <Typography
                  variant={isSmallMobile ? "h6" : "h5"}
                  sx={{
                    fontWeight: 900,
                    fontStyle: 'italic',
                    textTransform: 'uppercase',
                    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
                  }}
                >
                   {event.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    maxWidth: '90%',
                    mt: 0.5,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    display: isSmallMobile ? '-webkit-box' : 'block',
                    WebkitLineClamp: isSmallMobile ? 2 : 'unset',
                    WebkitBoxOrient: 'vertical',
                    overflow: isSmallMobile ? 'hidden' : 'visible'
                  }}
                >
                   {event.description}
                </Typography>
                {isSmallMobile && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontWeight: 700,
                      mt: 1,
                      color: 'text.secondary',
                      fontSize: '0.65rem'
                    }}
                  >
                    <Clock size={12} />
                    {formatDateTime(event.start_time)}
                  </Typography>
                )}
             </Box>

             <Stack spacing={{ xs: 1.25, sm: 1.5 }}>
                 <Stack direction="row" justifyContent="space-between" alignItems="center">
                     <Typography
                       variant="caption"
                       sx={{
                         fontWeight: 900,
                         letterSpacing: '0.1em',
                         textTransform: 'uppercase',
                         color: 'text.disabled',
                         fontSize: { xs: '0.6rem', sm: '0.65rem' }
                       }}
                     >
                         {t('dashboard.roster_manifest')}
                     </Typography>
                     <Typography
                       variant="caption"
                       sx={{
                         fontWeight: 900,
                         color: isFull ? 'error.main' : 'text.primary',
                         fontSize: { xs: '0.7rem', sm: '0.75rem' }
                       }}
                     >
                         {currentCount} / {event.capacity || '∞'}
                     </Typography>
                 </Stack>

                 <Stack direction="row" flexWrap="wrap" gap={{ xs: 0.75, sm: 1 }}>
                     {event.participants?.slice(0, isSmallMobile ? 6 : 10).map((p: User) => (
                        <Box
                           key={p.id}
                           sx={{
                               px: { xs: 1.25, sm: 1.5 },
                               py: { xs: 0.75, sm: 1 },
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
                               minWidth: { xs: 90, sm: 100 }
                           }}
                        >
                           <Typography
                             variant="body2"
                             sx={{
                               fontWeight: 800,
                               lineHeight: 1,
                               fontSize: { xs: '0.8rem', sm: '0.875rem' }
                             }}
                           >
                             {p.username}
                           </Typography>
                           <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" gap={0.5} mt={0.5}>
                               <Box sx={{
                                   px: 1, py: 0.25, borderRadius: 4,
                                   fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase',
                                   bgcolor: (() => {
                                       const c = p.classes?.[0] || '';
                                       if (c.includes('qiansilin')) return theme.custom?.classes.qiansi.bg;
                                       if (c.includes('lieshiwei')) return theme.custom?.classes.lieshi.bg;
                                       if (c.includes('mingjin')) return theme.custom?.classes.mingjin.bg;
                                       if (c.includes('pozhu')) return theme.custom?.classes.pozhu.bg;
                                       return alpha(theme.palette.info.main, 0.15);
                                   })(),
                                   color: (() => {
                                       const c = p.classes?.[0] || '';
                                       if (c.includes('qiansilin')) return theme.custom?.classes.qiansi.text;
                                       if (c.includes('lieshiwei')) return theme.custom?.classes.lieshi.text;
                                       if (c.includes('mingjin')) return theme.custom?.classes.mingjin.text;
                                       if (c.includes('pozhu')) return theme.custom?.classes.pozhu.text;
                                       return theme.palette.info.light;
                                   })(),
                                   border: 1,
                                   borderColor: (() => {
                                       const c = p.classes?.[0] || '';
                                       if (c.includes('qiansilin')) return alpha(theme.custom?.classes.qiansi.main as string, 0.3);
                                       if (c.includes('lieshiwei')) return alpha(theme.custom?.classes.lieshi.main as string, 0.3);
                                       if (c.includes('mingjin')) return alpha(theme.custom?.classes.mingjin.main as string, 0.3);
                                       if (c.includes('pozhu')) return alpha(theme.custom?.classes.pozhu.main as string, 0.3);
                                       return alpha(theme.palette.info.main, 0.3);
                                   })()
                                }}>
                                   {p.classes?.[0]?.replace(/_/g, ' ') || 'UNK'}
                                </Box>
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
                        </Box>
                     ))}
                     {(!event.participants || event.participants.length === 0) && (
                         <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.disabled' }}>{t('dashboard.no_operatives')}</Typography>
                     )}
                 </Stack>
             </Stack>
          </Stack>
       </CardContent>
    </Card>
  );
}

function LastWarStats() {
  const { t } = useTranslation();
  const theme = useTheme();

  // Fetch latest war history
  const { data: warHistory, isLoading: isLoadingHistory } = useWarHistory({ limit: 1 });
  const latestWar = warHistory?.[0];

  // Fetch member stats for the latest war
  const { data: memberStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['wars', 'member-stats', latestWar?.id],
    queryFn: () => warsAPI.getMemberStats(latestWar!.id),
    enabled: !!latestWar?.id,
  });

  // Calculate time ago
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const warDate = new Date(dateString);
    const diffMs = now.getTime() - warDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  // Find top performers
  const getTopPerformers = () => {
    if (!memberStats || memberStats.length === 0) return null;

    const topDamage = [...memberStats].sort((a, b) => b.damage - a.damage)[0];
    const topDamageTaken = [...memberStats].sort((a, b) => b.damage_taken - a.damage_taken)[0];
    const topHealing = [...memberStats].sort((a, b) => b.healing - a.healing)[0];
    const topCredits = [...memberStats].sort((a, b) => b.credits - a.credits)[0];

    return { topDamage, topDamageTaken, topHealing, topCredits };
  };

  const topPerformers = getTopPerformers();

  // Format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
    return num.toLocaleString();
  };

  const formatPercent = (hp: number): string => {
    return `${Math.round(hp)}%`;
  };

  // Show loading state with skeleton
  if (isLoadingHistory) {
    return (
      <Card sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.03, pointerEvents: 'none', transform: 'rotate(-15deg)' }}>
          <Swords size={160} />
        </Box>

        <Box sx={{ p: 2.5, pb: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Swords size={12} style={{ color: theme.palette.primary.main }} />
              <Typography variant="caption" fontWeight={900} letterSpacing="0.15em" color="text.secondary" textTransform="uppercase">
                {t('dashboard.latest_conflict')}
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Skeleton variant="text" width={180} height={24} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }} />
              <Skeleton variant="text" width={80} height={18} sx={{ bgcolor: alpha(theme.palette.text.secondary, 0.05) }} />
            </Box>
            <Skeleton variant="rounded" width={80} height={20} sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }} />
          </Stack>

          <Stack direction="row" justifyContent="center" alignItems="center" gap={4} mt={3} mb={1}>
            <Box textAlign="center">
              <Skeleton variant="text" width={80} height={48} sx={{ mx: 'auto', bgcolor: alpha(theme.palette.primary.main, 0.1) }} />
              <Skeleton variant="text" width={70} height={16} sx={{ mx: 'auto', mt: 0.5 }} />
            </Box>
            <Box sx={{ px: 2, py: 0.5, borderRadius: 1, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" fontWeight={900} color="text.disabled">VS</Typography>
            </Box>
            <Box textAlign="center">
              <Skeleton variant="text" width={80} height={48} sx={{ mx: 'auto', bgcolor: alpha(theme.palette.error.main, 0.1) }} />
              <Skeleton variant="text" width={70} height={16} sx={{ mx: 'auto', mt: 0.5 }} />
            </Box>
          </Stack>
        </Box>

        <CardContent sx={{ p: 0 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', bgcolor: 'background.default' }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} sx={{ p: 1.5, borderRight: i < 4 ? '1px solid' : 'none', borderColor: 'divider', textAlign: 'center' }}>
                <Skeleton variant="text" width={40} height={16} sx={{ mx: 'auto', mb: 0.5 }} />
                <Skeleton variant="text" width={30} height={20} sx={{ mx: 'auto' }} />
                <Skeleton variant="text" width={30} height={20} sx={{ mx: 'auto' }} />
              </Box>
            ))}
          </Box>

          <Box sx={{ p: 2, pt: 3 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: '0.1em', color: 'text.disabled', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Zap size={12} /> {t('dashboard.performer_top')}
                </Typography>
                <Stack spacing={0.5} mt={1}>
                  {[1, 2, 3, 4].map((i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Skeleton variant="text" width={60} height={16} />
                      <Skeleton variant="text" width={80} height={16} sx={{ flexGrow: 1 }} />
                      <Skeleton variant="text" width={70} height={16} />
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Show empty state if no war data
  if (!latestWar) {
    return (
      <Card sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        minHeight: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Stack alignItems="center" spacing={2}>
          <Swords size={48} style={{ color: theme.palette.text.disabled, opacity: 0.3 }} />
          <Typography variant="body2" color="text.secondary">
            {t('dashboard.no_war_data')}
          </Typography>
        </Stack>
      </Card>
    );
  }

  // Determine result label and color
  const getResultChip = (result: string) => {
    switch (result) {
      case 'victory':
        return {
          label: t('dashboard.victory'),
          bgcolor: alpha(theme.palette.success.main, 0.1),
          color: 'success.main',
          borderColor: alpha(theme.palette.success.main, 0.2),
        };
      case 'defeat':
        return {
          label: t('dashboard.defeat'),
          bgcolor: alpha(theme.palette.error.main, 0.1),
          color: 'error.main',
          borderColor: alpha(theme.palette.error.main, 0.2),
        };
      case 'draw':
        return {
          label: t('dashboard.draw'),
          bgcolor: alpha(theme.palette.warning.main, 0.1),
          color: 'warning.main',
          borderColor: alpha(theme.palette.warning.main, 0.2),
        };
      default:
        return {
          label: t('dashboard.pending'),
          bgcolor: alpha(theme.palette.info.main, 0.1),
          color: 'info.main',
          borderColor: alpha(theme.palette.info.main, 0.2),
        };
    }
  };

  const resultChip = getResultChip(latestWar.result);

  return (
    <Card sx={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 4,
      border: '1px solid',
      borderColor: 'divider',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        borderColor: 'primary.main',
        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.08)}`
      }
    }}>
      <DecorativeGlyph icon={Swords} color={alpha(theme.palette.primary.main, 0.6)} size={180} opacity={0.08} right={-20} top={-20} />

      <Box sx={{ p: 2.5, pb: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
         <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Stack direction="row" alignItems="center" gap={1}>
               <Swords size={12} style={{ color: theme.palette.primary.main }} />
               <Typography variant="caption" fontWeight={900} letterSpacing="0.15em" color="text.secondary" textTransform="uppercase">
                  {t('dashboard.latest_conflict')}
               </Typography>
            </Stack>
            <Link to="/guild-war">
               <Button
                variant="text"
                size="small"
                endIcon={<ArrowRight size={12} />}
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                }}
               >
                  {t('nav.guild_war')}
               </Button>
            </Link>
         </Stack>

         <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
               <Typography variant="subtitle2" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                 {latestWar.title}
               </Typography>
               <Typography variant="caption" display="block" color="text.disabled" fontWeight={700}>
                 {getTimeAgo(latestWar.date)}
               </Typography>
            </Box>
            <Chip
              label={resultChip.label}
              sx={{
                fontWeight: 900,
                height: 20,
                fontSize: '0.6rem',
                bgcolor: resultChip.bgcolor,
                color: resultChip.color,
                border: '1px solid',
                borderColor: resultChip.borderColor
              }}
            />
         </Stack>

          <Stack direction="row" justifyContent="center" alignItems="center" gap={4} mt={3} mb={1}>
             <Box textAlign="center">
                <Typography variant="h3" sx={{ fontWeight: 900, fontFamily: 'monospace', letterSpacing: '-0.05em', color: 'primary.main', lineHeight: 1 }}>
                  {latestWar.own_stats.kills.toLocaleString()}
                </Typography>
                <Typography variant="caption" fontWeight={900} color="text.secondary" textTransform="uppercase" letterSpacing="0.1em">
                  {t('dashboard.alliance')}
                </Typography>
             </Box>
             <Box sx={{ px: 2, py: 0.5, borderRadius: 1, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" fontWeight={900} color="text.disabled">VS</Typography>
             </Box>
             <Box textAlign="center">
                <Typography variant="h3" sx={{ fontWeight: 900, fontFamily: 'monospace', letterSpacing: '-0.05em', color: 'error.main', lineHeight: 1 }}>
                  {latestWar.enemy_stats.kills.toLocaleString()}
                </Typography>
                <Typography variant="caption" fontWeight={900} color="text.secondary" textTransform="uppercase" letterSpacing="0.1em">
                  {t('dashboard.enemy')}
                </Typography>
             </Box>
          </Stack>
      </Box>

      <CardContent sx={{ p: 0 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', bgcolor: 'background.default' }}>
           <CompactStat
             label={t('dashboard.base_hp')}
             val1={formatPercent(latestWar.own_stats.base_hp)}
             val2={formatPercent(latestWar.enemy_stats.base_hp)}
             icon={Shield}
           />
           <CompactStat
             label={t('dashboard.towers')}
             val1={latestWar.own_stats.towers.toString()}
             val2={latestWar.enemy_stats.towers.toString()}
             icon={TowerControl}
           />
           <CompactStat
             label={t('dashboard.distance')}
             val1={latestWar.own_stats.distance ? formatNumber(latestWar.own_stats.distance) : '-'}
             val2={latestWar.enemy_stats.distance ? formatNumber(latestWar.enemy_stats.distance) : '-'}
             icon={Map}
           />
           <CompactStat
             label={t('dashboard.credits')}
             val1={formatNumber(latestWar.own_stats.credits)}
             val2={formatNumber(latestWar.enemy_stats.credits)}
             icon={Coins}
           />
        </Box>

         <Box sx={{ p: 2, pt: 3 }}>
            <Stack spacing={2}>
               <Box>
                  <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: '0.1em', color: 'text.disabled', display: 'flex', alignItems: 'center', gap: 1 }}>
                     <Zap size={12} /> {t('dashboard.performer_top')}
                  </Typography>
                  {isLoadingStats ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : topPerformers ? (
                    <Stack spacing={0.5} mt={1}>
                       <MVPFullRow
                         type={t('dashboard.dmg')}
                         name={topPerformers.topDamage.username}
                         val={topPerformers.topDamage.damage.toLocaleString()}
                         color="error.main"
                       />
                       <MVPFullRow
                         type={t('dashboard.dmg_taken')}
                         name={topPerformers.topDamageTaken.username}
                         val={topPerformers.topDamageTaken.damage_taken.toLocaleString()}
                         color="warning.main"
                       />
                       <MVPFullRow
                         type={t('dashboard.healing')}
                         name={topPerformers.topHealing.username}
                         val={topPerformers.topHealing.healing.toLocaleString()}
                         color="success.main"
                       />
                       <MVPFullRow
                         type={t('dashboard.credits')}
                         name={topPerformers.topCredits.username}
                         val={topPerformers.topCredits.credits.toLocaleString()}
                         color="warning.dark"
                       />
                    </Stack>
                  ) : (
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
                      {t('dashboard.no_stats_available')}
                    </Typography>
                  )}
               </Box>
            </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

function CompactStat({ label, val1, val2, icon: Icon }: any) {
  const theme = useTheme();
  return (
    <Box sx={{ 
      p: 2, 
      textAlign: 'center', 
      borderRight: '1px solid', 
      borderColor: 'divider',
      '&:last-child': { borderRight: 'none' },
      bgcolor: alpha(theme.palette.background.paper, 0.4)
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1, color: 'text.disabled', opacity: 0.8 }}>
         <Icon size={14} />
      </Box>
      <Stack direction="row" alignItems="center" justifyContent="center" gap={0.5} sx={{ mb: 0.5 }}>
         <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 900, color: 'primary.main', fontSize: '0.85rem' }}>{val1}</Typography>
         <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 900 }}>/</Typography>
         <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 900, color: 'error.main', fontSize: '0.85rem' }}>{val2}</Typography>
      </Stack>
      <Typography variant="caption" sx={{ fontSize: '0.55rem', fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>
        {label}
      </Typography>
    </Box>
  )
}

function MVPFullRow({ type, name, val, color }: any) {
   const theme = useTheme();

   // Safely resolve theme color
   const resolveColor = (c: string) => {
     if (c.includes('.')) {
       const [palette, shade] = c.split('.');
       return (theme.palette as any)[palette]?.[shade] || theme.palette.primary.main;
     }
     return (theme.palette as any)[c]?.main || c;
   };

   // Format large numbers to compact format (e.g., 42M, 1.2M)
   const formatCompactNumber = (value: string | number): string => {
     const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
     if (isNaN(num)) return value.toString();

     if (num >= 1_000_000) {
       return (num / 1_000_000).toFixed(1) + 'M';
     } else if (num >= 1_000) {
       return (num / 1_000).toFixed(1) + 'k';
     }
     return num.toString();
   };

   const themeColor = resolveColor(color);
   const formattedVal = formatCompactNumber(val);

   return (
      <Box sx={{
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'space-between',
         px: 1.5, py: 1,
         borderRadius: 2,
         bgcolor: 'background.default',
         border: '1px solid',
         borderColor: 'divider',
         transition: 'all 0.2s',
         '&:hover': {
           borderColor: 'primary.main',
           bgcolor: 'action.hover',
           transform: 'translateX(4px)'
         }
      }}>
         <Stack direction="row" alignItems="center" gap={1.5}>
            <Box sx={{
              px: 0.75, py: 0.25, borderRadius: 0.5,
              bgcolor: alpha(themeColor, 0.1),
              border: '1px solid',
              borderColor: alpha(themeColor, 0.2)
            }}>
               <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, color: themeColor }}>{type}</Typography>
            </Box>
            <Typography variant="caption" fontWeight={900} color="text.primary" textTransform="uppercase" letterSpacing="0.05em">{name}</Typography>
         </Stack>
         <Typography variant="caption" sx={{ fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: 600, color: 'text.secondary' }}>{formattedVal}</Typography>
      </Box>
   )
}

function EmptyState({ icon: Icon, message, action }: any) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ py: 6, border: '2px dashed', borderColor: 'divider', borderRadius: 4, bgcolor: 'action.hover' }}>
      <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'background.paper' }}>
        <Icon size={32} className="text-muted-foreground opacity-50" />
      </Box>
      <Typography variant="overline" color="text.disabled" fontWeight={900} letterSpacing="0.2em">{message}</Typography>
      {action}
    </Stack>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-12 animate-pulse">
      <div className="lg:col-span-8 space-y-8">
        <div className="h-32 bg-muted/20 rounded-3xl" />
        <div className="space-y-4">
           <div className="h-24 bg-muted/20 rounded-3xl" />
           <div className="h-24 bg-muted/20 rounded-3xl" />
        </div>
      </div>
      <div className="lg:col-span-4 h-96 bg-muted/20 rounded-3xl" />
    </div>
  );
}
