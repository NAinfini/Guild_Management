/**
 * Guild War API Service
 * Typed methods for war management operations with Domain Mapping
 */

import { api } from '../api-client';
import type { WarTeam, WarHistoryEntry, WarMemberStat } from '../../types';

// ============================================================================
// Backend Types
// ============================================================================

interface WarTeamDTO {
  war_team_id: string;
  war_id: string;
  name: string;
  note: string | null;
  is_locked: number; // 0/1
  sort_order: number;
  members: Array<{
    user_id: string;
    username: string;
    role_tag: string | null;
    power: number;
  }>;
}

interface WarHistoryDTO {
  war_id: string;
  event_id: string;
  war_date: string;
  title: string;
  result: 'victory' | 'defeat' | 'draw' | 'pending';
  our_kills: number;
  enemy_kills: number;
  our_towers: number;
  enemy_towers: number;
  our_base_hp: number;
  enemy_base_hp: number;
  our_credits: number;
  enemy_credits: number;
  notes: string | null;
  updated_at_utc: string;
}

interface MemberStatsDTO {
    user_id: string;
    username: string;
    class_code: string;
    kills: number;
    deaths: number;
    assists: number;
    damage: number;
    healing: number;
    building_damage: number;
    damage_taken: number;
    credits: number;
    note: string | null;
}

// ============================================================================
// Mappers
// ============================================================================

const mapTeamToDomain = (dto: WarTeamDTO): WarTeam => ({
  id: dto.war_team_id,
  name: dto.name,
  note: dto.note || undefined,
  is_locked: !!dto.is_locked,
  members: (dto.members || []).map((m) => ({
    user_id: m.user_id,
    role_tag: m.role_tag || undefined,
  })),
});

const mapHistoryToDomain = (dto: WarHistoryDTO): WarHistoryEntry => ({
    id: dto.war_id,
    event_id: dto.event_id,
    date: dto.war_date,
    title: dto.title,
    result: dto.result,
    own_stats: {
        kills: dto.our_kills,
        towers: dto.our_towers,
        base_hp: dto.our_base_hp,
        credits: dto.our_credits
    },
    enemy_stats: {
        kills: dto.enemy_kills,
        towers: dto.enemy_towers,
        base_hp: dto.enemy_base_hp,
        credits: dto.enemy_credits
    },
    updated_at: dto.updated_at_utc,
    notes: dto.notes || undefined,
    teams_snapshot: [], // often loaded separately
    pool_snapshot: [],
    member_stats: []
});

const mapStatsToDomain = (dto: MemberStatsDTO): WarMemberStat => ({
    id: dto.user_id,
    username: dto.username,
    class: dto.class_code as any,
    kills: dto.kills,
    deaths: dto.deaths,
    assists: dto.assists,
    damage: dto.damage,
    healing: dto.healing,
    building_damage: dto.building_damage,
    damage_taken: dto.damage_taken,
    credits: dto.credits,
    note: dto.note || undefined
});

// ============================================================================
// API Service
// ============================================================================

export const warsAPI = {
  // Latest Wars
  getLatest: async (): Promise<any[]> => {
    // Return raw for now as structure of "War" is complex
    return api.get<any[]>('/wars/latest');
  },
  
  getActiveTeams: async (warId: string): Promise<{ teams: WarTeam[]; pool: any[]; etag?: string }> => {
    const response = await api.get<{ teams: WarTeamDTO[]; pool: any[]; warUpdatedAt?: string }>(`/wars/${warId}/teams`);
    const etag = (response as any)._responseHeaders?.['etag'];
    return {
      teams: (response.teams || []).map(mapTeamToDomain),
      pool: response.pool || [],
      etag,
    };
  },

  createTeam: async (warId: string, name: string, note?: string): Promise<WarTeam> => {
    const response = await api.post<{ team: WarTeamDTO }>(`/wars/${warId}/teams`, { name, note });
    return mapTeamToDomain(response.team);
  },

  updateTeam: async (warId: string, teamId: string, data: { name?: string; note?: string; isLocked?: boolean; sortOrder?: number }): Promise<WarTeam> => {
    const payload: any = { ...data };
    if (data.isLocked !== undefined) payload.is_locked = data.isLocked ? 1 : 0;
    
    const response = await api.put<{ team: WarTeamDTO }>(`/wars/${warId}/teams/${teamId}`, payload);
    return mapTeamToDomain(response.team);
  },

  deleteTeam: async (warId: string, teamId: string): Promise<void> => {
    await api.delete(`/wars/${warId}/teams/${teamId}`);
  },

  // Assignments
  movePoolToTeam: async (warId: string, moves: { userId: string, teamId: string, roleTag?: string }[] | { userId: string, teamId: string, roleTag?: string }): Promise<void> => {
    // Standardize to batch structure
    const payload = Array.isArray(moves) ? { moves } : moves;
    await api.post(`/wars/${warId}/pool-to-team`, payload);
  },

  moveTeamToPool: async (warId: string, userIds: string[] | string): Promise<void> => {
    const payload = Array.isArray(userIds) ? { userIds } : { userId: userIds };
    await api.post(`/wars/${warId}/team-to-pool`, payload);
  },

  moveTeamToTeam: async (warId: string, moves: { userId: string, sourceTeamId: string, targetTeamId: string }[] | { userId: string, sourceTeamId: string, targetTeamId: string }): Promise<void> => {
    const payload = Array.isArray(moves) ? { moves } : moves;
    await api.post(`/wars/${warId}/team-to-team`, payload);
  },

  kickFromTeam: async (warId: string, kicks: { userId: string, teamId: string }[] | { userId: string, teamId: string }): Promise<void> => {
    const payload = Array.isArray(kicks) ? { kicks } : kicks;
    await api.post(`/wars/${warId}/kick-from-team`, payload);
  },

  kickFromPool: async (warId: string, userIds: string[] | string): Promise<void> => {
    const payload = Array.isArray(userIds) ? { userIds } : { userId: userIds };
    await api.post(`/wars/${warId}/kick-from-pool`, payload);
  },

  // War History
  getHistory: async (params?: { limit?: number; offset?: number }): Promise<WarHistoryEntry[]> => {
    const response = await api.get<{ wars: WarHistoryDTO[] }>('/wars/history', params as any);
    return (response.wars || []).map(mapHistoryToDomain);
  },

  createHistory: async (data: Partial<WarHistoryEntry>): Promise<WarHistoryEntry> => {
    // Map domain -> DTO for creation (simplified)
    const payload = {
        title: data.title,
        war_date: data.date,
        result: data.result,
        our_kills: data.own_stats?.kills,
        // ... mapped fields
    };
    const response = await api.post<{ war: WarHistoryDTO }>('/wars/history', payload);
    return mapHistoryToDomain(response.war);
  },

  updateWarStats: async (warId: string, data: Partial<WarHistoryEntry>, ifMatch?: string): Promise<WarHistoryEntry> => {
    const payload: any = {
      ourKills: data.own_stats?.kills,
      enemyKills: data.enemy_stats?.kills,
      ourTowers: data.own_stats?.towers,
      enemyTowers: data.enemy_stats?.towers,
      ourBaseHp: data.own_stats?.base_hp,
      enemyBaseHp: data.enemy_stats?.base_hp,
      ourCredits: data.own_stats?.credits,
      enemyCredits: data.enemy_stats?.credits,
      notes: data.notes,
      result: data.result,
    };
    const response = await api.put<{ war: WarHistoryDTO }>(`/wars/history/${warId}`, payload, { headers: ifMatch ? { 'If-Match': ifMatch } : undefined } as any);
    return mapHistoryToDomain(response.war);
  },

  // Member Stats
  getMemberStats: async (warId: string): Promise<WarMemberStat[]> => {
    const response = await api.get<{ stats: MemberStatsDTO[] }>(`/wars/history/${warId}/member-stats`);
    return (response.stats || []).map(mapStatsToDomain);
  },

  updateMemberStats: async (warId: string, data: WarMemberStat, ifMatch?: string): Promise<void> => {
    await api.put(`/wars/history/${warId}/member-stats`, {
      userId: data.id,
      kills: data.kills,
      deaths: data.deaths,
      assists: data.assists,
      damage: data.damage,
      healing: data.healing,
      buildingDamage: data.building_damage,
      damageTaken: data.damage_taken,
      credits: data.credits,
      note: data.note,
    }, { headers: ifMatch ? { 'If-Match': ifMatch } : undefined } as any);
  },

  // Analytics
  getAnalytics: async (params?: { userId?: string; startDate?: string; endDate?: string }) => {
    return api.get<{ memberStats: any[]; rankings: any; warResults: any[] }>('/wars/analytics', params as any);
  },

  // War Analytics - Enhanced endpoints for analytics components
  getWarsList: async (params?: { startDate?: string; endDate?: string; limit?: number }): Promise<any[]> => {
    // Get wars list with minimal info for filtering
    const response = await api.get<{ wars: WarHistoryDTO[] }>('/wars/history', params as any);
    return (response.wars || []).map((war) => ({
      war_id: parseInt(war.war_id),
      war_date: war.war_date,
      title: war.title,
      result: war.result === 'victory' ? 'win' : war.result === 'defeat' ? 'loss' : war.result,
      our_kills: war.our_kills,
      enemy_kills: war.enemy_kills,
      our_towers: war.our_towers,
      enemy_towers: war.enemy_towers,
      participant_count: 0, // Will be calculated from member stats
      missing_stats_count: 0, // Will be calculated from member stats
    }));
  },

  getAnalyticsData: async (params?: {
    startDate?: string;
    endDate?: string;
    warIds?: number[];
    userIds?: number[];
  }): Promise<{
    memberStats: any[];
    perWarStats: any[];
  }> => {
    // This endpoint should aggregate data from multiple wars
    // For now, we'll call the existing analytics endpoint and transform the data
    const response = await api.get<any>('/wars/analytics', params as any);

    // Transform the response to match expected format
    return {
      memberStats: response.memberStats || [],
      perWarStats: response.perWarStats || [],
    };
  },
};
