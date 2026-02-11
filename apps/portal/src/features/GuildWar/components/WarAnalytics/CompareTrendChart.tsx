/**
 * War Analytics - Compare Trend Chart
 *
 * Multi-series line chart for comparing multiple members' performance
 * Supports:
 * - Multiple colored lines (one per member)
 * - Focus member (click legend)
 * - Hide/show series (Ctrl/Alt-click legend)
 * - Missing data gaps
 * - Deterministic colors
 */

import { useMemo } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { useTranslation } from 'react-i18next';
import { CardSkeleton, Alert, AlertDescription, AlertTitle } from '@/components';
import { useAnalytics } from './AnalyticsContext';
import { transformForCompare, formatWarDateShort, formatNumber } from './utils';
import { getMemberMetricColor, formatMetricName } from './types';
import type { PerWarMemberStats, WarSummary, MemberStats } from './types';
import type { MetricType } from './types';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// ============================================================================
// Main Component
// ============================================================================

interface CompareTrendChartProps {
  perWarStats: PerWarMemberStats[];
  wars: WarSummary[];
  members: MemberStats[];
  onSelectWar?: (params: { warId: number; userId?: number }) => void;
  samplingApplied?: boolean;
  isLoading?: boolean;
}

export function CompareTrendChart({ perWarStats, wars, members, onSelectWar, samplingApplied = false, isLoading }: CompareTrendChartProps) {
  const { t } = useTranslation();
  const { filters, compareMode } = useAnalytics();
  const selectedMetrics = compareMode.selectedMetrics.length > 0 ? compareMode.selectedMetrics : [filters.primaryMetric];
  const HIGH_SERIES_THRESHOLD = 12;

  const chartData = useMemo(() => {
    if (!perWarStats || perWarStats.length === 0 || compareMode.selectedUserIds.length === 0) {
      return [];
    }

    return transformForCompare(
      perWarStats,
      wars,
      compareMode.selectedUserIds,
      selectedMetrics
    );
  }, [perWarStats, wars, compareMode.selectedUserIds, selectedMetrics]);

  const selectedMembers = useMemo(() => {
    return compareMode.selectedUserIds
      .map((id) => members.find((m) => m.user_id === id))
      .filter(Boolean) as MemberStats[];
  }, [compareMode.selectedUserIds, members]);

  const compareSeries = useMemo(() => {
    return selectedMembers.flatMap((member) =>
      selectedMetrics.map((metric) => ({
        userId: member.user_id,
        username: member.username,
        metric,
        dataKey: `user_${member.user_id}__${metric}`,
        color: getMemberMetricColor(member.user_id, metric),
      })),
    );
  }, [selectedMembers, selectedMetrics]);

  const visibleSeriesCount = useMemo(
    () => compareSeries.filter((series) => !compareMode.hiddenUserIds.has(series.userId)).length,
    [compareMode.hiddenUserIds, compareSeries],
  );

  const handleChartClick = (event: any, d: any) => {
    if (d.dataIndex === undefined || d.dataIndex === null) return;
    const point = chartData[d.dataIndex];
    if (!point) return;

    const warId = Number(point.war_id);
    if (!Number.isFinite(warId)) return;

    // d.seriesId will be like 'user_123__damage'
    const userPart = String(d.seriesId || '').split('__')[0];
    const parsedUserId = Number(userPart.replace('user_', ''));
    onSelectWar?.({
      warId,
      userId: Number.isFinite(parsedUserId) ? parsedUserId : undefined,
    });
  };

  if (isLoading) {
    return <CardSkeleton aspectRatio="16/9" />;
  }

  if (chartData.length === 0) {
    return (
      <Alert variant="default">
        <ShowChartIcon sx={{ fontSize: 24, color: "primary.main" }} />
        <AlertDescription>
          {compareMode.selectedUserIds.length === 0
            ? t('guild_war.analytics_no_compare_selection')
            : t('guild_war.analytics_no_compare_data')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div
      className="rounded-xl border bg-card p-4 shadow-sm"
      style={{
        background:
          'radial-gradient(circle at 5% 10%, rgba(50,170,255,0.07), transparent 25%), radial-gradient(circle at 90% 10%, rgba(255,128,0,0.07), transparent 20%)',
      }}
    >
      {visibleSeriesCount > HIGH_SERIES_THRESHOLD && (
        <Alert
          variant="default"
          className="mb-4"
          style={{
            borderColor: 'color-mix(in srgb, var(--color-status-warning) 50%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--color-status-warning-bg) 76%, transparent)',
            color: 'var(--color-status-warning-fg)',
          }}
        >
          <WarningIcon sx={{ fontSize: 20 }} />
          <div className="flex flex-col gap-1">
             <AlertTitle>{t('guild_war.analytics_high_series_warning', {
              count: visibleSeriesCount,
              threshold: HIGH_SERIES_THRESHOLD,
            })}</AlertTitle>
             <AlertDescription>
               {t('guild_war.analytics_high_series_hint')}
             </AlertDescription>
          </div>
        </Alert>
      )}

      {samplingApplied && (
        <Alert variant="default" className="mb-4">
          <ErrorOutlineIcon className="h-4 w-4" />
          <AlertDescription>{t('guild_war.analytics_sampling_applied')}</AlertDescription>
        </Alert>
      )}

      <LineChart
        xAxis={[
          {
            scaleType: 'point' as const,
            data: chartData.map((d) => formatWarDateShort(d.war_date)),
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
        series={compareSeries
          .filter((series) => !compareMode.hiddenUserIds.has(series.userId))
          .map((series) => {
            const drawArea = selectedMetrics.length === 1;

            return {
              id: series.dataKey,
              data: chartData.map((d) => (d as any)[series.dataKey] ?? null),
              label: `${series.username} · ${formatMetricName(series.metric as MetricType)}`,
              color: series.color,
              connectNulls: false,
              showMark: true,
              area: drawArea,
            };
          })}
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
      />

      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          {t('guild_war.analytics_compare_chart_hint', {
            members: compareSeries.length,
            wars: chartData.length,
          })}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Custom Tooltip
// ============================================================================

interface CompareTooltipProps {
  active?: boolean;
  payload?: any[];
}

function CompareTooltip({ active, payload }: CompareTooltipProps) {
  const { t } = useTranslation();
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  const factor = typeof data.normalization_factor === 'number' ? data.normalization_factor : undefined;
  const tier = typeof data.enemy_strength_tier === 'string' ? data.enemy_strength_tier : undefined;

  return (
    <div className="rounded-md border bg-popover p-3 shadow-md max-w-[300px]">
      <h4 className="mb-1 text-sm font-bold text-popover-foreground">
        {data.war_title}
      </h4>

      <span className="mb-1 block text-xs text-muted-foreground">
        {new Date(data.war_date).toLocaleDateString()}
      </span>

      {factor !== undefined && (
        <span className="mb-1 block text-xs text-muted-foreground">
          {t('guild_war.analytics_normalization_badge', {
            factor: factor.toFixed(2),
            tier: tier ? t(`guild_war.analytics_tier_${tier}`) : t('common.unknown'),
          })}
        </span>
      )}

      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="mb-1 last:mb-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs font-semibold text-popover-foreground">
                {entry.name}
              </span>
            </div>
            <span className="font-mono text-xs text-popover-foreground">
              {entry.value !== null && entry.value !== undefined ? formatNumber(entry.value) : <em className="text-muted-foreground">{t('guild_war.analytics_missing')}</em>}
            </span>
          </div>
          {factor !== undefined && entry.value !== null && entry.value !== undefined && (() => {
            const [userPart, metric] = String(entry.dataKey || '').split('__');
            const rawKey = `${userPart}__${metric}__raw`;
            const rawValue = data?.[rawKey];
            if (typeof rawValue !== 'number') return null;
            if (Math.abs(rawValue - Number(entry.value)) < 0.01) return null;
            return (
              <span className="ml-5 block text-[10px] text-muted-foreground">
                {t('guild_war.analytics_raw_to_normalized', {
                  raw: formatNumber(rawValue),
                  normalized: formatNumber(entry.value),
                })}
              </span>
            );
          })()}
        </div>
      ))}
    </div>
  );
}

export { CompareTooltip };
