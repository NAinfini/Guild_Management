/**
 * Event Batch Actions API
 * POST /api/events/batch - Batch process multiple events
 * GET /api/events/batch?ids=... - Get multiple events by IDs
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
  assertIfMatch,
} from '../_utils';
import { withModeratorAuth, withOptionalAuth } from '../_middleware';
import { validateBody, batchEventActionSchema } from '../_validation';

/**
 * GET /api/events/batch - Get multiple events by IDs
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withOptionalAuth(context, async (authContext) => {
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
      const query = `SELECT * FROM events WHERE event_id IN (${placeholders}) AND deleted_at IS NULL`;
      
      const result = await env.DB.prepare(query).bind(...ids).all();

      // Get participants for each event
      const eventIds = result.results?.map((e: any) => e.event_id) || [];
      const participantsByEvent: Record<string, any[]> = {};
      
      if (eventIds.length > 0) {
        const participantPlaceholders = eventIds.map(() => '?').join(',');
        const { results: participants } = await env.DB.prepare(
          `
            SELECT ep.event_id, u.user_id, u.username, u.role, u.power, u.is_active
            FROM event_participants ep
            JOIN users u ON ep.user_id = u.user_id
            WHERE ep.event_id IN (${participantPlaceholders})
          `
        ).bind(...eventIds).all();

        // Get classes for participants
        const userIds = participants.map((p: any) => p.user_id);
        if (userIds.length > 0) {
          const userPlaceholders = userIds.map(() => '?').join(',');
          const { results: classRows } = await env.DB.prepare(
            `SELECT user_id, class_code FROM member_classes WHERE user_id IN (${userPlaceholders})`
          ).bind(...userIds).all();
          
          const classMap = classRows.reduce<Record<string, string[]>>((acc, row: any) => {
            if (!acc[row.user_id]) acc[row.user_id] = [];
            acc[row.user_id].push(row.class_code);
            return acc;
          }, {});

          for (const p of (participants as any[])) {
            if (!participantsByEvent[p.event_id]) participantsByEvent[p.event_id] = [];
            participantsByEvent[p.event_id].push({
              id: p.user_id,
              username: p.username,
              role: p.role,
              power: p.power,
              classes: classMap[p.user_id] || [],
              active_status: p.is_active ? 'active' : 'inactive',
            });
          }
        }
      }

      const events = result.results?.map((event: any) => {
        const members = participantsByEvent[event.event_id] || [];
        return {
          id: event.event_id,
          type: event.type,
          title: event.title,
          description: event.description,
          start_time: event.start_at_utc,
          end_time: event.end_at_utc,
          capacity: event.capacity,
          is_locked: !!event.signup_locked,
          is_pinned: !!event.is_pinned,
          is_archived: !!event.is_archived,
          participants: members,
          current: members.length,
          updated_at: event.updated_at_utc,
        };
      }) || [];

      return successResponse({
        events,
        count: events.length
      });
    } catch (error) {
      console.error('Batch get events error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while fetching events', 500);
    }
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  return withModeratorAuth(context, async (authContext) => {
    const { request, env } = authContext;
    const { user: operator } = authContext.data;

    const validation = await validateBody(request, batchEventActionSchema);
    if (!validation.success) {
      return badRequestResponse('Invalid request body', validation.error.flatten());
    }

    const { eventIds, action } = validation.data;
    
    // Guaranteed by withModeratorAuth, but for TS:
    if (!operator) return unauthorizedResponse();

    try {
      // Concurrency check: compare If-Match to max updated_at of target events
      const placeholdersForCheck = eventIds.map(() => '?').join(',');
      const maxRow = await env.DB
        .prepare(`SELECT MAX(updated_at_utc) as ts FROM events WHERE event_id IN (${placeholdersForCheck})`)
        .bind(...eventIds)
        .first<{ ts: string }>();
      const currentEtag = etagFromTimestamp(maxRow?.ts || null);
      const pre = assertIfMatch(request, currentEtag);
      if (pre) return pre;

      const now = utcNow();
      const statements = [];

      if (action === 'archive' || action === 'unarchive') {
        const isArchived = action === 'archive' ? 1 : 0;
        const placeholders = eventIds.map(() => '?').join(',');
        
        statements.push(
          env.DB.prepare(`UPDATE events SET is_archived = ?, archived_at_utc = ?, updated_at_utc = ? WHERE event_id IN (${placeholders})`)
            .bind(isArchived, isArchived ? now : null, now, ...eventIds)
        );

        for (const id of eventIds) {
          await createAuditLog(
            env.DB,
            'event',
            action,
            operator.user_id,
            id,
            `Batch ${action}d event`
          );
        }
      } else if (action === 'delete') {
        const placeholders = eventIds.map(() => '?').join(',');
        
        // Soft delete
        statements.push(
          env.DB.prepare(`UPDATE events SET deleted_at = ?, updated_at_utc = ? WHERE event_id IN (${placeholders})`)
            .bind(now, now, ...eventIds)
        );

        for (const id of eventIds) {
          await createAuditLog(
            env.DB,
            'event',
            'delete',
            operator.user_id,
            id,
            'Batch deleted event'
          );
        }
      }

      if (statements.length > 0) {
        await env.DB.batch(statements);
      }

      const newEtag = etagFromTimestamp(now);
      const resp = successResponse({
        message: 'Batch action completed successfully',
        affectedCount: eventIds.length,
        action,
      });
      if (newEtag) resp.headers.set('ETag', newEtag);
      return resp;
    } catch (error) {
      console.error('Batch event action error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred during batch processing', 500);
    }
  });
};
