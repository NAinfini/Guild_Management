/**
 * War Analytics - Module Exports
 *
 * Central export point for all analytics components, types, and utilities
 */

// Context & Hooks
export { AnalyticsProvider, useAnalytics, useSelectionLimits, useCurrentModeState, useHasSelection } from './AnalyticsContext';

// Types
export type {
  AnalyticsMode,
  MetricType,
  AggregationType,
  AnalyticsFilters,
  PlayerModeState,
  CompareModeState,
  RankingsModeState,
  TeamsModeState,
  WarSummary,
  MemberStats,
  PerWarMemberStats,
  RankingEntry,
  TeamStats,
  TimelineDataPoint,
  CompareDataPoint,
  RankingDataPoint,
  TeamDataPoint,
  MissingDataInfo,
  DateRangePreset,
} from './types';

export {
  METRICS,
  DEFAULT_FILTERS,
  DEFAULT_PLAYER_MODE,
  DEFAULT_COMPARE_MODE,
  DEFAULT_RANKINGS_MODE,
  DEFAULT_TEAMS_MODE,
  SELECTION_LIMITS,
  COLOR_PALETTE,
  CLASS_TINTS,
  DATE_RANGE_PRESETS,
  getUserColor,
  getClassTint,
  formatMetricName,
  isMetricHigherBetter,
  calculateKDA,
  formatKDA,
  formatNumber,
  formatCompactNumber,
  getMissingDataInfo,
} from './types';

// Utilities
export {
  transformForTimeline,
  transformForCompare,
  transformForRankings,
  transformForTeams,
  calculateMovingAverage,
  calculateTrend,
  calculateVariance,
  calculateStdDev,
  calculateMedian,
  countMissingStatsForUser,
  getMissingFields,
  hasIncompleteStat,
  sortMemberStats,
  filterWarsByDateRange,
  filterWarsByParticipation,
  findBestWar,
  generateAnalyticsSnapshot,
  copyToClipboard,
  formatWarDate,
  formatWarDateShort,
  formatPercentage,
  formatLargeNumber,
  getTrendIndicator,
} from './utils';

// Components
export { ModeStrip, ModeDescription } from './ModeStrip';
export { FilterBar, DateRangeSelector, WarMultiSelector } from './FilterBar';
export { PlayerSelector, SelectedMemberCard, StatBox } from './PlayerSelector';
export { PlayerTimelineChart } from './PlayerTimelineChart';
export { CompareSelector } from './CompareSelector';
export { CompareTrendChart, CompareTooltip } from './CompareTrendChart';
export { RankingsFilters } from './RankingsFilters';
export { RankingsBarChart, RankingsTooltip } from './RankingsBarChart';
export { MetricsPanel } from './MetricsPanel';
export { ShareButton } from './ShareButton';
export { TableFallback, createTimelineColumns, createCompareColumns, createRankingsColumns } from './TableFallback';
export { ChartLoadingSkeleton, TableLoadingSkeleton, CardLoadingSkeleton, ListLoadingSkeleton, FullPageLoading } from './LoadingStates';
export { WarAnalyticsMain } from './WarAnalyticsMain';
