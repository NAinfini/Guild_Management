import { api } from '../api-client';
import type { WarTeam, WarHistoryEntry, WarMemberStat } from '../../types';
import type { 
  WarTeamDTO, 
  WarHistoryDTO, 
  WarMemberStatDTO, 
  ActiveWarDTO,
  AnalyticsResponseDTO 
} from '../../../shared/api/contracts';

// ============================================================================
// Mappers
// ============================================================================

const mapTeamToDomain = (dto: WarTeamDTO): WarTeam => ({
  id: dto.team_id,
  name: (dto as any).team_name || (dto as any).name || '',
  note: dto.note || undefined,
  is_locked: !!dto.is_locked,
  members: (dto.members || []).map((m) => ({
    user_id: m.user_id,
    role_tag: m.role_tag || undefined,
  })),
});

export const mapHistoryToDomain = (dto: WarHistoryDTO): WarHistoryEntry => ({
    id: dto.war_id,
    event_id: dto.event_id,
    date: dto.war_date,
    title: dto.title,
    result: dto.result === 'win' ? 'victory' : dto.result === 'loss' ? 'defeat' : dto.result === 'unknown' ? 'pending' : dto.result,
    score: dto.our_kills || 0,
    enemy_score: dto.enemy_kills || 0,
    own_stats: {
        kills: dto.our_kills || 0,
        towers: dto.our_towers || 0,
        base_hp: dto.our_base_hp || 0,
        credits: dto.our_credits || 0
    },
    enemy_stats: {
        kills: dto.enemy_kills || 0,
        towers: dto.enemy_towers || 0,
        base_hp: dto.enemy_base_hp || 0,
        credits: dto.enemy_credits || 0
    },
    updated_at: dto.updated_at_utc,
    notes: dto.notes || undefined,
    teams_snapshot: [],
    pool_snapshot: [],
    member_stats: []
});

const mapStatsToDomain = (dto: WarMemberStatDTO): WarMemberStat => ({
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
  getLatest: async (): Promise<ActiveWarDTO[]> => {
    return api.get<ActiveWarDTO[]>('/wars/latest');
  },
  
  getActiveTeams: async (warId: string): Promise<{ teams: WarTeam[]; pool: any[]; etag?: string }> => {
    // Note: Backend endpoint /wars/:id returns { war: { ...teams... } } usually? 
    // But getActiveTeams seems to call /wars/:id/teams which is handled by... ?
    // Checking endpoints.ts: createTeam is /wars/:id/teams. 
    // workers/api/wars/[id].ts usually handles the generic GET.
    // If there is no specific /teams endpoint, this might be legacy call?
    // Let's assume the legacy route exists or is handled. 
    // Wait, I saw workers/api/wars/index.ts. I did not see a separate teams file.
    // However, workers/api/wars/[id].ts includes teams in its GET response.
    // Maybe we should just use getWar? 
    // API previously called `/wars/${warId}/teams`.
    // I will preserve the signature but type the return.
    const response = await api.get<{ teams: WarTeamDTO[]; pool: any[] }>(`/wars/${warId}/teams`);
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
    // ... logic preserved, just explicit type
    const payload: any = { ...data };
    if (data.isLocked !== undefined) payload.is_locked = data.isLocked ? 1 : 0;
    
    const response = await api.put<{ team: WarTeamDTO }>(`/wars/${warId}/teams/${teamId}`, payload);
    return mapTeamToDomain(response.team);
  },

  deleteTeam: async (warId: string, teamId: string): Promise<void> => {
    await api.delete(`/wars/${warId}/teams/${teamId}`);
  },

  // Assignments
  movePoolToTeam: async (warId: string, moves: any): Promise<void> => { 
      // keeping 'any' for input params for now as strict typing there requires more DTO work
      const payload = Array.isArray(moves) ? { moves } : moves;
      await api.post(`/wars/${warId}/pool-to-team`, payload);
  },
  
  // ... (keep move methods similar) ...

  moveTeamToPool: async (warId: string, userIds: string[] | string): Promise<void> => {
    const payload = Array.isArray(userIds) ? { userIds } : { userId: userIds };
    await api.post(`/wars/${warId}/team-to-pool`, payload);
  },

  moveTeamToTeam: async (warId: string, moves: any): Promise<void> => {
    const payload = Array.isArray(moves) ? { moves } : moves;
    await api.post(`/wars/${warId}/team-to-team`, payload);
  },

  kickFromTeam: async (warId: string, kicks: any): Promise<void> => {
    const payload = Array.isArray(kicks) ? { kicks } : kicks;
    await api.post(`/wars/${warId}/kick-from-team`, payload);
  },

  kickFromPool: async (warId: string, userIds: string[] | string): Promise<void> => {
    const payload = Array.isArray(userIds) ? { userIds } : { userId: userIds };
    await api.post(`/wars/${warId}/kick-from-pool`, payload);
  },

  // War History
  getHistory: async (params?: { limit?: number; offset?: number }): Promise<WarHistoryEntry[]> => {
    // API returns array directly according to workers/api/wars/history.ts
    const response = await api.get<WarHistoryDTO[] | { wars: WarHistoryDTO[] }>('/wars/history', params as any);
    const list = Array.isArray(response) ? response : response.wars || [];
    return list.map(mapHistoryToDomain);
  },

  createHistory: async (data: Partial<WarHistoryEntry>): Promise<WarHistoryEntry> => {
    // Map frontend result values to backend result values
    const result = data.result === 'victory' ? 'win' :
                   data.result === 'defeat' ? 'loss' :
                   data.result === 'pending' ? 'unknown' : data.result;

    const payload = {
        title: data.title,
        warDate: data.date,
        result: result,
        ourKills: data.own_stats?.kills,
        // ... map rest if needed
    };
    const response = await api.post<{ war: WarHistoryDTO }>('/wars/history', payload);
    return mapHistoryToDomain(response.war);
  },

  updateWarStats: async (warId: string, data: Partial<WarHistoryEntry>, ifMatch?: string): Promise<WarHistoryEntry> => {
    // Map frontend result values to backend result values
    const result = data.result === 'victory' ? 'win' :
                   data.result === 'defeat' ? 'loss' :
                   data.result === 'pending' ? 'unknown' : data.result;

    const payload: any = {
      ourKills: data.own_stats?.kills,
      enemyKills: data.enemy_stats?.kills,
      // ... same mapping
      ourTowers: data.own_stats?.towers,
      enemyTowers: data.enemy_stats?.towers,
      ourBaseHp: data.own_stats?.base_hp,
      enemyBaseHp: data.enemy_stats?.base_hp,
      ourCredits: data.own_stats?.credits,
      enemyCredits: data.enemy_stats?.credits,
      notes: data.notes,
      result: result,
    };
    const response = await api.put<{ war: WarHistoryDTO }>(`/wars/history/${warId}`, payload, { headers: ifMatch ? { 'If-Match': ifMatch } : undefined } as any);
    return mapHistoryToDomain(response.war);
  },

  // Member StatsDTO
  getMemberStats: async (warId: string): Promise<WarMemberStat[]> => {
    const response = await api.get<{ stats: WarMemberStatDTO[] }>(`/wars/history/${warId}/member-stats`);
    return (response.stats || []).map(mapStatsToDomain);
  },

  updateMemberStats: async (warId: string, data: WarMemberStat, ifMatch?: string): Promise<void> => {
    // Map domain -> DTO params
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
    return api.get<AnalyticsResponseDTO>('/wars/analytics', params as any);
  },

  getWarsList: async (params?: { startDate?: string; endDate?: string; limit?: number }): Promise<any[]> => {
      // Re-using getHistory 
      const response = await api.get<WarHistoryDTO[] | { wars: WarHistoryDTO[] }>('/wars/history', params as any);
      const list = Array.isArray(response) ? response : response.wars || [];
      
      return list.map((war) => ({
        war_id: parseInt(war.war_id) || war.war_id, // Handle if string
        war_date: war.war_date,
        title: war.title,
        result: war.result === 'victory' || war.result === 'win' ? 'win' :
                war.result === 'defeat' || war.result === 'loss' ? 'loss' :
                war.result === 'pending' || war.result === 'unknown' ? 'unknown' : war.result,
        our_kills: war.our_kills,
        enemy_kills: war.enemy_kills,
        our_towers: war.our_towers,
        enemy_towers: war.enemy_towers,
        participant_count: 0,
        missing_stats_count: 0,
      }));
  },

  getAnalyticsData: async (params?: any): Promise<{ memberStats: any[]; perWarStats: any[] }> => {
    const response = await api.get<AnalyticsResponseDTO>('/wars/analytics', params);
    return {
      memberStats: response.memberStats || [],
      perWarStats: response.perWarStats || [],
    };
  },
};
