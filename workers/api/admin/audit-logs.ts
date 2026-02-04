/**
 * Admin API - Audit Log
 * GET /api/admin/audit-logs - Get audit logs with pagination
 */

import type { PagesFunction, Env, AuditLog } from '../../_types';
import {
  successResponse,
  errorResponse,
} from '../../_utils';
import { withAuth } from '../../_middleware';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withAuth(context, async (authContext) => {
    const { env, request } = authContext;
    const { isAdmin, isModerator } = authContext.data;

    // Only admins and moderators can view audit logs
    if (!isAdmin && !isModerator) {
      return errorResponse('FORBIDDEN', 'Only admins and moderators can view audit logs', 403);
    }

    try {
      const url = new URL(request.url);
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 50);
      const cursor = url.searchParams.get('cursor');
      const entityType = url.searchParams.get('entityType');
      const actorId = url.searchParams.get('actorId');
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');

      const now = new Date();
      const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const rangeStart = startDate ? new Date(startDate) : defaultStart;
      const rangeEnd = endDate ? new Date(endDate) : now;

      if (rangeEnd.getTime() - rangeStart.getTime() > 365 * 24 * 60 * 60 * 1000) {
        return errorResponse('DATE_RANGE_TOO_LARGE', 400);
      }

      let query = 'SELECT * FROM audit_log WHERE created_at_utc BETWEEN ? AND ?';
      const params: any[] = [
        rangeStart.toISOString().replace('T', ' ').substring(0, 19),
        rangeEnd.toISOString().replace('T', ' ').substring(0, 19),
      ];

      if (entityType) {
        query += ' AND entity_type = ?';
        params.push(entityType);
      }

      if (actorId) {
        query += ' AND actor_id = ?';
        params.push(actorId);
      }

      if (cursor) {
        query += ' AND created_at_utc < ?';
        params.push(cursor);
      }

      query += ' ORDER BY created_at_utc DESC LIMIT ?';
      params.push(limit + 1); // Fetch one extra to determine if there are more

      const result = await env.DB.prepare(query).bind(...params).all<AuditLog>();

      const logs = result.results || [];
      const hasMore = logs.length > limit;
      const items = hasMore ? logs.slice(0, limit) : logs;
      const nextCursor = hasMore ? items[items.length - 1].created_at_utc : null;

      return successResponse({
        logs: items,
        cursor: nextCursor,
        hasMore,
        rangeStart: params[0],
        rangeEnd: params[1],
      });
    } catch (error) {
      console.error('Get audit logs error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while fetching audit logs', 500);
    }
  });
};
