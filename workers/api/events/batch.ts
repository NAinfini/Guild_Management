/**
 * Event Batch Operations
 * POST /api/events/batch - Perform batch actions
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../lib/types';
import { createEndpoint } from '../../lib/endpoint-factory';
import { utcNow, createAuditLog } from '../../lib/utils';

// ============================================================
// Types
// ============================================================

interface BatchEventActionBody {
  action: 'delete' | 'archive';
  eventIds: string[];
}

interface BatchEventResponse {
  message: string;
  affectedCount: number;
  action: string;
}

// ============================================================
// POST /api/events/batch
// ============================================================

export const onRequestPost = createEndpoint<BatchEventResponse, BatchEventActionBody, any>({
  auth: 'moderator', // Or admin
  cacheControl: 'no-store',

  parseBody: (body) => {
    if (!body.action || !body.eventIds || !Array.isArray(body.eventIds)) {
      throw new Error('Invalid batch request');
    }
    return body as BatchEventActionBody;
  },

  handler: async ({ env, user, body }) => {
    const { action, eventIds } = body;
    const now = utcNow();
    let affectedCount = 0;

    if (action === 'delete') {
      const placeholders = eventIds.map(() => '?').join(',');
      const result = await env.DB
        .prepare(`
          UPDATE events SET deleted_at_utc = ?, updated_at_utc = ?
          WHERE event_id IN (${placeholders}) AND deleted_at_utc IS NULL
        `)
        .bind(now, now, ...eventIds)
        .run();
      affectedCount = result.meta.changes || 0;
    } else if (action === 'archive') {
      const placeholders = eventIds.map(() => '?').join(',');
      const result = await env.DB
        .prepare(`
          UPDATE events SET is_archived = 1, updated_at_utc = ?
          WHERE event_id IN (${placeholders})
        `)
        .bind(now, ...eventIds)
        .run();
      affectedCount = result.meta.changes || 0;
    }

    if (eventIds.length > 0) {
      await createAuditLog(
        env.DB,
        'event',
        `batch_${action}`,
        user!.user_id,
        'batch',
        `Batch ${action} on ${eventIds.length} events`,
        JSON.stringify({ eventIds, action })
      );
    }

    return {
      message: 'Batch action completed',
      affectedCount,
      action,
    };
  },
});
