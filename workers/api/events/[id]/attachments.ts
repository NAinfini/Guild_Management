/**
 * Event Attachments Management
 * POST /events/:id/attachments - Attach media to event
 * PUT /events/:id/attachments/reorder - Reorder attachments
 */

import { createEndpoint } from '../../../lib/endpoint-factory';
import { generateId } from '../../../../shared/utils/id';
import { utcNow } from '../../../../shared/utils/date';

interface AttachmentResponse {
  attachment_id: string;
  event_id: string;
  media_id: string;
  sort_order: number;
  url: string;
}

interface AttachmentsListResponse {
  attachments: AttachmentResponse[];
}

/**
 * POST /events/:id/attachments - Attach media to event
 */
export const onRequestPost = createEndpoint<AttachmentsListResponse>({
  auth: 'moderator',
  handler: async ({ env, params, request }) => {
    const eventId = params.id;

    if (!eventId) {
      throw new Error('Event ID is required');
    }

    // Check if event exists
    const event = await env.DB.prepare(
      `SELECT event_id FROM events WHERE event_id = ? AND deleted_at_utc IS NULL`
    )
      .bind(eventId)
      .first();

    if (!event) {
      throw new Error('Event not found');
    }

    // Parse request body
    const body = (await request.json()) as { media_ids: string[] };

    if (!body.media_ids || !Array.isArray(body.media_ids) || body.media_ids.length === 0) {
      throw new Error('media_ids array is required');
    }

    // Check current attachment count
    const countResult = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM event_attachments WHERE event_id = ?`
    )
      .bind(eventId)
      .first<{ count: number }>();

    const currentCount = countResult?.count || 0;

    // Check if adding these media would exceed quota (max 5)
    if (currentCount + body.media_ids.length > 5) {
      throw new Error(`Cannot attach ${body.media_ids.length} media. Event attachment quota is 5 (current: ${currentCount})`);
    }

    // Verify all media IDs exist and are R2 objects
    const mediaCheckQuery = `
      SELECT media_id, storage_type
      FROM media_objects
      WHERE media_id IN (${body.media_ids.map(() => '?').join(',')})
    `;

    const mediaResult = await env.DB.prepare(mediaCheckQuery)
      .bind(...body.media_ids)
      .all();

    const foundMedia = mediaResult.results || [];

    if (foundMedia.length !== body.media_ids.length) {
      throw new Error('One or more media IDs not found');
    }

    // Check if all media are R2 storage type (DB trigger will enforce this, but check upfront)
    const nonR2Media = foundMedia.filter((m: any) => m.storage_type !== 'r2');
    if (nonR2Media.length > 0) {
      throw new Error('Event attachments must reference R2 media objects (no external URLs)');
    }

    // Get current max sort_order
    const maxSortResult = await env.DB.prepare(
      `SELECT COALESCE(MAX(sort_order), -1) as max_sort FROM event_attachments WHERE event_id = ?`
    )
      .bind(eventId)
      .first<{ max_sort: number }>();

    let sortOrder = (maxSortResult?.max_sort || -1) + 1;

    const now = utcNow();
    const attachments: AttachmentResponse[] = [];

    // Insert attachments
    for (const mediaId of body.media_ids) {
      const attachmentId = generateId('att');

      try {
        await env.DB.prepare(
          `INSERT INTO event_attachments (
            attachment_id, event_id, media_id, sort_order,
            created_at_utc, updated_at_utc
          ) VALUES (?, ?, ?, ?, ?, ?)`
        )
          .bind(attachmentId, eventId, mediaId, sortOrder, now, now)
          .run();

        // Get media URL
        const media = await env.DB.prepare(
          `SELECT r2_key FROM media_objects WHERE media_id = ?`
        )
          .bind(mediaId)
          .first<{ r2_key: string }>();

        attachments.push({
          attachment_id: attachmentId,
          event_id: eventId,
          media_id: mediaId,
          sort_order: sortOrder,
          url: media?.r2_key ? `https://your-r2-domain.com/${media.r2_key}` : '',
        });

        sortOrder++;
      } catch (error: any) {
        // Check if quota exceeded (DB trigger)
        if (error.message?.includes('quota exceeded')) {
          throw new Error('Event attachment quota exceeded (max 5 attachments)');
        }
        throw error;
      }
    }

    return { attachments };
  },
});

/**
 * PUT /events/:id/attachments/reorder - Reorder attachments
 */
export const onRequestPut = createEndpoint<AttachmentsListResponse>({
  auth: 'moderator',
  handler: async ({ env, params, request }) => {
    const eventId = params.id;

    if (!eventId) {
      throw new Error('Event ID is required');
    }

    // Parse request body
    const body = (await request.json()) as { attachment_ids: string[] };

    if (!body.attachment_ids || !Array.isArray(body.attachment_ids)) {
      throw new Error('attachment_ids array is required');
    }

    // Verify all attachments belong to this event
    const verifyQuery = `
      SELECT attachment_id
      FROM event_attachments
      WHERE event_id = ? AND attachment_id IN (${body.attachment_ids.map(() => '?').join(',')})
    `;

    const verifyResult = await env.DB.prepare(verifyQuery)
      .bind(eventId, ...body.attachment_ids)
      .all();

    const foundAttachments = verifyResult.results || [];

    if (foundAttachments.length !== body.attachment_ids.length) {
      throw new Error('One or more attachment IDs do not belong to this event');
    }

    const now = utcNow();

    // Update sort_order for each attachment
    for (let i = 0; i < body.attachment_ids.length; i++) {
      await env.DB.prepare(
        `UPDATE event_attachments
         SET sort_order = ?, updated_at_utc = ?
         WHERE attachment_id = ? AND event_id = ?`
      )
        .bind(i, now, body.attachment_ids[i], eventId)
        .run();
    }

    // Fetch updated attachments
    const attachmentsQuery = `
      SELECT ea.attachment_id, ea.event_id, ea.media_id, ea.sort_order, mo.r2_key
      FROM event_attachments ea
      JOIN media_objects mo ON ea.media_id = mo.media_id
      WHERE ea.event_id = ?
      ORDER BY ea.sort_order ASC
    `;

    const attachmentsResult = await env.DB.prepare(attachmentsQuery)
      .bind(eventId)
      .all();

    const attachments = (attachmentsResult.results || []).map((row: any) => ({
      attachment_id: row.attachment_id,
      event_id: row.event_id,
      media_id: row.media_id,
      sort_order: row.sort_order,
      url: row.r2_key ? `https://your-r2-domain.com/${row.r2_key}` : '',
    }));

    return { attachments };
  },
});
