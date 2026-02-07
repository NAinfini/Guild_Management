/**
 * Event Actions - Add Participant (Admin/Mod action)
 * POST /api/events/[id]/participants
 * Body: { userId: string }
 *
 * Uses team_members + event_teams pattern (same as join.ts)
 */

import { createEndpoint } from '../../../core/endpoint-factory';
import { broadcastUpdate } from '../../../core/broadcast';
import { utcNow, createAuditLog } from '../../../core/utils';
import { NotFoundError } from '../../../core/errors';
import type { Event } from '../../../core/types';

interface AddParticipantBody {
  userId: string;
}

export const onRequestPost = createEndpoint<{ message: string }, AddParticipantBody>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => {
    if (!body.userId || typeof body.userId !== 'string') {
      throw new Error('userId is required');
    }
    return body as AddParticipantBody;
  },

  handler: async ({ env, user, params, body, waitUntil }) => {
    const eventId = params.id;
    const targetUserId = body!.userId;
    const now = utcNow();

    // 1. Fetch event
    const event = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ? AND is_archived = 0 AND deleted_at_utc IS NULL')
      .bind(eventId)
      .first<Event>();

    if (!event) {
      throw new NotFoundError('Event');
    }

    // 2. Check if user exists
    const targetUser = await env.DB
      .prepare('SELECT user_id, username FROM users WHERE user_id = ?')
      .bind(targetUserId)
      .first<{ user_id: string; username: string }>();

    if (!targetUser) {
      throw new NotFoundError('User');
    }

    // 3. Get or create Pool team for this event
    let poolTeam = await env.DB
      .prepare(`
        SELECT t.team_id FROM teams t
        INNER JOIN event_teams et ON et.team_id = t.team_id
        WHERE et.event_id = ? AND t.name = 'Pool'
      `)
      .bind(eventId)
      .first<{ team_id: string }>();

    if (!poolTeam) {
      const poolTeamId = `team_${Date.now()}`;
      await env.DB
        .prepare(`INSERT INTO teams (team_id, name, description, created_at_utc, updated_at_utc) VALUES (?, 'Pool', 'Event participant pool', ?, ?)`)
        .bind(poolTeamId, now, now)
        .run();

      await env.DB
        .prepare(`INSERT INTO event_teams (event_id, team_id, assigned_at_utc) VALUES (?, ?, ?)`)
        .bind(eventId, poolTeamId, now)
        .run();

      poolTeam = { team_id: poolTeamId };
    }

    // 4. Check if already joined
    const existing = await env.DB
      .prepare(`
        SELECT tm.* FROM team_members tm
        INNER JOIN event_teams et ON et.team_id = tm.team_id
        WHERE et.event_id = ? AND tm.user_id = ?
      `)
      .bind(eventId, targetUserId)
      .first();

    if (existing) {
      throw new Error('User already joined this event');
    }

    // 5. Check capacity
    if (event.capacity && event.capacity > 0) {
      const count = await env.DB
        .prepare(`
          SELECT COUNT(DISTINCT tm.user_id) as count
          FROM team_members tm
          INNER JOIN event_teams et ON et.team_id = tm.team_id
          WHERE et.event_id = ?
        `)
        .bind(eventId)
        .first<{ count: number }>();

      if ((count?.count || 0) >= event.capacity) {
        throw new Error('Event is full');
      }
    }

    // 6. Add to Pool team
    await env.DB
      .prepare(`
        INSERT INTO team_members (team_id, user_id, sort_order, joined_at_utc)
        VALUES (?, ?, 0, ?)
      `)
      .bind(poolTeam.team_id, targetUserId, now)
      .run();

    // 7. Audit Log
    await createAuditLog(
      env.DB,
      'event',
      'join_other',
      user!.user_id,
      eventId,
      `Added member ${targetUser.username} to event`,
      JSON.stringify({ addedUserId: targetUserId })
    );

    const updatedEvent = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first<Event>();

    if (updatedEvent) {
      waitUntil(broadcastUpdate(env, {
        entity: 'events',
        action: 'updated',
        payload: [updatedEvent],
        ids: [eventId],
        excludeUserId: user!.user_id,
      }));
    }

    return { message: 'Member added to event successfully' };
  },
});
