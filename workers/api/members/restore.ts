/**
 * Restore Members Endpoint
 * POST /api/members/restore
 * Restores soft-deleted members within undo window
 */

import { withAdminAuth } from '../_middleware';
import { successResponse, errorResponse } from '../_utils';
import type { PagesFunction, Env } from '../_types';

export const onRequestPost: PagesFunction<Env> = withAdminAuth(async (context) => {
  const { request, env } = context;
  
  const body = await request.json() as {
    userIds: string[];
  };
  
  if (!body.userIds || !Array.isArray(body.userIds)) {
    return errorResponse('INVALID_INPUT', 'userIds array required');
  }
  
  if (body. userIds.length === 0 || body.userIds.length > 100) {
    return errorResponse('INVALID_INPUT', 'Provide 1-100 user IDs');
  }
  
  // Restore users (set deleted_at_utc to NULL)
  const placeholders = body.userIds.map(() => '?').join(',');
  const result = await env.DB.prepare(
    `UPDATE users 
     SET deleted_at_utc = NULL, updated_at_utc = ?
     WHERE user_id IN (${placeholders})
     AND deleted_at_utc IS NOT NULL`
  ).bind(new Date().toISOString(), ...body.userIds).run();
  
  return successResponse({
    affectedCount: result.meta.changes || 0,
  });
});
