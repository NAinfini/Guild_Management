/**
 * Event Actions - Join/Leave/Pin/Lock/Duplicate
 * POST /api/events/[id]/join
 * POST /api/events/[id]/leave
 * POST /api/events/[id]/pin
 * POST /api/events/[id]/lock
 * POST /api/events/[id]/duplicate
 */

import type { PagesFunction, Env, Event } from '../../../lib/types';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
  conflictResponse,
  generateId,
  utcNow,
  createAuditLog,
  canEditEntity,
  etagFromTimestamp,
  assertIfMatch,
} from '../../../lib/utils';
import { withAuth, withModeratorAuth } from '../../../lib/middleware';

// ============================================================
// POST /api/events/[id]/join - Join Event
// ============================================================

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const action = context.params.action as string;

  switch (action) {
    case 'join':
      return handleJoin(context);
    case 'leave':
      return handleLeave(context);
    case 'pin':
      return handlePin(context);
    case 'lock':
      return handleLock(context);
    case 'duplicate':
      return handleDuplicate(context);
    default:
      return errorResponse('INVALID_ACTION', 'Invalid action', 400);
  }
};

async function handleJoin(context: any): Promise<Response> {
  return withAuth(context, async (authContext) => {
    const { env, params } = authContext;
    const { user } = authContext.data;
    const eventId = params.id;

    const event = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ? AND is_archived = 0')
      .bind(eventId)
      .first<Event>();

    if (!event) {
      return notFoundResponse('Event');
    }

    if (event.signup_locked) {
      return forbiddenResponse('Event signup is locked');
    }

    // Check if already joined
    const existing = await env.DB
      .prepare('SELECT * FROM event_participants WHERE event_id = ? AND user_id = ?')
      .bind(eventId, user.user_id)
      .first();

    if (existing) {
      return conflictResponse('Already joined this event');
    }

    // Check capacity
    if (event.capacity) {
      const count = await env.DB
        .prepare('SELECT COUNT(*) as count FROM event_participants WHERE event_id = ?')
        .bind(eventId)
        .first<{ count: number }>();

      if (count && count.count >= event.capacity) {
        return conflictResponse('Event is full');
      }
    }

    const now = utcNow();
    await env.DB
      .prepare(`
        INSERT INTO event_participants (event_id, user_id, joined_at_utc, joined_by, created_at_utc, updated_at_utc)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(eventId, user.user_id, now, user.user_id, now, now)
      .run();

    const etag = etagFromTimestamp(event.updated_at_utc);
    const resp = successResponse({ message: 'Joined event successfully' });
    if (etag) resp.headers.set('ETag', etag);
    return resp;
  });
}

async function handleLeave(context: any): Promise<Response> {
  return withAuth(context, async (authContext) => {
    const { env, params } = authContext;
    const { user } = authContext.data;
    const eventId = params.id;

    const result = await env.DB
      .prepare('DELETE FROM event_participants WHERE event_id = ? AND user_id = ?')
      .bind(eventId, user.user_id)
      .run();

    if (result.meta.changes === 0) {
      return notFoundResponse('Event participation');
    }

    return successResponse({ message: 'Left event successfully' });
  });
}

async function handlePin(context: any): Promise<Response> {
  return withModeratorAuth(context, async (authContext) => {
    const { env, params } = authContext;
    const { user } = authContext.data;
    const eventId = params.id;

    const event = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first<Event>();

    if (!event) {
      return notFoundResponse('Event');
    }

    const currentEtag = etagFromTimestamp(event.updated_at_utc);
    const pre = assertIfMatch(authContext.request, currentEtag);
    if (pre) return pre;

    const newPinState = event.is_pinned === 1 ? 0 : 1;
    const now = utcNow();

    await env.DB
      .prepare('UPDATE events SET is_pinned = ?, updated_at_utc = ? WHERE event_id = ?')
      .bind(newPinState, now, eventId)
      .run();

    await createAuditLog(
      env.DB,
      'event',
      newPinState ? 'pin' : 'unpin',
      user.user_id,
      eventId,
      `${newPinState ? 'Pinned' : 'Unpinned'} event: ${event.title}`,
      null
    );

    const updated = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first<Event>();

    const etag = etagFromTimestamp(updated?.updated_at_utc);
    const resp = successResponse({ message: `Event ${newPinState ? 'pinned' : 'unpinned'} successfully`, isPinned: newPinState === 1 });
    if (etag) resp.headers.set('ETag', etag);
    return resp;
  });
}

async function handleLock(context: any): Promise<Response> {
  return withModeratorAuth(context, async (authContext) => {
    const { env, params } = authContext;
    const { user } = authContext.data;
    const eventId = params.id;

    const event = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first<Event>();

    if (!event) {
      return notFoundResponse('Event');
    }

    const currentEtag = etagFromTimestamp(event.updated_at_utc);
    const pre = assertIfMatch(authContext.request, currentEtag);
    if (pre) return pre;

    const newLockState = event.signup_locked === 1 ? 0 : 1;
    const now = utcNow();

    await env.DB
      .prepare('UPDATE events SET signup_locked = ?, updated_at_utc = ? WHERE event_id = ?')
      .bind(newLockState, now, eventId)
      .run();

    await createAuditLog(
      env.DB,
      'event',
      newLockState ? 'lock' : 'unlock',
      user.user_id,
      eventId,
      `${newLockState ? 'Locked' : 'Unlocked'} event signup: ${event.title}`,
      null
    );

    const updated = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first<Event>();

    const etag = etagFromTimestamp(updated?.updated_at_utc);
    const resp = successResponse({ message: `Event signup ${newLockState ? 'locked' : 'unlocked'} successfully`, signupLocked: newLockState === 1 });
    if (etag) resp.headers.set('ETag', etag);
    return resp;
  });
}

async function handleDuplicate(context: any): Promise<Response> {
  return withAuth(context, async (authContext) => {
    const { env, params } = authContext;
    const { user } = authContext.data;
    const eventId = params.id;

    const event = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first<Event>();

    if (!event) {
      return notFoundResponse('Event');
    }

    if (!canEditEntity(user, event.created_by)) {
      return forbiddenResponse('You do not have permission to duplicate this event');
    }

    const newEventId = generateId('evt');
    const now = utcNow();

    // Duplicate event with adjusted times (add 7 days)
    const startDate = new Date(event.start_at_utc);
    startDate.setDate(startDate.getDate() + 7);
    const newStartAt = startDate.toISOString().replace('T', ' ').substring(0, 19);

    let newEndAt = null;
    if (event.end_at_utc) {
      const endDate = new Date(event.end_at_utc);
      endDate.setDate(endDate.getDate() + 7);
      newEndAt = endDate.toISOString().replace('T', ' ').substring(0, 19);
    }

    await env.DB
      .prepare(`
        INSERT INTO events (
          event_id, type, title, description, start_at_utc, end_at_utc,
          capacity, is_pinned, is_archived, signup_locked,
          created_by, updated_by, created_at_utc, updated_at_utc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?, ?)
      `)
      .bind(
        newEventId,
        event.type,
        `${event.title} (Copy)`,
        event.description,
        newStartAt,
        newEndAt,
        event.capacity,
        user.user_id,
        user.user_id,
        now,
        now
      )
      .run();

    await createAuditLog(
      env.DB,
      'event',
      'duplicate',
      user.user_id,
      newEventId,
      `Duplicated event: ${event.title}`,
      JSON.stringify({ originalEventId: eventId })
    );

    const newEvent = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(newEventId)
      .first<Event>();

    return successResponse({ event: newEvent }, 201);
  });
}
