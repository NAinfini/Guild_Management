/**
 * Announcements Batch Actions API
 * POST /api/announcements/batch - Batch process multiple announcements
 */

import type { PagesFunction, Env } from '../_types';
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  utcNow,
  createAuditLog,
  unauthorizedResponse,
  etagFromTimestamp,
} from '../_utils';
import { withModeratorAuth } from '../_middleware';
import { validateBody, batchAnnouncementActionSchema } from '../_validation';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  return withModeratorAuth(context, async (authContext) => {
    const { request, env } = authContext;
    const { user: operator } = authContext.data;

    const validation = await validateBody(request, batchAnnouncementActionSchema);
    if (!validation.success) {
      return badRequestResponse('Invalid request body', validation.error.flatten());
    }

    const { announcementIds, action } = validation.data;
    
    // Guaranteed by withModeratorAuth, but for TS:
    if (!operator) return unauthorizedResponse();

    try {
      const now = utcNow();
      const statements = [];

      if (action === 'archive' || action === 'unarchive') {
        const isArchived = action === 'archive' ? 1 : 0;
        const placeholders = announcementIds.map(() => '?').join(',');
        
        statements.push(
          env.DB.prepare(`UPDATE announcements SET is_archived = ?, updated_at_utc = ? WHERE announcement_id IN (${placeholders})`)
            .bind(isArchived, now, ...announcementIds)
        );

        for (const id of announcementIds) {
          await createAuditLog(
            env.DB,
            'announcement',
            action,
            operator.user_id,
            id,
            `Batch ${action}d announcement`
          );
        }
      } else if (action === 'delete') {
        const placeholders = announcementIds.map(() => '?').join(',');
        
        // Hard delete for announcements (or change to soft delete if preferred)
        statements.push(
          env.DB.prepare(`DELETE FROM announcements WHERE announcement_id IN (${placeholders})`)
            .bind(...announcementIds)
        );

        for (const id of announcementIds) {
          await createAuditLog(
            env.DB,
            'announcement',
            'delete',
            operator.user_id,
            id,
            'Batch deleted announcement'
          );
        }
      } else if (action === 'pin' || action === 'unpin') {
        const isPinned = action === 'pin' ? 1 : 0;
        const placeholders = announcementIds.map(() => '?').join(',');
        
        statements.push(
          env.DB.prepare(`UPDATE announcements SET is_pinned = ?, updated_at_utc = ? WHERE announcement_id IN (${placeholders})`)
            .bind(isPinned, now, ...announcementIds)
        );

        for (const id of announcementIds) {
          await createAuditLog(
            env.DB,
            'announcement',
            action,
            operator.user_id,
            id,
            `Batch ${action}ned announcement`
          );
        }
      }

      if (statements.length > 0) {
        await env.DB.batch(statements);
      }

      const newEtag = etagFromTimestamp(now);
      const resp = successResponse({
        message: 'Batch action completed successfully',
        affectedCount: announcementIds.length,
        action,
      });
      if (newEtag) resp.headers.set('ETag', newEtag);
      return resp;
    } catch (error) {
      console.error('Batch announcement action error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred during batch processing', 500);
    }
  });
};

/**
 * GET /api/announcements/batch - Get multiple announcements by IDs
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withModeratorAuth(context, async (authContext) => {
    const { request, env } = authContext;

    try {
      const url = new URL(request.url);
      const idsParam = url.searchParams.get('ids');
      
      if (!idsParam) {
        return badRequestResponse('Missing ids parameter');
      }

      const ids = idsParam.split(',').map(id => id.trim()).filter(Boolean);
      
      if (ids.length === 0) {
        return badRequestResponse('No valid IDs provided');
      }

      if (ids.length > 100) {
        return badRequestResponse('Maximum 100 IDs allowed per request');
      }

      const placeholders = ids.map(() => '?').join(',');
      const query = `SELECT * FROM announcements WHERE announcement_id IN (${placeholders})`;
      
      const result = await env.DB.prepare(query).bind(...ids).all();

      return successResponse({
        announcements: result.results || [],
        count: result.results?.length || 0
      });
    } catch (error) {
      console.error('Batch get announcements error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while fetching announcements', 500);
    }
  });
};
