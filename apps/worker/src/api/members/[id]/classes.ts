/**
 * Member Classes Management
 * PUT /api/members/[id]/classes - Update member classes
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../../core/types';
import { createEndpoint } from '../../../core/endpoint-factory';
import { utcNow, etagFromTimestamp, assertIfMatch, createAuditLog } from '../../../core/utils';

// ============================================================
// Types
// ============================================================

interface UpdateClassesBody {
  classes: string[];
}

interface UpdateClassesResponse {
  message: string;
  classes: string[];
}

// ============================================================
// PUT /api/members/[id]/classes
// ============================================================

export const onRequestPut = createEndpoint<UpdateClassesResponse, any, UpdateClassesBody>({
  auth: 'required',
  cacheControl: 'no-store',

  parseBody: (body) => {
    if (!body.classes || !Array.isArray(body.classes)) {
      throw new Error('classes array is required');
    }
    return body as UpdateClassesBody;
  },

  handler: async ({ env, user, params, body, request, isAdmin, isModerator }) => {
    const userId = params.id;

    // Check permissions (self or admin/mod)
    if (userId !== user!.user_id && !isAdmin && !isModerator) {
      throw new Error('You do not have permission to edit this member');
    }

    const current = await env.DB
      .prepare('SELECT updated_at_utc, created_at_utc FROM users WHERE user_id = ?')
      .bind(userId)
      .first<{ updated_at_utc: string; created_at_utc: string }>();

    const currentEtag = etagFromTimestamp(current?.updated_at_utc || current?.created_at_utc);
    const pre = assertIfMatch(request, currentEtag);
    if (pre) return pre;

    if (!body) throw new Error('Body required');
    const { classes } = body;
    const now = utcNow();

    // Delete existing classes
    await env.DB
      .prepare('DELETE FROM member_classes WHERE user_id = ?')
      .bind(userId)
      .run();

    // Insert new classes
    for (let i = 0; i < classes.length; i++) {
      await env.DB
        .prepare(`
          INSERT INTO member_classes (
            user_id, class_code, sort_order, created_at_utc, updated_at_utc
          ) VALUES (?, ?, ?, ?, ?)
        `)
        .bind(userId, classes[i], i, now, now)
        .run();
    }

    // Update user timestamp
    await env.DB
      .prepare('UPDATE users SET updated_at_utc = ? WHERE user_id = ?')
      .bind(now, userId)
      .run();

    // Create audit log
    await createAuditLog(
      env.DB,
      'member',
      'update_classes',
      user!.user_id,
      userId,
      'Updated classes',
      JSON.stringify({ classes })
    );

    return {
      message: 'Classes updated successfully',
      classes,
    };
  },
});
