/**
 * Events API - Create Event
 * POST /api/events
 */

import type { PagesFunction, Env, Event } from '../_types';
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  generateId,
  utcNow,
  createAuditLog,
} from '../_utils';
import { withAuth } from '../_middleware';
import { validateBody, createEventSchema } from '../_validation';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  return withAuth(context, async (authContext) => {
    const { request, env } = authContext;
    const { user } = authContext.data;

    // Validate request body
    const validation = await validateBody(request, createEventSchema);
    if (!validation.success) {
      return badRequestResponse('Invalid request body', validation.error.errors);
    }

    const { type, title, description, startAt, endAt, capacity } = validation.data;

    try {
      const eventId = generateId('evt');
      const now = utcNow();

      // Convert ISO datetime to SQLite format
      const startAtUtc = new Date(startAt).toISOString().replace('T', ' ').substring(0, 19);
      const endAtUtc = endAt ? new Date(endAt).toISOString().replace('T', ' ').substring(0, 19) : null;

      // Insert event
      await env.DB
        .prepare(`
          INSERT INTO events (
            event_id, type, title, description, start_at_utc, end_at_utc,
            capacity, is_pinned, is_archived, signup_locked,
            created_by, updated_by, created_at_utc, updated_at_utc
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?, ?)
        `)
        .bind(
          eventId,
          type,
          title,
          description || null,
          startAtUtc,
          endAtUtc,
          capacity || null,
          user.user_id,
          user.user_id,
          now,
          now
        )
        .run();

      // Create audit log
      await createAuditLog(
        env.DB,
        'event',
        'create',
        user.user_id,
        eventId,
        `Created event: ${title}`,
        JSON.stringify({ type, title, startAt, endAt })
      );

      // Fetch created event
      const event = await env.DB
        .prepare('SELECT * FROM events WHERE event_id = ?')
        .bind(eventId)
        .first<Event>();

      return successResponse({ event }, 201);
    } catch (error) {
      console.error('Create event error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while creating event', 500);
    }
  });
};
