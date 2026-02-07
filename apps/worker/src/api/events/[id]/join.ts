/**
 * Event Actions - Join
 * POST /api/events/[id]/join - Join event (self or batch for moderators)
 *
 * Features:
 * - Self join: No body required (uses authenticated user)
 * - Moderator batch join: { userIds: string[] }
 * - Backward compatible with existing self-join
 */

import type { Env, Event } from '../../../core/types';
import { createEndpoint } from '../../../core/endpoint-factory';
import { broadcastUpdate } from '../../../core/broadcast';
import { utcNow, createAuditLog } from '../../../core/utils';
import { NotFoundError } from '../../../core/errors';

// ============================================================
// Types
// ============================================================

interface BatchJoinBody {
  userIds: string[];
}

interface JoinEventResponse {
  message: string;
  participant?: any;
  joinedCount?: number;
  failed?: Array<{ userId: string; error: string }>;
}

// ============================================================
// POST /api/events/[id]/join
// ============================================================

export const onRequestPost = createEndpoint<JoinEventResponse, BatchJoinBody | Record<string, never>>({
  auth: 'required',
  cacheControl: 'no-store',

  parseBody: (body) => {
    // Check if it's a batch join (has 'userIds' array)
    if ('userIds' in body && Array.isArray(body.userIds)) {
      if (body.userIds.length === 0) {
        throw new Error('UserIds array cannot be empty');
      }
      if (body.userIds.length > 100) {
        throw new Error('Maximum 100 users per batch join');
      }
      return body as BatchJoinBody;
    }
    return body as Record<string, never>;
  },

  handler: async ({ env, user, params, body, waitUntil }) => {
    const eventId = params.id;
    const now = utcNow();
    const isBatch = 'userIds' in body;

    // Get event
    const event = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ? AND is_archived = 0 AND deleted_at_utc IS NULL')
      .bind(eventId)
      .first<Event>();

    if (!event) {
      throw new NotFoundError('Event');
    }

    if (event.signup_locked) {
      throw new Error('Event signup is locked');
    }

    // ============================================================
    // BATCH JOIN MODE: Moderator joining multiple users
    // ============================================================
    if (isBatch) {
      const { userIds } = body as BatchJoinBody;
      let successCount = 0;
      const failed: Array<{ userId: string; error: string }> = [];

      // Get or create Pool team for this event
      let poolTeam = await env.DB
        .prepare(`
          SELECT t.team_id FROM teams t
          INNER JOIN event_teams et ON et.team_id = t.team_id
          WHERE et.event_id = ? AND t.name = 'Pool'
        `)
        .bind(eventId)
        .first<{ team_id: string }>();

      if (!poolTeam) {
        // Create Pool team if it doesn't exist
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

      // Check capacity
      let currentCount = 0;
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
        currentCount = count?.count || 0;
      }

      // Check existing participants
      const placeholders = userIds.map(() => '?').join(',');
      const existing = await env.DB
        .prepare(`
          SELECT DISTINCT tm.user_id FROM team_members tm
          INNER JOIN event_teams et ON et.team_id = tm.team_id
          WHERE et.event_id = ? AND tm.user_id IN (${placeholders})
        `)
        .bind(eventId, ...userIds)
        .all();
      const existingUserIds = new Set(existing.results?.map((e: any) => e.user_id) || []);

      for (const userId of userIds) {
        try {
          // Check if already joined
          if (existingUserIds.has(userId)) {
            failed.push({ userId, error: 'Already joined' });
            continue;
          }

          // Check capacity
          if (event.capacity && event.capacity > 0 && currentCount >= event.capacity) {
            failed.push({ userId, error: 'Event is full' });
            continue;
          }

          // Join by adding to Pool team
          await env.DB
            .prepare(`
              INSERT INTO team_members (
                team_id, user_id, sort_order, joined_at_utc
              ) VALUES (?, ?, 0, ?)
            `)
            .bind(poolTeam.team_id, userId, now)
            .run();

          currentCount++;
          successCount++;
        } catch (error: any) {
          failed.push({ userId, error: error.message || 'Unknown error' });
        }
      }

      await createAuditLog(
        env.DB,
        'event',
        'batch_join',
        user!.user_id,
        eventId,
        `Batch joined ${successCount} users to event`,
        JSON.stringify({ total: userIds.length, success: successCount, failed: failed.length })
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

      return {
        message: `Batch join complete: ${successCount} joined, ${failed.length} failed`,
        joinedCount: successCount,
        failed: failed.length > 0 ? failed : undefined,
      };
    }

    // ============================================================
    // SELF JOIN MODE: User joins themselves
    // ============================================================

    // Get or create Pool team for this event
    let poolTeam = await env.DB
      .prepare(`
        SELECT t.team_id FROM teams t
        INNER JOIN event_teams et ON et.team_id = t.team_id
        WHERE et.event_id = ? AND t.name = 'Pool'
      `)
      .bind(eventId)
      .first<{ team_id: string }>();

    if (!poolTeam) {
      // Create Pool team if it doesn't exist
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

    // Check capacity
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

    // Check if already joined
    const existing = await env.DB
      .prepare(`
        SELECT tm.* FROM team_members tm
        INNER JOIN event_teams et ON et.team_id = tm.team_id
        WHERE et.event_id = ? AND tm.user_id = ?
      `)
      .bind(eventId, user!.user_id)
      .first();

    if (existing) {
      throw new Error('You have already joined this event');
    }

    // Join by adding to Pool team
    await env.DB
      .prepare(`
        INSERT INTO team_members (
          team_id, user_id, sort_order, joined_at_utc
        ) VALUES (?, ?, 0, ?)
      `)
      .bind(poolTeam.team_id, user!.user_id, now)
      .run();

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

    return {
      message: 'Joined event successfully',
      participant: {
        event_id: eventId,
        user_id: user!.user_id,
        created_at_utc: now,
      },
    };
  },
});
