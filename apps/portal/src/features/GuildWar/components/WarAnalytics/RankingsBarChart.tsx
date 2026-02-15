/**
 * War Analytics - Rankings Bar Chart
 */

import { useMemo } from 'react';
import { BarChart } from '@/ui-bridge/x-charts/BarChart';
import {
  alpha,
  useTheme
} from "@/ui-bridge/material";
import BarChartIcon from "@/ui-bridge/icons-material/BarChart";
import InfoIcon from "@/ui-bridge/icons-material/Info";
import { useTranslation } from 'react-i18next';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import { useAnalytics } from './AnalyticsContext';
import { transformForRankings, formatNumber } from './utils';
import { METRICS, formatMetricName } from './types';
import type { MemberStats, MetricType, PerWarMemberStats } from './types';
import { Alert, AlertDescription } from '@/components/feedback/Alert';
import { Badge } from '@/components/data-display/Badge';

interface RankingsBarChartProps {
  members: MemberStats[];
  perWarStats?: PerWarMemberStats[];
  onSelectWar?: (params: { warId: number; userId?: number }) => void;
  isLoading?: boolean;
}

export function RankingsBarChart({ members, perWarStats = [], onSelectWar, isLoading }: RankingsBarChartProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { filters, rankingsMode } = useAnalytics();

  const chartData = useMemo(() => {
    if (!members || members.length === 0) return [];

    return transformForRankings(
      members,
      filters.primaryMetric,
      filters.aggregation,
      rankingsMode.topN,
      rankingsMode.minParticipation,
      rankingsMode.classFilter
    );
  }, [members, filters.primaryMetric, filters.aggregation, rankingsMode]);

  const getBarColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return theme.palette.warning.main; // Gold equivalent
      case 2:
        return theme.palette.text.secondary; // Silver equivalent
      case 3:
        return theme.palette.error.main; // Bronze/Red equivalent or specific bronze color
      default:
        return theme.palette.primary.main;
    }
  };

  const bestWarByUser = useMemo(() => {
    const map = new Map<number, number>();
    const higherIsBetter = METRICS[filters.primaryMetric].higherIsBetter;

    for (const row of perWarStats) {
      const userId = Number(row.user_id);
      if (!Number.isFinite(userId)) continue;
      const value = Number(row[filters.primaryMetric] ?? 0);

      const existingWarId = map.get(userId);
      if (!existingWarId) {
        map.set(userId, Number(row.war_id));
        continue;
      }

      const existingRow = perWarStats.find((r) => Number(r.war_id) === existingWarId && Number(r.user_id) === userId);
      const existingValue = Number(existingRow?.[filters.primaryMetric] ?? 0);
      const isBetter = higherIsBetter ? value > existingValue : value < existingValue;
      if (isBetter) {
        map.set(userId, Number(row.war_id));
      }
    }

    return map;
  }, [filters.primaryMetric, perWarStats]);

  const handleBarClick = (entry: { user_id?: number | string } | null | undefined) => {
    if (!entry) return;
    const userId = Number(entry.user_id);
    if (!Number.isFinite(userId)) return;

    const warId = bestWarByUser.get(userId);
    if (!warId || !Number.isFinite(warId)) return;
    onSelectWar?.({ warId, userId });
  };

  if (isLoading) {
    return <CardSkeleton aspectRatio="16/9" />;
  }

  if (chartData.length === 0) {
    return (
      <Alert variant="default">
        <InfoIcon sx={{ fontSize: 20 }} />
        <AlertDescription>{t('guild_war.analytics_rankings_no_match')}</AlertDescription>
      </Alert>
    );
  }

  // Prepare data for MUI X-Charts
  const usernames = chartData.map((d) => d.username);
  const values = chartData.map((d) => d.value);
  const colors = chartData.map((d) => getBarColor(d.rank));

  return (
    <div>
      <BarChart
        yAxis={[
          {
            scaleType: 'band',
            data: usernames,
            tickLabelStyle: {
              fontSize: 14,
              fill: 'hsl(var(--foreground))',
            },
          },
        ]}
        xAxis={[
          {
            tickLabelStyle: {
              fontSize: 12,
              fill: 'hsl(var(--muted-foreground))',
            },
            valueFormatter: (value: number | null) => formatNumber(value ?? 0),
          },
        ]}
        series={[
          {
            data: values,
            valueFormatter: (value: number | null) => formatNumber(value ?? 0),
          },
        ]}
        layout="horizontal"
        height={Math.max(400, chartData.length * 50)}
        margin={{ top: 10, right: 80, left: 120, bottom: 10 }}
        grid={{ vertical: true }}
        colors={colors}
        onItemClick={(_event: unknown, d: { dataIndex?: number | null }) => {
          if (d.dataIndex !== undefined && d.dataIndex !== null) {
            handleBarClick(chartData[d.dataIndex]);
          }
        }}
        sx={{
          '& .MuiChartsAxis-line': {
            stroke: 'hsl(var(--border))',
          },
          '& .MuiChartsAxis-tick': {
            stroke: 'hsl(var(--border))',
          },
          '& .MuiChartsGrid-line': {
            stroke: 'hsl(var(--border))',
            strokeDasharray: '3 3',
          },
          '& .MuiBarElement-root': {
            cursor: 'pointer',
          },
        }}
        slotProps={{
          legend: { hidden: true } as any,
        }}
      />

      {chartData.length >= 3 && (
        <div className="mt-6 rounded-lg bg-secondary/50 p-4">
          <h4 className="mb-4 text-sm font-bold text-foreground">
            {t('guild_war.analytics_top_performers')}
          </h4>
          <div className="flex justify-center gap-4">
            {chartData.slice(0, 3).map((entry) => (
              <div
                key={entry.user_id}
                className={`flex flex-1 flex-col items-center rounded-lg border p-4 text-center ${
                  entry.rank === 1
                    ? 'border-[color:var(--gold-color)] bg-[color:var(--gold-bg)]'
                    : 'bg-card'
                }`}
                style={
                  entry.rank === 1
                    ? {
                        borderColor: theme.palette.warning.main,
                        backgroundColor: alpha(theme.palette.warning.main, 0.1),
                      }
                    : undefined
                }
              >
                <span className="mb-1 text-3xl">
                  {entry.rank === 1 ? '馃' : entry.rank === 2 ? '馃' : '馃'}
                </span>
                <BarChartIcon sx={{ fontSize: 24, color: "primary.main" }} />
                <span className="text-sm font-bold">{entry.username}</span>
                <Badge variant="secondary" className="my-2">
                  {entry.class}
                </Badge>
                <span className="font-mono text-lg font-bold">
                  {formatNumber(entry.value)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('guild_war.analytics_wars_count', { count: entry.wars_participated })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-center text-xs text-muted-foreground">
        {t('guild_war.analytics_rankings_chart_hint', {
          count: chartData.length,
          metric: formatMetricName(filters.primaryMetric),
          aggregation: filters.aggregation,
        })}
        {rankingsMode.minParticipation > 1 && ` | ${t('guild_war.analytics_min_wars_label', { count: rankingsMode.minParticipation })}`}
        {rankingsMode.classFilter.length > 0 && ` | ${rankingsMode.classFilter.join(', ')}`}
      </div>
    </div>
  );
}

interface RankingsTooltipProps {
  active?: boolean;
  payload?: any[];
  metric: string;
}

function RankingsTooltip({ active, payload, metric }: RankingsTooltipProps) {
  const { t } = useTranslation();
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-md border bg-popover p-3 shadow-md">
      <h6 className="mb-1 font-bold text-popover-foreground">
        #{data.rank} {data.username}
      </h6>

      <Badge variant="outline" className="mb-2">
        {data.class}
      </Badge>

      <div className="mb-1">
        <span className="block text-xs font-semibold text-popover-foreground">
          {formatMetricName(metric as MetricType)}:
        </span>
        <span className="font-mono text-base font-bold text-popover-foreground">
          {formatNumber(data.value)}
        </span>
      </div>

      <span className="block text-xs text-muted-foreground">
        {t('guild_war.analytics_rankings_participated_wars', { count: data.wars_participated })}
      </span>
    </div>
  );
}

export { RankingsTooltip };
