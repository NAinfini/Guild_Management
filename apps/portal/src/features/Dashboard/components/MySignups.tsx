import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/layout/Card';
import { Event } from '@/types';
import { format, parseISO, addDays } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupIcon from '@mui/icons-material/Group';
import { Tooltip } from '@mui/material';

interface MySignupsProps {
  events: Event[];
  userId: string;
}

const getEventBadgeStyle = (type: Event['type']): React.CSSProperties => {
  if (type === 'guild_war') {
    return {
      backgroundColor: 'color-mix(in srgb, var(--color-status-error-bg) 86%, transparent)',
      color: 'var(--color-status-error-fg)',
      borderColor: 'color-mix(in srgb, var(--color-status-error) 48%, transparent)',
    };
  }

  if (type === 'weekly_mission') {
    return {
      backgroundColor: 'color-mix(in srgb, var(--color-status-info-bg) 86%, transparent)',
      color: 'var(--color-status-info-fg)',
      borderColor: 'color-mix(in srgb, var(--color-status-info) 48%, transparent)',
    };
  }

  return {
    backgroundColor: 'color-mix(in srgb, var(--color-status-success-bg) 86%, transparent)',
    color: 'var(--color-status-success-fg)',
    borderColor: 'color-mix(in srgb, var(--color-status-success) 48%, transparent)',
  };
};

const getSignupTypeLabel = (
  t: (key: string) => string,
  type: Event['type']
) => {
  if (type === 'guild_war') return t('dashboard.my_signups.types.war');
  if (type === 'weekly_mission') return t('dashboard.my_signups.types.mission');
  return t('dashboard.my_signups.types.event');
};

const getLocalizedWeekday = (
  t: (key: string) => string,
  date: Date
) => {
  const day = date.getDay();
  if (day === 0) return t('common.day_sunday');
  if (day === 1) return t('common.day_monday');
  if (day === 2) return t('common.day_tuesday');
  if (day === 3) return t('common.day_wednesday');
  if (day === 4) return t('common.day_thursday');
  if (day === 5) return t('common.day_friday');
  return t('common.day_saturday');
};

export const MySignups: React.FC<MySignupsProps> = ({ events, userId }) => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language.startsWith('zh') ? zhCN : enUS;
  const timeFormat = i18n.language.startsWith('zh') ? 'HH:mm' : 'h:mm a';
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const myEvents = events.filter(event =>
    event.participants?.some(p => p.id === userId)
  );

  const sortedEvents = myEvents.sort((a, b) =>
    parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i);
    return format(date, 'yyyy-MM-dd');
  });

  const groupedByDate = sortedEvents.reduce((acc, event) => {
    const date = format(parseISO(event.start_time), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  const calculateNowPosition = () => {
    const startOfToday = new Date(today);
    const endOfWeek = addDays(startOfToday, 7);
    const now = currentTime.getTime();
    const start = startOfToday.getTime();
    const end = endOfWeek.getTime();

    if (now < start) return 0;
    if (now > end) return 100;

    return ((now - start) / (end - start)) * 100;
  };

  const nowPosition = calculateNowPosition();

  return (
    <Card className="h-full bg-[color:var(--cmp-card-bg)] backdrop-blur-md border border-[color:var(--cmp-card-border)] flex flex-col relative overflow-hidden group">
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

      <CardHeader
        className="pb-3 border-b border-[color:var(--cmp-card-border)] flex-shrink-0"
        style={{ backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 40%, transparent)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarTodayIcon sx={{ fontSize: 16 }} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {t('dashboard.my_signups.title')}
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            {myEvents.length} {myEvents.length === 1 ? t('dashboard.my_signups.event') : t('dashboard.my_signups.events')}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 min-h-0">
        <div className="relative h-full flex flex-col">
          <div className="flex-1 overflow-x-auto overflow-y-hidden pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="relative min-w-max h-full">
              <div className="absolute top-5 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />

              {nowPosition > 0 && nowPosition < 100 && (
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-primary z-20 animate-pulse"
                  style={{ left: `${nowPosition}%` }}
                >
                  <div
                    className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 shadow-lg"
                    style={{ borderColor: 'var(--cmp-card-bg)' }}
                  />
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span
                      className="text-[8px] font-bold text-primary px-1.5 py-0.5 rounded border"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 78%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--sys-interactive-accent) 36%, transparent)',
                      }}
                    >
                      {t('dashboard.my_signups.now')}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-4 h-full">
                {next7Days.map((dateStr) => {
                  const dayEvents = groupedByDate[dateStr] || [];
                  const hasEvents = dayEvents.length > 0;
                  const date = parseISO(dateStr);

                  return (
                    <div key={dateStr} className="relative flex flex-col items-center min-w-[120px]">
                      <div
                        className="w-10 h-10 rounded-full border-2 flex items-center justify-center relative z-10 mb-3"
                        style={{
                          borderColor: hasEvents ? 'var(--sys-interactive-accent)' : 'var(--sys-border-subtle)',
                          backgroundColor: hasEvents
                            ? 'var(--cmp-card-bg)'
                            : 'color-mix(in srgb, var(--cmp-card-bg) 52%, transparent)',
                        }}
                      >
                        <div className="text-center">
                          <div className={`text-[9px] font-black uppercase ${hasEvents ? 'text-primary' : 'text-muted-foreground/50'} leading-none`}>
                            {getLocalizedWeekday(t, date)}
                          </div>
                          <div className="text-[8px] text-muted-foreground leading-none mt-0.5">
                            {format(date, 'M/d')}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 w-full">
                        {hasEvents ? (
                          <div className="space-y-1.5">
                            {dayEvents.map(event => (
                              <Tooltip
                                key={event.id}
                                title={
                                  <div className="p-2">
                                    <div className="font-bold mb-1">{event.title}</div>
                                    {event.description && (
                                      <div className="text-xs mb-2 opacity-90">{event.description}</div>
                                    )}
                                    <div className="text-xs opacity-75">
                                      {format(parseISO(event.start_time), timeFormat, { locale: dateLocale })}
                                      {event.end_time && ` - ${format(parseISO(event.end_time), timeFormat, { locale: dateLocale })}`}
                                    </div>
                                    {event.participants && (
                                      <div className="text-xs mt-1 opacity-75 flex items-center gap-1">
                                        <GroupIcon sx={{ fontSize: 12 }} />
                                        {event.participants.length} {t('dashboard.my_signups.participants')}
                                      </div>
                                    )}
                                  </div>
                                }
                                placement="top"
                                arrow
                              >
                                <div
                                  className="p-1.5 rounded-lg border border-[color:var(--cmp-card-border)] hover:border-[color:var(--sys-interactive-accent)] hover:bg-[color:var(--sys-interactive-hover)] transition-all cursor-pointer group/event"
                                  style={{ backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 38%, transparent)' }}
                                >
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <span className="text-[8px] font-mono text-muted-foreground">
                                      {format(parseISO(event.start_time), timeFormat, { locale: dateLocale })}
                                    </span>
                                    <span
                                      className="text-[7px] px-1 py-0.5 rounded uppercase font-bold tracking-wider border"
                                      style={getEventBadgeStyle(event.type)}
                                    >
                                      {getSignupTypeLabel(t, event.type)}
                                    </span>
                                  </div>
                                  <div className="text-[10px] font-medium text-foreground group-hover/event:text-primary transition-colors line-clamp-1">
                                    {event.title}
                                  </div>
                                </div>
                              </Tooltip>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[9px] text-muted-foreground/30 italic text-center mt-1">
                            {t('dashboard.my_signups.no_events')}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

