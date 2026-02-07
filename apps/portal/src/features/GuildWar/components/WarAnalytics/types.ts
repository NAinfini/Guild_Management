/**
 * War Analytics - Type Definitions
 *
 * Core types for the analytics system supporting four modes:
 * - Player: Single member across multiple wars
 * - Compare: Multiple members side-by-side
 * - Rankings: Top N performers
 * - Teams: Team comparison
 */

// ============================================================================
// Analytics Modes
// ============================================================================

export type AnalyticsMode = 'player' | 'compare' | 'rankings' | 'teams';

// ============================================================================
// Metrics
// ============================================================================

export type MetricType =
  | 'damage'
  | 'healing'
  | 'building_damage'
  | 'credits'
  | 'kills'
  | 'deaths'
  | 'assists'
  | 'kda';

export type AggregationType = 'total' | 'average' | 'best' | 'median';

export const METRICS: Record<MetricType, { label: string; higherIsBetter: boolean }> = {
  damage: { label: 'Damage', higherIsBetter: true },
  healing: { label: 'Healing', higherIsBetter: true },
  building_damage: { label: 'Building Damage', higherIsBetter: true },
  credits: { label: 'Credits', higherIsBetter: true },
  kills: { label: 'Kills', higherIsBetter: true },
  deaths: { label: 'Deaths', higherIsBetter: false },
  assists: { label: 'Assists', higherIsBetter: true },
  kda: { label: 'K/D/A', higherIsBetter: true },
};

// ============================================================================
// Global Filters
// ============================================================================

export interface AnalyticsFilters {
  mode: AnalyticsMode;
  selectedWars: number[]; // war_ids
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  participationOnly: boolean; // Only include wars where subject participated
  primaryMetric: MetricType;
  aggregation: AggregationType;
}

export const DEFAULT_FILTERS: AnalyticsFilters = {
  mode: 'player',
  selectedWars: [],
  participationOnly: true,
  primaryMetric: 'damage',
  aggregation: 'total',
};

// ============================================================================
// Mode-Specific State
// ============================================================================

export interface PlayerModeState {
  selectedUserId: number | null;
  secondaryMetric?: MetricType;
  showMovingAverage: boolean;
}

export const DEFAULT_PLAYER_MODE: PlayerModeState = {
  selectedUserId: null,
  secondaryMetric: undefined,
  showMovingAverage: false,
};

export interface CompareModeState {
  selectedUserIds: number[];
  focusedUserId?: number; // Highlighted user (thicker line)
  hiddenUserIds: Set<number>; // Hidden series
}

export const DEFAULT_COMPARE_MODE: CompareModeState = {
  selectedUserIds: [],
  focusedUserId: undefined,
  hiddenUserIds: new Set(),
};

export interface RankingsModeState {
  topN: number; // Number of top performers to show
  minParticipation: number; // Minimum wars participated
  classFilter: string[]; // Filter by class (empty = all)
}

export const DEFAULT_RANKINGS_MODE: RankingsModeState = {
  topN: 10,
  minParticipation: 1,
  classFilter: [],
};

export interface TeamsModeState {
  selectedTeamIds: number[];
  showTotal: boolean; // true = total, false = average
}

export const DEFAULT_TEAMS_MODE: TeamsModeState = {
  selectedTeamIds: [],
  showTotal: true,
};

// ============================================================================
// Data Structures
// ============================================================================

export interface WarSummary {
  war_id: number;
  war_date: string;
  title: string;
  result: 'win' | 'loss' | 'draw' | 'unknown';
  our_kills: number | null;
  enemy_kills: number | null;
  our_towers: number | null;
  enemy_towers: number | null;
  participant_count: number;
  missing_stats_count: number;
}

export interface MemberStats {
  user_id: number;
  username: string;
  class: string;
  avatar_url?: string;

  // Aggregate stats
  wars_participated: number;
  total_kills: number;
  total_deaths: number;
  total_assists: number;
  total_damage: number;
  total_healing: number;
  total_building_damage: number;
  total_credits: number;
  total_damage_taken: number;

  // Average stats
  avg_kills: number;
  avg_deaths: number;
  avg_assists: number;
  avg_damage: number;
  avg_healing: number;
  avg_building_damage: number;
  avg_credits: number;
  avg_damage_taken: number;

  // Derived stats
  kda_ratio: number | null; // (kills + assists) / deaths

  // Best performance
  best_war_id?: number;
  best_war_value?: number; // Best value for primary metric
  [key: string]: any;
}

export interface PerWarMemberStats {
  war_id: number;
  war_date: string;
  user_id: number;
  username: string;
  class: string;

  // Performance stats (can be null for missing data)
  kills: number | null;
  deaths: number | null;
  assists: number | null;
  damage: number | null;
  healing: number | null;
  building_damage: number | null;
  credits: number | null;
  damage_taken: number | null;

  // Derived
  kda: number | null;
  note?: string;
}

export interface RankingEntry {
  user_id: number;
  username: string;
  class: string;
  avatar_url?: string;
  wars_participated: number;
  value: number; // Value of the metric being ranked
  rank: number;
}

export interface TeamStats {
  team_id: number;
  team_name: string;
  war_id: number;
  war_date: string;
  member_count: number;

  // Aggregate stats
  total_kills: number;
  total_deaths: number;
  total_assists: number;
  total_damage: number;
  total_healing: number;
  total_building_damage: number;
  total_credits: number;

  // Average stats
  avg_damage: number;
  avg_healing: number;
  avg_building_damage: number;
  avg_credits: number;
  avg_kills: number;
  avg_deaths: number;
  avg_assists: number;
  [key: string]: any;
}

// ============================================================================
// Chart Data Types
// ============================================================================

export interface TimelineDataPoint {
  war_id: number;
  war_date: string;
  war_title: string;
  value: number | null; // null for missing data
  secondaryValue?: number | null;
  movingAvg?: number | null;
}

export interface CompareDataPoint {
  war_id: number;
  war_date: string;
  war_title: string;
  [key: `user_${number}`]: number | null; // Dynamic keys for each user
}

export interface RankingDataPoint {
  user_id: number;
  username: string;
  class: string;
  value: number;
  wars_participated: number;
  rank: number;
}

export interface TeamDataPoint {
  war_id: number;
  war_date: string;
  [key: string]: any; // Dynamic keys for each team (team_ID)
}

// ============================================================================
// Missing Data Tracking
// ============================================================================

export interface MissingDataInfo {
  has_missing: boolean;
  missing_count: number;
  missing_fields: string[];
  total_fields: number;
  completeness_percentage: number;
}

export function getMissingDataInfo(stats: Partial<PerWarMemberStats>): MissingDataInfo {
  const fields = ['kills', 'deaths', 'assists', 'damage', 'healing', 'building_damage', 'credits', 'damage_taken'];
  const missingFields = fields.filter(field => stats[field as keyof PerWarMemberStats] === null);

  return {
    has_missing: missingFields.length > 0,
    missing_count: missingFields.length,
    missing_fields: missingFields,
    total_fields: fields.length,
    completeness_percentage: ((fields.length - missingFields.length) / fields.length) * 100,
  };
}

// ============================================================================
// Date Range Presets
// ============================================================================

export interface DateRangePreset {
  label: string;
  value: string;
  getDates: () => { startDate: string; endDate: string };
}

export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  {
    label: 'Last 7 days',
    value: '7d',
    getDates: () => ({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
    }),
  },
  {
    label: 'Last 30 days',
    value: '30d',
    getDates: () => ({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
    }),
  },
  {
    label: 'Last 90 days',
    value: '90d',
    getDates: () => ({
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
    }),
  },
  {
    label: 'Last 6 months',
    value: '6m',
    getDates: () => ({
      startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
    }),
  },
  {
    label: 'Last year',
    value: '1y',
    getDates: () => ({
      startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
    }),
  },
  {
    label: 'All time',
    value: 'all',
    getDates: () => ({
      startDate: '2020-01-01T00:00:00.000Z', // Adjust to your guild's start date
      endDate: new Date().toISOString(),
    }),
  },
];

// ============================================================================
// Selection Limits
// ============================================================================

export const SELECTION_LIMITS = {
  COMPARE_SOFT_CAP: 10, // Show warning
  COMPARE_HARD_CAP: 20, // Prevent selection
  RANKINGS_MAX: 50,
  TEAMS_MAX: 10,
};

// ============================================================================
// Color Palette
// ============================================================================

export const COLOR_PALETTE = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F',
  '#FFBB28', '#FF8042', '#0088FE', '#00C49F', '#FFBB28',
  '#a4de6c', '#d0ed57', '#83a6ed', '#8dd1e1', '#82ca9d',
];

export function getUserColor(userId: number): string {
  return COLOR_PALETTE[userId % COLOR_PALETTE.length];
}

export const CLASS_TINTS: Record<string, string> = {
  qiansilin: 'rgba(76, 175, 80, 0.1)', // green
  lieshiwei: 'rgba(255, 193, 7, 0.1)',  // yellow-brown
  default: 'rgba(33, 150, 243, 0.1)',   // blue
};

export function getClassTint(className: string): string {
  return CLASS_TINTS[className] || CLASS_TINTS.default;
}

// ============================================================================
// Utility Functions
// ============================================================================

export function formatMetricName(metric: MetricType): string {
  return METRICS[metric]?.label || metric;
}

export function isMetricHigherBetter(metric: MetricType): boolean {
  return METRICS[metric]?.higherIsBetter ?? true;
}

export function calculateKDA(kills: number | null, deaths: number | null, assists: number | null): number | null {
  if (kills === null || deaths === null || assists === null) return null;
  if (deaths === 0) return null; // Avoid division by zero
  return (kills + assists) / deaths;
}

export function formatKDA(kda: number | null): string {
  if (kda === null) return 'N/A';
  return kda.toFixed(2);
}

export function formatNumber(value: number | null): string {
  if (value === null) return 'N/A';
  return value.toLocaleString();
}

export function formatCompactNumber(value: number | null): string {
  if (value === null) return 'N/A';

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}
