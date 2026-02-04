/**
 * Events API - Update/Delete Event
 * PUT /api/events/[id]
 * DELETE /api/events/[id]
 */

import type { PagesFunction, Env, Event } from '../_types';
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
  utcNow,
  createAuditLog,
  canEditEntity,
  etagFromTimestamp,
  assertIfMatch,
} from '../_utils';
import { withAuth } from '../_middleware';
import { validateBody, updateEventSchema } from '../_validation';

// ============================================================
// PUT /api/events/[id] - Update Event
// ============================================================

export const onRequestPut: PagesFunction<Env> = async (context) => {
  return withAuth(context, async (authContext) => {
    const { request, env, params } = authContext;
    const { user } = authContext.data;
    const eventId = params.id;

    // Get existing event
    const existingEvent = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ? AND is_archived = 0')
      .bind(eventId)
      .first<Event>();

    if (!existingEvent) {
      return notFoundResponse('Event');
    }

    // Check permissions
    if (!canEditEntity(user, existingEvent.created_by)) {
      return forbiddenResponse('You do not have permission to edit this event');
    }

    const currentEtag = etagFromTimestamp(existingEvent.updated_at_utc || existingEvent.created_at_utc);
    const pre = assertIfMatch(request, currentEtag);
    if (pre) return pre;

    // Validate request body
    const validation = await validateBody(request, updateEventSchema);
    if (!validation.success) {
      return badRequestResponse('Invalid request body', validation.error.errors);
    }

    const updates = validation.data;

    try {
      const now = utcNow();
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      // Build dynamic UPDATE query
      if (updates.type !== undefined) {
        updateFields.push('type = ?');
        updateValues.push(updates.type);
      }
      if (updates.title !== undefined) {
        updateFields.push('title = ?');
        updateValues.push(updates.title);
      }
      if (updates.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(updates.description || null);
      }
      if (updates.startAt !== undefined) {
        const startAtUtc = new Date(updates.startAt).toISOString().replace('T', ' ').substring(0, 19);
        updateFields.push('start_at_utc = ?');
        updateValues.push(startAtUtc);
      }
      if (updates.endAt !== undefined) {
        const endAtUtc = updates.endAt
          ? new Date(updates.endAt).toISOString().replace('T', ' ').substring(0, 19)
          : null;
        updateFields.push('end_at_utc = ?');
        updateValues.push(endAtUtc);
      }
      if (updates.capacity !== undefined) {
        updateFields.push('capacity = ?');
        updateValues.push(updates.capacity || null);
      }

      if (updateFields.length === 0) {
        return badRequestResponse('No fields to update');
      }

      // Add updated_by and updated_at
      updateFields.push('updated_by = ?', 'updated_at_utc = ?');
      updateValues.push(user.user_id, now);

      // Add WHERE clause
      updateValues.push(eventId);

      const query = `UPDATE events SET ${updateFields.join(', ')} WHERE event_id = ?`;
      await env.DB.prepare(query).bind(...updateValues).run();

      // Create audit log
      await createAuditLog(
        env.DB,
        'event',
        'update',
        user.user_id,
        eventId,
        `Updated event: ${updates.title || existingEvent.title}`,
        JSON.stringify(updates)
      );

      // Fetch updated event
      const event = await env.DB
        .prepare('SELECT * FROM events WHERE event_id = ?')
        .bind(eventId)
        .first<Event>();

      const etag = etagFromTimestamp(event?.updated_at_utc || event?.created_at_utc);
      const resp = successResponse({ event });
      if (etag) resp.headers.set('ETag', etag);
      return resp;
    } catch (error) {
      console.error('Update event error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while updating event', 500);
    }
  });
};

// ============================================================
// DELETE /api/events/[id] - Archive Event
// ============================================================

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  return withAuth(context, async (authContext) => {
    const { env, params } = authContext;
    const { user } = authContext.data;
    const eventId = params.id;

    // Get existing event
    const existingEvent = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ? AND is_archived = 0')
      .bind(eventId)
      .first<Event>();

    if (!existingEvent) {
      return notFoundResponse('Event');
    }

    // Check permissions
    if (!canEditEntity(user, existingEvent.created_by)) {
      return forbiddenResponse('You do not have permission to delete this event');
    }

    const currentEtag = etagFromTimestamp(existingEvent.updated_at_utc || existingEvent.created_at_utc);
    const pre = assertIfMatch(authContext.request, currentEtag);
    if (pre) return pre;

    try {
      const now = utcNow();

      // Soft delete (archive)
      await env.DB
        .prepare('UPDATE events SET is_archived = 1, archived_at_utc = ?, updated_at_utc = ? WHERE event_id = ?')
        .bind(now, now, eventId)
        .run();

      // Create audit log
      await createAuditLog(
        env.DB,
        'event',
        'archive',
        user.user_id,
        eventId,
        `Archived event: ${existingEvent.title}`,
        null
      );

      const updated = await env.DB
        .prepare('SELECT * FROM events WHERE event_id = ?')
        .bind(eventId)
        .first<Event>();

      const etag = etagFromTimestamp(updated?.updated_at_utc || updated?.created_at_utc);
      const resp = successResponse({ message: 'Event archived successfully' });
      if (etag) resp.headers.set('ETag', etag);
      return resp;
    } catch (error) {
      console.error('Delete event error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while deleting event', 500);
    }
  });
};
