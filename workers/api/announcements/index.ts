/**
 * Announcements API
 * GET /api/announcements - List announcements or fetch specific by IDs
 * POST /api/announcements - Create announcement(s) - single or multiple
 *
 * Features:
 * - List announcements with filters and pagination
 * - Fetch specific announcements by IDs (batch read)
 * - Batch create announcements
 * - Backward compatible with existing API
 */

import type { Env, Announcement } from '../../lib/types';
import { createEndpoint } from '../../lib/endpoint-factory';
import { generateId, utcNow, createAuditLog, sanitizeHtml } from '../../lib/utils';
import { validateBody, createAnnouncementSchema } from '../../lib/validation';
import {
  parsePaginationQuery,
  buildPaginatedResponse,
  type PaginatedResponse,
  type PaginationQuery,
} from '../../../shared/utils/pagination';

// ============================================================
// Types
// ============================================================

interface CreateAnnouncementBody {
  title: string;
  bodyHtml?: string;
  isPinned?: boolean;
  mediaIds?: string[];
}

interface CreateAnnouncementsBody {
  announcements: CreateAnnouncementBody[]; // NEW: Support for multiple
}

interface CreateAnnouncementResponse {
  announcement: Announcement;
}

interface ListAnnouncementsQuery extends PaginationQuery {
  filter?: string; // all|pinned|archived
  search?: string;
  ids?: string; // NEW: Comma-separated IDs for batch fetch
}

interface BatchDeleteQuery {
  action?: 'delete' | 'archive';
  announcementIds?: string;
}

// ============================================================
// GET /api/announcements - List or Batch Fetch
// ============================================================

export const onRequestGet = createEndpoint<
  Announcement[] | PaginatedResponse<Announcement> | { announcements: Announcement[]; totalCount: number; notFound: string[] },
  ListAnnouncementsQuery
>({
  auth: 'optional',
  pollable: true,
  pollEntity: 'announcements',
  etag: true,
  cacheControl: 'public, max-age=60, must-revalidate',

  parseQuery: (searchParams) => ({
    filter: searchParams.get('filter') || undefined,
    search: searchParams.get('search')?.trim() || undefined,
    limit: searchParams.get('limit') || undefined,
    cursor: searchParams.get('cursor') || undefined,
    ids: searchParams.get('ids') || undefined,
  }),

  handler: async ({ env, query }) => {
    try {
      // ============================================================
      // BATCH FETCH MODE: Fetch specific announcements by IDs
      // ============================================================
      if (query.ids) {
        const ids = query.ids.split(',').map(id => id.trim()).filter(id => id.length > 0);

        if (ids.length === 0) {
          throw new Error('No IDs provided');
        }

        if (ids.length > 100) {
          throw new Error('Maximum 100 IDs per request');
        }

        const placeholders = ids.map(() => '?').join(',');
        const sqlQuery = `
          SELECT * FROM announcements
          WHERE announcement_id IN (${placeholders})
            AND deleted_at_utc IS NULL
          ORDER BY is_pinned DESC, created_at_utc DESC
        `;

        const result = await env.DB.prepare(sqlQuery).bind(...ids).all();
        const found = result.results || [];
        const foundIds = new Set(found.map((a: any) => a.announcement_id));
        const notFound = ids.filter(id => !foundIds.has(id));

        return {
          announcements: found,
          totalCount: found.length,
          notFound,
        };
      }

      // ============================================================
      // LIST MODE: List announcements with filters and pagination
      // ============================================================
      const { limit, cursor } = parsePaginationQuery(query);
      const usePagination = query.limit !== undefined || query.cursor !== undefined;

      const clauses: string[] = ['1=1'];
      const params: any[] = [];

      if (query.filter === 'archived') {
        clauses.push('is_archived = 1');
      } else if (query.filter === 'pinned') {
        clauses.push('is_archived = 0');
        clauses.push('is_pinned = 1');
      } else {
        clauses.push('is_archived = 0');
      }

      if (query.search) {
        clauses.push('(title LIKE ? OR body_html LIKE ?)');
        params.push(`%${query.search}%`, `%${query.search}%`);
      }

      if (cursor) {
        clauses.push('(created_at_utc < ? OR (created_at_utc = ? AND announcement_id < ?))');
        params.push(cursor.timestamp, cursor.timestamp, cursor.id);
      }

      const dbQuery = `
        SELECT * FROM announcements
        WHERE ${clauses.join(' AND ')}
        ORDER BY is_pinned DESC, created_at_utc DESC, announcement_id DESC
        ${usePagination ? `LIMIT ${limit + 1}` : 'LIMIT 200'}
      `;

      const result = await env.DB.prepare(dbQuery).bind(...params).all<Announcement>();

      if (usePagination) {
        return buildPaginatedResponse(result.results || [], limit, 'created_at_utc', 'announcement_id');
      }

      return result.results || [];
    } catch (error) {
      console.error('List announcements error:', error);
      throw error;
    }
  },
});

// ============================================================
// POST /api/announcements - Create Single or Multiple
// ============================================================

export const onRequestPost = createEndpoint<
  CreateAnnouncementResponse | { message: string; announcements: Announcement[] },
  CreateAnnouncementBody | CreateAnnouncementsBody
>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => {
    // Check if it's a batch create (has 'announcements' array)
    if ('announcements' in body && Array.isArray(body.announcements)) {
      if (body.announcements.length === 0) {
        throw new Error('Announcements array cannot be empty');
      }
      if (body.announcements.length > 50) {
        throw new Error('Maximum 50 announcements per batch create');
      }
      // Validate each announcement
      for (const ann of body.announcements) {
        const validation = createAnnouncementSchema.safeParse(ann);
        if (!validation.success) {
          throw new Error(JSON.stringify({ errors: validation.error.issues, index: body.announcements.indexOf(ann) }));
        }
      }
      return body as CreateAnnouncementsBody;
    }

    // Single announcement create
    const validation = createAnnouncementSchema.safeParse(body);
    if (!validation.success) {
      throw new Error(JSON.stringify({ errors: validation.error.issues }));
    }
    return validation.data;
  },

  handler: async ({ env, body, user }) => {
    try {
      if (!user) {
        throw new Error('User is required');
      }

      const now = utcNow();

      // ============================================================
      // BATCH CREATE MODE: Create multiple announcements
      // ============================================================
      if ('announcements' in body) {
        const { announcements: announcementsToCreate } = body as CreateAnnouncementsBody;
        const created: Announcement[] = [];

        for (const annData of announcementsToCreate) {
          const announcementId = generateId('ann');
          const sanitizedBody = annData.bodyHtml ? sanitizeHtml(annData.bodyHtml) : null;

          const statements: any[] = [];

          statements.push(env.DB.prepare(`
            INSERT INTO announcements (
              announcement_id, title, body_html, is_pinned, is_archived,
              created_by, updated_by, created_at_utc, updated_at_utc
            ) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)
          `).bind(
            announcementId,
            annData.title,
            sanitizedBody,
            annData.isPinned ? 1 : 0,
            user.user_id,
            user.user_id,
            now,
            now
          ));

          if (annData.mediaIds && annData.mediaIds.length > 0) {
            annData.mediaIds.forEach((mediaId: string, index: number) => {
              statements.push(env.DB.prepare(`
                INSERT INTO announcement_media (
                  announcement_id, media_id, sort_order, created_at_utc, updated_at_utc
                ) VALUES (?, ?, ?, ?, ?)
              `).bind(
                announcementId,
                mediaId,
                index,
                now,
                now
              ));
            });
          }

          await env.DB.batch(statements);

          created.push((await env.DB
            .prepare('SELECT * FROM announcements WHERE announcement_id = ?')
            .bind(announcementId)
            .first<Announcement>())!);
        }

        await createAuditLog(
          env.DB,
          'announcement',
          'batch_create',
          user.user_id,
          'batch',
          `Batch created ${announcementsToCreate.length} announcements`,
          JSON.stringify({ count: announcementsToCreate.length })
        );

        return {
          message: `Created ${announcementsToCreate.length} announcements successfully`,
          announcements: created,
        };
      }

      // ============================================================
      // SINGLE CREATE MODE: Create one announcement
      // ============================================================
      const announcementId = generateId('ann');
      const sanitizedBody = body.bodyHtml ? sanitizeHtml(body.bodyHtml) : null;

      const statements: any[] = [];

      statements.push(env.DB.prepare(`
        INSERT INTO announcements (
          announcement_id, title, body_html, is_pinned, is_archived,
          created_by, updated_by, created_at_utc, updated_at_utc
        ) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)
      `).bind(
        announcementId,
        body.title,
        sanitizedBody,
        body.isPinned ? 1 : 0,
        user.user_id,
        user.user_id,
        now,
        now
      ));

      if (body.mediaIds && body.mediaIds.length > 0) {
        body.mediaIds.forEach((mediaId: string, index: number) => {
          statements.push(env.DB.prepare(`
            INSERT INTO announcement_media (
              announcement_id, media_id, sort_order, created_at_utc, updated_at_utc
            ) VALUES (?, ?, ?, ?, ?)
          `).bind(
            announcementId,
            mediaId,
            index,
            now,
            now
          ));
        });
      }

      await env.DB.batch(statements);

      await createAuditLog(
        env.DB,
        'announcement',
        'create',
        user.user_id,
        announcementId,
        `Created announcement: ${body.title}`,
        JSON.stringify({ title: body.title, isPinned: body.isPinned, mediaCount: body.mediaIds?.length })
      );

      const announcement = await env.DB
        .prepare('SELECT * FROM announcements WHERE announcement_id = ?')
        .bind(announcementId)
        .first<Announcement>();

      return { announcement: announcement! };
    } catch (error) {
      console.error('Create announcement error:', error);
      throw error;
    }
  },
});

// ============================================================
// DELETE /api/announcements - Batch delete/archive via query params
// ============================================================

export const onRequestDelete = createEndpoint<
  { message: string; affectedCount: number; action: string },
  BatchDeleteQuery
>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseQuery: (searchParams) => ({
    action: (searchParams.get('action') || 'delete') as 'delete' | 'archive',
    announcementIds: searchParams.get('announcementIds') || undefined,
  }),

  handler: async ({ env, user, query }) => {
    const { action, announcementIds } = query;

    if (!announcementIds) {
      throw new Error('Missing announcementIds query parameter');
    }

    const ids = announcementIds.split(',').map(id => id.trim()).filter(id => id.length > 0);

    if (ids.length === 0) {
      throw new Error('No announcement IDs provided');
    }

    if (ids.length > 100) {
      throw new Error('Maximum 100 announcement IDs per batch operation');
    }

    const now = utcNow();
    let affectedCount = 0;

    const placeholders = ids.map(() => '?').join(',');

    if (action === 'delete') {
      const result = await env.DB
        .prepare(`
          UPDATE announcements SET deleted_at_utc = ?, updated_at_utc = ?
          WHERE announcement_id IN (${placeholders}) AND deleted_at_utc IS NULL
        `)
        .bind(now, now, ...ids)
        .run();
      affectedCount = result.meta.changes || 0;
    } else if (action === 'archive') {
      const result = await env.DB
        .prepare(`
          UPDATE announcements SET is_archived = 1, updated_at_utc = ?
          WHERE announcement_id IN (${placeholders})
        `)
        .bind(now, ...ids)
        .run();
      affectedCount = result.meta.changes || 0;
    }

    await createAuditLog(
      env.DB,
      'announcement',
      `batch_${action}`,
      user!.user_id,
      'batch',
      `Batch ${action} on ${ids.length} announcements`,
      JSON.stringify({ announcementIds: ids, action })
    );

    return {
      message: `Batch ${action} completed`,
      affectedCount,
      action,
    };
  },
});
