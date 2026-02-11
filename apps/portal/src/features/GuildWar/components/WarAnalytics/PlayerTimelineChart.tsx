/**
 * War Analytics - Player Timeline Chart
 *
 * Timeline chart showing one member's performance across multiple wars.
 * Supports selecting multiple metrics and rendering one line per metric.
 */

import { useMemo } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import {  alpha,
  useTheme
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InfoIcon from "@mui/icons-material/Info";
import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine';
import { useTranslation } from 'react-i18next';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import { formatWarDateShort, formatNumber } from './utils';
import { METRIC_LINE_COLORS, formatMetricName } from './types';
import type { PerWarMemberStats, WarSummary, MetricType } from './types';
import { Alert, AlertDescription } from '@/components/feedback/Alert';


interface PlayerTimelineChartProps {
  perWarStats: PerWarMemberStats[];
  wars: WarSummary[];
  metrics: MetricType[];
  onSelectWar?: (warId: number) => void;
  isLoading?: boolean;
}

export function PlayerTimelineChart({ perWarStats, wars, metrics, onSelectWar, isLoading }: PlayerTimelineChartProps) {
  const { t } = useTranslation();
  const selectedMetrics: MetricType[] = metrics.length > 0 ? metrics : ['damage'];

  const chartData = useMemo(() => {
    if (!perWarStats || perWarStats.length === 0 || wars.length === 0) return [];

    const sortedWars = [...wars].sort(
      (a, b) => new Date(a.war_date).getTime() - new Date(b.war_date).getTime()
    );

    return sortedWars.map((war) => {
      const stats = perWarStats.find((s) => s.war_id === war.war_id);
      const point: Record<string, string | number | null> = {
        war_id: war.war_id,
        war_date: war.war_date,
        war_title: war.title,
      };

      if (stats?.normalization_factor !== undefined) {
        point.normalization_factor = stats.normalization_factor;
      }
      if (stats?.enemy_strength_tier) {
        point.enemy_strength_tier = stats.enemy_strength_tier;
      }

      selectedMetrics.forEach((metric) => {
        point[`metric_${metric}`] = stats?.[metric] ?? null;
        const rawMetricKey = `raw_${metric}` as keyof PerWarMemberStats;
        const rawValue = stats?.[rawMetricKey];
        if (typeof rawValue === 'number') {
          point[`metric_${metric}_raw`] = rawValue;
        }
      });

      return point;
    });
  }, [perWarStats, wars, selectedMetrics]);

  const primaryMetricKey = `metric_${selectedMetrics[0]}`;

  const averageValue = useMemo(() => {
    const values = chartData
      .map((d) => d[primaryMetricKey])
      .filter((v): v is number => typeof v === 'number');

    if (values.length === 0) return null;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }, [chartData, primaryMetricKey]);

  const handleChartClick = (event: any, d: any) => {
    if (d.dataIndex === undefined || d.dataIndex === null) return;
    const point = chartData[d.dataIndex];
    if (!point) return;
    const warId = Number(point.war_id);
    if (!Number.isFinite(warId)) return;
    onSelectWar?.(warId);
  };

  if (isLoading) {
    return <CardSkeleton aspectRatio="16/9" />;
  }

  if (chartData.length === 0) {
    return (
      <Alert variant="default">
        <InfoIcon sx={{ fontSize: 16 }} />
        <AlertDescription>{t('guild_war.analytics_no_performance_data')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div
      className="rounded-xl border bg-card p-4 shadow-sm"
      style={{
        background:
          'radial-gradient(circle at 10% 20%, rgba(0,120,255,0.08), transparent 25%), radial-gradient(circle at 80% 10%, rgba(255,200,87,0.08), transparent 20%)',
      }}
    >
      <LineChart
        xAxis={[
          {
            scaleType: 'point' as const,
            data: chartData.map((d) => formatWarDateShort(String(d.war_date ?? ""))),
            tickLabelStyle: {
              fontSize: 11,
              fill: 'hsl(var(--muted-foreground))',
            },
          },
        ]}
        yAxis={[
          {
            tickLabelStyle: {
              fontSize: 11,
              fill: 'hsl(var(--muted-foreground))',
            },
            valueFormatter: (value: number | null) => formatNumber(value ?? 0),
          },
        ]}
        series={selectedMetrics.map((metric, index) => ({
          id: `metric_${metric}`,
          data: chartData.map((d) => d[`metric_${metric}`] as number | null),
          label: formatMetricName(metric),
          color: METRIC_LINE_COLORS[metric],
          connectNulls: false,
          showMark: true,
          area: true,
        }))}
        height={420}
        margin={{ top: 10, right: 30, left: 50, bottom: 30 }}
        grid={{ vertical: true, horizontal: true }}
        onMarkClick={handleChartClick}
        sx={{
          '& .MuiChartsAxis-line': {
            stroke: 'hsl(var(--border))',
          },
          '& .MuiChartsAxis-tick': {
            stroke: 'hsl(var(--border))',
          },
          '& .MuiChartsGrid-line': {
            stroke: 'hsl(var(--border))',
            strokeDasharray: '4 4',
          },
          '& .MuiLineElement-root': {
            strokeWidth: 2.5,
          },
        }}
      >
        {averageValue !== null && (
          <ChartsReferenceLine
            y={averageValue}
            lineStyle={{ stroke: 'hsl(var(--muted-foreground))', strokeDasharray: '5 5' }}
            label={t('guild_war.analytics_average_metric_label', {
              metric: formatMetricName(selectedMetrics[0]),
              value: formatNumber(averageValue),
            })}
            labelStyle={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          />
        )}
      </LineChart>

      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          {t('guild_war.analytics_multi_metric_hint', {
            metrics: selectedMetrics.length,
            wars: chartData.length,
          })}
        </p>
      </div>
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  metrics: MetricType[];
}

function CustomTooltip({ active, payload, metrics }: CustomTooltipProps) {
  const { t } = useTranslation();
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload as Record<string, string | number | null>;
  const factor = typeof data.normalization_factor === 'number' ? data.normalization_factor : undefined;
  const tier = typeof data.enemy_strength_tier === 'string' ? data.enemy_strength_tier : undefined;

  return (
    <div className="rounded-md border bg-popover p-3 shadow-md">
      <h4 className="mb-1 text-sm font-bold text-popover-foreground">
        {String(data.war_title ?? '')}
      </h4>

      <span className="mb-1 block text-xs text-muted-foreground">
        {new Date(String(data.war_date)).toLocaleDateString()}
      </span>

      {factor !== undefined && (
        <span className="mb-1 block text-xs text-muted-foreground">
          {t('guild_war.analytics_normalization_badge', {
            factor: Number(factor).toFixed(2),
            tier: tier ? t(`guild_war.analytics_tier_${tier}`) : t('common.unknown'),
          })}
        </span>
      )}

      <div className="flex flex-col gap-1.5">
        {metrics.map((metric) => {
          const metricKey = `metric_${metric}`;
          const value = data[metricKey] as number | null | undefined;
          const rawValue = data[`metric_${metric}_raw`] as number | null | undefined;

          return (
            <div key={metric} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: METRIC_LINE_COLORS[metric] }}
                />
                <PersonIcon sx={{ fontSize: 14, color: METRIC_LINE_COLORS[metric], mr: 0.5 }} />
                <span className="text-xs font-semibold text-popover-foreground">
                  {formatMetricName(metric)}
                </span>
              </div>
              <span className="font-mono text-xs text-popover-foreground">
                {value !== null && value !== undefined ? formatNumber(value) : <em className="text-muted-foreground">{t('guild_war.analytics_missing')}</em>}
              </span>
              {factor !== undefined &&
                typeof rawValue === 'number' &&
                value !== null &&
                value !== undefined &&
                Math.abs(rawValue - Number(value)) >= 0.01 && (
                  <span className="text-[10px] text-muted-foreground">
                    {t('guild_war.analytics_raw_to_normalized', {
                      raw: formatNumber(rawValue),
                      normalized: formatNumber(value),
                    })}
                  </span>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { CustomTooltip };
