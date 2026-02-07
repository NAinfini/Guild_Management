/**
 * Member Progression Tracking
 * PUT /api/members/[id]/progression - Update progression item
 * GET /api/members/[id]/progression - Get all progression
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../../core/types';
import { createEndpoint } from '../../../core/endpoint-factory';
import { utcNow, etagFromTimestamp, assertIfMatch, createAuditLog } from '../../../core/utils';

// ============================================================
// Types
// ============================================================

interface UpdateProgressionBody {
  category: string;
  itemId: string;
  level: number;
}

interface ProgressionResponse {
  message: string;
  progression: any;
}

interface GetProgressionResponse {
  progression: any[];
}

// ============================================================
// PUT /api/members/[id]/progression
// ============================================================

export const onRequestPut = createEndpoint<ProgressionResponse, any, UpdateProgressionBody>({
  auth: 'required',
  cacheControl: 'no-store',

  parseBody: (body) => {
    if (!body.category || !body.itemId || typeof body.level !== 'number') {
      throw new Error('category, itemId, and level are required');
    }
    return body as UpdateProgressionBody;
  },

  handler: async ({ env, user, params, body, request }) => {
    const userId = params.id;

    // Only self can update progression
    if (userId !== user!.user_id) {
      throw new Error('You can only update your own progression');
    }

    const currentUserRow = await env.DB
      .prepare('SELECT updated_at_utc, created_at_utc FROM users WHERE user_id = ?')
      .bind(userId)
      .first<{ updated_at_utc: string; created_at_utc: string }>();

    const currentEtag = etagFromTimestamp(currentUserRow?.updated_at_utc || currentUserRow?.created_at_utc);
    const pre = assertIfMatch(request, currentEtag);
    if (pre) return pre;

    if (!body) throw new Error('Body required');
    const { category, itemId, level } = body;
    const now = utcNow();

    // Check if progression exists
    const existing = await env.DB
      .prepare('SELECT * FROM member_progression WHERE user_id = ? AND category = ? AND item_id = ?')
      .bind(userId, category, itemId)
      .first();

    if (existing) {
      // Update
      await env.DB
        .prepare(`
          UPDATE member_progression 
          SET level = ?, updated_at_utc = ? 
          WHERE user_id = ? AND category = ? AND item_id = ?
        `)
        .bind(level, now, userId, category, itemId)
        .run();
    } else {
      // Insert
      await env.DB
        .prepare(`
          INSERT INTO member_progression (
            user_id, category, item_id, level, created_at_utc, updated_at_utc
          ) VALUES (?, ?, ?, ?, ?, ?)
        `)
        .bind(userId, category, itemId, level, now, now)
        .run();
    }

    // Update user timestamp (to invalidate etag)
    await env.DB
      .prepare('UPDATE users SET updated_at_utc = ? WHERE user_id = ?')
      .bind(now, userId)
      .run();

    const updated = await env.DB
      .prepare('SELECT * FROM member_progression WHERE user_id = ? AND category = ? AND item_id = ?')
      .bind(userId, category, itemId)
      .first();

    // Create audit log
    await createAuditLog(
      env.DB,
      'member',
      'update_progression',
      user!.user_id,
      userId,
      `Updated ${category}: ${itemId}`,
      JSON.stringify({ category, itemId, level })
    );

    return {
      message: 'Progression updated',
      progression: updated,
    };
  },
});

// ============================================================
// GET /api/members/[id]/progression
// ============================================================

export const onRequestGet = createEndpoint<GetProgressionResponse>({
  auth: 'optional',
  etag: true,
  cacheControl: 'public, max-age=60',

  handler: async ({ env, params }) => {
    const userId = params.id;

    const progression = await env.DB
      .prepare('SELECT * FROM member_progression WHERE user_id = ?')
      .bind(userId)
      .all();

    return {
      progression: progression.results || [],
    };
  },
});
