import { api } from '../api-client';
import { typedAPI } from './api-builder';
import { normalizeUtcDateTime } from './date';
import type { WarTeam, WarHistoryEntry, WarMemberStat } from '../../types';
import type { 
  WarTeamDTO, 
  WarHistoryDTO, 
  WarMemberStatDTO, 
  ActiveWarDTO,
  AnalyticsQueryDTO,
  AnalyticsResponseDTO,
  AnalyticsFormulaPresetDTO,
  AnalyticsFormulaPresetListResponseDTO,
  CreateAnalyticsFormulaPresetBodyDTO,
  CreateAnalyticsFormulaPresetResponseDTO,
} from '@guild/shared-api/contracts';

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
    date: normalizeUtcDateTime(dto.war_date) || dto.war_date,
    title: dto.title,
    result: dto.result === 'win' ? 'victory' : dto.result === 'loss' ? 'defeat' : dto.result === 'unknown' ? 'pending' : dto.result,
    score: dto.our_kills || 0,
    enemy_score: dto.enemy_kills || 0,
    opponent_name: dto.title.replace(/^vs\s+/i, ''),
    total_stars: dto.our_towers || 0,
    total_attacks: Math.max(1, (dto as any).total_attacks || (dto.our_kills ? Math.ceil(dto.our_kills / 3) : 1)),
    own_stats: {
        kills: dto.our_kills || 0,
        towers: dto.our_towers || 0,
        base_hp: dto.our_base_hp || 0,
        credits: dto.our_credits || 0,
        distance: dto.our_distance || 0,
    },
    enemy_stats: {
        kills: dto.enemy_kills || 0,
        towers: dto.enemy_towers || 0,
        base_hp: dto.enemy_base_hp || 0,
        credits: dto.enemy_credits || 0,
        distance: dto.enemy_distance || 0,
    },
    updated_at: normalizeUtcDateTime(dto.updated_at_utc) || dto.updated_at_utc,
    notes: dto.notes || undefined,
    teams_snapshot: Array.isArray((dto as any).teams_snapshot)
      ? (dto as any).teams_snapshot.map((team: any) => ({
          id: team.id || team.team_id,
          name: team.name || team.team_name || '',
          note: team.note || undefined,
          is_locked: !!team.is_locked,
          members: Array.isArray(team.members)
            ? team.members.map((member: any) => ({
                user_id: member.user_id,
                role_tag: member.role_tag || undefined,
                username: member.username || undefined,
              }))
            : [],
        }))
      : [],
    pool_snapshot: [],
    member_stats: Array.isArray((dto as any).member_stats)
      ? (dto as any).member_stats.map((m: any) => ({
          id: m.user_id,
          username: m.username,
          class: m.class_code as any,
          kills: m.kills ?? 0,
          deaths: m.deaths ?? 0,
          assists: m.assists ?? 0,
          damage: m.damage ?? 0,
          healing: m.healing ?? 0,
          building_damage: m.building_damage ?? 0,
          damage_taken: m.damage_taken ?? 0,
          credits: m.credits ?? 0,
          note: m.note || undefined,
        }))
      : [],
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

const mapMemberStatToRequest = (data: WarMemberStat) => ({
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
});

// ============================================================================
// API Service
// ============================================================================

export const warsAPI = {
  // Latest Wars
  getLatest: async (): Promise<ActiveWarDTO[]> => {
    return typedAPI.wars.latest<ActiveWarDTO[]>();
  },
  
  getActiveTeams: async (warId: string): Promise<{ teams: WarTeam[]; pool: any[]; etag?: string }> => {
    const response = await typedAPI.wars.getTeams<{ teams: WarTeamDTO[]; pool: any[] }>({ params: { id: warId } });
    const etag = (response as any)._responseHeaders?.['etag'];
    return {
      teams: (response.teams || []).map(mapTeamToDomain),
      pool: response.pool || [],
      etag,
    };
  },

  createTeam: async (warId: string, name: string, note?: string): Promise<WarTeam> => {
    const response = await typedAPI.wars.createTeam<{ team: WarTeamDTO }>({
      params: { id: warId },
      body: { name, note },
    });
    return mapTeamToDomain(response.team);
  },

  updateTeam: async (warId: string, teamId: string, data: { name?: string; note?: string; isLocked?: boolean; sortOrder?: number }): Promise<WarTeam> => {
    // ... logic preserved, just explicit type
    const payload: any = { ...data };
    if (data.isLocked !== undefined) payload.is_locked = data.isLocked ? 1 : 0;
    
    const response = await typedAPI.wars.updateTeam<{ team: WarTeamDTO }>({
      params: { id: warId, teamId },
      body: payload,
    });
    return mapTeamToDomain(response.team);
  },

  deleteTeam: async (warId: string, teamId: string): Promise<void> => {
    await typedAPI.wars.deleteTeam({ params: { id: warId, teamId } });
  },

  // Assignments
  movePoolToTeam: async (warId: string, moves: any): Promise<void> => { 
      // keeping 'any' for input params for now as strict typing there requires more DTO work
      const payload = Array.isArray(moves) ? { moves } : moves;
      await typedAPI.wars.poolToTeam({ params: { id: warId }, body: payload });
  },
  
  // ... (keep move methods similar) ...

  moveTeamToPool: async (warId: string, userIds: string[] | string): Promise<void> => {
    const payload = Array.isArray(userIds) ? { userIds } : { userId: userIds };
    await typedAPI.wars.teamToPool({ params: { id: warId }, body: payload });
  },

  moveTeamToTeam: async (warId: string, moves: any): Promise<void> => {
    const payload = Array.isArray(moves) ? { moves } : moves;
    await typedAPI.wars.teamToTeam({ params: { id: warId }, body: payload });
  },

  kickFromTeam: async (warId: string, kicks: any): Promise<void> => {
    const payload = Array.isArray(kicks) ? { kicks } : kicks;
    await typedAPI.wars.kickFromTeam({ params: { id: warId }, body: payload });
  },

  kickFromPool: async (warId: string, userIds: string[] | string): Promise<void> => {
    const payload = Array.isArray(userIds) ? { userIds } : { userId: userIds };
    await typedAPI.wars.kickFromPool({ params: { id: warId }, body: payload });
  },

  // War History
  getHistory: async (params?: { limit?: number; offset?: number }): Promise<WarHistoryEntry[]> => {
    // API returns array directly according to apps/worker/src/api/wars/history.ts
    const response = await typedAPI.wars.historyList<WarHistoryDTO[] | { wars: WarHistoryDTO[] }>({ query: params as any });
    const list = Array.isArray(response) ? response : response.wars || [];
    return list.map(mapHistoryToDomain);
  },

  getHistoryById: async (warId: string): Promise<WarHistoryEntry> => {
    const response = await typedAPI.wars.historyGet<{ war: WarHistoryDTO }>({ params: { id: warId } });
    return mapHistoryToDomain(response.war);
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
    const response = await typedAPI.wars.historyCreate<{ war: WarHistoryDTO }>({ body: payload });
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
    const response = await api.put<{ war: WarHistoryDTO }>(
      `/wars/history/${warId}`,
      payload,
      undefined,
      { headers: ifMatch ? { 'If-Match': ifMatch } : undefined }
    );
    return mapHistoryToDomain(response.war);
  },

  // Member StatsDTO
  getMemberStats: async (warId: string): Promise<WarMemberStat[]> => {
    const response = await typedAPI.wars.historyMemberStats<{ stats: WarMemberStatDTO[] }>({ params: { id: warId } });
    return (response.stats || []).map(mapStatsToDomain);
  },

  updateMemberStats: async (warId: string, data: WarMemberStat, ifMatch?: string): Promise<void> => {
    await api.put(
      `/wars/history/${warId}/member-stats`,
      {
        stats: [mapMemberStatToRequest(data)],
      },
      undefined,
      { headers: ifMatch ? { 'If-Match': ifMatch } : undefined }
    );
  },

  updateMemberStatsBatch: async (warId: string, data: WarMemberStat[], ifMatch?: string): Promise<void> => {
    await api.put(
      `/wars/history/${warId}/member-stats`,
      {
        stats: data.map(mapMemberStatToRequest),
      },
      undefined,
      { headers: ifMatch ? { 'If-Match': ifMatch } : undefined }
    );
  },

  // Analytics
  getAnalytics: async (params?: AnalyticsRequestParams) => {
    const query = serializeAnalyticsQuery(params);
    return typedAPI.wars.analytics<AnalyticsResponseDTO>({ query: query as any });
  },

  getWarsList: async (params?: { startDate?: string; endDate?: string; limit?: number }): Promise<any[]> => {
      // Re-using getHistory 
      const response = await typedAPI.wars.historyList<WarHistoryDTO[] | { wars: WarHistoryDTO[] }>({ query: params as any });
      const list = Array.isArray(response) ? response : response.wars || [];
      
      return list.map((war) => ({
        war_id: parseInt(war.war_id) || war.war_id, // Handle if string
        war_date: normalizeUtcDateTime(war.war_date) || war.war_date,
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

  getAnalyticsData: async (params?: AnalyticsRequestParams): Promise<{ memberStats: any[]; perWarStats: any[]; teamStats: any[]; meta?: any }> => {
    const query = serializeAnalyticsQuery(params);
    const response = await typedAPI.wars.analytics<AnalyticsResponseDTO>({ query: query as any });

    const toNumber = (value: unknown): number => {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    };

    const toNullableNumber = (value: unknown): number | null => {
      if (value === null || value === undefined || value === '') return null;
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    };

    const memberStats = (response.memberStats || []).map((row: any) => ({
      ...row,
      user_id: toNumber(row.user_id),
      wars_participated: toNumber(row.wars_participated),
      total_kills: toNumber(row.total_kills),
      total_deaths: toNumber(row.total_deaths),
      total_assists: toNumber(row.total_assists),
      total_damage: toNumber(row.total_damage),
      total_healing: toNumber(row.total_healing),
      total_building_damage: toNumber(row.total_building_damage),
      total_damage_taken: toNumber(row.total_damage_taken),
      total_credits: toNumber(row.total_credits),
      avg_kills: toNumber(row.avg_kills),
      avg_deaths: toNumber(row.avg_deaths),
      avg_assists: toNumber(row.avg_assists),
      avg_damage: toNumber(row.avg_damage),
      avg_healing: toNumber(row.avg_healing),
      avg_building_damage: toNumber(row.avg_building_damage),
      avg_damage_taken: toNumber(row.avg_damage_taken),
      avg_credits: toNumber(row.avg_credits),
      kda_ratio: toNullableNumber(row.kda_ratio),
      best_war_id: row.best_war_id === null || row.best_war_id === undefined ? undefined : toNumber(row.best_war_id),
      best_war_value: toNullableNumber(row.best_war_value),
    }));

    const perWarStats = (response.perWarStats || []).map((row: any) => ({
      ...row,
      war_id: toNumber(row.war_id),
      user_id: toNumber(row.user_id),
      kills: toNullableNumber(row.kills),
      deaths: toNullableNumber(row.deaths),
      assists: toNullableNumber(row.assists),
      damage: toNullableNumber(row.damage),
      healing: toNullableNumber(row.healing),
      building_damage: toNullableNumber(row.building_damage),
      damage_taken: toNullableNumber(row.damage_taken),
      credits: toNullableNumber(row.credits),
      kda: toNullableNumber(row.kda),
      raw_kills: toNullableNumber(row.raw_kills),
      raw_deaths: toNullableNumber(row.raw_deaths),
      raw_assists: toNullableNumber(row.raw_assists),
      raw_damage: toNullableNumber(row.raw_damage),
      raw_healing: toNullableNumber(row.raw_healing),
      raw_building_damage: toNullableNumber(row.raw_building_damage),
      raw_credits: toNullableNumber(row.raw_credits),
      raw_kda: toNullableNumber(row.raw_kda),
      normalization_factor: toNullableNumber(row.normalization_factor),
      enemy_strength_index: toNullableNumber(row.enemy_strength_index),
    }));

    const teamStats = ((response as any).teamStats || []).map((row: any) => ({
      ...row,
      team_id: toNumber(row.team_id),
      war_id: toNumber(row.war_id),
      member_count: toNumber(row.member_count),
      total_kills: toNumber(row.total_kills),
      total_deaths: toNumber(row.total_deaths),
      total_assists: toNumber(row.total_assists),
      total_damage: toNumber(row.total_damage),
      total_healing: toNumber(row.total_healing),
      total_building_damage: toNumber(row.total_building_damage),
      total_credits: toNumber(row.total_credits),
      avg_kills: toNumber(row.avg_kills),
      avg_deaths: toNumber(row.avg_deaths),
      avg_assists: toNumber(row.avg_assists),
      avg_damage: toNumber(row.avg_damage),
      avg_healing: toNumber(row.avg_healing),
      avg_building_damage: toNumber(row.avg_building_damage),
      avg_credits: toNumber(row.avg_credits),
      normalization_factor: toNullableNumber(row.normalization_factor),
      enemy_strength_index: toNullableNumber(row.enemy_strength_index),
    }));

    return {
      memberStats,
      perWarStats,
      teamStats,
      meta: (response as any).meta,
    };
  },

  getAnalyticsFormulaPresets: async (): Promise<AnalyticsFormulaPresetDTO[]> => {
    const response = await typedAPI.wars.analyticsFormulaPresets<AnalyticsFormulaPresetListResponseDTO>();
    return response.presets || [];
  },

  createAnalyticsFormulaPreset: async (payload: {
    name: string;
    weights: {
      kda: number;
      towers: number;
      distance: number;
    };
    isDefault?: boolean;
  }): Promise<AnalyticsFormulaPresetDTO> => {
    const body: CreateAnalyticsFormulaPresetBodyDTO = {
      name: payload.name,
      kdaWeight: payload.weights.kda,
      towerWeight: payload.weights.towers,
      distanceWeight: payload.weights.distance,
      isDefault: payload.isDefault ? 1 : 0,
    };
    const response = await typedAPI.wars.createAnalyticsFormulaPreset<CreateAnalyticsFormulaPresetResponseDTO>({
      body,
    });
    return response.preset;
  },

  deleteAnalyticsFormulaPreset: async (presetId: string): Promise<void> => {
    await typedAPI.wars.deleteAnalyticsFormulaPreset({ query: { id: presetId } });
  },
};

type AnalyticsRequestParams = {
  userId?: string;
  startDate?: string;
  endDate?: string;
  warIds?: Array<number | string>;
  userIds?: Array<number | string>;
  teamIds?: Array<number | string>;
  mode?: AnalyticsQueryDTO['mode'];
  metric?: AnalyticsQueryDTO['metric'];
  aggregation?: AnalyticsQueryDTO['aggregation'];
  limit?: number;
  cursor?: string;
  includePerWar?: boolean;
  participationOnly?: boolean;
  opponentNormalized?: boolean;
  normalizationWeights?: {
    kda: number;
    towers: number;
    distance: number;
  };
};

function serializeIdList(values?: Array<number | string>): string | undefined {
  if (!values || values.length === 0) {
    return undefined;
  }

  const normalized = [...new Set(values.map((value) => String(value).trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return normalized.length > 0 ? normalized.join(',') : undefined;
}

function serializeAnalyticsQuery(params?: AnalyticsRequestParams) {
  if (!params) return undefined;

  const query: AnalyticsQueryDTO = {
    userId: params.userId,
    startDate: params.startDate,
    endDate: params.endDate,
    warIds: serializeIdList(params.warIds),
    userIds: serializeIdList(params.userIds),
    teamIds: serializeIdList(params.teamIds),
    mode: params.mode,
    metric: params.metric,
    aggregation: params.aggregation,
    limit: params.limit,
    cursor: params.cursor,
    includePerWar: params.includePerWar === undefined ? undefined : params.includePerWar ? '1' : '0',
    participationOnly: params.participationOnly === undefined ? undefined : params.participationOnly ? '1' : '0',
    opponentNormalized: params.opponentNormalized === undefined ? undefined : params.opponentNormalized ? '1' : '0',
    normalizationKdaWeight: params.normalizationWeights?.kda,
    normalizationTowerWeight: params.normalizationWeights?.towers,
    normalizationDistanceWeight: params.normalizationWeights?.distance,
  };

  return query;
}
