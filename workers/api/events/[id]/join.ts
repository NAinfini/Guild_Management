/**
 * Join Event Endpoint
 * POST /api/events/:id/join
 */

import type { PagesFunction, Env, Event } from '../../_types';
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  conflictResponse,
  errorResponse,
  utcNow,
} from '../../_utils';
import { withAuth } from '../../_middleware';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  return withAuth(context, async (authContext) => {
    const { env, params } = authContext;
    const { user } = authContext.data;
    const eventId = params.id;

    try {
      // Check event exists and not archived
      const event = await env.DB
        .prepare('SELECT * FROM events WHERE event_id = ? AND is_archived = 0')
        .bind(eventId)
        .first<Event>();

      if (!event) {
        return notFoundResponse('Event');
      }

      // Check if signup is locked (Admin/Mod can bypass)
      if (event.signup_locked && user.role !== 'admin' && user.role !== 'moderator') {
        return forbiddenResponse('Event signup is locked');
      }

      // Check capacity
      if (event.capacity) {
        const countResult = await env.DB
          .prepare('SELECT COUNT(*) as count FROM event_participants WHERE event_id = ?')
          .bind(eventId)
          .first<{ count: number }>();

        if (countResult && countResult.count >= event.capacity) {
          return conflictResponse('Event is at full capacity');
        }
      }

      // Check for conflicts (soft warning, not blocking)
      const conflicts = await env.DB
        .prepare(`
          SELECT e.event_id, e.title, e.start_at_utc, e.end_at_utc
          FROM events e
          JOIN event_participants ep ON e.event_id = ep.event_id
          WHERE ep.user_id = ?
            AND e.event_id != ?
            AND e.is_archived = 0
            AND (
              (e.start_at_utc <= ? AND (e.end_at_utc IS NULL OR e.end_at_utc >= ?))
              OR
              (e.start_at_utc >= ? AND e.start_at_utc <= ?)
            )
        `)
        .bind(
          user.user_id,
          eventId,
          event.start_at_utc,
          event.start_at_utc,
          event.start_at_utc,
          event.end_at_utc || event.start_at_utc
        )
        .all<{ event_id: string; title: string }>();

      // Insert participant (ignore if already exists)
      const now = utcNow();
      await env.DB
        .prepare(`
          INSERT INTO event_participants (event_id, user_id, joined_at_utc, joined_by, created_at_utc, updated_at_utc)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(event_id, user_id) DO NOTHING
        `)
        .bind(eventId, user.user_id, now, user.user_id, now, now)
        .run();

      // Update event updated_at for cache invalidation
      await env.DB
        .prepare('UPDATE events SET updated_at_utc = ? WHERE event_id = ?')
        .bind(now, eventId)
        .run();

      return successResponse({
        message: 'Joined event successfully',
        conflicts: conflicts.results || [],
      });
    } catch (error) {
      console.error('Join event error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while joining event', 500);
    }
  });
};
