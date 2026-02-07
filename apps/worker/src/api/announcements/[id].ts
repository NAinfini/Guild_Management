/**
 * Announcements API - Announcement Detail
 * GET /api/announcements/[id] - Get announcement
 * PUT /api/announcements/[id] - Update announcement
 * DELETE /api/announcements/[id] - Delete announcement
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env, Announcement } from '../../core/types';
import { createEndpoint } from '../../core/endpoint-factory';
import { broadcastUpdate } from '../../core/broadcast';
import {
  utcNow,
  createAuditLog,
  etagFromTimestamp,
  assertIfMatch,
  canEditEntity,
  sanitizeHtml
} from '../../core/utils';
import { NotFoundError } from '../../core/errors';

// ============================================================
// Types
// ============================================================

interface UpdateAnnouncementBody {
  title?: string;
  bodyHtml?: string;
  mediaIds?: string[]; // Array of media keys/IDs
}

interface PatchAnnouncementBody {
  isPinned?: boolean;
}

interface AnnouncementResponse {
  announcement: Announcement;
  media: any[];
}

// ============================================================
// GET /api/announcements/[id]
// ============================================================

export const onRequestGet = createEndpoint<AnnouncementResponse>({
  auth: 'optional',
  etag: true,
  cacheControl: 'public, max-age=60',

  handler: async ({ env, params }) => {
    const announcementId = params.id;

    const announcement = await env.DB
      .prepare(`
        SELECT
          announcement_id, title, body_html, is_pinned, is_archived,
          created_by, updated_by, created_at_utc, updated_at_utc, archived_at_utc
        FROM announcements WHERE announcement_id = ? AND is_archived = 0
      `)
      .bind(announcementId)
      .first<Announcement>();

    if (!announcement) {
      throw new NotFoundError('Announcement');
    }

    // Get media
    const media = await env.DB
      .prepare(`
        SELECT mo.*
        FROM announcement_media am
        JOIN media_objects mo ON am.media_id = mo.media_id
        WHERE am.announcement_id = ?
        ORDER BY am.sort_order
      `)
      .bind(announcementId)
      .all();

    return {
      announcement,
      media: media.results || [],
    };
  },
});

// ============================================================
// PUT /api/announcements/[id]
// ============================================================

export const onRequestPut = createEndpoint<{ message: string; announcement: Announcement }, UpdateAnnouncementBody>({
  auth: 'required',
  cacheControl: 'no-store',

  parseBody: (body) => body as UpdateAnnouncementBody,

  handler: async ({ env, user, params, body, request, waitUntil }) => {
    const announcementId = params.id;

    const existing = await env.DB
      .prepare(`
        SELECT
          announcement_id, title, body_html, is_pinned, is_archived,
          created_by, updated_by, created_at_utc, updated_at_utc, archived_at_utc
        FROM announcements WHERE announcement_id = ?
      `)
      .bind(announcementId)
      .first<Announcement>();

    if (!existing) {
      throw new NotFoundError('Announcement');
    }

    if (!canEditEntity(user!, existing.created_by as string)) {
      throw new Error('You do not have permission to edit this announcement');
    }

    const currentEtag = etagFromTimestamp(existing.updated_at_utc || existing.created_at_utc);
    const pre = assertIfMatch(request, currentEtag);
    if (pre) return pre;

    const { title, bodyHtml, mediaIds } = body;
    const now = utcNow();

    if (title || bodyHtml) {
      const updates: string[] = [];
      const values: any[] = [];

      if (title !== undefined) {
        updates.push('title = ?');
        values.push(title);
      }
      if (bodyHtml !== undefined) {
        updates.push('body_html = ?');
        values.push(sanitizeHtml(bodyHtml));
      }

      updates.push('updated_at_utc = ?');
      values.push(now, announcementId);

      await env.DB
        .prepare(`UPDATE announcements SET ${updates.join(', ')} WHERE announcement_id = ?`)
        .bind(...values)
        .run();
    }

    // Update media associations if provided
    if (mediaIds !== undefined) {
      // Clear existing
      await env.DB
        .prepare('DELETE FROM announcement_media WHERE announcement_id = ?')
        .bind(announcementId)
        .run();

      // Insert new
      if (mediaIds.length > 0) {
        const stmt = env.DB.prepare('INSERT INTO announcement_media (announcement_id, media_id, sort_order) VALUES (?, ?, ?)');
        const batch = mediaIds.map((mediaId: string, index: number) => stmt.bind(announcementId, mediaId, index));
        await env.DB.batch(batch);
      }
    }

    await createAuditLog(
      env.DB,
      'announcement',
      'update',
      user!.user_id,
      announcementId,
      'Updated announcement',
      JSON.stringify(body)
    );

    const updated = await env.DB
      .prepare(`
        SELECT
          announcement_id, title, body_html, is_pinned, is_archived,
          created_by, updated_by, created_at_utc, updated_at_utc, archived_at_utc
        FROM announcements WHERE announcement_id = ?
      `)
      .bind(announcementId)
      .first<Announcement>();

    // Broadcast update
    waitUntil(broadcastUpdate(env, {
      entity: 'announcements',
      action: 'updated',
      payload: [updated!],
      ids: [announcementId],
      excludeUserId: user!.user_id
    }));

    return {
      message: 'Announcement updated successfully',
      announcement: updated!,
    };
  },
});

// ============================================================
// PATCH /api/announcements/[id] - Partial Updates (isPinned, etc)
// ============================================================

export const onRequestPatch = createEndpoint<{ message: string; announcement: Announcement }, PatchAnnouncementBody>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => body as PatchAnnouncementBody,

  handler: async ({ env, user, params, body, waitUntil }) => {
    const announcementId = params.id;
    const { isPinned } = body;

    if (isPinned === undefined) {
      throw new Error('No fields to update');
    }

    const existing = await env.DB
      .prepare(`
        SELECT
          announcement_id, title, body_html, is_pinned, is_archived,
          created_by, updated_by, created_at_utc, updated_at_utc, archived_at_utc
        FROM announcements WHERE announcement_id = ?
      `)
      .bind(announcementId)
      .first<Announcement>();

    if (!existing) {
      throw new NotFoundError('Announcement');
    }

    const now = utcNow();
    const updates: string[] = ['updated_at_utc = ?'];
    const values: any[] = [now];

    if (isPinned !== undefined) {
      updates.push('is_pinned = ?');
      values.push(isPinned ? 1 : 0);
    }

    values.push(announcementId);

    await env.DB
      .prepare(`UPDATE announcements SET ${updates.join(', ')} WHERE announcement_id = ?`)
      .bind(...values)
      .run();

    const updated = await env.DB
      .prepare(`
        SELECT
          announcement_id, title, body_html, is_pinned, is_archived,
          created_by, updated_by, created_at_utc, updated_at_utc, archived_at_utc
        FROM announcements WHERE announcement_id = ?
      `)
      .bind(announcementId)
      .first<Announcement>();

    await createAuditLog(
      env.DB,
      'announcement',
      isPinned ? 'pin' : 'unpin',
      user!.user_id,
      announcementId,
      `${isPinned ? 'Pinned' : 'Unpinned'} announcement`,
      undefined
    );

    // Broadcast update (pinned change)
    waitUntil(broadcastUpdate(env, {
      entity: 'announcements',
      action: 'updated',
      payload: [updated!],
      ids: [announcementId],
      excludeUserId: user!.user_id
    }));

    return {
      message: `Announcement ${isPinned ? 'pinned' : 'unpinned'} successfully`,
      announcement: updated!,
    };
  },
});

// ============================================================
// DELETE /api/announcements/[id]
// ============================================================

export const onRequestDelete = createEndpoint<{ message: string }>({
  auth: 'required',
  cacheControl: 'no-store',

  handler: async ({ env, user, params, waitUntil }) => {
    const announcementId = params.id;

    const existing = await env.DB
      .prepare(`
        SELECT
          announcement_id, title, body_html, is_pinned, is_archived,
          created_by, updated_by, created_at_utc, updated_at_utc, archived_at_utc
        FROM announcements WHERE announcement_id = ?
      `)
      .bind(announcementId)
      .first<Announcement>();

    if (!existing) {
      throw new NotFoundError('Announcement');
    }

    if (!canEditEntity(user!, existing.created_by as string)) {
      throw new Error('You do not have permission to delete this announcement');
    }

    const now = utcNow();

    await env.DB
      .prepare('UPDATE announcements SET deleted_at_utc = ?, updated_at_utc = ? WHERE announcement_id = ?')
      .bind(now, now, announcementId)
      .run();

    await createAuditLog(
      env.DB,
      'announcement',
      'delete',
      user!.user_id,
      announcementId,
      'Deleted announcement',
      undefined
    );

    // Broadcast delete
    waitUntil(broadcastUpdate(env, {
      entity: 'announcements',
      action: 'deleted',
      ids: [announcementId],
      excludeUserId: user!.user_id
    }));

    return { message: 'Announcement deleted successfully' };
  },
});
