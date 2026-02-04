/**
 * Announcements API - Update/Delete/Actions
 * PUT /api/announcements/[id]
 * DELETE /api/announcements/[id]
 * POST /api/announcements/[id]/[action]
 */

import type { PagesFunction, Env, Announcement } from '../../_types';
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
  utcNow,
  createAuditLog,
  canEditEntity,
  sanitizeHtml,
  generateId,
} from '../../_utils';
import { withAuth, withModeratorAuth } from '../../_middleware';
import { validateBody, updateAnnouncementSchema } from '../../_validation';

// ============================================================
// PUT /api/announcements/[id] - Update Announcement
// ============================================================

export const onRequestPut: PagesFunction<Env> = async (context) => {
  return withAuth(context, async (authContext) => {
    const { request, env, params } = authContext;
    const { user } = authContext.data;
    const announcementId = params.id;

    const existing = await env.DB
      .prepare('SELECT * FROM announcements WHERE announcement_id = ? AND is_archived = 0')
      .bind(announcementId)
      .first<Announcement>();

    if (!existing) {
      return notFoundResponse('Announcement');
    }

    if (!canEditEntity(user, existing.created_by)) {
      return forbiddenResponse('You do not have permission to edit this announcement');
    }

    const validation = await validateBody(request, updateAnnouncementSchema);
    if (!validation.success) {
      return badRequestResponse('Invalid request body', validation.error.errors);
    }

    const updates = validation.data;

    try {
      const now = utcNow();
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.title !== undefined) {
        updateFields.push('title = ?');
        updateValues.push(updates.title);
      }
      if (updates.bodyHtml !== undefined) {
        updateFields.push('body_html = ?');
        updateValues.push(updates.bodyHtml ? sanitizeHtml(updates.bodyHtml) : null);
      }
      if (updates.isPinned !== undefined) {
        updateFields.push('is_pinned = ?');
        updateValues.push(updates.isPinned ? 1 : 0);
      }
      if ((updates as any).mediaUrls !== undefined) {
        updateFields.push('media_urls = ?');
        updateValues.push(JSON.stringify((updates as any).mediaUrls || []));
      }

      if (updateFields.length === 0) {
        return badRequestResponse('No fields to update');
      }

      updateFields.push('updated_by = ?', 'updated_at_utc = ?');
      updateValues.push(user.user_id, now, announcementId);

      const query = `UPDATE announcements SET ${updateFields.join(', ')} WHERE announcement_id = ?`;
      await env.DB.prepare(query).bind(...updateValues).run();

      await createAuditLog(
        env.DB,
        'announcement',
        'update',
        user.user_id,
        announcementId,
        `Updated announcement: ${updates.title || existing.title}`,
        JSON.stringify(updates)
      );

      const announcement = await env.DB
        .prepare('SELECT * FROM announcements WHERE announcement_id = ?')
        .bind(announcementId)
        .first<Announcement>();

      return successResponse({ announcement });
    } catch (error) {
      console.error('Update announcement error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while updating announcement', 500);
    }
  });
};

// ============================================================
// DELETE /api/announcements/[id] - Archive Announcement
// ============================================================

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  return withAuth(context, async (authContext) => {
    const { env, params } = authContext;
    const { user } = authContext.data;
    const announcementId = params.id;

    const existing = await env.DB
      .prepare('SELECT * FROM announcements WHERE announcement_id = ? AND is_archived = 0')
      .bind(announcementId)
      .first<Announcement>();

    if (!existing) {
      return notFoundResponse('Announcement');
    }

    if (!canEditEntity(user, existing.created_by)) {
      return forbiddenResponse('You do not have permission to delete this announcement');
    }

    try {
      const now = utcNow();

      await env.DB
        .prepare('UPDATE announcements SET is_archived = 1, archived_at_utc = ?, updated_at_utc = ? WHERE announcement_id = ?')
        .bind(now, now, announcementId)
        .run();

      await createAuditLog(
        env.DB,
        'announcement',
        'archive',
        user.user_id,
        announcementId,
        `Archived announcement: ${existing.title}`,
        null
      );

      return successResponse({ message: 'Announcement archived successfully' });
    } catch (error) {
      console.error('Delete announcement error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while deleting announcement', 500);
    }
  });
};

// ============================================================
// POST /api/announcements/[id]/[action] - Actions (duplicate, pin, unpin, archive/unarchive)
// ============================================================

export const onRequestPost: PagesFunction<Env> = async (context) => {
  return withAuth(context, async (authContext) => {
    const { env, params } = authContext;
    const { user } = authContext.data;
    const announcementId = params.id;
    const action = params.action;

    const announcement = await env.DB
      .prepare('SELECT * FROM announcements WHERE announcement_id = ?')
      .bind(announcementId)
      .first<Announcement>();

    if (!announcement) {
      return notFoundResponse('Announcement');
    }

    if (!canEditEntity(user, announcement.created_by)) {
      return forbiddenResponse('You do not have permission to modify this announcement');
    }

    const now = utcNow();

    if (action === 'duplicate') {
      const newAnnouncementId = generateId('ann');
      await env.DB
        .prepare(`
          INSERT INTO announcements (
            announcement_id, title, body_html, is_pinned, is_archived, media_urls,
            created_by, updated_by, created_at_utc, updated_at_utc
          ) VALUES (?, ?, ?, 0, 0, ?, ?, ?, ?, ?)
        `)
        .bind(
          newAnnouncementId,
          `${announcement.title} (Copy)`,
          announcement.body_html,
          announcement.media_urls || '[]',
          user.user_id,
          user.user_id,
          now,
          now
        )
        .run();

      await createAuditLog(
        env.DB,
        'announcement',
        'duplicate',
        user.user_id,
        newAnnouncementId,
        `Duplicated announcement: ${announcement.title}`,
        JSON.stringify({ originalAnnouncementId: announcementId })
      );

      const newAnnouncement = await env.DB
        .prepare('SELECT * FROM announcements WHERE announcement_id = ?')
        .bind(newAnnouncementId)
        .first<Announcement>();

      return successResponse({ announcement: newAnnouncement }, 201);
    }

    if (action === 'pin' || action === 'unpin') {
      const isPinned = action === 'pin' ? 1 : 0;
      await env.DB
        .prepare('UPDATE announcements SET is_pinned = ?, updated_at_utc = ?, updated_by = ? WHERE announcement_id = ?')
        .bind(isPinned, now, user.user_id, announcementId)
        .run();

      await createAuditLog(
        env.DB,
        'announcement',
        action,
        user.user_id,
        announcementId,
        `${action} announcement`,
        null
      );

      const updated = await env.DB
        .prepare('SELECT * FROM announcements WHERE announcement_id = ?')
        .bind(announcementId)
        .first<Announcement>();

      // Broadcast update via WebSocket
      await broadcastUpdate(env, {
        type: 'announcement:updated',
        data: updated,
        excludeUserId: user.user_id,
      });

      return successResponse({ announcement: updated });
    }

    if (action === 'archive' || action === 'unarchive') {
      const isArchived = action === 'archive' ? 1 : 0;
      await env.DB
        .prepare('UPDATE announcements SET is_archived = ?, updated_at_utc = ?, updated_by = ? WHERE announcement_id = ?')
        .bind(isArchived, now, user.user_id, announcementId)
        .run();

      await createAuditLog(env.DB, 'announcement', action, user.user_id, announcementId, `${action} announcement`, null);

      const updated = await env.DB
        .prepare('SELECT * FROM announcements WHERE announcement_id = ?')
        .bind(announcementId)
        .first<Announcement>();

      return successResponse({ announcement: updated });
    }

    return badRequestResponse('Unsupported action');
  });
};
