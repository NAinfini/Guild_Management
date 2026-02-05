/**
 * Announcement Actions - Pin/Unpin
 * POST /api/announcements/[id]/pin
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env, Announcement } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog } from '../../../lib/utils';

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

export const onRequestPost = createEndpoint<PinAnnouncementResponse, PinAnnouncementBody>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => body as PinAnnouncementBody,

  handler: async ({ env, user, params, body }) => {
    const announcementId = params.id;
    const { isPinned } = body;
    const now = utcNow();

    const result = await env.DB
      .prepare('UPDATE announcements SET is_pinned = ?, updated_at_utc = ? WHERE announcement_id = ?')
      .bind(isPinned ? 1 : 0, now, announcementId)
      .run();

    if (!result.meta.changes) {
      throw new Error('Announcement not found');
    }

    await createAuditLog(
      env.DB,
      'announcement',
      isPinned ? 'pin' : 'unpin',
      user!.user_id,
      announcementId,
      `${isPinned ? 'Pinned' : 'Unpinned'} announcement`,
      null
    );

    return {
      message: `Announcement ${isPinned ? 'pinned' : 'unpinned'} successfully`,
      isPinned,
    };
  },
});
