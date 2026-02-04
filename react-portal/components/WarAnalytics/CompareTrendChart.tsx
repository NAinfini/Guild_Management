/**
 * War Analytics - Compare Trend Chart
 *
 * Multi-series line chart for comparing multiple members' performance
 * Supports:
 * - Multiple colored lines (one per member)
 * - Focus member (click legend)
 * - Hide/show series (alt-click legend)
 * - Missing data gaps
 * - Deterministic colors
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
  Area,
} from 'recharts';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { useAnalytics } from './AnalyticsContext';
import { transformForCompare, formatWarDateShort, formatNumber } from './utils';
import { getUserColor, formatMetricName } from './types';
import type { PerWarMemberStats, WarSummary, MemberStats } from './types';

// ============================================================================
// Main Component
// ============================================================================

interface CompareTrendChartProps {
  perWarStats: PerWarMemberStats[];
  wars: WarSummary[];
  members: MemberStats[];
  isLoading?: boolean;
}

export function CompareTrendChart({ perWarStats, wars, members, isLoading }: CompareTrendChartProps) {
  const { filters, compareMode, focusUser, toggleUserVisibility } = useAnalytics();

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!perWarStats || perWarStats.length === 0 || compareMode.selectedUserIds.length === 0) {
      return [];
    }

    return transformForCompare(
      perWarStats,
      wars,
      compareMode.selectedUserIds,
      filters.primaryMetric
    );
  }, [perWarStats, wars, compareMode.selectedUserIds, filters.primaryMetric]);

  // Get member info for each selected user
  const selectedMembers = useMemo(() => {
    return compareMode.selectedUserIds
      .map((id) => members.find((m) => m.user_id === id))
      .filter(Boolean) as MemberStats[];
  }, [compareMode.selectedUserIds, members]);

  // Handle legend click (focus)
  const handleLegendClick = (data: any) => {
    const userId = parseInt(data.dataKey.replace('user_', ''));
    if (compareMode.focusedUserId === userId) {
      focusUser(undefined); // Unfocus
    } else {
      focusUser(userId); // Focus
    }
  };

  // Handle legend right click or alt-click (hide/show)
  const handleLegendRightClick = (data: any, event: any) => {
    event.preventDefault();
    const userId = parseInt(data.dataKey.replace('user_', ''));
    toggleUserVisibility(userId);
  };

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
        {compareMode.selectedUserIds.length === 0
          ? 'Select members from the left panel to compare their performance'
          : 'No performance data available for the selected wars and members'}
      </Alert>
    );
  }

  return (
    <Box sx={{ background: 'radial-gradient(circle at 5% 10%, rgba(50,170,255,0.07), transparent 25%), radial-gradient(circle at 90% 10%, rgba(255,128,0,0.07), transparent 20%)', borderRadius: 3, p: 2 }}>
      <ResponsiveContainer width="100%" height={420}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
        >
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

          <Tooltip
            content={
              <CompareTooltip
                members={selectedMembers}
                metric={filters.primaryMetric}
              />
            }
          />

          <Legend
            wrapperStyle={{ fontSize: '0.875rem', cursor: 'pointer' }}
            iconType="line"
            onClick={handleLegendClick}
            onContextMenu={handleLegendRightClick}
          />

          {/* Render line for each member */}
          {selectedMembers.map((member) => {
            const dataKey = `user_${member.user_id}`;
            const color = getUserColor(member.user_id);
            const isFocused = compareMode.focusedUserId === member.user_id;
            const isHidden = compareMode.hiddenUserIds.has(member.user_id);

            if (isHidden) return null;

            return (
              <>
                <Area
                  key={`${member.user_id}-area`}
                  type="monotone"
                  dataKey={dataKey}
                  stroke="none"
                  fill={`url(#grad-${member.user_id})`}
                  opacity={compareMode.focusedUserId && !isFocused ? 0.15 : 0.3}
                  connectNulls={false}
                />
                <Line
                  key={member.user_id}
                  type="monotone"
                  dataKey={dataKey}
                  name={member.username}
                  stroke={color}
                  strokeWidth={isFocused ? 3.5 : compareMode.focusedUserId ? 1.5 : 2.5}
                  opacity={compareMode.focusedUserId && !isFocused ? 0.35 : 1}
                  dot={{ r: isFocused ? 5 : 3 }}
                  activeDot={{ r: isFocused ? 7 : 5 }}
                  connectNulls={false} // Show gaps
                  strokeLinecap="round"
                />
              </>
            );
          })}

          {/* Gradients per user for soft fills */}
          <defs>
            {selectedMembers.map((member) => (
              <linearGradient key={member.user_id} id={`grad-${member.user_id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={getUserColor(member.user_id)} stopOpacity={0.25}/>
                <stop offset="80%" stopColor={getUserColor(member.user_id)} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
        </LineChart>
      </ResponsiveContainer>

      {/* Chart Info */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Comparing {selectedMembers.length} members across {chartData.length} wars
          {' • '}
          Click legend to focus • Alt+Click to hide/show
        </Typography>
      </Box>
    </Box>
  );
}

// ============================================================================
// Custom Tooltip
// ============================================================================

interface CompareTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  members: MemberStats[];
  metric: string;
}

function CompareTooltip({ active, payload, label, members, metric }: CompareTooltipProps) {
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
        maxWidth: 300,
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

      {/* Each member's value */}
      {members.map((member) => {
        const value = data[`user_${member.user_id}`];
        const color = getUserColor(member.user_id);

        return (
          <Box key={member.user_id} sx={{ mb: 0.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: color,
                  }}
                />
                <Typography variant="body2" fontWeight={600}>
                  {member.username}:
                </Typography>
              </Stack>
              <Typography variant="body2" fontFamily="monospace">
                {value !== null && value !== undefined ? formatNumber(value) : <em>Missing</em>}
              </Typography>
            </Stack>
          </Box>
        );
      })}
    </Box>
  );
}

// Helper to create Stack component
import { Stack } from '@mui/material';

// ============================================================================
// Export
// ============================================================================

export { CompareTooltip };
