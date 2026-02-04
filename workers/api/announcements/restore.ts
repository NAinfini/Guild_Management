/**
 * Restore Announcements Endpoint
 * POST /api/announcements/restore
 * Restores soft-deleted announcements within undo window
 */

import { withModeratorAuth } from '../_middleware';
import { successResponse, errorResponse } from '../_utils';
import type { PagesFunction, Env } from '../_types';

export const onRequestPost: PagesFunction<Env> = withModeratorAuth(async (context) => {
  const { request, env } = context;
  
  const body = await request.json() as {
    announcementIds: string[];
  };
  
  if (!body.announcementIds || !Array.isArray(body.announcementIds)) {
    return errorResponse('INVALID_INPUT', 'announcementIds array required');
  }
  
  if (body.announcementIds.length === 0 || body.announcementIds.length > 100) {
    return errorResponse('INVALID_INPUT', 'Provide 1-100 announcement IDs');
  }
  
  // Restore announcements (set deleted_at_utc to NULL)
  const placeholders = body.announcementIds.map(() => '?').join(',');
  const result = await env.DB.prepare(
    `UPDATE announcements 
     SET deleted_at_utc = NULL, updated_at_utc = ?
     WHERE announcement_id IN (${placeholders})
     AND deleted_at_utc IS NOT NULL`
  ).bind(new Date().toISOString(), ...body.announcementIds).run();
  
  return successResponse({
    affectedCount: result.meta.changes || 0,
  });
});
