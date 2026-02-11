import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/layout/Card';
import { WarHistoryEntry } from '@/types';
import { format } from 'date-fns';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DangerousIcon from '@mui/icons-material/Dangerous'; // Kills
import ShieldIcon from '@mui/icons-material/Shield'; // Towers/Tank
import BoltIcon from '@mui/icons-material/Bolt'; // Credits/Heal
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; // Distance
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts'; // Damage
import HistoryIcon from '@mui/icons-material/History';
import { Avatar } from '@/components/data-display/Avatar';
import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/Button';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

interface LastWarStatsProps {
  history: WarHistoryEntry[];
}

type Tone = 'success' | 'warning' | 'error' | 'info';

const getToneBoxStyle = (tone: Tone): React.CSSProperties => ({
  backgroundColor: `color-mix(in srgb, var(--color-status-${tone}-bg) 84%, transparent)`,
  borderColor: `color-mix(in srgb, var(--color-status-${tone}) 48%, transparent)`,
});

const getToneTextStyle = (tone: Tone): React.CSSProperties => ({
  color: `var(--color-status-${tone})`,
});

export const LastWarStats: React.FC<LastWarStatsProps> = ({ history }) => {
  const { t } = useTranslation();
  // Take only the latest war
  const lastWar = history[0];

  if (!lastWar) {
      return (
        <Card
          className="h-full backdrop-blur-md border border-[color:var(--cmp-card-border)] flex flex-col items-center justify-center p-6 text-muted-foreground"
          style={{ backgroundColor: 'color-mix(in srgb, var(--cmp-card-bg) 84%, transparent)' }}
        >
             <EmojiEventsIcon sx={{ fontSize: 40 }} className="mb-2 opacity-20" />
             <span className="text-xs font-black uppercase tracking-widest">{t('dashboard.no_war_data')}</span>
        </Card>
      );
  }

  const isVictory = lastWar.result === 'victory';
  
  // Calculate MVPs
  const topDamage = [...lastWar.member_stats].sort((a, b) => b.damage - a.damage)[0];
  const topHealing = [...lastWar.member_stats].sort((a, b) => b.healing - a.healing)[0];
  const topTank = [...lastWar.member_stats].sort((a, b) => b.damage_taken - a.damage_taken)[0];

  return (
    <Card
      className="h-full backdrop-blur-md border border-[color:var(--cmp-card-border)] flex flex-col relative overflow-hidden group"
      style={{ backgroundColor: 'color-mix(in srgb, var(--cmp-card-bg) 84%, transparent)' }}
    >
       <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[color:var(--color-status-error)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

       <CardHeader
         className="pb-3 border-b border-[color:var(--cmp-card-border)] flex-shrink-0 flex flex-row items-center justify-between"
         style={{ backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 40%, transparent)' }}
       >
         <div className="flex items-center gap-2">
            <EmojiEventsIcon sx={{ fontSize: 16 }} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                {t('dashboard.last_guild_war')}
            </span>
         </div>
         <span className="text-[9px] font-mono text-muted-foreground">
            {format(new Date(lastWar.date), 'MM.dd HH:mm')}
         </span>
       </CardHeader>
       
       <CardContent className="p-4 flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-4">
          
          {/* Guild Comparison Header */}
          <div className="grid grid-cols-2 gap-4">
             {/* Our Guild */}
             <div className="flex flex-col items-center gap-2 p-3 rounded-lg border" style={getToneBoxStyle('info')}>
                <span className="text-[10px] font-black uppercase tracking-widest" style={getToneTextStyle('info')}>
                   {t('dashboard.war.our_guild')}
                </span>
                <span className="text-3xl font-black" style={{ color: isVictory ? 'var(--color-status-success)' : 'var(--sys-text-primary)' }}>
                   {lastWar.score}
                </span>
             </div>

             {/* Enemy Guild */}
             <div className="flex flex-col items-center gap-2 p-3 rounded-lg border" style={getToneBoxStyle('error')}>
                <span className="text-[10px] font-black uppercase tracking-widest" style={getToneTextStyle('error')}>
                   {t('dashboard.war.enemy_guild')}
                </span>
                <span className="text-3xl font-black" style={{ color: !isVictory ? 'var(--color-status-error)' : 'var(--sys-text-primary)' }}>
                   {lastWar.enemy_score}
                </span>
             </div>
          </div>

          {/* Result Badge */}
          <div
            className="flex items-center justify-center p-2 rounded-lg border"
            style={isVictory ? getToneBoxStyle('success') : getToneBoxStyle('error')}
          >
             <span className="text-xl font-black uppercase tracking-widest leading-none">
                 {isVictory ? t('dashboard.war.victory') : t('dashboard.war.defeat')}
             </span>
          </div>

          {/* Stats Comparison */}
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 mb-1">
                <div className="h-[1px] flex-1 bg-[color:var(--cmp-card-border)]" />
                <span className="text-[8px] uppercase font-black text-muted-foreground tracking-[0.2em]">{t('dashboard.war.statistics')}</span>
                <div className="h-[1px] flex-1 bg-[color:var(--cmp-card-border)]" />
             </div>

             {/* Kills */}
             <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                <div className="text-right">
                   <span className="text-2xl font-black" style={getToneTextStyle('info')}>{lastWar.own_stats.kills}</span>
                </div>
                <div className="flex flex-col items-center px-3">
                   <DangerousIcon sx={{ fontSize: 14 }} className="text-muted-foreground mb-0.5" />
                   <span className="text-[8px] font-bold text-muted-foreground uppercase">{t('dashboard.stats.kills')}</span>
                </div>
                <div className="text-left">
                   <span className="text-2xl font-black" style={getToneTextStyle('error')}>{lastWar.enemy_stats.kills}</span>
                </div>
             </div>

             {/* Towers */}
             <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                <div className="text-right">
                   <span className="text-lg font-black" style={getToneTextStyle('info')}>{lastWar.own_stats.towers}</span>
                </div>
                <div className="flex flex-col items-center px-3">
                   <ShieldIcon sx={{ fontSize: 14 }} className="text-muted-foreground mb-0.5" />
                   <span className="text-[8px] font-bold text-muted-foreground uppercase">{t('dashboard.stats.towers')}</span>
                </div>
                <div className="text-left">
                   <span className="text-lg font-black" style={getToneTextStyle('error')}>{lastWar.enemy_stats.towers}</span>
                </div>
             </div>

             {/* Credits */}
             <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                <div className="text-right">
                   <span className="text-lg font-black" style={getToneTextStyle('info')}>{(lastWar.own_stats.credits / 1000).toFixed(1)}k</span>
                </div>
                <div className="flex flex-col items-center px-3">
                   <BoltIcon sx={{ fontSize: 14 }} className="text-muted-foreground mb-0.5" />
                   <span className="text-[8px] font-bold text-muted-foreground uppercase">{t('dashboard.stats.credits')}</span>
                </div>
                <div className="text-left">
                   <span className="text-lg font-black" style={getToneTextStyle('error')}>{(lastWar.enemy_stats.credits / 1000).toFixed(1)}k</span>
                </div>
             </div>
          </div>

          {/* MVPs */}
          <div className="mt-auto">
             <div className="flex items-center gap-2 mb-2">
                 <div className="h-[1px] flex-1 bg-[color:var(--cmp-card-border)]" />
                 <span className="text-[8px] uppercase font-black text-muted-foreground tracking-[0.2em]">{t('dashboard.mvps')}</span>
                 <div className="h-[1px] flex-1 bg-[color:var(--cmp-card-border)]" />
             </div>
             
             <div className="grid grid-cols-3 gap-2">
                 <LargeMVPBadge user={topDamage} icon={SportsMartialArtsIcon} label={t('dashboard.roles.dmg')} tone="error" />
                 <LargeMVPBadge user={topHealing} icon={BoltIcon} label={t('dashboard.roles.heal')} tone="success" />
                 <LargeMVPBadge user={topTank} icon={ShieldIcon} label={t('dashboard.roles.tank')} tone="warning" />
             </div>
          </div>
          
          <Link to="/guild-war" className="text-center mt-2">
             <Button variant="ghost" size="sm" className="w-full text-[10px] uppercase h-6 text-muted-foreground hover:text-foreground">
                 {t('dashboard.view_history')}
                 <HistoryIcon sx={{ fontSize: 12 }} className="ml-1" />
             </Button>
          </Link>
       </CardContent>
    </Card>
  );
};

const StatPill = ({ icon: Icon, value, label }: any) => (
    <div
      className="flex flex-col items-center justify-center p-2 rounded border border-[color:var(--cmp-card-border)]"
      style={{ backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 40%, transparent)' }}
    >
        <div className="text-sm font-bold leading-none mb-1 text-foreground">{value}</div>
        <div className="text-[8px] text-muted-foreground uppercase font-black tracking-wider flex items-center gap-1">
             {label}
        </div>
    </div>
);

const LargeMVPBadge = ({ user, icon: Icon, label, tone }: any) => {
    if (!user) {
      return (
        <div
          className="flex-1 h-12 rounded border border-dashed border-[color:var(--cmp-card-border)] opacity-50"
          style={{ backgroundColor: 'color-mix(in srgb, var(--sys-surface-elevated) 38%, transparent)' }}
        />
      );
    }

    const toneStyles = getToneBoxStyle(tone as Tone);

    return (
        <div className={cn("flex flex-col items-center justify-center p-2 rounded border transition-colors")} style={toneStyles}>
            <div className="flex items-center gap-1.5 mb-1">
                <Avatar src={undefined} alt={user.username} className="w-4 h-4 text-[6px]">{user.username[0]}</Avatar>
                <span className="text-[9px] font-bold" style={getToneTextStyle(tone as Tone)}>{label}</span>
            </div>
            <span className="text-[10px] font-bold text-foreground truncate max-w-full leading-none">{user.username}</span>
        </div>
    );
};
