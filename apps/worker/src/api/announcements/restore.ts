/**
 * Restore Announcements Endpoint
 * POST /api/announcements/restore
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../core/types';
import { createEndpoint } from '../../core/endpoint-factory';
import { utcNow, createAuditLog } from '../../core/utils';

// ============================================================
// Types
// ============================================================

interface RestoreAnnouncementsBody {
  announcementIds: string[];
}

interface RestoreResponse {
  affectedCount: number;
}

// ============================================================
// POST /api/announcements/restore
// ============================================================

export const onRequestPost = createEndpoint<RestoreResponse, RestoreAnnouncementsBody>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => {
    if (!body.announcementIds || !Array.isArray(body.announcementIds)) {
      throw new Error('announcementIds array required');
    }
    return body as RestoreAnnouncementsBody;
  },

  handler: async ({ env, user, body }) => {
    const { announcementIds } = body;
    const now = utcNow();

    const placeholders = announcementIds.map(() => '?').join(',');
    const result = await env.DB
      .prepare(`
        UPDATE announcements 
        SET deleted_at_utc = NULL, updated_at_utc = ?
        WHERE announcement_id IN (${placeholders})
        AND deleted_at_utc IS NOT NULL
      `)
      .bind(now, ...announcementIds)
      .run();

    if (announcementIds.length > 0) {
      await createAuditLog(
        env.DB,
        'announcement',
        'batch_restore',
        user!.user_id,
        'batch',
        `Restored ${announcementIds.length} announcements`,
        JSON.stringify({ announcementIds })
      );
    }

    return {
      affectedCount: result.meta.changes || 0,
    };
  },
});
