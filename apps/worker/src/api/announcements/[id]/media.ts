/**
 * Announcement Media API
 * POST /api/announcements/:id/media - Attach media to announcement
 * PUT /api/announcements/:id/media - Reorder media attachments
 *
 * Max 10 images per announcement (enforced by DB trigger)
 * Only R2 storage allowed (enforced by DB trigger)
 */

import type { Env } from '../../../core/types';
import { createEndpoint } from '../../../core/endpoint-factory';
import { utcNow, createAuditLog, generateId } from '../../../core/utils';
import { NotFoundError } from '../../../core/errors';

interface AttachMediaRequest {
  media_ids: string[];
}

interface ReorderMediaRequest {
  media_ids: string[]; // Full ordered list of media IDs
}

interface AnnouncementMedia {
  announcement_id: string;
  media_id: string;
  sort_order: number;
  created_at_utc: string;
  url: string;
}

/**
 * POST /api/announcements/:id/media - Attach media to announcement
 */
export const onRequestPost = createEndpoint<{ message: string; attachments: AnnouncementMedia[] }>({
  auth: 'moderator',
  cacheControl: 'no-store',

  handler: async ({ env, user, params, request }) => {
    const announcementId = params.id;
    const body = (await request.json()) as AttachMediaRequest;

    if (!body.media_ids || !Array.isArray(body.media_ids) || body.media_ids.length === 0) {
      throw new Error('media_ids array is required and must not be empty');
    }

    // Check announcement exists
    const announcement = await env.DB
      .prepare('SELECT * FROM announcements WHERE announcement_id = ?')
      .bind(announcementId)
      .first();

    if (!announcement) {
      throw new NotFoundError('Announcement');
    }

    // Get current attachment count
    const countResult = await env.DB
      .prepare('SELECT COUNT(*) as count FROM announcement_media WHERE announcement_id = ?')
      .bind(announcementId)
      .first<{ count: number }>();

    const currentCount = countResult?.count || 0;
    const newCount = currentCount + body.media_ids.length;

    if (newCount > 10) {
      throw new Error(`Cannot attach ${body.media_ids.length} media. Current: ${currentCount}, Max: 10, Would be: ${newCount}`);
    }

    // Verify all media exists and is R2 storage
    const placeholders = body.media_ids.map(() => '?').join(',');
    const mediaCheck = await env.DB
      .prepare(`SELECT media_id, storage_type FROM media_objects WHERE media_id IN (${placeholders})`)
      .bind(...body.media_ids)
      .all();

    if (!mediaCheck.results || mediaCheck.results.length !== body.media_ids.length) {
      throw new Error('One or more media IDs not found');
    }

    const nonR2Media = mediaCheck.results.filter((m: any) => m.storage_type !== 'r2');
    if (nonR2Media.length > 0) {
      throw new Error('All announcement media must be R2 storage type');
    }

    // Get next sort_order value
    const maxSortResult = await env.DB
      .prepare('SELECT COALESCE(MAX(sort_order), -1) as max_sort FROM announcement_media WHERE announcement_id = ?')
      .bind(announcementId)
      .first<{ max_sort: number }>();

    let nextSortOrder = (maxSortResult?.max_sort || -1) + 1;
    const now = utcNow();

    // Insert all attachments
    for (const mediaId of body.media_ids) {
      await env.DB
        .prepare(
          `INSERT INTO announcement_media (announcement_id, media_id, sort_order, created_at_utc, updated_at_utc)
           VALUES (?, ?, ?, ?, ?)`
        )
        .bind(announcementId, mediaId, nextSortOrder, now, now)
        .run();

      nextSortOrder++;
    }

    // Audit log
    await createAuditLog(
      env.DB,
      'announcement',
      'attach_media',
      user!.user_id,
      announcementId,
      `Attached ${body.media_ids.length} media to announcement`,
      JSON.stringify({ media_ids: body.media_ids }),
    );

    // Return updated attachments
    const attachments = await env.DB
      .prepare(`
        SELECT am.*, mo.r2_key
        FROM announcement_media am
        JOIN media_objects mo ON am.media_id = mo.media_id
        WHERE am.announcement_id = ?
        ORDER BY am.sort_order ASC
      `)
      .bind(announcementId)
      .all();

    return {
      message: `Successfully attached ${body.media_ids.length} media`,
      attachments: (attachments.results || []).map((row: any) => ({
        announcement_id: row.announcement_id,
        media_id: row.media_id,
        sort_order: row.sort_order,
        created_at_utc: row.created_at_utc,
        url: row.r2_key ? `https://your-r2-domain.com/${row.r2_key}` : '',
      })),
    };
  },
});

/**
 * PUT /api/announcements/:id/media - Reorder media attachments
 */
export const onRequestPut = createEndpoint<{ message: string; attachments: AnnouncementMedia[] }>({
  auth: 'moderator',
  cacheControl: 'no-store',

  handler: async ({ env, user, params, request }) => {
    const announcementId = params.id;
    const body = (await request.json()) as ReorderMediaRequest;

    if (!body.media_ids || !Array.isArray(body.media_ids)) {
      throw new Error('media_ids array is required');
    }

    // Check announcement exists
    const announcement = await env.DB
      .prepare('SELECT * FROM announcements WHERE announcement_id = ?')
      .bind(announcementId)
      .first();

    if (!announcement) {
      throw new NotFoundError('Announcement');
    }

    // Get current attachments
    const currentAttachments = await env.DB
      .prepare('SELECT media_id FROM announcement_media WHERE announcement_id = ? ORDER BY sort_order')
      .bind(announcementId)
      .all();

    const currentMediaIds = (currentAttachments.results || []).map((row: any) => row.media_id);

    // Verify all media IDs in request exist in current attachments
    const invalidIds = body.media_ids.filter(id => !currentMediaIds.includes(id));
    if (invalidIds.length > 0) {
      throw new Error(`Invalid media IDs: ${invalidIds.join(', ')}`);
    }

    // Verify all current media IDs are in the request (can't skip any)
    const missingIds = currentMediaIds.filter(id => !body.media_ids.includes(id));
    if (missingIds.length > 0) {
      throw new Error(`Missing media IDs in reorder: ${missingIds.join(', ')}`);
    }

    const now = utcNow();

    // Update sort_order for all attachments
    for (let i = 0; i < body.media_ids.length; i++) {
      await env.DB
        .prepare(
          `UPDATE announcement_media
           SET sort_order = ?, updated_at_utc = ?
           WHERE announcement_id = ? AND media_id = ?`
        )
        .bind(i, now, announcementId, body.media_ids[i])
        .run();
    }

    // Audit log
    await createAuditLog(
      env.DB,
      'announcement',
      'reorder_media',
      user!.user_id,
      announcementId,
      'Reordered announcement media',
      JSON.stringify({ media_ids: body.media_ids }),
    );

    // Return updated attachments
    const attachments = await env.DB
      .prepare(`
        SELECT am.*, mo.r2_key
        FROM announcement_media am
        JOIN media_objects mo ON am.media_id = mo.media_id
        WHERE am.announcement_id = ?
        ORDER BY am.sort_order ASC
      `)
      .bind(announcementId)
      .all();

    return {
      message: 'Successfully reordered attachments',
      attachments: (attachments.results || []).map((row: any) => ({
        announcement_id: row.announcement_id,
        media_id: row.media_id,
        sort_order: row.sort_order,
        created_at_utc: row.created_at_utc,
        url: row.r2_key ? `https://your-r2-domain.com/${row.r2_key}` : '',
      })),
    };
  },
});
