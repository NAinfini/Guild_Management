/**
 * War Analytics API
 * GET /api/wars/analytics - Get aggregated war analytics
 */

import type { PagesFunction, Env } from '../../_types';
import { successResponse, errorResponse, etagFromTimestamp } from '../../_utils';
import { withAuth } from '../../_middleware';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withAuth(context, async (authContext) => {
    const { env, request } = authContext;

    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');
      const warIds = url.searchParams.get('warIds')?.split(',').map(Number).filter(n => !isNaN(n));

      // Build WHERE conditions
      const buildWhereClause = (alias: string = 'wh') => {
        const conditions: string[] = ['1=1'];
        const params: any[] = [];

        if (startDate) {
          conditions.push(`${alias}.war_date >= ?`);
          params.push(startDate);
        }
        if (endDate) {
          conditions.push(`${alias}.war_date <= ?`);
          params.push(endDate);
        }
        if (warIds && warIds.length > 0) {
          conditions.push(`${alias}.war_id IN (${warIds.map(() => '?').join(',')})`);
          params.push(...warIds);
        }

        return { whereClause: conditions.join(' AND '), params };
      };

      // Get member stats aggregated across selected wars
      const { whereClause: memberWhereClause, params: memberParams } = buildWhereClause('wh');

      const memberQuery = `
        SELECT
          wms.user_id,
          u.username,
          u.class_code as class,
          u.avatar_url,
          COUNT(DISTINCT wms.war_id) as wars_participated,
          SUM(wms.kills) as total_kills,
          SUM(wms.deaths) as total_deaths,
          SUM(wms.assists) as total_assists,
          SUM(wms.damage) as total_damage,
          SUM(wms.healing) as total_healing,
          SUM(wms.building_damage) as total_building_damage,
          SUM(wms.damage_taken) as total_damage_taken,
          SUM(wms.credits) as total_credits,
          AVG(wms.kills) as avg_kills,
          AVG(wms.deaths) as avg_deaths,
          AVG(wms.assists) as avg_assists,
          AVG(wms.damage) as avg_damage,
          AVG(wms.healing) as avg_healing,
          AVG(wms.building_damage) as avg_building_damage,
          AVG(wms.credits) as avg_credits,
          AVG(wms.damage_taken) as avg_damage_taken,
          MAX(wms.damage) as best_war_value
        FROM war_member_stats wms
        JOIN users u ON wms.user_id = u.user_id
        JOIN war_history wh ON wms.war_id = wh.war_id
        WHERE ${memberWhereClause}
        ${userId ? 'AND wms.user_id = ?' : ''}
        GROUP BY wms.user_id, u.username, u.class_code, u.avatar_url
        ORDER BY total_damage DESC
      `;

      const finalMemberParams = userId ? [...memberParams, userId] : memberParams;
      const memberResult = await env.DB.prepare(memberQuery).bind(...finalMemberParams).all();

      // Calculate KDA ratio for each member
      const memberStats = (memberResult.results || []).map((row: any) => ({
        ...row,
        kda_ratio: row.total_deaths === 0 || row.total_deaths === null
          ? (row.total_kills || 0) + (row.total_assists || 0)
          : ((row.total_kills || 0) + (row.total_assists || 0)) / row.total_deaths,
      }));

      // Get per-war stats for selected wars
      const { whereClause: perWarWhereClause, params: perWarParams } = buildWhereClause('wh');

      const perWarQuery = `
        SELECT
          wms.war_id,
          wh.war_date,
          wh.title as war_title,
          wms.user_id,
          u.username,
          u.class_code as class,
          wms.kills,
          wms.deaths,
          wms.assists,
          wms.damage,
          wms.healing,
          wms.building_damage,
          wms.credits,
          wms.damage_taken,
          CASE
            WHEN wms.deaths IS NULL OR wms.deaths = 0
            THEN wms.kills + wms.assists
            ELSE (wms.kills + wms.assists) * 1.0 / wms.deaths
          END as kda
        FROM war_member_stats wms
        JOIN war_history wh ON wms.war_id = wh.war_id
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

      // Calculate rankings (for backward compatibility)
      const rankings = {
        byKills: [...memberStats].sort((a: any, b: any) => (b.total_kills || 0) - (a.total_kills || 0)).slice(0, 10),
        byDamage: [...memberStats].sort((a: any, b: any) => (b.total_damage || 0) - (a.total_damage || 0)).slice(0, 10),
        byHealing: [...memberStats].sort((a: any, b: any) => (b.total_healing || 0) - (a.total_healing || 0)).slice(0, 10),
        byCredits: [...memberStats].sort((a: any, b: any) => (b.total_credits || 0) - (a.total_credits || 0)).slice(0, 10),
      };

      const maxUpdatedRow = await env.DB.prepare('SELECT MAX(updated_at_utc) as ts FROM war_history').first<{ ts: string }>();
      const etag = etagFromTimestamp(maxUpdatedRow?.ts || null);

      const resp = successResponse({
        memberStats,
        perWarStats: perWarResult.results || [],
        rankings,
        warResults: warResults.results || [],
      });
      if (etag) resp.headers.set('ETag', etag);
      return resp;
    } catch (error) {
      console.error('Get analytics error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while fetching analytics', 500);
    }
  });
};
