/**
 * War Analytics - Metrics Panel Component
 *
 * Right panel with:
 * - Primary metric selector
 * - Aggregation selector (for Rankings)
 * - Mode-aware summary cards
 * - Share button
 */

import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
} from '@mui/material';
import { BarChart3, TrendingUp, Award, Target } from 'lucide-react';
import { useAnalytics } from './AnalyticsContext';
import { METRICS, formatMetricName, formatNumber, formatCompactNumber } from './types';
import type { MemberStats, MetricType, AggregationType } from './types';
import { ShareButton } from './ShareButton';

// ============================================================================
// Main Component
// ============================================================================

interface MetricsPanelProps {
  analyticsData?: {
    memberStats: MemberStats[];
    [key: string]: any;
  };
}

export function MetricsPanel({ analyticsData }: MetricsPanelProps) {
  const { filters, updateFilters } = useAnalytics();

  const handleMetricChange = (metric: MetricType) => {
    updateFilters({ primaryMetric: metric });
  };

  const handleAggregationChange = (aggregation: AggregationType) => {
    updateFilters({ aggregation });
  };

  return (
    <Box>
      {/* Metric Selector */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={700} mb={2}>
            <Stack direction="row" alignItems="center" gap={1}>
              <BarChart3 size={18} />
              Metrics
            </Stack>
          </Typography>

          {/* Primary Metric */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Primary Metric</InputLabel>
            <Select
              value={filters.primaryMetric}
              onChange={(e) => handleMetricChange(e.target.value as MetricType)}
              label="Primary Metric"
            >
              {Object.keys(METRICS).map((metric) => (
                <MenuItem key={metric} value={metric}>
                  {formatMetricName(metric as MetricType)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Aggregation (for Rankings mode) */}
          {filters.mode === 'rankings' && (
            <FormControl fullWidth size="small">
              <InputLabel>Aggregation</InputLabel>
              <Select
                value={filters.aggregation}
                onChange={(e) => handleAggregationChange(e.target.value as AggregationType)}
                label="Aggregation"
              >
                <MenuItem value="total">Total</MenuItem>
                <MenuItem value="average">Average</MenuItem>
                <MenuItem value="best">Best</MenuItem>
                <MenuItem value="median">Median</MenuItem>
              </Select>
            </FormControl>
          )}
        </CardContent>
      </Card>

      {/* Mode-Aware Summary Cards */}
      <ModeSummaryCards analyticsData={analyticsData} />

      <Divider sx={{ my: 2 }} />

      {/* Share Button */}
      <ShareButton />
    </Box>
  );
}

// ============================================================================
// Mode-Aware Summary Cards
// ============================================================================

function ModeSummaryCards({ analyticsData }: { analyticsData?: any }) {
  const { filters, playerMode, compareMode } = useAnalytics();

  if (!analyticsData || !analyticsData.memberStats) {
    return null;
  }

  switch (filters.mode) {
    case 'player':
      if (!playerMode.selectedUserId) return null;
      return <PlayerSummaryCards userId={playerMode.selectedUserId} data={analyticsData} />;

    case 'compare':
      if (compareMode.selectedUserIds.length === 0) return null;
      return <CompareSummaryCards userIds={compareMode.selectedUserIds} data={analyticsData} />;

    case 'rankings':
      return <RankingsSummaryCards data={analyticsData} />;

    default:
      return null;
  }
}

// ============================================================================
// Player Mode Summary
// ============================================================================

function PlayerSummaryCards({ userId, data }: { userId: number; data: any }) {
  const { filters } = useAnalytics();
  const member = data.memberStats.find((m: MemberStats) => m.user_id === userId);

  if (!member) return null;

  const metricKey = `total_${filters.primaryMetric}` as keyof MemberStats;
  const avgKey = `avg_${filters.primaryMetric}` as keyof MemberStats;

  return (
    <Stack spacing={2}>
      {/* Best Performance */}
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" gap={1} mb={1}>
            <Award size={16} color="#FFD700" />
            <Typography variant="caption" textTransform="uppercase" fontWeight={700}>
              Best War
            </Typography>
          </Stack>
          <Typography variant="h6" fontWeight={700} fontFamily="monospace">
            {member.best_war_value ? formatNumber(member.best_war_value) : 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatMetricName(filters.primaryMetric)}
          </Typography>
        </CardContent>
      </Card>

      {/* Average */}
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" gap={1} mb={1}>
            <TrendingUp size={16} />
            <Typography variant="caption" textTransform="uppercase" fontWeight={700}>
              Average
            </Typography>
          </Stack>
          <Typography variant="h6" fontWeight={700} fontFamily="monospace">
            {member[avgKey] !== undefined ? formatNumber(member[avgKey] as number) : 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            per war
          </Typography>
        </CardContent>
      </Card>

      {/* Total */}
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" gap={1} mb={1}>
            <Target size={16} />
            <Typography variant="caption" textTransform="uppercase" fontWeight={700}>
              Total
            </Typography>
          </Stack>
          <Typography variant="h6" fontWeight={700} fontFamily="monospace">
            {member[metricKey] !== undefined ? formatCompactNumber(member[metricKey] as number) : 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            across {member.wars_participated} wars
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}

// ============================================================================
// Compare Mode Summary
// ============================================================================

function CompareSummaryCards({ userIds, data }: { userIds: number[]; data: any }) {
  const { filters } = useAnalytics();
  const members = data.memberStats.filter((m: MemberStats) => userIds.includes(m.user_id));

  if (members.length === 0) return null;

  // Find top performer
  const metricKey = `total_${filters.primaryMetric}` as keyof MemberStats;
  const topMember = [...members].sort(
    (a, b) => ((b[metricKey] as number) || 0) - ((a[metricKey] as number) || 0)
  )[0];

  // Calculate average across selected members
  const totalValues = members.map((m: MemberStats) => (m[metricKey] as number) || 0);
  const average = totalValues.reduce((sum, v) => sum + v, 0) / totalValues.length;

  return (
    <Stack spacing={2}>
      {/* Top Performer */}
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" gap={1} mb={1}>
            <Award size={16} color="#FFD700" />
            <Typography variant="caption" textTransform="uppercase" fontWeight={700}>
              Top Performer
            </Typography>
          </Stack>
          <Typography variant="body2" fontWeight={700}>
            {topMember.username}
          </Typography>
          <Typography variant="h6" fontWeight={700} fontFamily="monospace">
            {formatCompactNumber((topMember[metricKey] as number) || 0)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatMetricName(filters.primaryMetric)}
          </Typography>
        </CardContent>
      </Card>

      {/* Group Average */}
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" gap={1} mb={1}>
            <TrendingUp size={16} />
            <Typography variant="caption" textTransform="uppercase" fontWeight={700}>
              Group Average
            </Typography>
          </Stack>
          <Typography variant="h6" fontWeight={700} fontFamily="monospace">
            {formatCompactNumber(average)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            across {members.length} members
          </Typography>
        </CardContent>
      </Card>

      {/* Participation */}
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" gap={1} mb={1}>
            <Target size={16} />
            <Typography variant="caption" textTransform="uppercase" fontWeight={700}>
              Participation
            </Typography>
          </Stack>
          <Typography variant="h6" fontWeight={700}>
            {members.reduce((sum, m) => sum + m.wars_participated, 0)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            total war participations
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}

// ============================================================================
// Rankings Mode Summary
// ============================================================================

function RankingsSummaryCards({ data }: { data: any }) {
  const { filters } = useAnalytics();

  if (!data.memberStats || data.memberStats.length === 0) return null;

  const metricKey = `total_${filters.primaryMetric}` as keyof MemberStats;
  const topMembers = [...data.memberStats]
    .sort((a, b) => ((b[metricKey] as number) || 0) - ((a[metricKey] as number) || 0))
    .slice(0, 5);

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" gap={1} mb={2}>
          <Award size={16} color="#FFD700" />
          <Typography variant="caption" textTransform="uppercase" fontWeight={700}>
            Top 5 Quick View
          </Typography>
        </Stack>

        <Stack spacing={1}>
          {topMembers.map((member, index) => (
            <Box
              key={member.user_id}
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: index === 0 ? 'warning.lighter' : 'action.hover',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" fontWeight={600}>
                  {index + 1}. {member.username}
                </Typography>
                <Typography variant="caption" fontFamily="monospace" fontWeight={700}>
                  {formatCompactNumber((member[metricKey] as number) || 0)}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
