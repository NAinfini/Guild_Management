/**
 * Event Attachment Management - Individual Attachment
 * DELETE /events/:id/attachments/:mediaId - Remove attachment from event
 */

import { createEndpoint } from '../../../../lib/endpoint-factory';
import { utcNow } from '../../../../../shared/utils/date';

/**
 * DELETE /events/:id/attachments/:mediaId
 */
export const onRequestDelete = createEndpoint<{ success: true }>({
  auth: 'moderator',
  handler: async ({ env, params }) => {
    const eventId = params.id;
    const mediaId = params.mediaId;

    if (!eventId || !mediaId) {
      throw new Error('Event ID and Media ID are required');
    }

    // Check if attachment exists for this event
    const attachment = await env.DB.prepare(
      `SELECT attachment_id, event_id, media_id, sort_order
       FROM event_attachments
       WHERE event_id = ? AND media_id = ?`
    )
      .bind(eventId, mediaId)
      .first();

    if (!attachment) {
      throw new Error('Attachment not found for this event');
    }

    const removedSortOrder = attachment.sort_order as number;

    // Delete the attachment
    await env.DB.prepare(
      `DELETE FROM event_attachments WHERE event_id = ? AND media_id = ?`
    )
      .bind(eventId, mediaId)
      .run();

    // Reorder remaining attachments to fill the gap
    // Decrement sort_order for all attachments that were after the removed one
    await env.DB.prepare(
      `UPDATE event_attachments
       SET sort_order = sort_order - 1, updated_at_utc = ?
       WHERE event_id = ? AND sort_order > ?`
    )
      .bind(utcNow(), eventId, removedSortOrder)
      .run();

    // Note: We do NOT delete from media_objects
    // Media may be used elsewhere (other events, members, announcements)

    return { success: true };
  },
});
