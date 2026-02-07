/**
 * Events API - Event Detail Management
 * GET /api/events/[id] - Get event details
 * PUT /api/events/[id] - Update event
 * DELETE /api/events/[id] - Delete event
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env, Event } from '../../lib/types';
import { createEndpoint } from '../../lib/endpoint-factory';
import { broadcastUpdate } from '../../lib/broadcast';
import { DB_TABLES, EVENT_COLUMNS } from '../../lib/db-schema';
import {
  utcNow,
  createAuditLog,
  etagFromTimestamp,
  assertIfMatch,
  canEditEntity
} from '../../lib/utils';
import { NotFoundError } from '../../lib/errors';

// ============================================================
// Types
// ============================================================

interface UpdateEventBody {
  title?: string;
  description?: string;
  eventDate?: string;
  eventType?: string;
  maxParticipants?: number;
  capacity?: number;
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

export const onRequestGet = createEndpoint<EventResponse, any, any>({
  auth: 'optional',
  etag: true,
  cacheControl: 'public, max-age=60',

  handler: async ({ env, params }) => {
    const eventId = params.id;

    const event = await env.DB
      .prepare(`SELECT * FROM ${DB_TABLES.events} WHERE ${EVENT_COLUMNS.id} = ? AND ${EVENT_COLUMNS.isArchived} = 0`)
      .bind(eventId)
      .first<Event>();

    if (!event) {
      throw new NotFoundError('Event');
    }

    // Load participants from team_members linked to this event
    const attendees = await env.DB
      .prepare(`
        SELECT DISTINCT
          tm.user_id,
          u.username,
          u.power,
          tm.joined_at_utc as created_at_utc,
          t.name as team_name,
          t.team_id
        FROM ${DB_TABLES.teamMembers} tm
        INNER JOIN ${DB_TABLES.eventTeams} et ON et.team_id = tm.team_id
        INNER JOIN ${DB_TABLES.users} u ON tm.user_id = u.user_id
        LEFT JOIN ${DB_TABLES.teams} t ON tm.team_id = t.team_id
        WHERE et.event_id = ?
        ORDER BY tm.joined_at_utc
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

export const onRequestPut = createEndpoint<{ message: string; event: Event }, UpdateEventBody, any>({
  auth: 'required',
  cacheControl: 'no-store',

  parseBody: (body) => body as UpdateEventBody,

  handler: async ({ env, user, params, body, request, waitUntil }) => {
    const eventId = params.id;

    // Get existing event
    const existingEvent = await env.DB
      .prepare(`SELECT * FROM ${DB_TABLES.events} WHERE ${EVENT_COLUMNS.id} = ?`)
      .bind(eventId)
      .first<Event>();

    if (!existingEvent) {
      throw new NotFoundError('Event');
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
      eventDate: 'start_at_utc',
      eventType: 'type',
      maxParticipants: EVENT_COLUMNS.capacity,
      capacity: EVENT_COLUMNS.capacity,
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
          .prepare(`UPDATE ${DB_TABLES.events} SET ${updateFields.join(', ')} WHERE ${EVENT_COLUMNS.id} = ?`)
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
      .prepare(`SELECT * FROM ${DB_TABLES.events} WHERE ${EVENT_COLUMNS.id} = ?`)
      .bind(eventId)
      .first<Event>();

    if (!updatedEvent) {
      throw new Error('Failed to retrieve updated event');
    }

    // Broadcast update
    waitUntil(broadcastUpdate(env, {
      entity: 'events',
      action: 'updated',
      payload: [updatedEvent],
      ids: [eventId],
      excludeUserId: user!.user_id
    }));

    return {
      message: 'Event updated successfully',
      event: updatedEvent,
    };
  },
});

// ============================================================
// PATCH /api/events/[id] - Partial Updates (isPinned, signupLocked, etc)
// ============================================================

export const onRequestPatch = createEndpoint<{ message: string; event: Event }, PatchEventBody, any>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => body as PatchEventBody,

  handler: async ({ env, user, params, body, waitUntil }) => {
    const eventId = params.id;
    const { isPinned, signupLocked } = body;

    if (isPinned === undefined && signupLocked === undefined) {
      throw new Error('No fields to update');
    }

    const existing = await env.DB
      .prepare(`SELECT * FROM ${DB_TABLES.events} WHERE ${EVENT_COLUMNS.id} = ?`)
      .bind(eventId)
      .first<Event>();

    if (!existing) {
      throw new NotFoundError('Event');
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
      .prepare(`UPDATE ${DB_TABLES.events} SET ${updates.join(', ')} WHERE ${EVENT_COLUMNS.id} = ?`)
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
      .prepare(`SELECT * FROM ${DB_TABLES.events} WHERE ${EVENT_COLUMNS.id} = ?`)
      .bind(eventId)
      .first<Event>();

    if (!updated) {
      throw new Error('Failed to retrieve updated event');
    }

    // Broadcast update
    waitUntil(broadcastUpdate(env, {
      entity: 'events',
      action: 'updated',
      payload: [updated],
      ids: [eventId],
      excludeUserId: user!.user_id
    }));

    return {
      message: `Event ${auditActions.join(' and ')} successfully`,
      event: updated,
    };
  },
});

// ============================================================
// DELETE /api/events/[id]
// ============================================================

export const onRequestDelete = createEndpoint<{ message: string }, any, any>({
  auth: 'required',
  cacheControl: 'no-store',

  handler: async ({ env, user, params, waitUntil }) => {
    const eventId = params.id;

    const existingEvent = await env.DB
      .prepare(`SELECT * FROM ${DB_TABLES.events} WHERE ${EVENT_COLUMNS.id} = ?`)
      .bind(eventId)
      .first<Event>();

    if (!existingEvent) {
      throw new NotFoundError('Event');
    }

    if (!canEditEntity(user!, existingEvent.created_by)) {
      throw new Error('You do not have permission to delete this event');
    }

    const now = utcNow();

    // Soft delete
    await env.DB
      .prepare(`UPDATE ${DB_TABLES.events} SET ${EVENT_COLUMNS.deletedAt} = ?, ${EVENT_COLUMNS.updatedAt} = ? WHERE ${EVENT_COLUMNS.id} = ?`)
      .bind(now, now, eventId)
      .run();

    await createAuditLog(
      env.DB,
      'event',
      'delete',
      user!.user_id,
      eventId,
      'Deleted event',
      undefined
    );

    // Broadcast delete
    waitUntil(broadcastUpdate(env, {
      entity: 'events',
      action: 'deleted',
      ids: [eventId],
      excludeUserId: user!.user_id
    }));

    return { message: 'Event deleted successfully' };
  },
});
