/**
 * Guild War Analytics
 * GET /api/wars/analytics - Get war statistics and analytics
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../lib/types';
import { createEndpoint } from '../../lib/endpoint-factory';
import { etagFromTimestamp } from '../../lib/utils';

// ============================================================
// Types
// ============================================================

interface AnalyticsQuery {
  userId?: string;
  startDate?: string;
  endDate?: string;
}

interface AnalyticsResponse {
  memberStats: any[];
  perWarStats: any[];
  rankings: {
    byKills: any[];
    byDamage: any[];
    byHealing: any[];
    byCredits: any[];
  };
  warResults: any[];
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
  }),

  handler: async ({ env, query }) => {
    const buildWhereClause = () => {
      const clauses: string[] = ['1=1'];
      const params: any[] = [];

      if (query.startDate) {
        clauses.push('wh.war_date >= ?');
        params.push(query.startDate);
      }

      if (query.endDate) {
        clauses.push('wh.war_date <= ?');
        params.push(query.endDate);
      }

      return { whereClause: clauses.join(' AND '), params };
    };

    const { userId, startDate, endDate } = query;

    // Get member stats
    const { whereClause: memberWhereClause, params: memberParams } = buildWhereClause();

    const memberStatsQuery = `
      SELECT
        u.user_id,
        u.username,
        u.wechat_name,
        COUNT(DISTINCT wms.war_id) as wars_participated,
        SUM(wms.kills) as total_kills,
        SUM(wms.damage) as total_damage,
        SUM(wms.healing) as total_healing,
        SUM(wms.credits) as total_credits,
        AVG(wms.kills) as avg_kills,
        AVG(wms.damage) as avg_damage,
        AVG(wms.healing) as avg_healing,
        AVG(wms.credits) as avg_credits
      FROM users u
      LEFT JOIN war_member_stats wms ON u.user_id = wms.user_id
      LEFT JOIN war_history wh ON wms.war_id = wh.war_id
      WHERE ${memberWhereClause}
      ${userId ? 'AND u.user_id = ?' : ''}
      GROUP BY u.user_id
      HAVING wars_participated > 0
      ORDER BY total_kills DESC
    `;

    const finalMemberParams = userId ? [...memberParams, userId] : memberParams;
    const memberStatsResult = await env.DB.prepare(memberStatsQuery).bind(...finalMemberParams).all();
    const memberStats = memberStatsResult.results || [];

    // Get per-war stats
    const { whereClause: perWarWhereClause, params: perWarParams } = buildWhereClause();

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
      WHERE ${perWarWhereClause}
      ${userId ? 'AND wms.user_id = ?' : ''}
      ORDER BY wh.war_date DESC, u.username
    `;

    const finalPerWarParams = userId ? [...perWarParams, userId] : perWarParams;
    const perWarResult = await env.DB.prepare(perWarQuery).bind(...finalPerWarParams).all();

    // Get war results summary
    const { whereClause: resultsWhereClause, params: resultsParams } = buildWhereClause();

    const warResultsQuery = `
      SELECT
        result,
        COUNT(*) as count
      FROM war_history wh
      WHERE ${resultsWhereClause}
      GROUP BY result
    `;

    const warResults = await env.DB.prepare(warResultsQuery).bind(...resultsParams).all();

    // Calculate rankings
    const rankings = {
      byKills: [...memberStats].sort((a: any, b: any) => (b.total_kills || 0) - (a.total_kills || 0)).slice(0, 10),
      byDamage: [...memberStats].sort((a: any, b: any) => (b.total_damage || 0) - (a.total_damage || 0)).slice(0, 10),
      byHealing: [...memberStats].sort((a: any, b: any) => (b.total_healing || 0) - (a.total_healing || 0)).slice(0, 10),
      byCredits: [...memberStats].sort((a: any, b: any) => (b.total_credits || 0) - (a.total_credits || 0)).slice(0, 10),
    };

    return {
      memberStats,
      perWarStats: perWarResult.results || [],
      rankings,
      warResults: warResults.results || [],
    };
  },
});
