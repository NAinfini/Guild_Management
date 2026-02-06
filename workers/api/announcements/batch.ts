/**
 * Announcement Batch Operations
 * POST /api/announcements/batch
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../lib/types';
import { createEndpoint } from '../../lib/endpoint-factory';
import { utcNow, createAuditLog } from '../../lib/utils';

// ============================================================
// Types
// ============================================================

interface BatchAnnouncementBody {
  action: 'delete' | 'archive';
  announcementIds: string[];
}

interface BatchAnnouncementResponse {
  message: string;
  affectedCount: number;
  action: string;
}

// ============================================================
// POST /api/announcements/batch
// ============================================================

export const onRequestPost = createEndpoint<BatchAnnouncementResponse, any, BatchAnnouncementBody>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => {
    if (!body || !body.action || !body.announcementIds || !Array.isArray(body.announcementIds)) {
      throw new Error('Invalid batch request');
    }
    return body as BatchAnnouncementBody;
  },

  handler: async ({ env, user, body }) => {
    if (!body) throw new Error('Body required');
    const { action, announcementIds } = body;
    const now = utcNow();
    let affectedCount = 0;

    if (action === 'delete') {
      const placeholders = announcementIds.map(() => '?').join(',');
      const result = await env.DB
        .prepare(`
          UPDATE announcements SET deleted_at_utc = ?, updated_at_utc = ?
          WHERE announcement_id IN (${placeholders}) AND deleted_at_utc IS NULL
        `)
        .bind(now, now, ...announcementIds)
        .run();
      affectedCount = result.meta.changes || 0;
    } else if (action === 'archive') {
      const placeholders = announcementIds.map(() => '?').join(',');
      const result = await env.DB
        .prepare(`
          UPDATE announcements SET is_archived = 1, updated_at_utc = ?
          WHERE announcement_id IN (${placeholders})
        `)
        .bind(now, ...announcementIds)
        .run();
      affectedCount = result.meta.changes || 0;
    }

    if (announcementIds.length > 0) {
      await createAuditLog(
        env.DB,
        'announcement',
        `batch_${action}`,
        user!.user_id,
        'batch',
        `Batch ${action} on ${announcementIds.length} announcements`,
        JSON.stringify({ announcementIds, action })
      );
    }

    return {
      message: 'Batch action completed',
      affectedCount,
      action,
    };
  },
});
