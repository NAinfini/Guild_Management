/**
 * Announcement Media API - Delete
 * DELETE /api/announcements/:id/media/:mediaId - Remove media from announcement
 *
 * Automatically reorders remaining media to fill gaps
 */

import type { Env } from '../../../../core/types';
import { createEndpoint } from '../../../../core/endpoint-factory';
import { utcNow, createAuditLog } from '../../../../core/utils';
import { NotFoundError } from '../../../../core/errors';

/**
 * DELETE /api/announcements/:id/media/:mediaId - Remove media attachment
 */
export const onRequestDelete = createEndpoint<{ success: true; message: string }>({
  auth: 'moderator',
  cacheControl: 'no-store',

  handler: async ({ env, user, params }) => {
    const announcementId = params.id;
    const mediaId = params.mediaId;

    // Check announcement exists
    const announcement = await env.DB
      .prepare('SELECT * FROM announcements WHERE announcement_id = ?')
      .bind(announcementId)
      .first();

    if (!announcement) {
      throw new NotFoundError('Announcement');
    }

    // Check attachment exists
    const attachment = await env.DB
      .prepare('SELECT * FROM announcement_media WHERE announcement_id = ? AND media_id = ?')
      .bind(announcementId, mediaId)
      .first();

    if (!attachment) {
      throw new NotFoundError('Media attachment');
    }

    // Delete the attachment
    await env.DB
      .prepare('DELETE FROM announcement_media WHERE announcement_id = ? AND media_id = ?')
      .bind(announcementId, mediaId)
      .run();

    // Reorder remaining attachments to fill gap
    const remaining = await env.DB
      .prepare(
        `SELECT media_id FROM announcement_media
         WHERE announcement_id = ?
         ORDER BY sort_order ASC`
      )
      .bind(announcementId)
      .all();

    const now = utcNow();

    // Update sort_order for remaining attachments
    if (remaining.results && remaining.results.length > 0) {
      for (let i = 0; i < remaining.results.length; i++) {
        const row = remaining.results[i] as any;
        await env.DB
          .prepare(
            `UPDATE announcement_media
             SET sort_order = ?, updated_at_utc = ?
             WHERE announcement_id = ? AND media_id = ?`
          )
          .bind(i, now, announcementId, row.media_id)
          .run();
      }
    }

    // Audit log
    await createAuditLog(
      env.DB,
      'announcement',
      'remove_media',
      user!.user_id,
      announcementId,
      `Removed media ${mediaId} from announcement`,
      undefined,
    );

    return {
      success: true,
      message: 'Media attachment removed successfully',
    };
  },
});
