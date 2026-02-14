import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/layout/Card';
import { Event } from '@/types';
import { format, parseISO, addDays } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupIcon from '@mui/icons-material/Group';
import { Tooltip } from '@mui/material';

interface TimelineProps {
  events: Event[];
  userId: string;
}

const DAY_WIDTH_PX = 120;
const TIMELINE_DAYS = 7;
const MINUTES_PER_DAY = 24 * 60;

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

export const Timeline: React.FC<TimelineProps> = ({ events, userId }) => {
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

  const next7Days = Array.from({ length: TIMELINE_DAYS }, (_, i) => {
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

  const calculateNowOffsetPx = () => {
    const startOfToday = new Date(today);
    const minutesSinceWeekStart = (currentTime.getTime() - startOfToday.getTime()) / 60000;
    const totalWindowMinutes = TIMELINE_DAYS * MINUTES_PER_DAY;

    if (minutesSinceWeekStart <= 0 || minutesSinceWeekStart >= totalWindowMinutes) {
      return null;
    }

    return (minutesSinceWeekStart / MINUTES_PER_DAY) * DAY_WIDTH_PX;
  };

  const nowOffsetPx = calculateNowOffsetPx();

  const calculateEventStartOffset = (startTime: string) => {
    const start = parseISO(startTime);
    const startOfDay = new Date(start);
    startOfDay.setHours(0, 0, 0, 0);
    const minutesFromMidnight = (start.getTime() - startOfDay.getTime()) / 60000;
    const boundedMinutes = Math.max(0, Math.min(24 * 60, minutesFromMidnight));
    return (boundedMinutes / (24 * 60)) * 100;
  };

  return (
    <Card
      data-testid="dashboard-timeline"
      className="h-full bg-[color:var(--cmp-card-bg)] backdrop-blur-md border border-[color:var(--cmp-card-border)] flex flex-col relative overflow-hidden group gap-0"
    >
      {/* Top gradient accent */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />

      <CardHeader
        className="px-4 pt-3 pb-2.5 border-b border-[color:var(--cmp-card-border)] flex-shrink-0 relative z-10"
        style={{ backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 50%, transparent)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <CalendarTodayIcon sx={{ fontSize: 14 }} className="text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
              {t('dashboard.my_signups.title')}
            </span>
          </div>
          <div className="px-2 py-1 rounded-md border border-[color:var(--cmp-card-border)] bg-gradient-to-br from-primary/10 to-primary/5">
            <span className="text-[10px] font-bold text-primary">
              {myEvents.length} {myEvents.length === 1 ? t('dashboard.my_signups.event') : t('dashboard.my_signups.events')}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 min-h-0">
        <div className="relative h-full flex flex-col">
          <div className="flex-1 overflow-x-auto overflow-y-hidden pb-2 no-scrollbar">
            <div className="relative min-w-max h-full">
              {/* Enhanced timeline rail with gradient */}
              <div className="absolute top-5 left-0 right-0 h-[3px] bg-gradient-to-r from-primary/40 via-primary/25 to-primary/10 rounded-full" />
              <div className="absolute top-5 left-0 right-0 h-[1px] bg-gradient-to-r from-primary/60 via-primary/40 to-transparent" />

              {/* Enhanced "now" marker with glow effect */}
              {nowOffsetPx !== null && (
                <div
                  data-testid="dashboard-timeline-now-marker"
                  className="absolute top-0 bottom-0 w-[3px] z-20"
                  style={{ 
                    left: `${nowOffsetPx}px`,
                    background: 'linear-gradient(180deg, var(--sys-interactive-accent) 0%, color-mix(in srgb, var(--sys-interactive-accent) 60%, transparent) 100%)',
                    boxShadow: '0 0 12px 2px color-mix(in srgb, var(--sys-interactive-accent) 40%, transparent)',
                  }}
                >
                  {/* Pulsing dot at top */}
                  <div
                    className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-2 animate-pulse"
                    style={{ 
                      borderColor: 'var(--cmp-card-bg)',
                      boxShadow: '0 0 16px 4px color-mix(in srgb, var(--sys-interactive-accent) 50%, transparent), 0 0 8px 2px var(--sys-interactive-accent)',
                    }}
                  >
                    {/* Inner glow */}
                    <div className="absolute inset-0.5 rounded-full bg-primary/80 animate-ping" />
                  </div>
                  
                  {/* Enhanced time label */}
                  <div
                    data-testid="dashboard-timeline-now-label-container"
                    className="absolute top-8 left-full ml-2 whitespace-nowrap"
                  >
                    <span
                      data-testid="dashboard-timeline-now-label"
                      className="text-[8px] font-bold text-primary px-2 py-1 rounded-md border backdrop-blur-sm shadow-lg"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--cmp-card-bg) 85%, transparent)',
                        borderColor: 'var(--sys-interactive-accent)',
                        boxShadow: '0 2px 8px color-mix(in srgb, var(--sys-interactive-accent) 25%, transparent)',
                      }}
                    >
                      {format(currentTime, timeFormat, { locale: dateLocale })}
                    </span>
                  </div>
                </div>
              )}

              <div data-testid="dashboard-timeline-day-rail" className="flex gap-0 h-full">
                {next7Days.map((dateStr, dayIndex) => {
                  const dayEvents = groupedByDate[dateStr] || [];
                  const hasEvents = dayEvents.length > 0;
                  const date = parseISO(dateStr);

                  return (
                    <div
                      key={dateStr}
                      data-testid={`dashboard-timeline-day-${dateStr}`}
                      className="relative flex flex-col items-center w-[120px] shrink-0"
                    >
                      {/* Enhanced day band with gradient */}
                      <div
                        data-testid={`dashboard-timeline-day-band-${dateStr}`}
                        className="absolute top-5 bottom-0 left-0 right-0 pointer-events-none transition-all duration-300"
                        style={{
                          borderLeft: dayIndex === 0 ? 'none' : '1px solid color-mix(in srgb, var(--sys-border-subtle) 40%, transparent)',
                          borderRight: '1px solid color-mix(in srgb, var(--sys-border-subtle) 30%, transparent)',
                          backgroundColor: dayIndex % 2 === 0
                            ? 'color-mix(in srgb, var(--sys-surface-sunken) 12%, transparent)'
                            : 'transparent',
                        }}
                      />
                      
                      {/* Enhanced day circle with shadow and gradient */}
                      <div
                        className="w-11 h-11 rounded-full border-2 flex items-center justify-center relative z-10 mb-3 transition-all duration-300 hover:scale-110"
                        style={{
                          borderColor: hasEvents ? 'var(--sys-interactive-accent)' : 'color-mix(in srgb, var(--sys-border-subtle) 70%, transparent)',
                          backgroundColor: hasEvents
                            ? 'var(--cmp-card-bg)'
                            : 'color-mix(in srgb, var(--cmp-card-bg) 60%, transparent)',
                          boxShadow: hasEvents 
                            ? '0 4px 12px color-mix(in srgb, var(--sys-interactive-accent) 20%, transparent), 0 2px 4px color-mix(in srgb, var(--sys-shadow) 10%, transparent)'
                            : '0 2px 4px color-mix(in srgb, var(--sys-shadow) 5%, transparent)',
                        }}
                      >
                        {/* Gradient overlay for active days */}
                        {hasEvents && (
                          <div 
                            className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"
                          />
                        )}
                        
                        <div className="text-center relative z-10">
                          <div className={`text-[9px] font-black uppercase ${hasEvents ? 'text-primary' : 'text-muted-foreground/50'} leading-none`}>
                            {getLocalizedWeekday(t, date)}
                          </div>
                          <div className="text-[8px] text-muted-foreground leading-none mt-0.5">
                            {format(date, 'M/d')}
                          </div>
                        </div>
                      </div>

                      {/* Time markers - keep as is */}
                      <div
                        data-testid={`dashboard-timeline-day-markers-${dateStr}`}
                        className="absolute top-0 left-0 right-0 h-10 pointer-events-none z-20"
                      >
                        <div
                          data-testid={`dashboard-timeline-midnight-tick-${dateStr}`}
                          className="absolute top-5 left-0 -translate-x-1/2 -translate-y-1/2 h-2 w-px bg-muted-foreground/60"
                        />
                        <span
                          data-testid={`dashboard-timeline-midnight-label-${dateStr}`}
                          className="absolute top-0 left-0 -translate-x-1/2 text-[8px] font-mono text-muted-foreground/80 px-0.5"
                          style={{ backgroundColor: 'var(--cmp-card-bg)' }}
                        >
                          {t('dashboard.my_signups.markers.midnight')}
                        </span>
                        <div
                          data-testid={`dashboard-timeline-six-tick-${dateStr}`}
                          className="absolute top-5 left-1/4 -translate-x-1/2 -translate-y-1/2 h-2 w-px bg-muted-foreground/50"
                        />
                        <span
                          data-testid={`dashboard-timeline-six-label-${dateStr}`}
                          className="absolute top-0 left-1/4 -translate-x-1/2 text-[8px] font-mono text-muted-foreground/80 px-0.5"
                          style={{ backgroundColor: 'var(--cmp-card-bg)' }}
                        >
                          {t('dashboard.my_signups.markers.six')}
                        </span>
                        <div
                          data-testid={`dashboard-timeline-noon-tick-${dateStr}`}
                          className="absolute top-5 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-px bg-muted-foreground/50"
                        />
                        <span
                          data-testid={`dashboard-timeline-noon-label-${dateStr}`}
                          className="absolute top-0 left-1/2 -translate-x-1/2 text-[8px] font-mono text-muted-foreground/80 px-0.5"
                          style={{ backgroundColor: 'var(--cmp-card-bg)' }}
                        >
                          {t('dashboard.my_signups.markers.noon')}
                        </span>
                        <div
                          data-testid={`dashboard-timeline-eighteen-tick-${dateStr}`}
                          className="absolute top-5 left-3/4 -translate-x-1/2 -translate-y-1/2 h-2 w-px bg-muted-foreground/50"
                        />
                        <span
                          data-testid={`dashboard-timeline-eighteen-label-${dateStr}`}
                          className="absolute top-0 left-3/4 -translate-x-1/2 text-[8px] font-mono text-muted-foreground/80 px-0.5"
                          style={{ backgroundColor: 'var(--cmp-card-bg)' }}
                        >
                          {t('dashboard.my_signups.markers.eighteen')}
                        </span>
                      </div>

                      <div className="h-6 mb-2" />

                      {/* Enhanced event cards */}
                      <div className="flex-1 w-full relative z-10">
                        {hasEvents && (
                          <div className="space-y-1.5">
                            {dayEvents.map(event => {
                              const startOffset = calculateEventStartOffset(event.start_time);
                              return (
                                <div
                                  key={event.id}
                                  data-testid={`dashboard-timeline-event-${event.id}`}
                                  style={{ marginLeft: `${startOffset}%` }}
                                >
                                  <Tooltip
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
                                      className="min-w-[140px] max-w-[220px] p-2 rounded-lg border backdrop-blur-sm cursor-pointer group/event transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                      style={{ 
                                        backgroundColor: 'color-mix(in srgb, var(--sys-surface-elevated) 65%, transparent)',
                                        borderColor: 'color-mix(in srgb, var(--cmp-card-border) 80%, transparent)',
                                        boxShadow: '0 2px 8px color-mix(in srgb, var(--sys-shadow) 8%, transparent)',
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--sys-interactive-accent)';
                                        e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--sys-surface-elevated) 85%, transparent)';
                                        e.currentTarget.style.boxShadow = '0 4px 16px color-mix(in srgb, var(--sys-interactive-accent) 15%, transparent)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--cmp-card-border) 80%, transparent)';
                                        e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--sys-surface-elevated) 65%, transparent)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px color-mix(in srgb, var(--sys-shadow) 8%, transparent)';
                                      }}
                                    >
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-[8px] font-mono text-muted-foreground font-bold">
                                          {format(parseISO(event.start_time), timeFormat, { locale: dateLocale })}
                                        </span>
                                        <span
                                          className="text-[7px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider border whitespace-nowrap shrink-0 shadow-sm"
                                          style={getEventBadgeStyle(event.type)}
                                        >
                                          {getSignupTypeLabel(t, event.type)}
                                        </span>
                                      </div>
                                      <div className="text-[10px] font-semibold text-foreground group-hover/event:text-primary transition-colors line-clamp-1">
                                        {event.title}
                                      </div>
                                    </div >
                                  </Tooltip>
                                </div>
                              );
                            })}
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
