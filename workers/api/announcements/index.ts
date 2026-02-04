/**
 * Announcements API - Create/List
 * POST /api/announcements - Create announcement
 * GET /api/announcements - List announcements
 */

import type { PagesFunction, Env, Announcement } from '../_types';
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  generateId,
  utcNow,
  createAuditLog,
  sanitizeHtml,
} from '../_utils';
import { withAuth, withOptionalAuth } from '../_middleware';
import { validateBody, createAnnouncementSchema } from '../_validation';

// ============================================================
// POST /api/announcements - Create Announcement
// ============================================================

export const onRequestPost: PagesFunction<Env> = async (context) => {
  return withAuth(context, async (authContext) => {
    const { request, env } = authContext;
    const { user, isModerator } = authContext.data;

    // Only moderators and admins can create announcements
    if (!isModerator) {
      return errorResponse('FORBIDDEN', 'Only moderators and admins can create announcements', 403);
    }

    const validation = await validateBody(request, createAnnouncementSchema);
    if (!validation.success) {
      return badRequestResponse('Invalid request body', validation.error.errors);
    }

    const { title, bodyHtml, isPinned, mediaUrls } = validation.data;

    try {
      const announcementId = generateId('ann');
      const now = utcNow();
      const sanitizedBody = bodyHtml ? sanitizeHtml(bodyHtml) : null;

      await env.DB
        .prepare(`
          INSERT INTO announcements (
            announcement_id, title, body_html, is_pinned, is_archived,
            media_urls, created_by, updated_by, created_at_utc, updated_at_utc
          ) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?)
        `)
        .bind(
          announcementId,
          title,
          sanitizedBody,
          isPinned ? 1 : 0,
          mediaUrls ? JSON.stringify(mediaUrls) : JSON.stringify([]),
          user.user_id,
          user.user_id,
          now,
          now
        )
        .run();

      await createAuditLog(
        env.DB,
        'announcement',
        'create',
        user.user_id,
        announcementId,
        `Created announcement: ${title}`,
        JSON.stringify({ title, isPinned })
      );

      const announcement = await env.DB
        .prepare('SELECT * FROM announcements WHERE announcement_id = ?')
        .bind(announcementId)
        .first<Announcement>();

      return successResponse({ announcement }, 201);
    } catch (error) {
      console.error('Create announcement error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while creating announcement', 500);
    }
  });
};

// ============================================================
// GET /api/announcements - List Announcements
// ============================================================

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withOptionalAuth(context, async (authContext) => {
    const { env } = authContext;

    try {
      const url = new URL(authContext.request.url);
      const filter = url.searchParams.get('filter'); // all|pinned|archived
      const search = url.searchParams.get('search')?.trim();

      const clauses: string[] = ['1=1'];
      const params: any[] = [];

      if (filter === 'archived') {
        clauses.push('is_archived = 1');
      } else if (filter === 'pinned') {
        clauses.push('is_archived = 0');
        clauses.push('is_pinned = 1');
      } else {
        clauses.push('is_archived = 0');
      }

      if (search) {
        clauses.push('(title LIKE ? OR body_html LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
      }

      const query = `
        SELECT * FROM announcements
        WHERE ${clauses.join(' AND ')}
        ORDER BY is_pinned DESC, created_at_utc DESC
        LIMIT 200
      `;

      const result = await env.DB.prepare(query).bind(...params).all<Announcement>();

      const etagSource = (result.results || []).map(r => r.updated_at_utc).join('|');
      const etag = etagSource ? `"${etagSource.length}-${result.results?.length || 0}"` : undefined;
      
      return successResponse({ announcements: result.results || [] }, 200, {
        etag,
        method: 'GET',
        maxAge: 30 // Cache for 30 seconds - announcements change occasionally
      });
    } catch (error) {
      console.error('List announcements error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while fetching announcements', 500);
    }
  });
};
