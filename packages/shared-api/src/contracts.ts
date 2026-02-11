/**
 * API Data Transfer Objects (DTOs)
 * Shared contracts between Client (Frontend) and Worker (Backend)
 */

// ============================================================================
// Guild War DTOs
// ============================================================================

export interface WarTeamDTO {
  team_id: string; // mapped from war_team_id
  team_name: string;
  note?: string;
  is_locked: number; // 0 or 1
  sort_order: number;
  assigned_at_utc?: string; // from join
  members: WarTeamMemberDTO[];
  member_count?: number;
}

export interface WarTeamMemberDTO {
  user_id: string;
  username: string;
  wechat_name?: string;
  role_tag?: string;
  power: number;
  sort_order?: number;
}

export interface WarHistoryDTO {
  war_id: string;
  event_id: string;
  war_date: string; // ISO date YYYY-MM-DD
  title: string;
  result: 'victory' | 'defeat' | 'draw' | 'pending' | 'unknown' | 'win' | 'loss'; 
  
  // Stats
  our_kills: number | null;
  enemy_kills: number | null;
  our_towers: number | null;
  enemy_towers: number | null;
  our_base_hp: number | null;
  enemy_base_hp: number | null;
  our_distance: number | null;
  enemy_distance: number | null;
  our_credits: number | null;
  enemy_credits: number | null;
  
  notes: string | null;
  updated_at_utc: string;
  member_stats?: WarMemberStatDTO[];
}

export interface WarMemberStatDTO {
  war_id: string;
  user_id: string;
  username: string;
  class_code?: string;
  
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  healing: number;
  building_damage: number;
  damage_taken: number;
  credits: number;
  note: string | null;
  
  created_at_utc?: string;
  updated_at_utc?: string;
}

export interface ActiveWarDTO extends WarHistoryDTO {
  teams: WarTeamDTO[];
  pool: WarPoolMemberDTO[];
}

export interface WarPoolMemberDTO {
  user_id: string;
  username: string;
  power: number;
  wechat_name?: string;
}

// ============================================================================
// Analytics DTOs
// ============================================================================

export interface AnalyticsMemberStatDTO {
  user_id: string;
  username: string;
  class?: string;
  wechat_name?: string;
  wars_participated: number;
  total_kills: number;
  total_deaths: number;
  total_assists: number;
  total_damage: number;
  total_healing: number;
  total_building_damage: number;
  total_damage_taken: number;
  total_credits: number;
  avg_kills: number;
  avg_deaths: number;
  avg_assists: number;
  avg_damage: number;
  avg_healing: number;
  avg_building_damage: number;
  avg_damage_taken: number;
  avg_credits: number;
  kda_ratio: number | null;
  best_war_id?: string | null;
  best_war_value?: number | null;
}

export type AnalyticsModeDTO = 'compare' | 'rankings' | 'teams';
export type AnalyticsMetricDTO =
  | 'damage'
  | 'healing'
  | 'building_damage'
  | 'credits'
  | 'kills'
  | 'deaths'
  | 'assists'
  | 'kda';
export type AnalyticsAggregationDTO = 'total' | 'average' | 'best' | 'median';

export interface AnalyticsPerWarStatDTO {
  war_id: string;
  war_date: string;
  title: string;
  result: string;
  user_id: string;
  username: string;
  class?: string;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  healing: number;
  building_damage: number;
  damage_taken: number;
  credits: number;
  kda: number | null;
  note?: string | null;
  raw_kills?: number;
  raw_deaths?: number;
  raw_assists?: number;
  raw_damage?: number;
  raw_healing?: number;
  raw_building_damage?: number;
  raw_credits?: number;
  raw_kda?: number | null;
  normalization_factor?: number;
  enemy_strength_index?: number;
  enemy_strength_tier?: 'weak' | 'normal' | 'strong';
  formula_version?: string;
}

export interface AnalyticsTeamStatDTO {
  team_id: string;
  team_name: string;
  war_id: string;
  war_date: string;
  total_kills: number;
  total_deaths: number;
  total_assists: number;
  total_damage: number;
  total_healing: number;
  total_building_damage: number;
  total_credits: number;
  avg_kills: number;
  avg_deaths: number;
  avg_assists: number;
  avg_damage: number;
  avg_healing: number;
  avg_building_damage: number;
  avg_credits: number;
  member_count: number;
  normalization_factor?: number;
  enemy_strength_index?: number;
  enemy_strength_tier?: 'weak' | 'normal' | 'strong';
  formula_version?: string;
}

export interface AnalyticsMetaDTO {
  nextCursor: string | null;
  hasMore: boolean;
  totalWars: number;
  totalRows: number;
  samplingApplied: boolean;
  limit?: number;
  cursor?: number;
  normalizationApplied?: boolean;
  normalizationFormulaVersion?: string | null;
  normalizationWeights?: {
    kda: number;
    towers: number;
    distance: number;
  };
}

export interface AnalyticsQueryDTO {
  userId?: string;
  startDate?: string;
  endDate?: string;
  warIds?: string;
  userIds?: string;
  teamIds?: string;
  participationOnly?: '0' | '1';
  mode?: AnalyticsModeDTO;
  metric?: AnalyticsMetricDTO;
  aggregation?: AnalyticsAggregationDTO;
  limit?: number;
  cursor?: string;
  includePerWar?: '0' | '1';
  opponentNormalized?: '0' | '1';
  normalizationKdaWeight?: number;
  normalizationTowerWeight?: number;
  normalizationDistanceWeight?: number;
}

export interface AnalyticsResponseDTO {
  memberStats: AnalyticsMemberStatDTO[];
  perWarStats: AnalyticsPerWarStatDTO[];
  teamStats?: AnalyticsTeamStatDTO[];
  rankings: {
    byKills: AnalyticsMemberStatDTO[];
    byDamage: AnalyticsMemberStatDTO[];
    byHealing: AnalyticsMemberStatDTO[];
    byCredits: AnalyticsMemberStatDTO[];
  };
  warResults: { result: string; count: number }[];
  meta?: AnalyticsMetaDTO;
}

export interface AnalyticsFormulaPresetDTO {
  preset_id: string;
  name: string;
  version: number;
  kda_weight: number;
  tower_weight: number;
  distance_weight: number;
  is_default: 0 | 1;
  created_by: string | null;
  created_at_utc: string;
  updated_at_utc: string;
}

export interface AnalyticsFormulaPresetListResponseDTO {
  presets: AnalyticsFormulaPresetDTO[];
}

export interface CreateAnalyticsFormulaPresetBodyDTO {
  name: string;
  kdaWeight: number;
  towerWeight: number;
  distanceWeight: number;
  isDefault?: 0 | 1;
}

export interface CreateAnalyticsFormulaPresetResponseDTO {
  preset: AnalyticsFormulaPresetDTO;
}

// ============================================================================
// WebSocket DTOs
// ============================================================================

export type WebSocketEntity = 'wars' | 'events' | 'announcements' | 'members';
export type WebSocketAction = 'updated' | 'created' | 'deleted';

export interface WebSocketMessage<T = any> {
  entity?: WebSocketEntity;
  action?: WebSocketAction;
  payload?: T[];
  ids?: string[];
  timestamp?: string;
  seq?: number;
  type?: string;
  data?: any;
}
