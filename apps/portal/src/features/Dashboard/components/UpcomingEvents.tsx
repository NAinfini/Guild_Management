import React from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO, isAfter, isBefore, addHours, addDays, isValid } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';
import { Event } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/layout/Card';
import { Badge } from '@/components/data-display/Badge';
import { Tooltip, IconButton, Zoom, useTheme } from '@mui/material';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';
import { useJoinEvent, useLeaveEvent } from '@/hooks/useServerState';

import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LockIcon from '@mui/icons-material/Lock';
import AddIcon from '@mui/icons-material/Add';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

interface UpcomingEventsProps {
  events: Event[];
}

type Tone = 'success' | 'warning' | 'error' | 'info';

const getToneStyles = (tone: Tone): React.CSSProperties => ({
  backgroundColor: `color-mix(in srgb, var(--color-status-${tone}-bg) 82%, transparent)`,
  borderColor: `color-mix(in srgb, var(--color-status-${tone}) 48%, transparent)`,
  color: `var(--color-status-${tone}-fg)`,
});

const getClassTokenColor = (className?: string | null) => {
  const classKey = className ? className.split('_')[0] : null;
  if (classKey && ['mingjin', 'qiansi', 'pozhu', 'lieshi'].includes(classKey)) {
    return {
      main: `var(--color-class-${classKey})`,
      bg: `var(--color-class-${classKey}-bg)`,
      text: `var(--color-class-${classKey}-text)`,
    };
  }

  return {
    main: 'var(--sys-interactive-accent)',
    bg: 'color-mix(in srgb, var(--sys-interactive-accent) 24%, transparent)',
    text: 'var(--sys-text-primary)',
  };
};

const getEventTypeLabel = (t: (key: string) => string, type: Event['type']) => {
  if (type === 'guild_war') return t('events.filter_war');
  if (type === 'weekly_mission') return t('events.filter_weekly');
  return t('events.filter_other');
};

export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events }) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const dateLocale = i18n.language.startsWith('zh') ? zhCN : enUS;
  const timeFormat = i18n.language.startsWith('zh') ? 'HH:mm' : 'h:mm a';
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = currentUser?.id;
  const { mutate: joinEvent } = useJoinEvent();
  const { mutate: leaveEvent } = useLeaveEvent();

  const sortedEvents = React.useMemo(() => {
    const now = new Date();
    const in7Days = addDays(now, 7);
    const eligible = events.filter((event) => !event.is_archived);
    const activeOrUpcoming = eligible.filter((event) => {
      const start = parseISO(event.start_time);
      if (!isValid(start)) return false;
      const end = event.end_time ? parseISO(event.end_time) : null;
      const hasValidEnd = !!end && isValid(end);
      const isOngoing =
        !isAfter(start, now) &&
        hasValidEnd &&
        !isBefore(end, now);
      const isUpcoming = isAfter(start, now) && isBefore(start, in7Days);
      return isOngoing || isUpcoming;
    });

    if (activeOrUpcoming.length > 0) {
      return activeOrUpcoming
        .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime())
        .slice(0, 3);
    }

    return eligible
      .sort((a, b) => parseISO(b.start_time).getTime() - parseISO(a.start_time).getTime())
      .slice(0, 3);
  }, [events]);

  return (
    <Card className="h-full bg-[color:var(--cmp-card-bg)] backdrop-blur-md border border-[color:var(--cmp-card-border)] flex flex-col relative overflow-hidden">
      <CardHeader
        className="pb-4 border-b border-[color:var(--cmp-card-border)]"
        style={{ backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 40%, transparent)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-lg font-black uppercase tracking-widest text-foreground">{t('dashboard.upcoming_events')}</h2>
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
              {t('dashboard.next_7_days')}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 overflow-y-auto max-h-[800px] no-scrollbar">
        {sortedEvents.some((e) => e.is_pinned) && (
          <div className="flex items-center gap-2 mb-2 px-2 py-1 border rounded-md" style={getToneStyles('warning')}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-status-warning)' }} />
            <span className="text-[10px] uppercase font-black tracking-widest">{t('dashboard.featured_event')}</span>
          </div>
        )}

        {sortedEvents.length > 0 ? (
          sortedEvents.map((event) => {
            const startTime = parseISO(event.start_time);
            const isStartsSoon = isAfter(startTime, new Date()) && isBefore(startTime, addHours(new Date(), 6));
            const isJoined = (event.participants || []).some((p) => p.id === currentUser?.id);
            const currentParticipants = (event.participants || []).length;
            const maxParticipants = event.capacity || 0;
            const slotsLeft = maxParticipants > 0 ? maxParticipants - currentParticipants : null;
            const eventTypeStyle = (() => {
              const map = theme.custom?.eventTypes;
              const colors =
                event.type === 'guild_war'
                  ? map?.guild_war
                  : event.type === 'weekly_mission'
                    ? map?.weekly_mission
                    : map?.other;

              if (!colors) {
                return getToneStyles('info');
              }

              return {
                backgroundColor: `color-mix(in srgb, ${colors.bg} 82%, transparent)`,
                borderColor: `color-mix(in srgb, ${colors.main} 48%, transparent)`,
                color: colors.text,
              } satisfies React.CSSProperties;
            })();

            const handleCopySignup = () => {
              const names = (event.participants || []).map((p) => p.wechat_name || p.username).join(', ');
              const text = `${event.title}: ${names}`;
              navigator.clipboard.writeText(text);
            };

            return (
              <div
                key={event.id}
                className="group relative rounded-xl border border-[color:var(--cmp-card-border)] hover:border-[color:var(--sys-interactive-accent)] transition-all duration-300 overflow-hidden"
                style={{ backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 32%, transparent)' }}
              >
                <div
                  className={cn(
                    'absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300',
                    isJoined ? 'bg-primary' : 'bg-[color:var(--sys-border-subtle)] group-hover:bg-primary/50'
                  )}
                />

                <div className="p-4 pl-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="uppercase text-[9px] font-black tracking-wider h-5 border" style={eventTypeStyle}>
                        {getEventTypeLabel(t, event.type)}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                        <AccessTimeIcon sx={{ fontSize: 14 }} />
                        <span>{format(startTime, timeFormat, { locale: dateLocale })}</span>
                      </div>
                      {isStartsSoon && (
                        <Badge variant="destructive" className="animate-pulse text-[9px] h-5 uppercase font-bold">
                          {t('dashboard.status.starting_soon')}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Tooltip title={t('dashboard.actions.copy_signup_list')} TransitionComponent={Zoom}>
                        <IconButton
                          size="small"
                          onClick={handleCopySignup}
                          className="text-muted-foreground hover:text-foreground border border-[color:var(--cmp-card-border)]"
                          sx={{ backgroundColor: 'color-mix(in srgb, var(--sys-surface-elevated) 50%, transparent)' }}
                        >
                          <ContentCopyIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>

                      {isJoined ? (
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (!currentUserId) return;
                            leaveEvent({ eventId: event.id, userId: currentUserId });
                          }}
                          disabled={!currentUserId}
                          className="border"
                          sx={getToneStyles('error')}
                        >
                          <ExitToAppIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      ) : (
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (!currentUserId) return;
                            joinEvent({ eventId: event.id, userId: currentUserId });
                          }}
                          disabled={
                            !currentUserId ||
                            !!(maxParticipants > 0 && currentParticipants >= maxParticipants) ||
                            event.is_locked
                          }
                          className="text-primary border border-[color:var(--sys-interactive-accent)] disabled:opacity-30"
                          sx={{
                            backgroundColor: 'color-mix(in srgb, var(--sys-interactive-accent) 14%, transparent)',
                            '&:hover': {
                              backgroundColor: 'color-mix(in srgb, var(--sys-interactive-accent) 22%, transparent)',
                            },
                          }}
                        >
                          {event.is_locked ? <LockIcon sx={{ fontSize: 14 }} /> : <AddIcon sx={{ fontSize: 14 }} />}
                        </IconButton>
                      )}

                      <div
                        className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground px-2 py-1 rounded-md border border-[color:var(--cmp-card-border)]"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--sys-surface-elevated) 60%, transparent)' }}
                      >
                        <GroupIcon sx={{ fontSize: 12 }} />
                        <span style={{ color: slotsLeft !== null && slotsLeft <= 3 ? 'var(--color-status-error)' : 'var(--sys-text-primary)' }}>
                          {currentParticipants}
                        </span>
                        {maxParticipants > 0 && <span className="opacity-50">/{maxParticipants}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors mb-1">{event.title}</h3>
                    {event.description && <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>}
                  </div>

                  <div className="mb-4">
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 10 }).map((_, idx) => {
                        const participant = (event.participants || [])[idx];

                        if (!participant) {
                          return (
                            <div
                              key={`empty-${idx}`}
                              className="flex flex-col items-center justify-center p-2 rounded-md border border-dashed border-[color:var(--cmp-card-border)] h-[60px]"
                              style={{ backgroundColor: 'color-mix(in srgb, var(--sys-surface-elevated) 38%, transparent)' }}
                            >
                              <span className="text-[10px] text-muted-foreground/30">--</span>
                            </div>
                          );
                        }

                        const userClasses = participant.classes || [];
                        const userClass = userClasses.length > 0 ? userClasses[0] : null;
                        const classColor = getClassTokenColor(userClass);

                        return (
                          <div
                            key={participant.id}
                            className="flex flex-col items-center justify-center p-2 rounded-md border transition-all h-[60px]"
                            style={{
                              backgroundColor: classColor.bg,
                              borderColor: `color-mix(in srgb, ${classColor.main} 45%, transparent)`,
                              color: classColor.text,
                            }}
                          >
                            <span className="text-[10px] font-bold leading-tight truncate w-full text-center">{participant.username}</span>
                            <span className="text-[8px] opacity-70 uppercase tracking-wider">{userClass || t('common.unknown')}</span>
                            {participant.power && (
                              <span className="text-[7px] font-mono opacity-50">{(participant.power / 1000).toFixed(0)}k</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {(event.participants || []).length > 10 && (
                      <div className="mt-2 text-center">
                        <span
                          className="text-[10px] font-bold text-primary px-2 py-1 rounded border border-[color:var(--sys-interactive-accent)]"
                          style={{ backgroundColor: 'color-mix(in srgb, var(--sys-interactive-accent) 12%, transparent)' }}
                        >
                          +{(event.participants?.length || 0) - 10} {t('common.more')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <CalendarTodayIcon sx={{ fontSize: 48 }} className="text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground">{t('dashboard.no_upcoming_events')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
