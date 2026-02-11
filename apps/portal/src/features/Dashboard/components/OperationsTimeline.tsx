import React from 'react';
import { format, addDays, isSameDay, startOfDay } from 'date-fns';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Event } from '@/types';
import { Card } from '@/components/layout/Card';
import { Badge } from '@/components/data-display/Badge';
import { Tooltip, Zoom } from '@mui/material';
import { useAuthStore } from '@/store';
import { cn } from '@/lib/utils';

interface OperationsTimelineProps {
  events: Event[];
}

export const OperationsTimeline: React.FC<OperationsTimelineProps> = ({ events }) => {
  const { t } = useTranslation();
  const currentUser = useAuthStore(state => state.user);
  const today = startOfDay(new Date());
  // 7-day timeline: today + next 6 days
  const timelineDays = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  // Only show events the user has joined
  const myEvents = events.filter(e => 
    (e.participants || []).some(p => p.id === currentUser?.id)
  );

  const getEventsForDay = (date: Date) => {
    return myEvents.filter(e => isSameDay(new Date(e.start_time), date));
  };

  const getLocalizedWeekday = (date: Date) => {
    const day = date.getDay();
    if (day === 0) return t('common.day_sunday');
    if (day === 1) return t('common.day_monday');
    if (day === 2) return t('common.day_tuesday');
    if (day === 3) return t('common.day_wednesday');
    if (day === 4) return t('common.day_thursday');
    if (day === 5) return t('common.day_friday');
    return t('common.day_saturday');
  };

  return (
    <Card
      className="w-full backdrop-blur-md border px-0 border-[color:var(--cmp-card-border)] overflow-hidden relative shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] group"
      style={{ backgroundColor: 'color-mix(in srgb, var(--cmp-card-bg) 84%, transparent)' }}
    >
       {/* Cinematic "Scan Line" Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-scan pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      
      <div
        className="flex items-center justify-between px-6 py-3 border-b border-[color:var(--cmp-card-border)]"
        style={{ backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 40%, transparent)' }}
      >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" />
            {t('dashboard.my_signups.title')}
         </span>
         <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[9px] h-5 text-muted-foreground font-mono tracking-wider border border-[color:var(--cmp-card-border)]"
              style={{ backgroundColor: 'color-mix(in srgb, var(--sys-surface-elevated) 50%, transparent)' }}
            >
                {myEvents.length} {t('dashboard.my_signups.events')}
            </Badge>
         </div>
      </div>
      
      <div className="flex flex-row overflow-x-auto p-6 gap-3 no-scrollbar scroll-smooth">
        {timelineDays.map((date, index) => {
          const dayEvents = getEventsForDay(date);
          const isToday = index === 1; // Today is at index 1 (yesterday is 0)
          const isYesterday = index === 0;
          const hasWar = dayEvents.some(e => e.type === 'guild_war');
          const hasMission = dayEvents.some(e => e.type === 'weekly_mission');
          const eventNames = dayEvents.map(e => e.title).join(', ');
          
          return (
            <motion.div
              key={date.toISOString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex-1 min-w-[140px] h-[160px] rounded-xl border relative group/day cursor-pointer
                transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
                flex flex-col items-center justify-center gap-1
                ${isToday 
                  ? 'bg-primary/10 border-primary/50 shadow-[0_0_20px_-5px_rgba(var(--primary-rgb),0.3)] z-10 scale-105' 
                  : 'bg-card/20 border-[color:var(--cmp-card-border)] hover:bg-card/40 hover:border-primary/30'
                }
              `}
            >
               {/* Date Header */}
               <div className={`text-[9px] uppercase font-black tracking-widest mb-1 ${isToday ? 'text-primary' : 'text-muted-foreground group-hover/day:text-primary/70'}`}>
                 {isToday ? t('dashboard.timeline.today') : getLocalizedWeekday(date)}
               </div>

               <Tooltip title={dayEvents.length > 0 ? eventNames : t('dashboard.my_signups.no_events')}>
                   <div
                     className={`text-2xl font-black tracking-tighter ${isToday ? '' : 'group-hover/day:text-foreground'}`}
                     style={{
                       color: isToday
                         ? 'var(--sys-text-primary)'
                         : 'color-mix(in srgb, var(--sys-text-primary) 60%, transparent)',
                     }}
                   >
                     {format(date, 'd')}
                   </div>
               </Tooltip>

               {/* Event Pills */}
               <div className="absolute top-[85px] left-1/2 -translate-x-1/2 w-[140px] flex flex-col items-center gap-1 z-20">
                  {dayEvents.slice(0, 2).map((event, i) => (
                      <div key={event.id} className={cn(
                          "text-[9px] px-2 py-0.5 rounded-full border shadow-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-full backdrop-blur-md transition-all",
                          isToday 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "bg-card/80 text-muted-foreground border-[color:var(--cmp-card-border)] group-hover/day:border-primary/30 group-hover/day:text-foreground"
                      )}>
                          {event.title}
                      </div>
                  ))}
               </div>

               {/* Activity Indicators (Dot only if no text shown or for extra status) */}
               {dayEvents.length === 0 && (
                   <div className="mt-4 text-[9px] text-muted-foreground/30 font-mono uppercase tracking-widest">
                       {t('dashboard.my_signups.no_events')}
                   </div>
               )}

               {/* Connecting Line (Visual) */}
               {dayEvents.length > 0 && (
                  <div className={`absolute top-[70px] bottom-[25px] w-[1px] ${isToday ? 'bg-primary/50' : 'bg-[color:var(--cmp-card-border)] group-hover/day:bg-primary/30'}`} />
               )}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};
