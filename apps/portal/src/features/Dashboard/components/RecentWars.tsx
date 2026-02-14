import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader } from '@/components/layout/Card';
import { WarHistoryEntry, WarMemberStat } from '@/types';
import { cn } from '@/lib/utils';
import { format, isValid, parseISO } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';
import SportsMmaIcon from '@mui/icons-material/SportsMma';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { IconButton } from '@mui/material';

interface RecentWarsProps {
  history: WarHistoryEntry[];
}

const formatDistance = (value?: number) => (typeof value === 'number' ? `${value}m` : '--');
type Tone = 'success' | 'warning' | 'error' | 'info';

const getToneCardStyle = (tone: Tone): React.CSSProperties => ({
  borderColor: `color-mix(in srgb, var(--color-status-${tone}) 45%, var(--cmp-card-border))`,
  backgroundColor: `color-mix(in srgb, var(--color-status-${tone}) 10%, var(--sys-surface-panel))`,
  boxShadow: `inset 0 1px 0 color-mix(in srgb, var(--color-status-${tone}) 18%, transparent)`,
});

const getToneIconStyle = (tone: Tone): React.CSSProperties => ({
  color: `var(--color-status-${tone})`,
});

const getToneTextStyle = (tone: Tone): React.CSSProperties => ({
  color: `var(--color-status-${tone})`,
});

export const RecentWars: React.FC<RecentWarsProps> = ({ history }) => {
  const { t, i18n } = useTranslation();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const recentWars = React.useMemo(() => history.slice(0, 4), [history]);
  const dateLocale = i18n.language.startsWith('zh') ? zhCN : enUS;

  React.useEffect(() => {
    setCurrentIndex(prev => (prev >= recentWars.length ? 0 : prev));
  }, [recentWars.length]);

  const currentWar = recentWars[currentIndex];

  if (!currentWar) {
    return (
      <Card className="h-full border border-[color:var(--cmp-card-border)] bg-[color:var(--cmp-card-bg)] backdrop-blur-sm gap-0">
        <CardHeader className="px-3.5 pt-2 pb-1.5 border-b border-[color:var(--cmp-card-border)]">
          <h3 className="text-sm font-semibold tracking-wide text-foreground">
            {t('dashboard.recent_wars.title')}
          </h3>
        </CardHeader>
        <CardContent className="p-6 flex items-center justify-center h-full">
          <p className="text-sm text-muted-foreground">{t('dashboard.no_war_data')}</p>
        </CardContent>
      </Card>
    );
  }

  const isVictory = currentWar.result === 'victory';
  const members = currentWar.member_stats ?? [];
  const topKDA = getTopKDA(members);
  const topDamage = [...members].sort((a, b) => b.damage - a.damage)[0];
  const topTank = [...members].sort((a, b) => b.damage_taken - a.damage_taken)[0];
  const topHealing = [...members].sort((a, b) => b.healing - a.healing)[0];
  const topKDAValue = topKDA ? getKDA(topKDA).toFixed(2) : '0';
  const topDamageValue = topDamage ? topDamage.damage.toLocaleString() : '0';
  const topTankValue = topTank ? topTank.damage_taken.toLocaleString() : '0';
  const topHealingValue = topHealing ? topHealing.healing.toLocaleString() : '0';
  const canNavigateWars = recentWars.length > 1;
  const warDateTime = (() => {
    if (!currentWar?.date) return '';
    const parsed = parseISO(currentWar.date);
    if (!isValid(parsed)) return '';

    return format(
      parsed,
      i18n.language.startsWith('zh') ? 'M月d日 HH:mm' : 'MMM dd, HH:mm',
      { locale: dateLocale }
    );
  })();
  const opponentGuildName = getOpponentGuildName(currentWar, t);

  return (
    <Card className="h-full border border-[color:var(--cmp-card-border)] bg-[color:var(--cmp-card-bg)] backdrop-blur-sm flex flex-col gap-0">
      <CardHeader
        className="px-3.5 pt-2 pb-1.5 border-b border-[color:var(--cmp-card-border)]"
        style={{ backgroundColor: 'color-mix(in srgb, var(--sys-surface-elevated) 35%, transparent)' }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SportsMmaIcon sx={{ fontSize: 16 }} className="text-foreground/80" />
            <div className="flex flex-col">
              <h3 className="text-[0.85rem] leading-none font-semibold text-foreground">
                {t('dashboard.recent_wars.title')}
              </h3>
              {warDateTime && (
                <span className="text-[0.6rem] text-muted-foreground font-mono mt-0.5">
                  {warDateTime}
                </span>
              )}
            </div>
            <Link
              to="/guild-war"
              aria-label={t('dashboard.view_history')}
              className="inline-flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-[color:var(--sys-interactive-hover)] transition-colors"
            >
              <OpenInNewIcon sx={{ fontSize: 16 }} />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'rounded-full px-2 py-0 text-[8px] font-semibold border uppercase tracking-[0.08em]'
              )}
              style={
                isVictory
                  ? {
                      backgroundColor: 'color-mix(in srgb, var(--color-status-success) 22%, transparent)',
                      color: 'var(--color-status-success)',
                      borderColor: 'color-mix(in srgb, var(--color-status-success) 72%, transparent)',
                      boxShadow: 'inset 0 0 12px color-mix(in srgb, var(--color-status-success) 20%, transparent)',
                    }
                  : {
                      backgroundColor: 'color-mix(in srgb, var(--color-status-error) 20%, transparent)',
                      color: 'var(--color-status-error)',
                      borderColor: 'color-mix(in srgb, var(--color-status-error) 70%, transparent)',
                      boxShadow: 'inset 0 0 12px color-mix(in srgb, var(--color-status-error) 16%, transparent)',
                    }
              }
            >
              {isVictory ? t('dashboard.recent_wars.victory') : t('dashboard.recent_wars.defeat')}
            </span>
            <div className="flex items-center gap-0.5">
              <IconButton
                size="small"
                onClick={() => setCurrentIndex(prev => (prev > 0 ? prev - 1 : recentWars.length - 1))}
                disabled={!canNavigateWars}
                className="text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <ChevronLeftIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <span className="text-[10px] font-mono text-muted-foreground px-1">
                {recentWars.length > 0 ? `${currentIndex + 1}/${recentWars.length}` : '0/0'}
              </span>
              <IconButton
                size="small"
                onClick={() => setCurrentIndex(prev => (prev < recentWars.length - 1 ? prev + 1 : 0))}
                disabled={!canNavigateWars}
                className="text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <ChevronRightIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pt-3 pb-4 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2.5">
            <GuildScoreCard
              name={t('dashboard.war.our_guild')}
              kills={currentWar.own_stats.kills}
              killsLabel={t('dashboard.stats.kills')}
              variant="ours"
            />
            <GuildScoreCard
              name={opponentGuildName}
              kills={currentWar.enemy_stats.kills}
              killsLabel={t('dashboard.stats.kills')}
              variant="opponent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StatsColumn
              creditsLabel={t('dashboard.stats.credits')}
              towersLabel={t('dashboard.stats.towers')}
              baseHpLabel={t('dashboard.base_hp')}
              distanceLabel={t('dashboard.stats.distance')}
              credits={currentWar.own_stats.credits}
              towers={currentWar.own_stats.towers}
              baseHp={currentWar.own_stats.base_hp}
              distance={currentWar.own_stats.distance}
            />
            <StatsColumn
              creditsLabel={t('dashboard.stats.credits')}
              towersLabel={t('dashboard.stats.towers')}
              baseHpLabel={t('dashboard.base_hp')}
              distanceLabel={t('dashboard.stats.distance')}
              credits={currentWar.enemy_stats.credits}
              towers={currentWar.enemy_stats.towers}
              baseHp={currentWar.enemy_stats.base_hp}
              distance={currentWar.enemy_stats.distance}
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <EmojiEventsIcon sx={{ fontSize: 16 }} style={getToneIconStyle('warning')} />
              <span className="text-[0.95rem] font-semibold text-foreground">{t('dashboard.recent_wars.mvp')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <HighlightCard
                  label={t('dashboard.recent_wars.top_kda')}
                  member={topKDA}
                  value={topKDAValue}
                  tone="info"
                />
                <HighlightCard
                  label={t('dashboard.recent_wars.top_damage')}
                  member={topDamage}
                  value={topDamageValue}
                  tone="error"
                />
                <HighlightCard
                  label={t('dashboard.recent_wars.top_tank')}
                  member={topTank}
                  value={topTankValue}
                  tone="warning"
                />
                <HighlightCard
                  label={t('dashboard.recent_wars.top_healing')}
                  member={topHealing}
                  value={topHealingValue}
                  tone="success"
                />
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

const GuildScoreCard = ({
  name,
  kills,
  killsLabel,
  variant = 'neutral'
}: {
  name: string;
  kills: number;
  killsLabel: string;
  variant?: 'ours' | 'opponent' | 'neutral';
}) => (
  <div
    className={cn(
      'rounded-xl border px-3 py-2.5 min-h-[88px] flex flex-col justify-between',
      variant === 'ours'
        ? 'border-[color:var(--color-status-success)] bg-[color:var(--color-status-success-bg)]'
        : variant === 'opponent'
          ? 'border-[color:var(--color-status-error)] bg-[color:var(--color-status-error-bg)]'
          : 'border-[color:var(--sys-border-default)] bg-[color:var(--sys-surface-panel)]'
    )}
    style={{
      borderColor:
        variant === 'ours'
          ? 'color-mix(in srgb, var(--color-status-success) 55%, transparent)'
          : variant === 'opponent'
            ? 'color-mix(in srgb, var(--color-status-error) 60%, transparent)'
            : 'var(--sys-border-default)',
      backgroundColor:
        variant === 'ours'
          ? 'color-mix(in srgb, var(--color-status-success-bg) 66%, var(--sys-surface-panel))'
          : variant === 'opponent'
            ? 'color-mix(in srgb, var(--color-status-error-bg) 66%, var(--sys-surface-panel))'
            : 'color-mix(in srgb, var(--sys-surface-panel) 94%, transparent)',
    }}
  >
    <div className="flex items-center gap-2">
      <span className="text-base font-semibold leading-tight text-foreground truncate">{name}</span>
      {variant === 'ours' && <EmojiEventsOutlinedIcon sx={{ fontSize: 16 }} className="text-amber-400" />}
    </div>
    <div className="flex items-center justify-between">
      <span className="text-[0.72rem] text-muted-foreground uppercase tracking-[0.08em]">{killsLabel}</span>
      <span className="text-[1.25rem] leading-none font-bold text-foreground tabular-nums">{kills}</span>
    </div>
  </div>
);

const StatsColumn = ({
  creditsLabel,
  towersLabel,
  baseHpLabel,
  distanceLabel,
  credits,
  towers,
  baseHp,
  distance
}: {
  creditsLabel: string;
  towersLabel: string;
  baseHpLabel: string;
  distanceLabel: string;
  credits: number;
  towers: number;
  baseHp: number;
  distance?: number;
}) => (
  <div>
    <div className="space-y-1.5">
      <StatRow icon={<PaidOutlinedIcon sx={{ fontSize: 16 }} style={getToneIconStyle('warning')} />} label={creditsLabel} value={credits.toLocaleString()} />
      <StatRow icon={<ShieldOutlinedIcon sx={{ fontSize: 16 }} style={getToneIconStyle('info')} />} label={towersLabel} value={towers} />
      <StatRow icon={<FavoriteBorderIcon sx={{ fontSize: 16 }} style={getToneIconStyle('error')} />} label={baseHpLabel} value={`${baseHp}%`} />
      <StatRow icon={<TrendingUpIcon sx={{ fontSize: 16 }} style={getToneIconStyle('success')} />} label={distanceLabel} value={formatDistance(distance)} />
    </div>
  </div>
);

const StatRow = ({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center justify-between gap-2 text-[0.92rem]">
    <div className="flex items-center gap-2 text-muted-foreground min-w-0">
      {icon}
      <span className="truncate">{label}:</span>
    </div>
    <span className="font-semibold text-foreground tabular-nums shrink-0">{value}</span>
  </div>
);

const HighlightCard = ({
  label,
  member,
  value,
  tone
}: {
  label: string;
  member?: WarMemberStat;
  value: string;
  tone: Tone;
}) => (
  <div
    className={cn('rounded-lg border-2 p-3 transition-all hover:shadow-md')}
    style={{
      ...getToneCardStyle(tone),
      borderStyle: 'solid', // Force solid border
    }}
  >
    <div className="flex items-center justify-between gap-2 mb-2">
      <div className="text-[0.72rem] font-bold uppercase tracking-wider" style={getToneTextStyle(tone)}>
        {label}
      </div>
      <div className="text-base font-bold tabular-nums" style={getToneTextStyle(tone)}>
        {value}
      </div>
    </div>
    <div className="text-lg font-bold text-foreground truncate">
      {member?.username || '--'}
    </div>
  </div>
);

const getTopKDA = (members: WarMemberStat[]) =>
  [...members].sort((a, b) => {
    const kdaA = getKDA(a);
    const kdaB = getKDA(b);
    return kdaB - kdaA;
  })[0];

const getKDA = (member: WarMemberStat) =>
  member.deaths > 0 ? (member.kills + member.assists) / member.deaths : member.kills + member.assists;

const getOpponentGuildName = (
  war: WarHistoryEntry | undefined,
  t: (key: string) => string
) => {
  if (!war) return t('dashboard.war.enemy_guild');

  const rawName = (war.opponent_name || '').trim();
  if (rawName.length === 0) return t('dashboard.war.enemy_guild');

  const normalized = rawName.toLowerCase();
  const looksGenericTitle =
    normalized.includes('guild war') ||
    normalized.includes('weekly mission') ||
    normalized.includes('operation');

  if (looksGenericTitle) return t('dashboard.war.enemy_guild');
  return rawName;
};

