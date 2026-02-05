/**
 * War Analytics - Utility Functions
 *
 * Data transformation and helper functions for analytics
 */

import {
  TimelineDataPoint,
  CompareDataPoint,
  RankingDataPoint,
  TeamDataPoint,
  MemberStats,
  PerWarMemberStats,
  WarSummary,
  MetricType,
  AggregationType,
  TeamStats,
} from './types';

// ============================================================================
// Data Transformations for Charts
// ============================================================================

/**
 * Transform data for Player mode timeline chart
 * Shows one member's performance across multiple wars
 */
export function transformForTimeline(
  perWarStats: PerWarMemberStats[],
  wars: WarSummary[],
  primaryMetric: MetricType,
  secondaryMetric?: MetricType,
  showMovingAverage?: boolean
): TimelineDataPoint[] {
  const sortedWars = [...wars].sort((a, b) =>
    new Date(a.war_date).getTime() - new Date(b.war_date).getTime()
  );

  const data = sortedWars.map(war => {
    const stats = perWarStats.find(s => s.war_id === war.war_id);

    const point: TimelineDataPoint = {
      war_id: war.war_id,
      war_date: war.war_date,
      war_title: war.title,
      value: stats?.[primaryMetric] ?? null,
    };

    if (secondaryMetric) {
      point.secondaryValue = stats?.[secondaryMetric] ?? null;
    }

    return point;
  });

  // Calculate moving average if requested
  if (showMovingAverage) {
    const window = 3; // 3-war moving average
    data.forEach((point, index) => {
      if (index >= window - 1) {
        const values = data
          .slice(index - window + 1, index + 1)
          .map(p => p.value)
          .filter(v => v !== null) as number[];

        if (values.length > 0) {
          point.movingAvg = values.reduce((sum, v) => sum + v, 0) / values.length;
        }
      }
    });
  }

  return data;
}

/**
 * Transform data for Compare mode multi-series chart
 * Shows multiple members' performance across selected wars
 */
export function transformForCompare(
  perWarStats: PerWarMemberStats[],
  wars: WarSummary[],
  userIds: number[],
  metric: MetricType
): CompareDataPoint[] {
  const sortedWars = [...wars].sort((a, b) =>
    new Date(a.war_date).getTime() - new Date(b.war_date).getTime()
  );

  return sortedWars.map(war => {
    const point: CompareDataPoint = {
      war_id: war.war_id,
      war_date: war.war_date,
      war_title: war.title,
    };

    // Add data for each user
    userIds.forEach(userId => {
      const stats = perWarStats.find(s => s.war_id === war.war_id && s.user_id === userId);
      point[`user_${userId}`] = stats?.[metric] ?? null;
    });

    return point;
  });
}

/**
 * Transform data for Rankings mode bar chart
 * Shows top N performers by a metric
 */
export function transformForRankings(
  memberStats: MemberStats[],
  metric: MetricType,
  aggregation: AggregationType,
  topN: number,
  minParticipation: number,
  classFilter: string[]
): RankingDataPoint[] {
  // Filter by participation and class
  let filtered = memberStats.filter(
    stats => stats.wars_participated >= minParticipation
  );

  if (classFilter.length > 0) {
    filtered = filtered.filter(stats => classFilter.includes(stats.class));
  }

  // Get value based on aggregation type
  const getValue = (stats: MemberStats): number => {
    switch (aggregation) {
      case 'total':
        return stats[`total_${metric}`] ?? 0;
      case 'average':
        return stats[`avg_${metric}`] ?? 0;
      case 'best':
        return stats.best_war_value ?? 0;
      case 'median':
        // For median, we'd need per-war data - simplified here
        return stats[`avg_${metric}`] ?? 0;
      default:
        return 0;
    }
  };

  // Sort and take top N
  const sorted = filtered
    .map(stats => ({
      user_id: stats.user_id,
      username: stats.username,
      class: stats.class,
      value: getValue(stats),
      wars_participated: stats.wars_participated,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);

  // Add rank
  return sorted.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}

/**
 * Transform data for Teams mode chart
 * Shows team aggregates across wars
 */
export function transformForTeams(
  teamStats: TeamStats[],
  wars: WarSummary[],
  teamIds: number[],
  metric: MetricType,
  showTotal: boolean
): TeamDataPoint[] {
  const sortedWars = [...wars].sort((a, b) =>
    new Date(a.war_date).getTime() - new Date(b.war_date).getTime()
  );

  return sortedWars.map(war => {
    const point: TeamDataPoint = {
      war_id: war.war_id,
      war_date: war.war_date,
    };

    teamIds.forEach(teamId => {
      const stats = teamStats.find(s => s.war_id === war.war_id && s.team_id === teamId);
      if (stats) {
        const key = `team_${teamId}`;
        point[key] = showTotal
          ? stats[`total_${metric}`] ?? 0
          : stats[`avg_${metric}`] ?? 0;
      }
    });

    return point;
  });
}

// ============================================================================
// Statistical Calculations
// ============================================================================

/**
 * Calculate moving average for a series of values
 */
export function calculateMovingAverage(
  values: (number | null)[],
  windowSize: number = 3
): (number | null)[] {
  return values.map((_, index) => {
    if (index < windowSize - 1) return null;

    const window = values
      .slice(index - windowSize + 1, index + 1)
      .filter(v => v !== null) as number[];

    if (window.length === 0) return null;
    return window.reduce((sum, v) => sum + v, 0) / window.length;
  });
}

/**
 * Calculate trend (percentage change from first to last)
 */
export function calculateTrend(values: (number | null)[]): number | null {
  const nonNull = values.filter(v => v !== null) as number[];
  if (nonNull.length < 2) return null;

  const first = nonNull[0];
  const last = nonNull[nonNull.length - 1];

  if (first === 0) return null;
  return ((last - first) / first) * 100;
}

/**
 * Calculate variance (measure of consistency)
 */
export function calculateVariance(values: (number | null)[]): number | null {
  const nonNull = values.filter(v => v !== null) as number[];
  if (nonNull.length < 2) return null;

  const mean = nonNull.reduce((sum, v) => sum + v, 0) / nonNull.length;
  const squaredDiffs = nonNull.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((sum, v) => sum + v, 0) / nonNull.length;
}

/**
 * Calculate standard deviation
 */
export function calculateStdDev(values: (number | null)[]): number | null {
  const variance = calculateVariance(values);
  return variance !== null ? Math.sqrt(variance) : null;
}

/**
 * Calculate median
 */
export function calculateMedian(values: (number | null)[]): number | null {
  const nonNull = values.filter(v => v !== null) as number[];
  if (nonNull.length === 0) return null;

  const sorted = [...nonNull].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

// ============================================================================
// Missing Data Analysis
// ============================================================================

/**
 * Count missing stats across multiple wars for a user
 */
export function countMissingStatsForUser(
  perWarStats: PerWarMemberStats[],
  userId: number
): number {
  const userStats = perWarStats.filter(s => s.user_id === userId);

  return userStats.filter(stats => {
    const fields = ['kills', 'deaths', 'assists', 'damage', 'healing', 'building_damage', 'credits'];
    return fields.some(field => stats[field as keyof PerWarMemberStats] === null);
  }).length;
}

/**
 * Get missing fields for a specific war-member combination
 */
export function getMissingFields(stats: PerWarMemberStats): string[] {
  const fields: (keyof PerWarMemberStats)[] = [
    'kills', 'deaths', 'assists', 'damage', 'healing',
    'building_damage', 'credits', 'damage_taken'
  ];

  return fields.filter(field => stats[field] === null);
}

/**
 * Check if a war has any missing stats
 */
export function hasIncompleteStat(stats: PerWarMemberStats[]): boolean {
  return stats.some(stat => {
    const fields: (keyof PerWarMemberStats)[] = [
      'kills', 'deaths', 'assists', 'damage', 'healing',
      'building_damage', 'credits'
    ];
    return fields.some(field => stat[field] === null);
  });
}

// ============================================================================
// Sorting & Filtering
// ============================================================================

/**
 * Sort member stats by a metric
 */
export function sortMemberStats(
  stats: MemberStats[],
  metric: MetricType,
  aggregation: AggregationType,
  ascending: boolean = false
): MemberStats[] {
  const sorted = [...stats].sort((a, b) => {
    let aValue: number;
    let bValue: number;

    switch (aggregation) {
      case 'total':
        aValue = a[`total_${metric}`] ?? 0;
        bValue = b[`total_${metric}`] ?? 0;
        break;
      case 'average':
        aValue = a[`avg_${metric}`] ?? 0;
        bValue = b[`avg_${metric}`] ?? 0;
        break;
      case 'best':
        aValue = a.best_war_value ?? 0;
        bValue = b.best_war_value ?? 0;
        break;
      case 'median':
        // Simplified - would need per-war data
        aValue = a[`avg_${metric}`] ?? 0;
        bValue = b[`avg_${metric}`] ?? 0;
        break;
      default:
        aValue = 0;
        bValue = 0;
    }

    return ascending ? aValue - bValue : bValue - aValue;
  });

  return sorted;
}

/**
 * Filter wars by date range
 */
export function filterWarsByDateRange(
  wars: WarSummary[],
  startDate?: string,
  endDate?: string
): WarSummary[] {
  let filtered = [...wars];

  if (startDate) {
    const start = new Date(startDate).getTime();
    filtered = filtered.filter(war => new Date(war.war_date).getTime() >= start);
  }

  if (endDate) {
    const end = new Date(endDate).getTime();
    filtered = filtered.filter(war => new Date(war.war_date).getTime() <= end);
  }

  return filtered;
}

/**
 * Filter wars by participation (user participated in war)
 */
export function filterWarsByParticipation(
  wars: WarSummary[],
  perWarStats: PerWarMemberStats[],
  userId: number
): WarSummary[] {
  const participatedWarIds = new Set(
    perWarStats.filter(s => s.user_id === userId).map(s => s.war_id)
  );

  return wars.filter(war => participatedWarIds.has(war.war_id));
}

// ============================================================================
// Best Performance Finder
// ============================================================================

/**
 * Find the best war for a user by a specific metric
 */
export function findBestWar(
  perWarStats: PerWarMemberStats[],
  userId: number,
  metric: MetricType
): { warId: number; value: number } | null {
  const userStats = perWarStats.filter(s => s.user_id === userId);

  let best: { warId: number; value: number } | null = null;

  userStats.forEach(stats => {
    const value = stats[metric];
    if (value !== null && (best === null || value > best.value)) {
      best = { warId: stats.war_id, value };
    }
  });

  return best;
}

// ============================================================================
// Export Utilities
// ============================================================================

/**
 * Generate shareable text snapshot of analytics
 */
export function generateAnalyticsSnapshot(
  mode: string,
  metric: MetricType,
  wars: WarSummary[],
  data: any
): string {
  const lines: string[] = [];

  lines.push('⚔️ War Analytics Snapshot');
  lines.push('');
  lines.push(`📅 Date Range: ${wars[0]?.war_date || 'N/A'} to ${wars[wars.length - 1]?.war_date || 'N/A'}`);
  lines.push(`🎯 Wars Analyzed: ${wars.length}`);
  lines.push(`📊 Mode: ${mode}`);
  lines.push(`📈 Metric: ${metric}`);
  lines.push('');

  // Mode-specific data
  if (mode === 'player' && data.selectedUser) {
    lines.push(`👤 Player: ${data.selectedUser.username}`);
    lines.push(`💪 Class: ${data.selectedUser.class}`);
    lines.push(`🎮 Wars Participated: ${data.selectedUser.wars_participated}`);
    lines.push(`📊 Average ${metric}: ${data.selectedUser[`avg_${metric}`]?.toFixed(1) || 'N/A'}`);
    lines.push(`🏆 Total ${metric}: ${data.selectedUser[`total_${metric}`]?.toLocaleString() || 'N/A'}`);
  }

  if (mode === 'compare' && data.members) {
    lines.push(`👥 Comparing ${data.members.length} members`);
    lines.push('');
    lines.push(`🏆 Top 5 by ${metric}:`);
    data.members
      .sort((a: any, b: any) => (b[`total_${metric}`] || 0) - (a[`total_${metric}`] || 0))
      .slice(0, 5)
      .forEach((member: any, i: number) => {
        lines.push(`  ${i + 1}. ${member.username}: ${member[`total_${metric}`]?.toLocaleString() || 'N/A'}`);
      });
  }

  if (mode === 'rankings' && data.rankings) {
    lines.push(`🏆 Top ${data.rankings.length} by ${metric}:`);
    data.rankings.forEach((entry: any, i: number) => {
      lines.push(`  ${i + 1}. ${entry.username} (${entry.class}): ${entry.value.toLocaleString()}`);
    });
  }

  lines.push('');
  lines.push('🤖 Generated with Guild Management System');

  return lines.join('\n');
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Format war date for display
 */
export function formatWarDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format war date as short string
 */
export function formatWarDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
  });
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | null, decimals: number = 1): string {
  if (value === null) return 'N/A';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with K/M suffix
 */
export function formatLargeNumber(value: number | null): string {
  if (value === null) return 'N/A';

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Get trend icon and color
 */
export function getTrendIndicator(trend: number | null): { icon: string; color: string } {
  if (trend === null) return { icon: '—', color: 'text.secondary' };
  if (trend > 5) return { icon: '↑', color: 'success.main' };
  if (trend < -5) return { icon: '↓', color: 'error.main' };
  return { icon: '→', color: 'warning.main' };
}

export { formatNumber, formatCompactNumber, formatMetricName, METRICS } from './types';
