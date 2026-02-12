import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/layout/Card';
import { Announcement, Event, User } from '@/types';
import { parseISO, formatDistanceToNow, subDays, addDays, isAfter, isBefore, isValid } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';
import { Link } from '@tanstack/react-router';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CellTowerIcon from '@mui/icons-material/CellTower';
import { ScrollArea } from '@/components/layout/ScrollArea';

interface IntelFeedProps {
  announcements: Announcement[];
  newMembers: User[];
  recentEvents: Event[];
}

type IntelTone = 'error' | 'info' | 'success';

const getIntelIconContainerStyle = (tone: IntelTone): React.CSSProperties => ({
  borderColor: 'color-mix(in srgb, var(--cmp-card-border) 86%, transparent)',
  backgroundColor: `color-mix(in srgb, var(--color-status-${tone}-bg) 78%, transparent)`,
  color: `var(--color-status-${tone})`,
  boxShadow: `inset 0 0 10px color-mix(in srgb, var(--color-status-${tone}) 22%, transparent)`,
});

const getIntelLabelStyle = (tone: IntelTone): React.CSSProperties => ({
  color: `var(--color-status-${tone})`,
});

export const IntelFeed: React.FC<IntelFeedProps> = ({ announcements, newMembers, recentEvents }) => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language.startsWith('zh') ? zhCN : enUS;

  const now = new Date();
  const threeDaysAgo = subDays(now, 3);
  const threeDaysFromNow = addDays(now, 3);

  const recentAnnouncements = React.useMemo(() => {
    const recent = announcements.filter((announcement) => {
      const createdAt = parseISO(announcement.created_at);
      return isValid(createdAt) && isAfter(createdAt, threeDaysAgo);
    });
    return (recent.length > 0 ? recent : announcements).slice(0, 3);
  }, [announcements, threeDaysAgo]);

  const recentNewMembers = React.useMemo(() => {
    const recent = newMembers.filter((member) => {
      const joinedAt = parseISO(member.created_at || '');
      return isValid(joinedAt) && isAfter(joinedAt, threeDaysAgo);
    });
    return (recent.length > 0 ? recent : newMembers).slice(0, 3);
  }, [newMembers, threeDaysAgo]);

  const upcomingEvents = React.useMemo(() => {
    const activeOrUpcoming = recentEvents.filter((event) => {
      const startTime = parseISO(event.start_time);
      if (!isValid(startTime)) return false;
      const endTime = event.end_time ? parseISO(event.end_time) : null;
      const hasValidEnd = !!endTime && isValid(endTime);
      const isOngoing =
        !isAfter(startTime, now) &&
        hasValidEnd &&
        !isBefore(endTime, now);
      const isUpcoming = isAfter(startTime, now) && isBefore(startTime, threeDaysFromNow);
      return isOngoing || isUpcoming;
    });
    return (activeOrUpcoming.length > 0 ? activeOrUpcoming : recentEvents).slice(0, 3);
  }, [recentEvents, now, threeDaysFromNow]);

  return (
    <Card className="h-full bg-[color:var(--cmp-card-bg)] backdrop-blur-md border border-[color:var(--cmp-card-border)] flex flex-col relative overflow-hidden group gap-0">
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

      <CardHeader
        className="pb-3 border-b border-[color:var(--cmp-card-border)] flex-shrink-0"
        style={{ backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 40%, transparent)' }}
      >
        <div className="flex items-center gap-2">
          <CellTowerIcon sx={{ fontSize: 16 }} className="text-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t('dashboard.intel.title')}</span>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 min-h-0 relative">
        <ScrollArea className="h-full">
          <div className="flex flex-col">
            {recentAnnouncements.length > 0 && (
              <>
                {recentAnnouncements.slice(0, 3).map((a) => (
                  <div
                    key={`announcement-${a.id}`}
                    className="p-3 border-b border-[color:var(--cmp-card-border)] hover:bg-[color:var(--sys-interactive-hover)] transition-all duration-300 flex gap-3 group/item relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300" />

                    <div
                      className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border shadow-inner"
                      style={getIntelIconContainerStyle('error')}
                    >
                      <NotificationsIcon sx={{ fontSize: 16 }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <span className="text-[9px] font-black uppercase tracking-wider" style={getIntelLabelStyle('error')}>
                          {t('dashboard.intel.priority_transmission')}
                        </span>
                        <span className="text-[9px] text-muted-foreground whitespace-nowrap ml-2 opacity-50 font-mono">
                          {formatDistanceToNow(parseISO(a.created_at), { addSuffix: true, locale: dateLocale })}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-foreground group-hover/item:text-primary transition-colors line-clamp-2 leading-tight">
                        {a.title}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {upcomingEvents.length > 0 && (
              <>
                {upcomingEvents.slice(0, 3).map((e) => (
                  <div
                    key={`event-${e.id}`}
                    className="p-3 border-b border-[color:var(--cmp-card-border)] hover:bg-[color:var(--sys-interactive-hover)] transition-all duration-300 flex gap-3 group/item relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300" />

                    <div
                      className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border shadow-inner"
                      style={getIntelIconContainerStyle('info')}
                    >
                      <CalendarTodayIcon sx={{ fontSize: 16 }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <span className="text-[9px] font-black uppercase tracking-wider" style={getIntelLabelStyle('info')}>
                          {t('dashboard.intel.schedule_update')}
                        </span>
                        <span className="text-[9px] text-muted-foreground whitespace-nowrap ml-2 opacity-50 font-mono">
                          {formatDistanceToNow(parseISO(e.updated_at), { addSuffix: true, locale: dateLocale })}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-foreground group-hover/item:text-primary transition-colors line-clamp-2 leading-tight mb-1">
                        {t('dashboard.intel.operation_created', { title: e.title })}
                      </div>
                      <Link
                        to="/events"
                        search={{ eventId: e.id }}
                        className="text-[9px] text-primary/70 hover:text-primary uppercase tracking-wider font-bold flex items-center gap-1 transition-colors"
                      >
                        {t('dashboard.intel.view_event')} -
                      </Link>
                    </div>
                  </div>
                ))}
              </>
            )}

            {recentNewMembers.length > 0 && (
              <>
                <div
                  className="px-4 py-2 border-b border-[color:var(--cmp-card-border)]"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 56%, transparent)' }}
                >
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <PersonAddIcon sx={{ fontSize: 12 }} />
                    {t('dashboard.intel.members')}
                  </span>
                </div>

                {recentNewMembers.slice(0, 3).map((m) => (
                  <div
                    key={`member-${m.id}`}
                    className="p-3 border-b border-[color:var(--cmp-card-border)] hover:bg-[color:var(--sys-interactive-hover)] transition-all duration-300 flex gap-3 group/item relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300" />

                    <div
                      className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border shadow-inner"
                      style={getIntelIconContainerStyle('success')}
                    >
                      <PersonAddIcon sx={{ fontSize: 16 }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-primary/80">
                          {t('dashboard.intel.reinforcements')}
                        </span>
                        <span className="text-[9px] text-muted-foreground whitespace-nowrap ml-2 opacity-50 font-mono">
                          {formatDistanceToNow(parseISO(m.created_at || new Date().toISOString()), { addSuffix: true, locale: dateLocale })}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-foreground group-hover/item:text-primary transition-colors line-clamp-2 leading-tight">
                        {t('dashboard.intel.operative_joined', { username: m.username })}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {recentAnnouncements.length === 0 && upcomingEvents.length === 0 && recentNewMembers.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-[10px] uppercase tracking-widest border-t border-dashed border-[color:var(--cmp-card-border)] m-4">
                {t('dashboard.intel.no_recent_intel')}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
