import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';
import { GAME_CLASS_COLORS } from '@/theme/tokens';
import { Card, CardContent, CardHeader } from '@/components/layout/Card';
import { User } from '@/types';
import GroupsIcon from '@mui/icons-material/Groups';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { isWithinInterval, parse, set, format } from 'date-fns';

interface MemberActivityCardProps {
    members: User[];
    title?: string;
}

export const MemberActivityCard: React.FC<MemberActivityCardProps> = ({ members, title = "FORCE STRENGTH" }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  // 1. Calculate Active based on Availability Time Blocks
  const activeCount = useMemo(() => {
    const now = new Date();
    const currentDay = format(now, 'EEEE'); // 'Monday', 'Tuesday', etc.
    const currentTime = now;

    return members.filter(m => {
      if (!m.availability) return false;
      const todaySchedule = m.availability.find(d => d.day === currentDay);
      if (!todaySchedule) return false;

      return todaySchedule.blocks.some(block => {
        const start = parse(block.start, 'HH:mm', now);
        const end = parse(block.end, 'HH:mm', now);
        // Handle cross-midnight if needed, but assuming simple blocks for now
        return isWithinInterval(currentTime, { start, end });
      });
    }).length;
  }, [members]);

  // 2. Class Composition Data
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(m => {
      const cls = (m.classes && m.classes.length > 0) ? m.classes[0] : 'Unknown';
      counts[cls] = (counts[cls] || 0) + 1;
    });

    return Object.entries(counts).map(([label, value], id) => ({
      id,
      value,
      label,
      color: label === 'Tianwang' ? GAME_CLASS_COLORS.lieshi.main : 
             label === 'Buzhou' ? GAME_CLASS_COLORS.pozhu.main : 
             label === 'Yuxu' ? GAME_CLASS_COLORS.mingjin.main : 
             GAME_CLASS_COLORS.qiansi.main 
    }));
  }, [members]);

  // 3. Power Distribution Data (Mock or Real)
  // Assuming we want a distribution curve or just a line of top members? 
  // Let's just show top 10 members power for now as a line
  const powerData = useMemo(() => {
    return members
      .map(m => m.power || 0)
      .sort((a, b) => b - a)
      .slice(0, 10);
  }, [members]);

  return (
    <Card
      className="h-full backdrop-blur-md border border-[color:var(--cmp-card-border)] flex flex-col relative overflow-hidden group"
      style={{ backgroundColor: 'color-mix(in srgb, var(--cmp-card-bg) 84%, transparent)' }}
    >
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 p-20 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
      
      <CardHeader
        className="pb-3 border-b border-[color:var(--cmp-card-border)] shrink-0"
        style={{ backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 40%, transparent)' }}
      >
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <GroupsIcon sx={{ fontSize: 16 }} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t('dashboard.stats.active_members')}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-primary">{activeCount}</span>
                <span className="text-[10px] text-muted-foreground font-mono">/ {members.length}</span>
            </div>
         </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-around min-h-0 relative z-10">
         
         {/* Class Composition Pie */}
         <div className="flex items-center justify-between gap-4">
            <div className="flex-1 h-[100px] relative">
                 <PieChart
                    series={[
                        {
                            data: pieData,
                            innerRadius: 25,
                            outerRadius: 45,
                            paddingAngle: 4,
                            cornerRadius: 4,
                            startAngle: -90,
                            endAngle: 270,
                            cx: 50,
                        }
                    ]}
                    height={100}
                    width={100}
                    slotProps={{
                        legend: { hidden: true } as any
                    }}
                />
            </div>
            <div className="flex flex-col gap-1 min-w-[100px]">
                <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">{t('dashboard.stats.class_composition')}</p>
                {pieData.map((d) => (
                    <div key={d.label} className="flex items-center justify-between text-[9px]">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                            <span style={{ color: 'color-mix(in srgb, var(--sys-text-primary) 70%, transparent)' }}>{d.label}</span>
                        </div>
                        <span className="font-mono" style={{ color: 'color-mix(in srgb, var(--sys-text-primary) 42%, transparent)' }}>{d.value}</span>
                    </div>
                ))}
            </div>
         </div>

         {/* Power Distribution Line */}
         <div className="h-[80px] w-full pt-2 border-t border-[color:var(--cmp-card-border)]">
            <div className="flex items-center justify-between mb-1">
                <p className="text-[9px] font-black uppercase text-muted-foreground">{t('dashboard.stats.power_distribution')}</p>
                <p className="text-[9px] font-mono text-primary/60">TOP 10</p>
            </div>
            <div className="w-full h-full -ml-2">
                <LineChart
                    series={[
                        {
                            data: powerData,
                            area: true,
                            showMark: false,
                            color: theme.palette.warning.main,
                            curve: "catmullRom",
                        }
                    ]}
                    xAxis={[{ 
                        data: Array.from({ length: powerData.length }, (_, i) => i + 1), 
                        scaleType: 'point', 
                        hideTooltip: true,
                        disableLine: true,
                        disableTicks: true,
                    }]}
                    yAxis={[{ 
                        min: 0, 
                        disableLine: true, 
                        disableTicks: true, 
                        labelStyle: { display: 'none' } 
                    }]}
                    height={60}
                    margin={{ top: 5, bottom: 5, left: 0, right: 0 }}
                    sx={{
                        '.MuiLineElement-root': {
                            strokeWidth: 2,
                            stroke: theme.palette.primary.main
                        },
                        '.MuiAreaElement-root': {
                            fill: 'url(#powerGradient)',
                            opacity: 0.2
                        }
                    }}
                >
                    <defs>
                        <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.6}/>
                            <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                </LineChart>
            </div>
         </div>

      </CardContent>
    </Card>
  );
};
