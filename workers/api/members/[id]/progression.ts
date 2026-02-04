/**
 * Member Progression Tracking
 * PUT /api/members/[id]/progression - Update progression item
 * GET /api/members/[id]/progression - Get all progression
 */

import type { PagesFunction, Env } from '../../_types';
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  forbiddenResponse,
  utcNow,
  etagFromTimestamp,
  assertIfMatch,
} from '../../_utils';
import { withAuth } from '../../_middleware';
import { validateBody, progressionUpdateSchema } from '../../_validation';

// ============================================================
// PUT /api/members/[id]/progression - Update Progression
// ============================================================

export const onRequestPut: PagesFunction<Env> = async (context: any) => {
  return withAuth(context, async (authContext: any) => {
    const { request, env, params } = authContext;
    const { user } = authContext.data;
    const userId = params.id;

    // Only self can update progression
    if (userId !== user.user_id) {
      return forbiddenResponse('You can only update your own progression');
    }

    const currentUserRow = await env.DB
      .prepare('SELECT updated_at_utc, created_at_utc FROM users WHERE user_id = ?')
      .bind(userId)
      .first<{ updated_at_utc: string; created_at_utc: string }>();
    const currentEtag = etagFromTimestamp(currentUserRow?.updated_at_utc || currentUserRow?.created_at_utc);
    const pre = assertIfMatch(request, currentEtag);
    if (pre) return pre;

    const validation = await validateBody(request, progressionUpdateSchema);
    if (!validation.success) {
      return badRequestResponse('Invalid request body', validation.error.errors);
    }

    const { category, itemId, level } = validation.data;

    try {
      const now = utcNow();

      // Check if progression exists
      const existing = await env.DB
        .prepare('SELECT * FROM member_progression WHERE user_id = ? AND category = ? AND item_id = ?')
        .bind(userId, category, itemId)
        .first();

      if (existing) {
        // Update existing
        await env.DB
          .prepare('UPDATE member_progression SET level = ?, updated_at_utc = ? WHERE user_id = ? AND category = ? AND item_id = ?')
          .bind(level, now, userId, category, itemId)
          .run();
      } else {
        // Insert new
        await env.DB
          .prepare(`
            INSERT INTO member_progression (user_id, category, item_id, level, created_at_utc, updated_at_utc)
            VALUES (?, ?, ?, ?, ?, ?)
          `)
          .bind(userId, category, itemId, level, now, now)
          .run();
      }

    const updatedUser = await env.DB
      .prepare('SELECT updated_at_utc FROM users WHERE user_id = ?')
      .bind(userId)
      .first<{ updated_at_utc: string }>();
    const etag = etagFromTimestamp(updatedUser?.updated_at_utc || currentUserRow?.updated_at_utc);

    const resp = successResponse({
      message: 'Progression updated successfully',
      category,
      itemId,
      level,
    });
    if (etag) resp.headers.set('ETag', etag);
    return resp;
    } catch (error) {
      console.error('Update progression error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while updating progression', 500);
    }
  });
};

// ============================================================
// GET /api/members/[id]/progression - Get Progression
// ============================================================

export const onRequestGet: PagesFunction<Env> = async (context: any) => {
  return withAuth(context, async (authContext: any) => {
    const { env, params } = authContext;
    const userId = params.id;

    try {
      const result = await env.DB
        .prepare('SELECT * FROM member_progression WHERE user_id = ? ORDER BY category, item_id')
        .bind(userId)
        .all();

      // Group by category
      const grouped = (result.results || []).reduce((acc: any, item: any) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push({
          itemId: item.item_id,
          level: item.level,
        });
        return acc;
      }, {});

      const userRow = await env.DB
        .prepare('SELECT updated_at_utc, created_at_utc FROM users WHERE user_id = ?')
        .bind(userId)
        .first<{ updated_at_utc: string; created_at_utc: string }>();
      const etag = etagFromTimestamp(userRow?.updated_at_utc || userRow?.created_at_utc);

      const resp = successResponse({ progression: grouped });
      if (etag) resp.headers.set('ETag', etag);
      return resp;
    } catch (error) {
      console.error('Get progression error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while fetching progression', 500);
    }
  });
};
