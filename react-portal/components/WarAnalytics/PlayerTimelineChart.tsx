/**
 * War Analytics - Player Timeline Chart
 *
 * Timeline chart showing one member's performance across multiple wars
 * Supports:
 * - Primary metric line
 * - Optional secondary metric (dashed line)
 * - Optional 3-war moving average
 * - Missing data gaps (never 0-fill)
 */

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
} from 'recharts';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { useAnalytics } from './AnalyticsContext';
import { transformForTimeline, formatWarDateShort, formatNumber } from './utils';
import { getUserColor } from './types';
import type { PerWarMemberStats, WarSummary, MetricType } from './types';

// ============================================================================
// Main Component
// ============================================================================

interface PlayerTimelineChartProps {
  perWarStats: PerWarMemberStats[];
  wars: WarSummary[];
  isLoading?: boolean;
}

export function PlayerTimelineChart({ perWarStats, wars, isLoading }: PlayerTimelineChartProps) {
  const { filters, playerMode } = useAnalytics();

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!perWarStats || perWarStats.length === 0) return [];

    return transformForTimeline(
      perWarStats,
      wars,
      filters.primaryMetric,
      playerMode.secondaryMetric,
      playerMode.showMovingAverage
    );
  }, [perWarStats, wars, filters.primaryMetric, playerMode.secondaryMetric, playerMode.showMovingAverage]);

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  // No data state
  if (chartData.length === 0) {
    return (
      <Alert severity="info">
        No performance data available for the selected wars
      </Alert>
    );
  }

  // Calculate average line value
  const averageValue = useMemo(() => {
    const values = chartData.map(d => d.value).filter(v => v !== null) as number[];
    if (values.length === 0) return null;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }, [chartData]);

  return (
    <Box sx={{ background: 'radial-gradient(circle at 10% 20%, rgba(0,120,255,0.08), transparent 25%), radial-gradient(circle at 80% 10%, rgba(255,200,87,0.08), transparent 20%)', borderRadius: 3, p: 2 }}>
      <ResponsiveContainer width="100%" height={420}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="primaryGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={getUserColor(1)} stopOpacity={0.35}/>
              <stop offset="80%" stopColor={getUserColor(1)} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="secondaryGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={getUserColor(2)} stopOpacity={0.3}/>
              <stop offset="80%" stopColor={getUserColor(2)} stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.08)" />

          <XAxis
            dataKey="war_date"
            tickFormatter={(date) => formatWarDateShort(date)}
            style={{ fontSize: '0.75rem', fill: 'rgba(255,255,255,0.7)' }}
            tickMargin={10}
          />

          <YAxis
            style={{ fontSize: '0.75rem', fill: 'rgba(255,255,255,0.7)' }}
            tickFormatter={(value) => formatNumber(value)}
          />

          <Tooltip content={<CustomTooltip primaryMetric={filters.primaryMetric} secondaryMetric={playerMode.secondaryMetric} />} />

          <Legend
            wrapperStyle={{ fontSize: '0.875rem' }}
            iconType="line"
          />

          {/* Average reference line */}
          {averageValue !== null && (
            <ReferenceLine
              y={averageValue}
              stroke="rgba(255,255,255,0.35)"
              strokeDasharray="5 5"
              label={{
                value: `Avg: ${formatNumber(averageValue)}`,
                position: 'right',
                style: { fontSize: '0.7rem', fill: 'rgba(255,255,255,0.65)' },
              }}
            />
          )}

          {/* Primary area glow */}
          <Area
            type="monotone"
            dataKey="value"
            stroke="none"
            fill="url(#primaryGlow)"
            connectNulls={false}
          />

          {/* Primary metric line */}
          <Line
            type="monotone"
            dataKey="value"
            name={formatMetricLabel(filters.primaryMetric)}
            stroke={getUserColor(1)}
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            connectNulls={false} // CRITICAL: Show gaps for missing data
            strokeLinecap="round"
          />

          {/* Secondary metric line (optional) */}
          {playerMode.secondaryMetric && (
            <>
              <Area
                type="monotone"
                dataKey="secondaryValue"
                stroke="none"
                fill="url(#secondaryGlow)"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="secondaryValue"
                name={formatMetricLabel(playerMode.secondaryMetric)}
                stroke={getUserColor(2)}
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                connectNulls={false}
                strokeLinecap="round"
              />
            </>
          )}

          {/* Moving average line (optional) */}
          {playerMode.showMovingAverage && (
            <Line
              type="monotone"
              dataKey="movingAvg"
              name="3-war Moving Avg"
              stroke="#ff7300"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
              connectNulls={true} // Connect for smoother line
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Chart Legend/Info */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Showing {chartData.length} wars • Missing data shown as gaps (not 0)
        </Typography>
      </Box>
    </Box>
  );
}

// ============================================================================
// Custom Tooltip
// ============================================================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  primaryMetric: MetricType;
  secondaryMetric?: MetricType;
}

function CustomTooltip({ active, payload, label, primaryMetric, secondaryMetric }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 1.5,
        boxShadow: 2,
      }}
    >
      {/* War Title */}
      <Typography variant="subtitle2" fontWeight={700} mb={1}>
        {data.war_title}
      </Typography>

      {/* Date */}
      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
        {new Date(data.war_date).toLocaleDateString()}
      </Typography>

      {/* Primary Metric */}
      <Box sx={{ mb: 0.5 }}>
        <Typography variant="body2" fontWeight={600}>
          {formatMetricLabel(primaryMetric)}:
        </Typography>
        <Typography variant="body2" fontFamily="monospace">
          {data.value !== null ? formatNumber(data.value) : <em>Missing</em>}
        </Typography>
      </Box>

      {/* Secondary Metric */}
      {secondaryMetric && data.secondaryValue !== undefined && (
        <Box sx={{ mb: 0.5 }}>
          <Typography variant="body2" fontWeight={600}>
            {formatMetricLabel(secondaryMetric)}:
          </Typography>
          <Typography variant="body2" fontFamily="monospace">
            {data.secondaryValue !== null ? formatNumber(data.secondaryValue) : <em>Missing</em>}
          </Typography>
        </Box>
      )}

      {/* Moving Average */}
      {data.movingAvg !== undefined && data.movingAvg !== null && (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            Moving Avg:
          </Typography>
          <Typography variant="body2" fontFamily="monospace">
            {formatNumber(data.movingAvg)}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatMetricLabel(metric: MetricType): string {
  const labels: Record<MetricType, string> = {
    damage: 'Damage',
    healing: 'Healing',
    building_damage: 'Building Damage',
    credits: 'Credits',
    kills: 'Kills',
    deaths: 'Deaths',
    assists: 'Assists',
    kda: 'K/D/A',
  };
  return labels[metric] || metric;
}

// ============================================================================
// Export
// ============================================================================

export { CustomTooltip };
