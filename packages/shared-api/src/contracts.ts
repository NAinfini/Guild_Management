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
  wechat_name?: string;
  wars_participated: number;
  total_kills: number;
  total_damage: number;
  total_healing: number;
  total_credits: number;
  avg_kills: number;
  avg_damage: number;
  avg_healing: number;
  avg_credits: number;
}

export interface AnalyticsPerWarStatDTO {
  war_id: string;
  war_date: string;
  title: string;
  result: string;
  user_id: string;
  username: string;
  kills: number;
  damage: number;
  healing: number;
  credits: number;
}

export interface AnalyticsTeamStatDTO {
  team_id: string;
  team_name: string;
  war_id: string;
  war_date: string;
  total_kills: number;
  total_damage: number;
  total_healing: number;
  total_credits: number;
  member_count: number;
}

export interface AnalyticsMetaDTO {
  nextCursor: string | null;
  hasMore: boolean;
  totalWars: number;
  totalRows: number;
  samplingApplied: boolean;
}

export interface AnalyticsQueryDTO {
  userId?: string;
  startDate?: string;
  endDate?: string;
  warIds?: string;
  userIds?: string;
  teamIds?: string;
  mode?: 'compare' | 'rankings' | 'teams';
  metric?: string;
  aggregation?: 'total' | 'average' | 'best' | 'median';
  limit?: number;
  cursor?: string;
  includePerWar?: '0' | '1';
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
