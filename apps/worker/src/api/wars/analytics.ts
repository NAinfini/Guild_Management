/**
 * Guild War Analytics
 * GET /api/wars/analytics - Get war statistics and analytics
 */

import { createEndpoint } from '../../core/endpoint-factory';
import type {
  AnalyticsMemberStatDTO,
  AnalyticsMetaDTO,
  AnalyticsPerWarStatDTO,
  AnalyticsQueryDTO,
  AnalyticsResponseDTO,
  AnalyticsTeamStatDTO,
} from '@guild/shared-api/contracts';

// ============================================================
// Types
// ============================================================

type SqlParam = string | number;
type WarResultRow = { result: string; count: number };
type EnemyStrengthTier = 'weak' | 'normal' | 'strong';
type NormalizationInfo = {
  factor: number;
  index: number;
  tier: EnemyStrengthTier;
};
type NormalizationWeights = {
  kda: number;
  towers: number;
  distance: number;
};
type NormalizationConfig = {
  normalized: NormalizationWeights;
  displayWeights: {
    kda: number;
    towers: number;
    distance: number;
  };
  formulaVersion: string;
};

interface SqlFilter {
  params: SqlParam[];
  clause: (alias: string) => string;
}

// ============================================================
// GET /api/wars/analytics
// ============================================================

export const onRequestGet = createEndpoint<AnalyticsResponseDTO, AnalyticsQueryDTO>({
  auth: 'optional',
  etag: true,
  cacheControl: 'public, max-age=300', // 5 minutes

  parseQuery: (searchParams) => ({
    userId: searchParams.get('userId') || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    warIds: searchParams.get('warIds') || undefined,
    userIds: searchParams.get('userIds') || undefined,
    teamIds: searchParams.get('teamIds') || undefined,
    mode: (searchParams.get('mode') as AnalyticsQueryDTO['mode']) || undefined,
    metric: (searchParams.get('metric') as AnalyticsQueryDTO['metric']) || undefined,
    aggregation: (searchParams.get('aggregation') as AnalyticsQueryDTO['aggregation']) || undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    cursor: searchParams.get('cursor') || undefined,
    includePerWar: (searchParams.get('includePerWar') as '0' | '1') || undefined,
    participationOnly: (searchParams.get('participationOnly') as '0' | '1') || undefined,
    opponentNormalized: (searchParams.get('opponentNormalized') as '0' | '1') || undefined,
    normalizationKdaWeight: searchParams.get('normalizationKdaWeight')
      ? Number(searchParams.get('normalizationKdaWeight'))
      : undefined,
    normalizationTowerWeight: searchParams.get('normalizationTowerWeight')
      ? Number(searchParams.get('normalizationTowerWeight'))
      : undefined,
    normalizationDistanceWeight: searchParams.get('normalizationDistanceWeight')
      ? Number(searchParams.get('normalizationDistanceWeight'))
      : undefined,
  }),

  handler: async ({ env, query }) => {
    const warIds = parseCsv(query.warIds);
    const userIds = parseCsv(query.userIds);
    const teamIds = parseCsv(query.teamIds);
    const mode = query.mode ?? 'compare';
    const includeMemberStats = mode !== 'teams';
    const includePerWar = query.includePerWar !== '0' && mode !== 'teams';
    const includeTeamStats = mode === 'teams' || teamIds.length > 0;
    const participationOnly = query.participationOnly !== '0';
    const opponentNormalized = query.opponentNormalized === '1';
    const normalizationConfig = parseNormalizationConfig(query);
    const limit = normalizeLimit(query.limit);
    const offset = normalizeCursor(query.cursor);

    const warFilter = buildWarFilter(query.startDate, query.endDate, warIds);
    const userFilter = buildUserFilter(query.userId, userIds);
    const teamFilter = buildTeamFilter(teamIds);
    const normalizationByWar = opponentNormalized
      ? await loadNormalizationByWar(env.DB, warFilter, normalizationConfig.normalized)
      : new Map<string, NormalizationInfo>();

    let memberStats: AnalyticsMemberStatDTO[] = [];
    if (includeMemberStats) {
      const memberStatsQuery = `
        SELECT
          u.user_id,
          u.username,
          u.wechat_name,
          COALESCE(MAX(mc.class_code), '') as class,
          COUNT(DISTINCT wms.war_id) as wars_participated,
          SUM(COALESCE(wms.kills, 0)) as total_kills,
          SUM(COALESCE(wms.deaths, 0)) as total_deaths,
          SUM(COALESCE(wms.assists, 0)) as total_assists,
          SUM(COALESCE(wms.damage, 0)) as total_damage,
          SUM(COALESCE(wms.healing, 0)) as total_healing,
          SUM(COALESCE(wms.building_damage, 0)) as total_building_damage,
          SUM(COALESCE(wms.damage_taken, 0)) as total_damage_taken,
          SUM(COALESCE(wms.credits, 0)) as total_credits,
          AVG(COALESCE(wms.kills, 0)) as avg_kills,
          AVG(COALESCE(wms.deaths, 0)) as avg_deaths,
          AVG(COALESCE(wms.assists, 0)) as avg_assists,
          AVG(COALESCE(wms.damage, 0)) as avg_damage,
          AVG(COALESCE(wms.healing, 0)) as avg_healing,
          AVG(COALESCE(wms.building_damage, 0)) as avg_building_damage,
          AVG(COALESCE(wms.damage_taken, 0)) as avg_damage_taken,
          AVG(COALESCE(wms.credits, 0)) as avg_credits,
          CASE
            WHEN SUM(COALESCE(wms.deaths, 0)) = 0
              THEN CAST(SUM(COALESCE(wms.kills, 0) + COALESCE(wms.assists, 0)) AS REAL)
            ELSE CAST(SUM(COALESCE(wms.kills, 0) + COALESCE(wms.assists, 0)) AS REAL) / SUM(COALESCE(wms.deaths, 0))
          END as kda_ratio,
          NULL as best_war_id,
          NULL as best_war_value
        FROM war_member_stats wms
        JOIN users u ON u.user_id = wms.user_id
        JOIN war_history wh ON wh.war_id = wms.war_id
        LEFT JOIN member_classes mc ON mc.user_id = u.user_id AND mc.sort_order = 0
        WHERE ${warFilter.clause('wh')} ${userFilter.clause('wms')}
        GROUP BY u.user_id, u.username, u.wechat_name
        HAVING wars_participated > 0
        ORDER BY total_damage DESC, total_kills DESC
      `;

      const memberStatsResult = await env.DB
        .prepare(memberStatsQuery)
        .bind(...warFilter.params, ...userFilter.params)
        .all<AnalyticsMemberStatDTO>();
      memberStats = memberStatsResult.results || [];
    }

    const totalRowsQuery = `
      SELECT COUNT(*) as total
      FROM war_member_stats wms
      JOIN war_history wh ON wh.war_id = wms.war_id
      WHERE ${warFilter.clause('wh')} ${userFilter.clause('wms')}
    `;
    const totalRowsResult = await env.DB
      .prepare(totalRowsQuery)
      .bind(...warFilter.params, ...userFilter.params)
      .first<{ total: number }>();
    const totalRows = Number(totalRowsResult?.total || 0);

    const totalWarsQuery = `
      SELECT COUNT(DISTINCT wh.war_id) as total
      FROM war_history wh
      WHERE ${warFilter.clause('wh')}
    `;
    const totalWarsResult = await env.DB
      .prepare(totalWarsQuery)
      .bind(...warFilter.params)
      .first<{ total: number }>();
    const totalWars = Number(totalWarsResult?.total || 0);

    let perWarStats: AnalyticsPerWarStatDTO[] = [];
    if (includePerWar) {
      const perWarQuery = `
        SELECT
          wh.war_id,
          wh.war_date,
          wh.title,
          wh.result,
          wms.user_id,
          u.username,
          COALESCE(mc.class_code, '') as class,
          wms.kills,
          wms.deaths,
          wms.assists,
          wms.damage,
          wms.healing,
          wms.building_damage,
          wms.damage_taken,
          wms.credits
          ,
          CASE
            WHEN COALESCE(wms.deaths, 0) = 0
              THEN CAST(COALESCE(wms.kills, 0) + COALESCE(wms.assists, 0) AS REAL)
            ELSE CAST(COALESCE(wms.kills, 0) + COALESCE(wms.assists, 0) AS REAL) / wms.deaths
          END as kda,
          wms.note
        FROM war_history wh
        JOIN war_member_stats wms ON wms.war_id = wh.war_id
        JOIN users u ON wms.user_id = u.user_id
        LEFT JOIN member_classes mc ON mc.user_id = u.user_id AND mc.sort_order = 0
        WHERE ${warFilter.clause('wh')} ${userFilter.clause('wms')}
        ORDER BY wh.war_date DESC, wh.war_id DESC, u.username
        LIMIT ?
        OFFSET ?
      `;

      const perWarResult = await env.DB
        .prepare(perWarQuery)
        .bind(...warFilter.params, ...userFilter.params, limit, offset)
        .all<AnalyticsPerWarStatDTO>();
      perWarStats = perWarResult.results || [];
    }

    if (opponentNormalized && perWarStats.length > 0 && normalizationByWar.size > 0) {
      perWarStats = applyNormalizationToPerWarStats(
        perWarStats,
        normalizationByWar,
        normalizationConfig.formulaVersion
      );
      if (includeMemberStats) {
        memberStats = aggregateMemberStatsFromPerWar(
          perWarStats,
          query.metric ?? 'damage',
          memberStats
        );
      }
    }

    let teamStats: AnalyticsTeamStatDTO[] = [];
    if (includeTeamStats) {
      const teamStatsQuery = `
        SELECT
          t.team_id,
          t.name as team_name,
          wh.war_id,
          wh.war_date,
          COUNT(DISTINCT CASE WHEN wms.user_id IS NOT NULL THEN tm.user_id END) as member_count,
          SUM(COALESCE(wms.kills, 0)) as total_kills,
          SUM(COALESCE(wms.deaths, 0)) as total_deaths,
          SUM(COALESCE(wms.assists, 0)) as total_assists,
          SUM(COALESCE(wms.damage, 0)) as total_damage,
          SUM(COALESCE(wms.healing, 0)) as total_healing,
          SUM(COALESCE(wms.building_damage, 0)) as total_building_damage,
          SUM(COALESCE(wms.credits, 0)) as total_credits,
          AVG(COALESCE(wms.kills, 0)) as avg_kills,
          AVG(COALESCE(wms.deaths, 0)) as avg_deaths,
          AVG(COALESCE(wms.assists, 0)) as avg_assists,
          AVG(COALESCE(wms.damage, 0)) as avg_damage,
          AVG(COALESCE(wms.healing, 0)) as avg_healing,
          AVG(COALESCE(wms.building_damage, 0)) as avg_building_damage,
          AVG(COALESCE(wms.credits, 0)) as avg_credits
        FROM war_history wh
        JOIN event_teams et ON et.event_id = wh.event_id
        JOIN teams t ON t.team_id = et.team_id
        LEFT JOIN team_members tm ON tm.team_id = t.team_id
        LEFT JOIN war_member_stats wms ON wms.war_id = wh.war_id AND wms.user_id = tm.user_id
        WHERE ${warFilter.clause('wh')} ${teamFilter.clause('t')}
        GROUP BY t.team_id, t.name, wh.war_id, wh.war_date
        ${participationOnly ? 'HAVING member_count > 0' : ''}
        ORDER BY wh.war_date DESC, t.name ASC
      `;
      const teamStatsResult = await env.DB
        .prepare(teamStatsQuery)
        .bind(...warFilter.params, ...teamFilter.params)
        .all<AnalyticsTeamStatDTO>();
      teamStats = teamStatsResult.results || [];
    }

    if (opponentNormalized && teamStats.length > 0 && normalizationByWar.size > 0) {
      teamStats = applyNormalizationToTeamStats(
        teamStats,
        normalizationByWar,
        normalizationConfig.formulaVersion
      );
    }

    const warResultsQuery = `
      SELECT
        wh.result,
        COUNT(*) as count
      FROM war_history wh
      WHERE ${warFilter.clause('wh')}
      GROUP BY wh.result
    `;
    const warResults = await env.DB.prepare(warResultsQuery).bind(...warFilter.params).all<WarResultRow>();

    const rankings = {
      byKills: [...memberStats].sort((a, b) => (b.total_kills || 0) - (a.total_kills || 0)).slice(0, 10),
      byDamage: [...memberStats].sort((a, b) => (b.total_damage || 0) - (a.total_damage || 0)).slice(0, 10),
      byHealing: [...memberStats].sort((a, b) => (b.total_healing || 0) - (a.total_healing || 0)).slice(0, 10),
      byCredits: [...memberStats].sort((a, b) => (b.total_credits || 0) - (a.total_credits || 0)).slice(0, 10),
    };

    const hasMore = includePerWar ? offset + perWarStats.length < totalRows : false;
    const nextCursor = hasMore ? String(offset + perWarStats.length) : null;
    const meta: AnalyticsMetaDTO = {
      nextCursor,
      hasMore,
      totalWars,
      totalRows,
      samplingApplied: includePerWar && totalRows > limit,
      limit,
      cursor: offset,
      normalizationApplied: opponentNormalized && normalizationByWar.size > 0,
      normalizationFormulaVersion:
        opponentNormalized && normalizationByWar.size > 0
          ? normalizationConfig.formulaVersion
          : null,
      normalizationWeights: normalizationConfig.displayWeights,
    };

    return {
      memberStats,
      perWarStats,
      teamStats,
      rankings,
      warResults: warResults.results || [],
      meta,
    };
  },
});

function parseCsv(value?: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function normalizeLimit(value?: number): number {
  if (!Number.isFinite(value) || !value) return 200;
  return Math.max(1, Math.min(200, Math.floor(value)));
}

function normalizeCursor(cursor?: string): number {
  const parsed = Number(cursor);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
}

function parseNormalizationConfig(query: AnalyticsQueryDTO): NormalizationConfig {
  const kdaRaw = Number(query.normalizationKdaWeight);
  const towersRaw = Number(query.normalizationTowerWeight);
  const distanceRaw = Number(query.normalizationDistanceWeight);

  const hasCustom =
    Number.isFinite(kdaRaw) || Number.isFinite(towersRaw) || Number.isFinite(distanceRaw);

  const buildConfig = (raw: { kda: number; towers: number; distance: number }): NormalizationConfig => {
    const total = raw.kda + raw.towers + raw.distance;
    const normalized =
      total > 0
        ? {
            kda: raw.kda / total,
            towers: raw.towers / total,
            distance: raw.distance / total,
          }
        : {
            kda: 0.6,
            towers: 0.15,
            distance: 0.25,
          };

    const displayWeights = {
      kda: round(normalized.kda * 100),
      towers: round(normalized.towers * 100),
      distance: round(normalized.distance * 100),
    };

    return {
      normalized,
      displayWeights,
      formulaVersion: `kda:${displayWeights.kda}|towers:${displayWeights.towers}|distance:${displayWeights.distance}`,
    };
  };

  if (!hasCustom) {
    return buildConfig({ kda: 60, towers: 15, distance: 25 });
  }

  const kda = Math.max(0, Number.isFinite(kdaRaw) ? kdaRaw : 60);
  const towers = Math.max(0, Number.isFinite(towersRaw) ? towersRaw : 15);
  const distance = Math.max(0, Number.isFinite(distanceRaw) ? distanceRaw : 25);
  return buildConfig({ kda, towers, distance });
}

function buildWarFilter(startDate?: string, endDate?: string, warIds: string[] = []) {
  const clauses: string[] = ['1=1'];
  const params: SqlParam[] = [];

  if (startDate) {
    clauses.push('???.war_date >= ?');
    params.push(startDate);
  }

  if (endDate) {
    clauses.push('???.war_date <= ?');
    params.push(endDate);
  }

  if (warIds.length > 0) {
    clauses.push(`???.war_id IN (${warIds.map(() => '?').join(',')})`);
    params.push(...warIds);
  }

  return {
    params,
    clause(alias: string) {
      return clauses.map((c) => c.replaceAll('???', alias)).join(' AND ');
    },
  };
}

function buildUserFilter(singleUserId?: string, userIds: string[] = []) {
  const effectiveUserIds = singleUserId ? [singleUserId] : userIds;
  if (effectiveUserIds.length === 0) {
    return {
      params: [] as SqlParam[],
      clause: () => '',
    } as SqlFilter;
  }

  return {
    params: [...effectiveUserIds],
    clause(alias: string) {
      return `AND ${alias}.user_id IN (${effectiveUserIds.map(() => '?').join(',')})`;
    },
  } as SqlFilter;
}

function buildTeamFilter(teamIds: string[] = []) {
  if (teamIds.length === 0) {
    return {
      params: [] as SqlParam[],
      clause: () => '',
    } as SqlFilter;
  }

  return {
    params: [...teamIds],
    clause(alias: string) {
      return `AND ${alias}.team_id IN (${teamIds.map(() => '?').join(',')})`;
    },
  } as SqlFilter;
}

async function loadNormalizationByWar(
  db: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        all: <T>() => Promise<{ results?: T[] }>;
      };
    };
  },
  warFilter: SqlFilter,
  weights: NormalizationWeights
): Promise<Map<string, NormalizationInfo>> {
  const query = `
    SELECT
      wh.war_id,
      COALESCE(wh.our_kills, 0) as our_kills,
      COALESCE(wh.enemy_kills, 0) as enemy_kills,
      COALESCE(wh.our_towers, 0) as our_towers,
      COALESCE(wh.enemy_towers, 0) as enemy_towers,
      COALESCE(wh.our_distance, 0) as our_distance,
      COALESCE(wh.enemy_distance, 0) as enemy_distance
    FROM war_history wh
    WHERE ${warFilter.clause('wh')}
  `;

  const rows = await db
    .prepare(query)
    .bind(...warFilter.params)
    .all<{
      war_id: string;
      our_kills: number;
      enemy_kills: number;
      our_towers: number;
      enemy_towers: number;
      our_distance: number;
      enemy_distance: number;
    }>();

  const indices = (rows.results || []).map((row) => {
    const kdaRatioProxy = safeRatio(row.enemy_kills, row.our_kills);
    const towerRatio = safeRatio(row.enemy_towers, row.our_towers);
    const distanceRatio = safeRatio(row.enemy_distance, row.our_distance);
    const enemyStrengthIndex =
      weights.kda * kdaRatioProxy +
      weights.towers * towerRatio +
      weights.distance * distanceRatio;
    return {
      warId: row.war_id,
      enemyStrengthIndex,
    };
  });

  if (indices.length === 0) {
    return new Map<string, NormalizationInfo>();
  }

  const sorted = indices.map((item) => item.enemyStrengthIndex).sort((a, b) => a - b);
  const p33 = quantile(sorted, 0.33);
  const p66 = quantile(sorted, 0.66);
  const medianIndex = quantile(sorted, 0.5);
  const denominator = medianIndex > 0 ? medianIndex : 1;

  const output = new Map<string, NormalizationInfo>();
  for (const item of indices) {
    const factor = clamp(item.enemyStrengthIndex / denominator, 0.7, 1.3);
    const tier: EnemyStrengthTier =
      item.enemyStrengthIndex <= p33 ? 'weak' : item.enemyStrengthIndex >= p66 ? 'strong' : 'normal';

    output.set(item.warId, {
      factor,
      index: item.enemyStrengthIndex,
      tier,
    });
  }

  return output;
}

function applyNormalizationToPerWarStats(
  rows: AnalyticsPerWarStatDTO[],
  normalizationByWar: Map<string, NormalizationInfo>,
  formulaVersion: string
): AnalyticsPerWarStatDTO[] {
  return rows.map((row) => {
    const info = normalizationByWar.get(String(row.war_id));
    if (!info) return row;

    const factor = info.factor;
    return {
      ...row,
      raw_kills: Number(row.kills ?? 0),
      raw_deaths: Number(row.deaths ?? 0),
      raw_assists: Number(row.assists ?? 0),
      raw_damage: Number(row.damage ?? 0),
      raw_healing: Number(row.healing ?? 0),
      raw_building_damage: Number(row.building_damage ?? 0),
      raw_credits: Number(row.credits ?? 0),
      raw_kda: row.kda,
      kills: normalizeHigher(row.kills, factor),
      deaths: normalizeLower(row.deaths, factor),
      assists: normalizeHigher(row.assists, factor),
      damage: normalizeHigher(row.damage, factor),
      healing: normalizeHigher(row.healing, factor),
      building_damage: normalizeHigher(row.building_damage, factor),
      credits: normalizeHigher(row.credits, factor),
      kda: row.kda == null ? null : round(row.kda * factor),
      normalization_factor: round(factor),
      enemy_strength_index: round(info.index),
      enemy_strength_tier: info.tier,
      formula_version: formulaVersion,
    };
  });
}

function applyNormalizationToTeamStats(
  rows: AnalyticsTeamStatDTO[],
  normalizationByWar: Map<string, NormalizationInfo>,
  formulaVersion: string
): AnalyticsTeamStatDTO[] {
  return rows.map((row) => {
    const info = normalizationByWar.get(String(row.war_id));
    if (!info) return row;

    const factor = info.factor;
    const totalKills = normalizeHigher(row.total_kills, factor);
    const totalDeaths = normalizeLower(row.total_deaths, factor);
    const totalAssists = normalizeHigher(row.total_assists, factor);
    const totalDamage = normalizeHigher(row.total_damage, factor);
    const totalHealing = normalizeHigher(row.total_healing, factor);
    const totalBuildingDamage = normalizeHigher(row.total_building_damage, factor);
    const totalCredits = normalizeHigher(row.total_credits, factor);
    const divisor = Math.max(row.member_count || 0, 1);

    return {
      ...row,
      total_kills: totalKills,
      total_deaths: totalDeaths,
      total_assists: totalAssists,
      total_damage: totalDamage,
      total_healing: totalHealing,
      total_building_damage: totalBuildingDamage,
      total_credits: totalCredits,
      avg_kills: round(totalKills / divisor),
      avg_deaths: round(totalDeaths / divisor),
      avg_assists: round(totalAssists / divisor),
      avg_damage: round(totalDamage / divisor),
      avg_healing: round(totalHealing / divisor),
      avg_building_damage: round(totalBuildingDamage / divisor),
      avg_credits: round(totalCredits / divisor),
      normalization_factor: round(factor),
      enemy_strength_index: round(info.index),
      enemy_strength_tier: info.tier,
      formula_version: formulaVersion,
    };
  });
}

function aggregateMemberStatsFromPerWar(
  rows: AnalyticsPerWarStatDTO[],
  bestMetric: NonNullable<AnalyticsQueryDTO['metric']>,
  seedStats: AnalyticsMemberStatDTO[]
): AnalyticsMemberStatDTO[] {
  const byUser = new Map<string, AnalyticsPerWarStatDTO[]>();
  for (const row of rows) {
    const key = String(row.user_id);
    const list = byUser.get(key);
    if (list) {
      list.push(row);
    } else {
      byUser.set(key, [row]);
    }
  }

  const seedByUser = new Map(seedStats.map((s) => [String(s.user_id), s]));
  const output: AnalyticsMemberStatDTO[] = [];

  for (const [userId, userRows] of byUser.entries()) {
    const seed = seedByUser.get(userId);
    const warsParticipated = userRows.length;

    const totalKills = sumBy(userRows, 'kills');
    const totalDeaths = sumBy(userRows, 'deaths');
    const totalAssists = sumBy(userRows, 'assists');
    const totalDamage = sumBy(userRows, 'damage');
    const totalHealing = sumBy(userRows, 'healing');
    const totalBuildingDamage = sumBy(userRows, 'building_damage');
    const totalDamageTaken = sumBy(userRows, 'damage_taken');
    const totalCredits = sumBy(userRows, 'credits');

    let bestWarId: string | null = null;
    let bestWarValue: number | null = null;
    for (const row of userRows) {
      const value = getMetricValue(row, bestMetric);
      if (value == null) continue;
      if (bestWarValue == null || value > bestWarValue) {
        bestWarValue = value;
        bestWarId = String(row.war_id);
      }
    }

    output.push({
      user_id: userId,
      username: userRows[0]?.username ?? seed?.username ?? userId,
      class: userRows[0]?.class ?? seed?.class ?? '',
      wechat_name: seed?.wechat_name,
      wars_participated: warsParticipated,
      total_kills: totalKills,
      total_deaths: totalDeaths,
      total_assists: totalAssists,
      total_damage: totalDamage,
      total_healing: totalHealing,
      total_building_damage: totalBuildingDamage,
      total_damage_taken: totalDamageTaken,
      total_credits: totalCredits,
      avg_kills: round(totalKills / Math.max(warsParticipated, 1)),
      avg_deaths: round(totalDeaths / Math.max(warsParticipated, 1)),
      avg_assists: round(totalAssists / Math.max(warsParticipated, 1)),
      avg_damage: round(totalDamage / Math.max(warsParticipated, 1)),
      avg_healing: round(totalHealing / Math.max(warsParticipated, 1)),
      avg_building_damage: round(totalBuildingDamage / Math.max(warsParticipated, 1)),
      avg_damage_taken: round(totalDamageTaken / Math.max(warsParticipated, 1)),
      avg_credits: round(totalCredits / Math.max(warsParticipated, 1)),
      kda_ratio:
        totalDeaths === 0
          ? round(totalKills + totalAssists)
          : round((totalKills + totalAssists) / totalDeaths),
      best_war_id: bestWarId,
      best_war_value: bestWarValue == null ? null : round(bestWarValue),
    });
  }

  return output.sort((a, b) => (b.total_damage || 0) - (a.total_damage || 0));
}

function sumBy(rows: AnalyticsPerWarStatDTO[], field: keyof AnalyticsPerWarStatDTO): number {
  return round(
    rows.reduce((sum, row) => sum + Number(row[field] ?? 0), 0)
  );
}

function getMetricValue(
  row: AnalyticsPerWarStatDTO,
  metric: NonNullable<AnalyticsQueryDTO['metric']>
): number | null {
  switch (metric) {
    case 'kda':
      return row.kda ?? null;
    case 'damage':
    case 'healing':
    case 'building_damage':
    case 'credits':
    case 'kills':
    case 'deaths':
    case 'assists':
      return Number(row[metric] ?? 0);
    default:
      return null;
  }
}

function normalizeHigher(value: number, factor: number): number {
  return round(Number(value ?? 0) * factor);
}

function normalizeLower(value: number, factor: number): number {
  return round(Number(value ?? 0) / Math.max(factor, 0.0001));
}

function safeRatio(numerator: number | null, denominator: number | null): number {
  return Number(numerator ?? 0) / Math.max(Number(denominator ?? 0), 1);
}

function quantile(sortedValues: number[], q: number): number {
  if (sortedValues.length === 0) return 0;
  const pos = (sortedValues.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sortedValues[base + 1];
  if (next === undefined) return sortedValues[base];
  return sortedValues[base] + rest * (next - sortedValues[base]);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
