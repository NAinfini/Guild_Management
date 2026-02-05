/**
 * Events API - Event Detail Management
 * GET /api/events/[id] - Get event details
 * PUT /api/events/[id] - Update event
 * DELETE /api/events/[id] - Delete event
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env, Event } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { 
  utcNow, 
  createAuditLog, 
  etagFromTimestamp, 
  assertIfMatch, 
  canEditEntity 
} from '../../../lib/utils';

// ============================================================
// Types
// ============================================================

interface UpdateEventBody {
  title?: string;
  description?: string;
  eventDate?: string;
  eventType?: string;
  minLevel?: number;
  maxParticipants?: number;
  // Add other event fields
}

interface PatchEventBody {
  isPinned?: boolean;
  signupLocked?: boolean;
}

interface EventResponse {
  event: Event;
  attendees: any[];
}

// ============================================================
// GET /api/events/[id]
// ============================================================

export const onRequestGet = createEndpoint<EventResponse>({
  auth: 'optional',
  etag: true,
  cacheControl: 'public, max-age=60',

  handler: async ({ env, params }) => {
    const eventId = params.id;

    const event = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ? AND is_archived = 0')
      .bind(eventId)
      .first<Event>();

    if (!event) {
      throw new Error('Event not found');
    }

    const attendees = await env.DB
      .prepare(`
        SELECT ea.*, u.username, u.avatar_url, u.class_code, u.power
        FROM event_attendees ea
        JOIN users u ON ea.user_id = u.user_id
        WHERE ea.event_id = ?
        ORDER BY ea.created_at_utc
      `)
      .bind(eventId)
      .all();

    return {
      event,
      attendees: attendees.results || [],
    };
  },
});

// ============================================================
// PUT /api/events/[id]
// ============================================================

export const onRequestPut = createEndpoint<{ message: string; event: Event }, UpdateEventBody>({
  auth: 'required',
  cacheControl: 'no-store',

  parseBody: (body) => body as UpdateEventBody,

  handler: async ({ env, user, params, body, request }) => {
    const eventId = params.id;

    // Get existing event
    const existingEvent = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first<Event>();

    if (!existingEvent) {
      throw new Error('Event not found');
    }

    // Check permissions
    if (!canEditEntity(user!, existingEvent.created_by)) {
      throw new Error('You do not have permission to edit this event');
    }

    const currentEtag = etagFromTimestamp(existingEvent.updated_at_utc || existingEvent.created_at_utc);
    const pre = assertIfMatch(request, currentEtag);
    if (pre) return pre;

    // Dynamic update query construction
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    const now = utcNow();

    const fieldMap: Record<string, string> = {
      title: 'title',
      description: 'description',
      eventDate: 'event_date',
      eventType: 'event_type',
      minLevel: 'min_level',
      maxParticipants: 'max_participants',
    };

    for (const [key, column] of Object.entries(fieldMap)) {
      const val = (body as any)[key];
      if (val !== undefined) {
        updateFields.push(`${column} = ?`);
        updateValues.push(val);
      }
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_at_utc = ?');
      updateValues.push(now, eventId);

      await env.DB
        .prepare(`UPDATE events SET ${updateFields.join(', ')} WHERE event_id = ?`)
        .bind(...updateValues)
        .run();
    }

    await createAuditLog(
      env.DB,
      'event',
      'update',
      user!.user_id,
      eventId,
      'Updated event details',
      JSON.stringify(body)
    );

    const updatedEvent = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first<Event>();

    return {
      message: 'Event updated successfully',
      event: updatedEvent!,
    };
  },
});

// ============================================================
// PATCH /api/events/[id] - Partial Updates (isPinned, signupLocked, etc)
// ============================================================

export const onRequestPatch = createEndpoint<{ message: string; event: Event }, PatchEventBody>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => body as PatchEventBody,

  handler: async ({ env, user, params, body }) => {
    const eventId = params.id;
    const { isPinned, signupLocked } = body;

    if (isPinned === undefined && signupLocked === undefined) {
      throw new Error('No fields to update');
    }

    const existing = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first<Event>();

    if (!existing) {
      throw new Error('Event not found');
    }

    const now = utcNow();
    const updates: string[] = ['updated_at_utc = ?'];
    const values: any[] = [now];
    const auditActions: string[] = [];

    if (isPinned !== undefined) {
      updates.push('is_pinned = ?');
      values.push(isPinned ? 1 : 0);
      auditActions.push(isPinned ? 'pinned' : 'unpinned');
    }

    if (signupLocked !== undefined) {
      updates.push('signup_locked = ?');
      values.push(signupLocked ? 1 : 0);
      auditActions.push(signupLocked ? 'locked' : 'unlocked');
    }

    values.push(eventId);

    await env.DB
      .prepare(`UPDATE events SET ${updates.join(', ')} WHERE event_id = ?`)
      .bind(...values)
      .run();

    await createAuditLog(
      env.DB,
      'event',
      'update',
      user!.user_id,
      eventId,
      `Event ${auditActions.join(' and ')}`,
      JSON.stringify(body)
    );

    const updated = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first<Event>();

    return {
      message: `Event ${auditActions.join(' and ')} successfully`,
      event: updated!,
    };
  },
});

// ============================================================
// DELETE /api/events/[id]
// ============================================================

export const onRequestDelete = createEndpoint<{ message: string }>({
  auth: 'required',
  cacheControl: 'no-store',

  handler: async ({ env, user, params }) => {
    const eventId = params.id;

    const existingEvent = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first<Event>();

    if (!existingEvent) {
      throw new Error('Event not found');
    }

    if (!canEditEntity(user!, existingEvent.created_by)) {
      throw new Error('You do not have permission to delete this event');
    }

    const now = utcNow();

    // Soft delete
    await env.DB
      .prepare('UPDATE events SET deleted_at_utc = ?, updated_at_utc = ? WHERE event_id = ?')
      .bind(now, now, eventId)
      .run();

    await createAuditLog(
      env.DB,
      'event',
      'delete',
      user!.user_id,
      eventId,
      'Deleted event',
      null
    );

    return { message: 'Event deleted successfully' };
  },
});
