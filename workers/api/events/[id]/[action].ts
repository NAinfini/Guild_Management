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

    if (!user) return forbiddenResponse('User not authenticated');

    // Check if already joined ANY team linked to this event
    const existing = await env.DB
      .prepare(`
        SELECT tm.team_id 
        FROM team_members tm
        JOIN event_teams et ON tm.team_id = et.team_id
        WHERE et.event_id = ? AND tm.user_id = ?
      `)
      .bind(eventId, user.user_id)
      .first();

    if (existing) {
      return conflictResponse('Already joined this event');
    }

    // Check capacity (total count in all teams linked to event)
    if (event.capacity) {
      const count = await env.DB
        .prepare(`
          SELECT COUNT(*) as count 
          FROM team_members tm
          JOIN event_teams et ON tm.team_id = et.team_id
          WHERE et.event_id = ?
        `)
        .bind(eventId)
        .first<{ count: number }>();

      if (count && count.count >= event.capacity) {
        return conflictResponse('Event is full');
      }
    }

    const now = utcNow();
    
    // Determine Default Team Name based on Event Type
    const defaultTeamName = event.type === 'guild_war' ? 'Pool' : 'Participants';

    // Find or Create the Default Team
    let team = await env.DB
      .prepare(`
        SELECT t.* 
        FROM teams t
        JOIN event_teams et ON t.team_id = et.team_id
        WHERE et.event_id = ? AND t.name = ?
      `)
      .bind(eventId, defaultTeamName)
      .first<{ team_id: string }>();

    if (!team) {
      // Create new team
      const newTeamId = generateId('team');
      
      // Batch create team and link to event
      await env.DB.batch([
        env.DB.prepare(`
          INSERT INTO teams (team_id, name, description, is_locked, created_by, created_at_utc, updated_at_utc)
          VALUES (?, ?, ?, 0, ?, ?, ?)
        `).bind(newTeamId, defaultTeamName, `Default pool for ${event.title}`, 'system', now, now),
        
        env.DB.prepare(`
            INSERT INTO event_teams (event_id, team_id, assigned_at_utc)
            VALUES (?, ?, ?)
        `).bind(eventId, newTeamId, now)
      ]);
      
      team = { team_id: newTeamId };
    }

    // Add user to the team
    await env.DB
      .prepare(`
        INSERT INTO team_members (team_id, user_id, sort_order, joined_at_utc)
        VALUES (?, ?, 0, ?)
      `)
      .bind(team.team_id, user.user_id, now)
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

    if (!user) return forbiddenResponse('User not authenticated');

    // Remove user from ANY team linked to this event
    const result = await env.DB
      .prepare(`
        DELETE FROM team_members 
        WHERE user_id = ? AND team_id IN (
            SELECT team_id FROM event_teams WHERE event_id = ?
        )
      `)
      .bind(user.user_id, eventId)
      .run();

    if (result.meta.changes === 0) {
      return notFoundResponse('Event participation');
    }

    return successResponse({ message: 'Left event successfully' });
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

    if (!user) return forbiddenResponse('User not authenticated');

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
