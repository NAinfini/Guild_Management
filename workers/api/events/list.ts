/**
 * Events API - List Events
 * GET /api/events - List all active events
 */

import type { PagesFunction, Env, Event } from '../../lib/types';
import { successResponse, errorResponse, etagFromTimestamp } from '../../lib/utils';
import { withOptionalAuth } from '../../lib/middleware';
import { DB_TABLES, EVENT_COLUMNS } from '../../lib/db-schema';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withOptionalAuth(context, async (authContext) => {
    const { env, request } = authContext;
    const { user } = authContext.data;

    try {
      const url = new URL(request.url);
      const type = url.searchParams.get('type'); // Filter by event type
      const includeArchived = url.searchParams.get('includeArchived') === 'true';

      let query = `SELECT * FROM ${DB_TABLES.events} WHERE 1=1`;
      const params: any[] = [];

      if (!includeArchived) {
        query += ' AND is_archived = 0';
      }

      if (type) {
        query += ' AND type = ?';
        params.push(type);
      }

      query += ' ORDER BY is_pinned DESC, start_at_utc DESC LIMIT 100';

      const result = await env.DB.prepare(query).bind(...params).all<Event>();

      // If user is logged in, get their participation status
      let participationMap: Record<string, boolean> = {};
      if (user) {
        const participations = await env.DB
          .prepare(`
            SELECT DISTINCT et.event_id
            FROM ${DB_TABLES.teamMembers} tm
            INNER JOIN ${DB_TABLES.eventTeams} et ON et.team_id = tm.team_id
            WHERE tm.user_id = ?
          `)
          .bind(user.user_id)
          .all<{ event_id: string }>();

        participationMap = (participations.results || []).reduce((acc, p) => {
          acc[p.event_id] = true;
          return acc;
        }, {} as Record<string, boolean>);
      }

      // Enhance events with participation status and participant count
      const eventsWithData = await Promise.all(
        (result.results || []).map(async (event) => {
          const countResult = await env.DB
            .prepare(`
              SELECT COUNT(DISTINCT tm.user_id) as count
              FROM ${DB_TABLES.teamMembers} tm
              INNER JOIN ${DB_TABLES.eventTeams} et ON et.team_id = tm.team_id
              WHERE et.event_id = ?
            `)
            .bind(event.event_id)
            .first<{ count: number }>();

          return {
            ...event,
            participantCount: countResult?.count || 0,
            isUserParticipating: user ? participationMap[event.event_id] || false : false,
          };
        })
      );

      const maxUpdated = (eventsWithData as any[]).reduce((max, e) => {
        const ts = (e as any).updated_at_utc || (e as any).updated_at || (e as any).start_at_utc;
        return ts && (!max || ts > max) ? ts : max;
      }, null as string | null);

      const etag = etagFromTimestamp(maxUpdated);
      return successResponse(eventsWithData, 200);
    } catch (error) {
      console.error('List events error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while fetching events', 500);
    }
  });
};
