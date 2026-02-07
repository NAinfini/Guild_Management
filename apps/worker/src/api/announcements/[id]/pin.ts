/**
 * Announcement Actions - Pin/Unpin
 * POST /api/announcements/[id]/pin
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env, Announcement } from '../../../core/types';
import { createEndpoint } from '../../../core/endpoint-factory';
import { broadcastUpdate } from '../../../core/broadcast';
import { utcNow, createAuditLog } from '../../../core/utils';
import { NotFoundError } from '../../../core/errors';

// ============================================================
// Types
// ============================================================

interface PinAnnouncementBody {
  isPinned: boolean;
}

interface PinAnnouncementResponse {
  message: string;
  isPinned: boolean;
}

// ============================================================
// POST /api/announcements/[id]/pin
// ============================================================

export const onRequestPost = createEndpoint<PinAnnouncementResponse, any, PinAnnouncementBody>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => body as PinAnnouncementBody,

  handler: async ({ env, user, params, body, waitUntil }) => {
    if (!body) throw new Error('Body required');
    const announcementId = params.id;
    const { isPinned } = body;
    const now = utcNow();

    const result = await env.DB
      .prepare('UPDATE announcements SET is_pinned = ?, updated_at_utc = ? WHERE announcement_id = ?')
      .bind(isPinned ? 1 : 0, now, announcementId)
      .run();

    if (!result.meta.changes) {
      throw new NotFoundError('Announcement');
    }

    await createAuditLog(
      env.DB,
      'announcement',
      isPinned ? 'pin' : 'unpin',
      user!.user_id,
      announcementId,
      `${isPinned ? 'Pinned' : 'Unpinned'} announcement`,
      undefined
    );

    const updatedAnnouncement = await env.DB
      .prepare('SELECT * FROM announcements WHERE announcement_id = ?')
      .bind(announcementId)
      .first<Announcement>();

    if (updatedAnnouncement) {
      waitUntil(broadcastUpdate(env, {
        entity: 'announcements',
        action: 'updated',
        payload: [updatedAnnouncement],
        ids: [announcementId],
        excludeUserId: user!.user_id,
      }));
    }

    return {
      message: `Announcement ${isPinned ? 'pinned' : 'unpinned'} successfully`,
      isPinned,
    };
  },
});
