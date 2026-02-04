/**
 * Member Notes Management (Admin Only)
 * PUT /api/members/[id]/notes - Update admin notes
 * GET /api/members/[id]/notes - Get admin notes
 */

import type { PagesFunction, Env } from '../../../_types';
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  notFoundResponse,
  utcNow,
  createAuditLog,
  etagFromTimestamp,
  assertIfMatch,
} from '../../../_utils';
import { withAuth, withAdminAuth } from '../../../_middleware';
import { validateBody, memberNoteSchema } from '../../../_validation';

// ============================================================
// PUT /api/members/[id]/notes - Update Note (Admin Only)
// ============================================================

export const onRequestPut: PagesFunction<Env> = async (context) => {
  return withAdminAuth(context, async (authContext) => {
    const { request, env, params } = authContext;
    const { user: admin } = authContext.data;
    const userId = params.id;

    const validation = await validateBody(request, memberNoteSchema);
    if (!validation.success) {
      return badRequestResponse('Invalid request body', validation.error.errors);
    }

    const { slot, noteText } = validation.data;

    try {
      // Verify user exists
      const targetUser = await env.DB
        .prepare('SELECT * FROM users WHERE user_id = ?')
        .bind(userId)
        .first();

      if (!targetUser) {
        return notFoundResponse('Member');
      }

      const currentEtag = etagFromTimestamp((targetUser as any).updated_at_utc || (targetUser as any).created_at_utc);
      const pre = assertIfMatch(request, currentEtag);
      if (pre) return pre;

      const now = utcNow();

      // Check if note exists
      const existing = await env.DB
        .prepare('SELECT * FROM member_admin_notes WHERE user_id = ? AND slot = ?')
        .bind(userId, slot)
        .first();

      if (existing) {
        // Update existing note
        await env.DB
          .prepare('UPDATE member_admin_notes SET note_text = ?, updated_by = ?, updated_at_utc = ? WHERE user_id = ? AND slot = ?')
          .bind(noteText || null, admin.user_id, now, userId, slot)
          .run();
      } else {
        // Insert new note
        await env.DB
          .prepare(`
            INSERT INTO member_admin_notes (user_id, slot, note_text, created_by, updated_by, created_at_utc, updated_at_utc)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(userId, slot, noteText || null, admin.user_id, admin.user_id, now, now)
          .run();
      }

      await createAuditLog(
        env.DB,
        'member',
        'update_note',
        admin.user_id,
        userId,
        `Updated admin note slot ${slot}`,
        null
      );

      const updated = await env.DB
        .prepare('SELECT updated_at_utc FROM users WHERE user_id = ?')
        .bind(userId)
        .first<{ updated_at_utc: string }>();

      const etag = etagFromTimestamp(updated?.updated_at_utc || (targetUser as any).updated_at_utc);
      const resp = successResponse({ message: 'Note updated successfully' });
      if (etag) resp.headers.set('ETag', etag);
      return resp;
    } catch (error) {
      console.error('Update note error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while updating note', 500);
    }
  });
};

// ============================================================
// GET /api/members/[id]/notes - Get Notes (Admin Only)
// ============================================================

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withAuth(context, async (authContext) => {
    const { env, params } = authContext;
    const { isAdmin, isModerator } = authContext.data;
    const userId = params.id;

    // Only admins and moderators can view notes
    if (!isAdmin && !isModerator) {
      return errorResponse('FORBIDDEN', 'Only admins and moderators can view notes', 403);
    }

    try {
      const notes = await env.DB
        .prepare(`
          SELECT man.*, u.username as updated_by_username
          FROM member_admin_notes man
          LEFT JOIN users u ON man.updated_by = u.user_id
          WHERE man.user_id = ?
          ORDER BY man.slot
        `)
        .bind(userId)
        .all();

      const userRow = await env.DB
        .prepare('SELECT updated_at_utc, created_at_utc FROM users WHERE user_id = ?')
        .bind(userId)
        .first<{ updated_at_utc: string; created_at_utc: string }>();
      const etag = etagFromTimestamp(userRow?.updated_at_utc || userRow?.created_at_utc);

      const resp = successResponse({ notes: notes.results || [] });
      if (etag) resp.headers.set('ETag', etag);
      return resp;
    } catch (error) {
      console.error('Get notes error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while fetching notes', 500);
    }
  });
};
