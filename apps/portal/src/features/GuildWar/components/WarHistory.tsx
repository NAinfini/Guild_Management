
import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/layout/Card';
import { Input } from '@/components/input/Input';
import { Button } from '@/components/button';
import { Badge } from '@/components/data-display/Badge';
import { Skeleton } from '@/components/feedback/Skeleton';

import { useWarHistory, useWarHistoryDetail, useWarMemberStats } from '../hooks/useWars';
import { WarHistoryDetail } from './WarHistoryDetail';
import { WarHistoryPieCharts } from './WarHistoryPieCharts';
import { formatDateTime, cn } from '../../../lib/utils';
import {
  Search,
  FilterList,
  Warning,
  Paid,
  EmojiFlags,
  Castle,
} from '@/ui-bridge/icons-material';
import { useTranslation } from 'react-i18next';
import { buildWarCardMetrics } from './WarHistory.utils';
import { useTheme } from '@/ui-bridge/material/styles';

export function WarHistory() {
  const { t } = useTranslation();
  const theme = useTheme();
  const panel = theme.custom?.components?.panel;
  const semanticSurface = theme.custom?.semantic?.surface;
  const semanticBorder = theme.custom?.semantic?.border;
  const panelSx = {
    backgroundColor: panel?.bg ?? semanticSurface?.panel ?? theme.palette.background.paper,
    borderColor: panel?.border ?? semanticBorder?.default ?? theme.palette.divider,
  };
  const {
    data = [],
    isLoading,
    isError: isWarHistoryError,
    refetch: refetchWarHistory,
  } = useWarHistory();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(() => {
    return data
      .filter((w) => (query ? w.title.toLowerCase().includes(query.toLowerCase()) : true))
      .filter((w) => {
        if (dateFrom && new Date(w.date) < new Date(dateFrom)) return false;
        if (dateTo && new Date(w.date) > new Date(dateTo)) return false;
        return true;
      });
  }, [data, query, dateFrom, dateTo]);

  const { data: selectedStats = [] } = useWarMemberStats(selectedId || '', {
    enabled: !!selectedId,
  });
  const { data: selectedDetail } = useWarHistoryDetail(selectedId || '', {
    enabled: !!selectedId,
  });

  const selected = useMemo(() => {
    const fallbackWar = filtered.find((w) => w.id === selectedId) || null;
    const war = selectedDetail || fallbackWar;
    if (!war) return null;
    return {
      ...war,
      member_stats: selectedStats.length > 0 ? selectedStats : war.member_stats,
    };
  }, [filtered, selectedId, selectedStats, selectedDetail]);

  const getSidePillStyle = (side: 'ours' | 'enemy') => {
    if (side === 'ours') {
      return {
        backgroundColor: 'color-mix(in srgb, var(--color-status-success-bg) 82%, transparent)',
        color: 'var(--color-status-success-fg)',
        borderColor: 'color-mix(in srgb, var(--color-status-success) 48%, transparent)',
      };
    }

    return {
      backgroundColor: 'color-mix(in srgb, var(--color-status-error-bg) 82%, transparent)',
      color: 'var(--color-status-error-fg)',
      borderColor: 'color-mix(in srgb, var(--color-status-error) 48%, transparent)',
    };
  };

  const getResultBadgeStyle = (result: 'victory' | 'defeat' | 'draw' | 'pending') => {
    if (result === 'victory') {
      return {
        backgroundColor: 'var(--color-status-success-bg)',
        color: 'var(--color-status-success-fg)',
        borderColor: 'color-mix(in srgb, var(--color-status-success) 55%, transparent)',
      };
    }

    if (result === 'draw') {
      return {
        backgroundColor: 'var(--color-status-warning-bg)',
        color: 'var(--color-status-warning-fg)',
        borderColor: 'color-mix(in srgb, var(--color-status-warning) 55%, transparent)',
      };
    }

    if (result === 'defeat') {
      return {
        backgroundColor: 'var(--color-status-error-bg)',
        color: 'var(--color-status-error-fg)',
        borderColor: 'color-mix(in srgb, var(--color-status-error) 55%, transparent)',
      };
    }

    return {
      backgroundColor: 'var(--sys-surface-sunken)',
      color: 'var(--sys-text-primary)',
      borderColor: 'var(--sys-border-default)',
    };
  };

  const getResultKey = (result: 'victory' | 'defeat' | 'draw' | 'pending') => {
    if (result === 'pending') {
      return 'pending';
    }

    return result;
  };

  const hasActiveFilters = Boolean(query || dateFrom || dateTo);

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Skeleton className="h-[200px] w-full" />
             <Skeleton className="h-[200px] w-full" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card sx={panelSx}>
        <CardContent className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-3 items-end p-4">
           <div className="space-y-1.5">
               <span className="text-xs font-medium text-muted-foreground">{t('guild_war.history_search_placeholder', 'Search Wars...')}</span>
               <div className="relative">
                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" sx={{ fontSize: 16 }} />
                 <Input
                    className="pl-9 h-9 text-sm"
                    placeholder={t('guild_war.history_search_placeholder')}
                    value={query}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                 />
               </div>
           </div>
           
           <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">{t('common.date_from')}</span>
                <Input
                    type="date"
                    className="h-9 text-sm"
                    value={dateFrom}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFrom(e.target.value)}
                />
           </div>

           <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">{t('common.date_to')}</span>
                <Input
                    type="date"
                    className="h-9 text-sm"
                    value={dateTo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateTo(e.target.value)}
                />
           </div>

           <Button
             variant="outline"
             size="sm"
             className="h-9 gap-2"
             onClick={() => { setDateFrom(''); setDateTo(''); setQuery(''); }}
           >
             <FilterList sx={{ fontSize: 16 }} />
             {t('common.clear_filters')}
           </Button>
        </CardContent>
      </Card>

      {isWarHistoryError && data.length === 0 ? (
        <Card sx={panelSx} data-testid="warhistory-error-state">
          <CardContent className="p-8 text-center space-y-3">
            <Warning sx={{ fontSize: 36, opacity: 0.35 }} />
            <p className="text-sm font-semibold">{t('guild_war.historical_archives')}</p>
            <p className="text-sm text-muted-foreground">{t('common.placeholder_msg')}</p>
            <div data-testid="warhistory-error-actions" className="flex justify-center gap-2">
              {/* Retry re-runs the history query so transient API failures recover without route reloads. */}
              <Button type="button" variant="outline" size="sm" onClick={() => void refetchWarHistory()}>
                {t('common.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <WarHistoryPieCharts data={filtered} />
      )}

      <Card sx={panelSx}>
        <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black uppercase tracking-tight">{t('guild_war.historical_archives')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
            {filtered.map((war) => {
              const metrics = buildWarCardMetrics(war as any);
              const missingMembers = war.member_stats?.filter((m) =>
                ['damage', 'healing', 'building_damage', 'credits', 'kills', 'deaths', 'assists', 'damage_taken'].some(
                  (k) => (m as any)[k] === null || (m as any)[k] === undefined,
                ),
              ).length ?? 0;
              
              return (
              <div
                key={war.id}
                onClick={() => setSelectedId(war.id)}
                className={cn(
                    "group relative flex flex-col gap-3 p-4 rounded-lg border transition-all cursor-pointer",
                    "hover:shadow-md",
                    missingMembers > 0 
                        ? "bg-card hover:bg-muted/50" 
                        : "bg-card hover:bg-muted/50 border-border"
                )}
                style={
                  missingMembers > 0
                    ? {
                        backgroundColor: 'color-mix(in srgb, var(--color-status-warning-bg) 26%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--color-status-warning) 42%, transparent)',
                      }
                    : undefined
                }
              >
                <div className="flex items-center gap-2">
                    {missingMembers > 0 && (
                         <Warning sx={{ fontSize: 16, color: 'var(--color-status-warning)' }} />
                    )}
                    <span className="text-sm font-black uppercase text-foreground group-hover:text-primary transition-colors">
                        {war.title}
                    </span>
                     <span className="text-xs text-muted-foreground ml-auto font-mono">
                        {formatDateTime(war.date)}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="default"
                    className="uppercase font-bold border"
                    style={getResultBadgeStyle(war.result)}
                  >
                    {t(`dashboard.${getResultKey(war.result)}`)}
                  </Badge>
                  
                  <Badge
                    variant="outline"
                    className="font-medium"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--color-status-info-bg) 72%, transparent)',
                      borderColor: 'color-mix(in srgb, var(--color-status-info) 45%, transparent)',
                      color: 'var(--color-status-info-fg)',
                    }}
                  >
                     KDA {metrics.kills}/{metrics.deaths}/{metrics.assists}
                  </Badge>

                  <Badge variant="outline" className="gap-1 font-medium" style={getSidePillStyle('ours')}>
                    <Paid sx={{ fontSize: 14 }} />
                    {t('guild_war.history_ours_short')} {t('common.credits')} {metrics.ownCredits.toLocaleString()}
                  </Badge>
                  <Badge variant="outline" className="gap-1 font-medium" style={getSidePillStyle('enemy')}>
                    <Paid sx={{ fontSize: 14 }} />
                     {t('guild_war.history_enemy_short')} {t('common.credits')} {metrics.enemyCredits.toLocaleString()}
                  </Badge>

                  <Badge variant="outline" className="gap-1 font-medium" style={getSidePillStyle('ours')}>
                    <EmojiFlags sx={{ fontSize: 14 }} />
                    {t('guild_war.history_ours_short')} {t('dashboard.distance')} {metrics.ownDistance.toLocaleString()}
                  </Badge>
                  <Badge variant="outline" className="gap-1 font-medium" style={getSidePillStyle('enemy')}>
                    <EmojiFlags sx={{ fontSize: 14 }} />
                     {t('guild_war.history_enemy_short')} {t('dashboard.distance')} {metrics.enemyDistance.toLocaleString()}
                  </Badge>

                  <Badge variant="outline" className="gap-1 font-medium" style={getSidePillStyle('ours')}>
                    <Castle sx={{ fontSize: 14 }} />
                     {t('guild_war.history_ours_short')} {t('dashboard.towers')} {metrics.ownTowers}
                  </Badge>
                  <Badge variant="outline" className="gap-1 font-medium" style={getSidePillStyle('enemy')}>
                    <Castle sx={{ fontSize: 14 }} />
                     {t('guild_war.history_enemy_short')} {t('dashboard.towers')} {metrics.enemyTowers}
                  </Badge>

                  {missingMembers > 0 && (
                    <Badge
                      variant="outline"
                      className="gap-1 font-bold"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-status-warning-bg) 76%, transparent)',
                        color: 'var(--color-status-warning-fg)',
                        borderColor: 'color-mix(in srgb, var(--color-status-warning) 45%, transparent)',
                      }}
                    >
                        <Warning sx={{ fontSize: 14 }} />
                        {t('guild_war.history_incomplete_stats', { count: missingMembers })}
                    </Badge>
                  )}
                </div>
              </div>
            );
            })}

            {filtered.length === 0 && !isWarHistoryError && (
              <div className="py-8 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border space-y-3">
                <p>{t('common.no_results_found')}</p>
                <div data-testid="warhistory-empty-actions" className="flex justify-center gap-2">
                  {hasActiveFilters && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDateFrom('');
                        setDateTo('');
                        setQuery('');
                      }}
                    >
                      {t('common.clear_filters')}
                    </Button>
                  )}
                </div>
              </div>
            )}
        </CardContent>
      </Card>

      <WarHistoryDetail war={selected} open={!!selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}
