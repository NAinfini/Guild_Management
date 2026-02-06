/**
 * Member Batch Operations
 * POST /api/members/batch - Perform batch actions (delete, role change, etc.)
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../lib/types';
import { createEndpoint } from '../../lib/endpoint-factory';
import { utcNow, createAuditLog } from '../../lib/utils';

// ============================================================
// Types
// ============================================================

interface BatchActionBody {
  action: 'delete' | 'change_role' | 'approve' | 'reject';
  userIds: string[];
  payload?: any;
}

interface BatchResponse {
  message: string;
  affectedCount: number;
  action: string;
}

// ============================================================
// POST /api/members/batch
// ============================================================

export const onRequestPost = createEndpoint<BatchResponse, any, BatchActionBody>({
  auth: 'admin',
  cacheControl: 'no-store',

  parseBody: (body) => {
    if (!body.action || !body.userIds || !Array.isArray(body.userIds)) {
      throw new Error('Invalid batch request');
    }
    return body as BatchActionBody;
  },

  handler: async ({ env, user: admin, body }) => {
    if (!body) throw new Error('Request body is required');
    const { action, userIds, payload } = body;
    const now = utcNow();
    let affectCount = 0;

    if (action === 'delete') {
      const placeholders = userIds.map(() => '?').join(',');
      const result = await env.DB
        .prepare(`
          UPDATE users SET deleted_at_utc = ?, updated_at_utc = ?
          WHERE user_id IN (${placeholders}) AND deleted_at_utc IS NULL
        `)
        .bind(now, now, ...userIds)
        .run();
      
      const sessionResult = await env.DB
        .prepare(`
          UPDATE sessions SET revoked_at_utc = ?, updated_at_utc = ?
          WHERE user_id IN (${placeholders})
        `)
        .bind(now, now, ...userIds)
        .run();

      affectCount = result.meta.changes || 0;
    } else if (action === 'change_role') {
      const targetRole = payload?.role;
      if (!targetRole || !['admin', 'moderator', 'member'].includes(targetRole)) {
        throw new Error('Valid role is required');
      }

      const placeholders = userIds.map(() => '?').join(',');
      const result = await env.DB
        .prepare(`
          UPDATE users SET role = ?, updated_at_utc = ?
          WHERE user_id IN (${placeholders})
        `)
        .bind(targetRole, now, ...userIds)
        .run();
      
      affectCount = result.meta.changes || 0;
    }

    if (userIds.length > 0) {
      await createAuditLog(
        env.DB,
        'member',
        `batch_${action}`,
        admin!.user_id,
        'batch',
        `Batch ${action} on ${userIds.length} users`,
        JSON.stringify({ userIds, action })
      );
    }

    return {
      message: 'Batch action completed',
      affectedCount: affectCount,
      action,
    };
  },
});
