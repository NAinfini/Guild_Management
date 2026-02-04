/**
 * Guild War API - War History
 * GET /api/wars/history - Get war history list
 * POST /api/wars/history - Create history entry
 * PUT /api/wars/history/[id] - Update war stats
 */

import type { PagesFunction, Env } from '../../_types';
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  notFoundResponse,
  generateId,
  utcNow,
  createAuditLog,
} from '../../_utils';
import { withOptionalAuth, withModeratorAuth } from '../../_middleware';

// ============================================================
// GET /api/wars/history - Get War History
// ============================================================

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withOptionalAuth(context, async (authContext) => {
    const { env, request } = authContext;

    try {
      const url = new URL(request.url);
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 500); // Max 500
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');

      // Build query with date filtering
      let query = 'SELECT * FROM war_history WHERE 1=1';
      const params: any[] = [];

      if (startDate) {
        query += ' AND war_date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        query += ' AND war_date <= ?';
        params.push(endDate);
      }

      query += ' ORDER BY war_date DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const wars = await env.DB.prepare(query).bind(...params).all();

      // Get total count with same filters
      let countQuery = 'SELECT COUNT(*) as count FROM war_history WHERE 1=1';
      const countParams: any[] = [];

      if (startDate) {
        countQuery += ' AND war_date >= ?';
        countParams.push(startDate);
      }
      if (endDate) {
        countQuery += ' AND war_date <= ?';
        countParams.push(endDate);
      }

      const countResult = await env.DB
        .prepare(countQuery)
        .bind(...countParams)
        .first<{ count: number }>();

      return successResponse({
        wars: wars.results || [],
        total: countResult?.count || 0,
        limit,
        offset,
      });
    } catch (error) {
      console.error('Get war history error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while fetching war history', 500);
    }
  });
};

// ============================================================
// POST /api/wars/history - Create History Entry
// ============================================================

export const onRequestPost: PagesFunction<Env> = async (context) => {
  return withModeratorAuth(context, async (authContext) => {
    const { request, env } = authContext;
    const { user } = authContext.data;

    try {
      const body = await request.json();
      const {
        eventId,
        warDate,
        title,
        notes,
        ourKills,
        enemyKills,
        ourTowers,
        enemyTowers,
        ourBaseHp,
        enemyBaseHp,
        ourDistance,
        enemyDistance,
        ourCredits,
        enemyCredits,
        result,
      } = body;

      if (!warDate || !title) {
        return badRequestResponse('warDate and title are required');
      }

      const warId = generateId('war');
      const now = utcNow();
      const warDateUtc = new Date(warDate).toISOString().replace('T', ' ').substring(0, 19);

      await env.DB
        .prepare(`
          INSERT INTO war_history (
            war_id, event_id, war_date, title, notes,
            our_kills, enemy_kills, our_towers, enemy_towers,
            our_base_hp, enemy_base_hp, our_distance, enemy_distance,
            our_credits, enemy_credits, result,
            created_by, updated_by, created_at_utc, updated_at_utc
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          warId,
          eventId || null,
          warDateUtc,
          title,
          notes || null,
          ourKills || null,
          enemyKills || null,
          ourTowers || null,
          enemyTowers || null,
          ourBaseHp || null,
          enemyBaseHp || null,
          ourDistance || null,
          enemyDistance || null,
          ourCredits || null,
          enemyCredits || null,
          result || 'unknown',
          user.user_id,
          user.user_id,
          now,
          now
        )
        .run();

      await createAuditLog(
        env.DB,
        'war',
        'create_history',
        user.user_id,
        warId,
        `Created war history: ${title}`,
        JSON.stringify({ warDate, result })
      );

      const war = await env.DB
        .prepare('SELECT * FROM war_history WHERE war_id = ?')
        .bind(warId)
        .first();

      return successResponse({ war }, 201);
    } catch (error) {
      console.error('Create war history error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while creating war history', 500);
    }
  });
};
