import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/layout/Card';
import { User } from '@/types';
import { format, parse } from 'date-fns';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Tooltip, Zoom } from '@mui/material';

interface AvailabilityHeatmapProps {
  members: User[];
}

export const AvailabilityHeatmap: React.FC<AvailabilityHeatmapProps> = ({ members }) => {
  const { t } = useTranslation();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23

  // Calculate heatmap data: active count per hour per day
  const heatmapData = useMemo(() => {
    const data: Record<string, Record<number, number>> = {};
    
    // Initialize
    days.forEach(day => {
        data[day] = {};
        hours.forEach(hour => data[day][hour] = 0);
    });

    members.forEach(member => {
        if (!member.availability) return;

        member.availability.forEach(daySchedule => {
            const day = daySchedule.day;
            if (!data[day]) return;

            daySchedule.blocks.forEach(block => {
                const startHour = parseInt(block.start.split(':')[0], 10);
                const endHour = parseInt(block.end.split(':')[0], 10);

                // Simple filling for now, handling cross-day wrap-around would be more complex
                // Assuming start <= end for simplicity in this version or same day
                for (let h = startHour; h <= endHour; h++) {
                   // Handle potential "24:00" logic if standard is to stop at 23
                   if (h < 24) data[day][h]++; 
                }
            });
        });
    });

    return data;
  }, [members, days, hours]);

  // Find max for scaling opacity
  const maxCount = useMemo(() => {
    let max = 0;
    Object.values(heatmapData).forEach(dayHours => {
        Object.values(dayHours).forEach(count => {
            if (count > max) max = count;
        });
    });
    return max || 1; // Avoid division by zero
  }, [heatmapData]);

  return (
    <Card
      className="h-full backdrop-blur-md border border-[color:var(--cmp-card-border)] overflow-hidden relative"
      style={{ backgroundColor: 'color-mix(in srgb, var(--cmp-card-bg) 84%, transparent)' }}
    >
      <CardHeader
        className="pb-2 border-b border-[color:var(--cmp-card-border)]"
        style={{ backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 40%, transparent)' }}
      >
         <div className="flex items-center gap-2">
            <AccessTimeIcon sx={{ fontSize: 16 }} className="text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t('dashboard.heatmap.title')}</span>
         </div>
      </CardHeader>
      <CardContent className="p-3">
         <div className="flex flex-col gap-1">
            {/* Header Row (Hours) - Simplified to marks */}
            <div className="flex pl-8 text-[8px] text-muted-foreground mb-1 justify-between font-mono">
                <span>00</span>
                <span>06</span>
                <span>12</span>
                <span>18</span>
                <span>24</span>
            </div>

            {/* Grid */}
            {days.map(day => (
                <div key={day} className="flex items-center h-4 group">
                    {/* Day Label */}
                    <div className="w-8 text-[8px] font-bold uppercase text-muted-foreground text-right pr-2 group-hover:text-primary transition-colors">
                        {day.substring(0, 3)}
                    </div>
                    {/* Hour Blocks */}
                    <div className="flex-1 flex gap-[1px] h-full">
                        {hours.map(hour => {
                            const count = heatmapData[day][hour];
                            const intensity = count / maxCount;
                            
                            return (
                                <Tooltip 
                                    key={hour} 
                                    title={t('dashboard.heatmap.online_count', { day, hour, count })} 
                                    placement="top" 
                                    TransitionComponent={Zoom}
                                    arrow
                                >
                                    <div 
                                        className="flex-1 rounded-[1px] transition-all duration-300 hover:scale-125 hover:z-50 cursor-crosshair border border-transparent hover:border-[color:var(--sys-border-strong)] relative"
                                        style={{
                                            backgroundColor: intensity > 0 
                                                ? `rgba(var(--primary-rgb), ${intensity * 0.8 + 0.2})` 
                                                : 'color-mix(in srgb, var(--sys-surface-elevated) 42%, transparent)',
                                            boxShadow: intensity > 0.8 ? '0 0 5px rgba(var(--primary-rgb), 0.5)' : 'none'
                                        }}
                                    />
                                </Tooltip>
                            );
                        })}
                    </div>
                </div>
            ))}
         </div>
         
         <div className="flex justify-between items-center mt-3 text-[9px] text-muted-foreground px-2 pt-2 border-t border-[color:var(--cmp-card-border)]">
            <span className="uppercase tracking-wider">{t('dashboard.heatmap.low_activity')}</span>
            <div className="flex gap-1 h-1.5 opacity-80">
                <div className="w-3 rounded-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--sys-interactive-accent) 14%, transparent)' }} />
                <div className="w-3 rounded-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--sys-interactive-accent) 40%, transparent)' }} />
                <div className="w-3 rounded-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--sys-interactive-accent) 72%, transparent)' }} />
                <div className="w-3 rounded-sm" style={{ backgroundColor: 'var(--sys-interactive-accent)', boxShadow: '0 0 5px rgba(var(--primary-rgb),0.5)' }} />
            </div>
            <span className="uppercase tracking-wider">{t('dashboard.heatmap.peak_time')}</span>
         </div>
      </CardContent>
    </Card>
  );
};
