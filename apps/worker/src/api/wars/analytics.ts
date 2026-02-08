/**
 * Guild War Analytics
 * GET /api/wars/analytics - Get war statistics and analytics
 */

import { createEndpoint } from '../../core/endpoint-factory';

// ============================================================
// Types
// ============================================================

interface AnalyticsQuery {
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

interface AnalyticsResponse {
  memberStats: any[];
  perWarStats: any[];
  teamStats: any[];
  rankings: {
    byKills: any[];
    byDamage: any[];
    byHealing: any[];
    byCredits: any[];
  };
  warResults: any[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
    totalWars: number;
    totalRows: number;
    samplingApplied: boolean;
  };
}

// ============================================================
// GET /api/wars/analytics
// ============================================================

export const onRequestGet = createEndpoint<AnalyticsResponse, AnalyticsQuery>({
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
    mode: (searchParams.get('mode') as AnalyticsQuery['mode']) || undefined,
    metric: searchParams.get('metric') || undefined,
    aggregation: (searchParams.get('aggregation') as AnalyticsQuery['aggregation']) || undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    cursor: searchParams.get('cursor') || undefined,
    includePerWar: (searchParams.get('includePerWar') as '0' | '1') || undefined,
  }),

  handler: async ({ env, query }) => {
    const warIds = parseCsv(query.warIds);
    const userIds = parseCsv(query.userIds);
    const teamIds = parseCsv(query.teamIds);
    const includePerWar = query.includePerWar !== '0';
    const limit = normalizeLimit(query.limit);
    const offset = normalizeCursor(query.cursor);

    const warFilter = buildWarFilter(query.startDate, query.endDate, warIds);
    const userFilter = buildUserFilter(query.userId, userIds);
    const teamFilter = buildTeamFilter(teamIds);

    const memberStatsQuery = `
      SELECT
        u.user_id,
        u.username,
        u.wechat_name,
        COUNT(DISTINCT wms.war_id) as wars_participated,
        SUM(COALESCE(wms.kills, 0)) as total_kills,
        SUM(COALESCE(wms.damage, 0)) as total_damage,
        SUM(COALESCE(wms.healing, 0)) as total_healing,
        SUM(COALESCE(wms.credits, 0)) as total_credits,
        AVG(COALESCE(wms.kills, 0)) as avg_kills,
        AVG(COALESCE(wms.damage, 0)) as avg_damage,
        AVG(COALESCE(wms.healing, 0)) as avg_healing,
        AVG(COALESCE(wms.credits, 0)) as avg_credits
      FROM war_member_stats wms
      JOIN users u ON u.user_id = wms.user_id
      JOIN war_history wh ON wh.war_id = wms.war_id
      WHERE ${warFilter.clause('wh')} ${userFilter.clause('wms')}
      GROUP BY u.user_id
      HAVING wars_participated > 0
      ORDER BY total_kills DESC
    `;

    const memberStatsResult = await env.DB
      .prepare(memberStatsQuery)
      .bind(...warFilter.params, ...userFilter.params)
      .all();
    const memberStats = memberStatsResult.results || [];

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

    let perWarStats: any[] = [];
    if (includePerWar) {
      const perWarQuery = `
        SELECT
          wh.war_id,
          wh.war_date,
          wh.title,
          wh.result,
          wms.user_id,
          u.username,
          wms.kills,
          wms.damage,
          wms.healing,
          wms.credits
        FROM war_history wh
        JOIN war_member_stats wms ON wms.war_id = wh.war_id
        JOIN users u ON wms.user_id = u.user_id
        WHERE ${warFilter.clause('wh')} ${userFilter.clause('wms')}
        ORDER BY wh.war_date DESC, u.username
        LIMIT ?
        OFFSET ?
      `;

      const perWarResult = await env.DB
        .prepare(perWarQuery)
        .bind(...warFilter.params, ...userFilter.params, limit, offset)
        .all();
      perWarStats = perWarResult.results || [];
    }

    const teamStatsQuery = `
      SELECT
        t.team_id,
        t.name as team_name,
        wh.war_id,
        wh.war_date,
        COUNT(DISTINCT tm.user_id) as member_count,
        SUM(COALESCE(wms.kills, 0)) as total_kills,
        SUM(COALESCE(wms.damage, 0)) as total_damage,
        SUM(COALESCE(wms.healing, 0)) as total_healing,
        SUM(COALESCE(wms.credits, 0)) as total_credits
      FROM war_history wh
      JOIN event_teams et ON et.event_id = wh.event_id
      JOIN teams t ON t.team_id = et.team_id
      LEFT JOIN team_members tm ON tm.team_id = t.team_id
      LEFT JOIN war_member_stats wms ON wms.war_id = wh.war_id AND wms.user_id = tm.user_id
      WHERE ${warFilter.clause('wh')} ${teamFilter.clause('t')}
      GROUP BY t.team_id, t.name, wh.war_id, wh.war_date
      ORDER BY wh.war_date DESC, t.name ASC
    `;
    const teamStatsResult = await env.DB
      .prepare(teamStatsQuery)
      .bind(...warFilter.params, ...teamFilter.params)
      .all();
    const teamStats = teamStatsResult.results || [];

    const warResultsQuery = `
      SELECT
        wh.result,
        COUNT(*) as count
      FROM war_history wh
      WHERE ${warFilter.clause('wh')}
      GROUP BY wh.result
    `;
    const warResults = await env.DB.prepare(warResultsQuery).bind(...warFilter.params).all();

    const rankings = {
      byKills: [...memberStats].sort((a: any, b: any) => (b.total_kills || 0) - (a.total_kills || 0)).slice(0, 10),
      byDamage: [...memberStats].sort((a: any, b: any) => (b.total_damage || 0) - (a.total_damage || 0)).slice(0, 10),
      byHealing: [...memberStats].sort((a: any, b: any) => (b.total_healing || 0) - (a.total_healing || 0)).slice(0, 10),
      byCredits: [...memberStats].sort((a: any, b: any) => (b.total_credits || 0) - (a.total_credits || 0)).slice(0, 10),
    };

    const hasMore = includePerWar ? offset + perWarStats.length < totalRows : false;
    const nextCursor = hasMore ? String(offset + perWarStats.length) : null;

    return {
      memberStats,
      perWarStats,
      teamStats,
      rankings,
      warResults: warResults.results || [],
      meta: {
        nextCursor,
        hasMore,
        totalWars,
        totalRows,
        samplingApplied: includePerWar && totalRows > limit,
      },
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
  return Math.max(1, Math.min(500, Math.floor(value)));
}

function normalizeCursor(cursor?: string): number {
  const parsed = Number(cursor);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
}

function buildWarFilter(startDate?: string, endDate?: string, warIds: string[] = []) {
  const clauses: string[] = ['1=1'];
  const params: any[] = [];

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
      params: [] as any[],
      clause: () => '',
    };
  }

  return {
    params: [...effectiveUserIds],
    clause(alias: string) {
      return `AND ${alias}.user_id IN (${effectiveUserIds.map(() => '?').join(',')})`;
    },
  };
}

function buildTeamFilter(teamIds: string[] = []) {
  if (teamIds.length === 0) {
    return {
      params: [] as any[],
      clause: () => '',
    };
  }

  return {
    params: [...teamIds],
    clause(alias: string) {
      return `AND ${alias}.team_id IN (${teamIds.map(() => '?').join(',')})`;
    },
  };
}
