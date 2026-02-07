/**
 * Restore Events Endpoint
 * POST /api/events/restore
 * Restores soft-deleted events
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../core/types';
import { createEndpoint } from '../../core/endpoint-factory';
import { utcNow, createAuditLog } from '../../core/utils';

// ============================================================
// Types
// ============================================================

interface RestoreEventsBody {
  eventIds: string[];
}

interface RestoreEventsResponse {
  affectedCount: number;
}

// ============================================================
// POST /api/events/restore
// ============================================================

export const onRequestPost = createEndpoint<RestoreEventsResponse, RestoreEventsBody, any>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => {
    if (!body.eventIds || !Array.isArray(body.eventIds)) {
      throw new Error('eventIds array required');
    }
    return body as RestoreEventsBody;
  },

  handler: async ({ env, user, body }) => {
    const { eventIds } = body;
    const now = utcNow();

    const placeholders = eventIds.map(() => '?').join(',');
    const result = await env.DB
      .prepare(`
        UPDATE events 
        SET deleted_at_utc = NULL, updated_at_utc = ?
        WHERE event_id IN (${placeholders})
        AND deleted_at_utc IS NOT NULL
      `)
      .bind(now, ...eventIds)
      .run();

    if (eventIds.length > 0) {
      await createAuditLog(
        env.DB,
        'event',
        'batch_restore',
        user!.user_id,
        'batch',
        `Restored ${eventIds.length} events`,
        JSON.stringify({ eventIds })
      );
    }

    return {
      affectedCount: result.meta.changes || 0,
    };
  },
});
