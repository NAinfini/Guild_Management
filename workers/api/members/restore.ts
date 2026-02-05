/**
 * Restore Members Endpoint
 * POST /api/members/restore
 * Restores soft-deleted members
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../lib/types';
import { createEndpoint } from '../../lib/endpoint-factory';
import { utcNow, createAuditLog } from '../../lib/utils';

// ============================================================
// Types
// ============================================================

interface RestoreMembersBody {
  userIds: string[];
}

interface RestoreResponse {
  affectedCount: number;
}

// ============================================================
// POST /api/members/restore
// ============================================================

export const onRequestPost = createEndpoint<RestoreResponse, RestoreMembersBody>({
  auth: 'admin',
  cacheControl: 'no-store',

  parseBody: (body) => {
    if (!body.userIds || !Array.isArray(body.userIds)) {
      throw new Error('userIds array required');
    }
    return body as RestoreMembersBody;
  },

  handler: async ({ env, user: admin, body }) => {
    const { userIds } = body;
    const now = utcNow();

    const placeholders = userIds.map(() => '?').join(',');
    const result = await env.DB
      .prepare(`
        UPDATE users 
        SET deleted_at_utc = NULL, updated_at_utc = ?
        WHERE user_id IN (${placeholders})
        AND deleted_at_utc IS NOT NULL
      `)
      .bind(now, ...userIds)
      .run();

    if (userIds.length > 0) {
      await createAuditLog(
        env.DB,
        'member',
        'batch_restore',
        admin!.user_id,
        'batch',
        `Restored ${userIds.length} users`,
        JSON.stringify({ userIds })
      );
    }

    return {
      affectedCount: result.meta.changes || 0,
    };
  },
});
