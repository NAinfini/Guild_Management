/**
 * War Analytics - Rankings Bar Chart
 *
 * Horizontal bar chart showing top N performers
 * Features:
 * - Ranked bars with colors (gold/silver/bronze for top 3)
 * - Value labels on bars
 * - Click to focus member
 */

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { Box, Typography, Alert, Stack, Avatar, Chip } from '@mui/material';
import { CardSkeleton } from '../../../../components/SkeletonLoaders';
import { useAnalytics } from './AnalyticsContext';
import { transformForRankings, formatNumber } from './utils';
import { formatMetricName } from './types';
import type { MemberStats, MetricType } from './types';

// ============================================================================
// Main Component
// ============================================================================

interface RankingsBarChartProps {
  members: MemberStats[];
  isLoading?: boolean;
}

export function RankingsBarChart({ members, isLoading }: RankingsBarChartProps) {
  const { filters, rankingsMode } = useAnalytics();

  // Transform data for chart
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

  // Get bar color based on rank
  const getBarColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return '#8884d8'; // Default blue
    }
  };

  // Loading state
  if (isLoading) {
    return <CardSkeleton aspectRatio="16/9" />;
  }

  // No data state
  if (chartData.length === 0) {
    return (
      <Alert severity="info">
        No members match the current filters. Try adjusting the class filter or minimum
        participation threshold.
      </Alert>
    );
  }

  return (
    <Box>
      <ResponsiveContainer width="100%" height={Math.max(400, chartData.length * 50)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 80, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />

          <XAxis
            type="number"
            style={{ fontSize: '0.75rem' }}
            tickFormatter={(value) => formatNumber(value)}
          />

          <YAxis
            type="category"
            dataKey="username"
            width={120}
            style={{ fontSize: '0.875rem' }}
          />

          <Tooltip content={<RankingsTooltip metric={filters.primaryMetric} />} />

          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.rank)} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(value: any) => formatNumber(Number(value))}
              style={{ fontSize: '0.75rem', fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Top 3 Podium (Optional visual) */}
      {chartData.length >= 3 && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="subtitle2" fontWeight={700} mb={2}>
            🏆 Top 3 Performers
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            {chartData.slice(0, 3).map((entry) => (
              <Box
                key={entry.user_id}
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  p: 2,
                  borderRadius: 1,
                  bgcolor: entry.rank === 1 ? 'warning.lighter' : 'background.paper',
                  border: 1,
                  borderColor: entry.rank === 1 ? 'warning.main' : 'divider',
                }}
              >
                <Typography variant="h4" mb={1}>
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {entry.username}
                </Typography>
                <Chip label={entry.class} size="small" sx={{ my: 1 }} />
                <Typography variant="h6" fontWeight={700} fontFamily="monospace">
                  {formatNumber(entry.value)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {entry.wars_participated} wars
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Chart Info */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Showing top {chartData.length} by {formatMetricName(filters.primaryMetric)} ({filters.aggregation})
          {rankingsMode.minParticipation > 1 && ` • Min ${rankingsMode.minParticipation} wars`}
          {rankingsMode.classFilter.length > 0 && ` • ${rankingsMode.classFilter.join(', ')}`}
        </Typography>
      </Box>
    </Box>
  );
}

// ============================================================================
// Custom Tooltip
// ============================================================================

interface RankingsTooltipProps {
  active?: boolean;
  payload?: any[];
  metric: string;
}

function RankingsTooltip({ active, payload, metric }: RankingsTooltipProps) {
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
      {/* Rank */}
      <Typography variant="h6" fontWeight={700} mb={1}>
        #{data.rank} {data.username}
      </Typography>

      {/* Class */}
      <Chip label={data.class} size="small" sx={{ mb: 1 }} />

      {/* Value */}
      <Box sx={{ mb: 0.5 }}>
        \u003cTypography variant=\"body2\" fontWeight={600}\u003e\r\n          {formatMetricName(metric as MetricType)}:\r\n        \u003c/Typography\u003e
        <Typography variant="body2" fontFamily="monospace" fontSize="1.1rem">
          {formatNumber(data.value)}
        </Typography>
      </Box>

      {/* Wars Participated */}
      <Typography variant="caption" color="text.secondary">
        Participated in {data.wars_participated} wars
      </Typography>
    </Box>
  );
}

// ============================================================================
// Export
// ============================================================================

export { RankingsTooltip };
