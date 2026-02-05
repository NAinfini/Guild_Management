/**
 * Event Actions - Join
 * POST /api/events/[id]/join - Join event (self or batch for moderators)
 *
 * Features:
 * - Self join: No body required (uses authenticated user)
 * - Moderator batch join: { userIds: string[] }
 * - Backward compatible with existing self-join
 */

import type { Env, Event } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog } from '../../../lib/utils';

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

  handler: async ({ env, user, params, body }) => {
    const eventId = params.id;
    const now = utcNow();
    const isBatch = 'userIds' in body;

    // Get event
    const event = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ? AND is_archived = 0 AND deleted_at_utc IS NULL')
      .bind(eventId)
      .first<Event>();

    if (!event) {
      throw new Error('Event not found');
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

      // Check capacity
      let currentCount = 0;
      if (event.max_participants > 0) {
        const count = await env.DB
          .prepare('SELECT COUNT(*) as count FROM event_attendees WHERE event_id = ?')
          .bind(eventId)
          .first<{ count: number }>();
        currentCount = count?.count || 0;
      }

      // Check existing attendees
      const placeholders = userIds.map(() => '?').join(',');
      const existing = await env.DB
        .prepare(`SELECT user_id FROM event_attendees WHERE event_id = ? AND user_id IN (${placeholders})`)
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
          if (event.max_participants > 0 && currentCount >= event.max_participants) {
            failed.push({ userId, error: 'Event is full' });
            continue;
          }

          // Join
          await env.DB
            .prepare(`
              INSERT INTO event_attendees (
                event_id, user_id, created_at_utc
              ) VALUES (?, ?, ?)
            `)
            .bind(eventId, userId, now)
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

      return {
        message: `Batch join complete: ${successCount} joined, ${failed.length} failed`,
        joinedCount: successCount,
        failed: failed.length > 0 ? failed : undefined,
      };
    }

    // ============================================================
    // SELF JOIN MODE: User joins themselves
    // ============================================================
    // Check capacity
    if (event.max_participants > 0) {
      const count = await env.DB
        .prepare('SELECT COUNT(*) as count FROM event_attendees WHERE event_id = ?')
        .bind(eventId)
        .first<{ count: number }>();

      if ((count?.count || 0) >= event.max_participants) {
        throw new Error('Event is full');
      }
    }

    // Check if already joined
    const existing = await env.DB
      .prepare('SELECT * FROM event_attendees WHERE event_id = ? AND user_id = ?')
      .bind(eventId, user!.user_id)
      .first();

    if (existing) {
      throw new Error('You have already joined this event');
    }

    // Join
    await env.DB
      .prepare(`
        INSERT INTO event_attendees (
          event_id, user_id, created_at_utc
        ) VALUES (?, ?, ?)
      `)
      .bind(eventId, user!.user_id, now)
      .run();

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
