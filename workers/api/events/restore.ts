/**
 * Restore Events Endpoint
 * POST /api/events/restore
 * Restores soft-deleted events within undo window
 */

import { withModeratorAuth } from '../_middleware';
import { successResponse, errorResponse } from '../_utils';
import type { PagesFunction, Env } from '../_types';

export const onRequestPost: PagesFunction<Env> = withModeratorAuth(async (context) => {
  const { request, env } = context;
  
  const body = await request.json() as {
    eventIds: string[];
  };
  
  if (!body.eventIds || !Array.isArray(body.eventIds)) {
    return errorResponse('INVALID_INPUT', 'eventIds array required');
  }
  
  if (body.eventIds.length === 0 || body.eventIds.length > 100) {
    return errorResponse('INVALID_INPUT', 'Provide 1-100 event IDs');
  }
  
  // Restore events (set deleted_at_utc to NULL)
  const placeholders = body.eventIds.map(() => '?').join(',');
  const result = await env.DB.prepare(
    `UPDATE events 
     SET deleted_at_utc = NULL, updated_at_utc = ?
     WHERE event_id IN (${placeholders})
     AND deleted_at_utc IS NOT NULL`
  ).bind(new Date().toISOString(), ...body.eventIds).run();
  
  return successResponse({
    affectedCount: result.meta.changes || 0,
  });
});
