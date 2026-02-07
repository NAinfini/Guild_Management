/**
 * Event Actions - Leave
 * POST /api/events/[id]/leave - Leave event (self or batch for moderators)
 *
 * Features:
 * - Self leave: No body required (uses authenticated user)
 * - Moderator batch leave: { userIds: string[] }
 * - Backward compatible with existing self-leave
 */

import type { Env, Event } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog } from '../../../lib/utils';
import { NotFoundError } from '../../../lib/errors';

// ============================================================
// Types
// ============================================================

interface BatchLeaveBody {
  userIds: string[];
}

interface LeaveEventResponse {
  message: string;
  leftCount?: number;
  failed?: Array<{ userId: string; error: string }>;
}

// ============================================================
// POST /api/events/[id]/leave
// ============================================================

export const onRequestPost = createEndpoint<LeaveEventResponse, BatchLeaveBody | Record<string, never>>({
  auth: 'required',
  cacheControl: 'no-store',

  parseBody: (body) => {
    // Check if it's a batch leave (has 'userIds' array)
    if ('userIds' in body && Array.isArray(body.userIds)) {
      if (body.userIds.length === 0) {
        throw new Error('UserIds array cannot be empty');
      }
      if (body.userIds.length > 100) {
        throw new Error('Maximum 100 users per batch leave');
      }
      return body as BatchLeaveBody;
    }
    return body as Record<string, never>;
  },

  handler: async ({ env, user, params, body }) => {
    const eventId = params.id;
    const isBatch = 'userIds' in body;

    // Get event
    const event = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first<Event>();

    if (!event) {
      throw new NotFoundError('Event');
    }

    if (event.signup_locked) {
      throw new Error('Event signup is locked');
    }

    // ============================================================
    // BATCH LEAVE MODE: Moderator removing multiple users
    // ============================================================
    if (isBatch) {
      const { userIds } = body as BatchLeaveBody;
      const failed: Array<{ userId: string; error: string }> = [];

      // Batch delete from team_members linked to this event
      const placeholders = userIds.map(() => '?').join(',');
      const result = await env.DB
        .prepare(`
          DELETE FROM team_members
          WHERE user_id IN (${placeholders})
          AND team_id IN (
            SELECT team_id FROM event_teams WHERE event_id = ?
          )
        `)
        .bind(...userIds, eventId)
        .run();

      const deletedCount = result.meta.changes || 0;
      const successCount = deletedCount;

      // Track which users were not found
      if (deletedCount < userIds.length) {
        // Find which IDs were not actually in the event
        const allExisting = await env.DB
          .prepare(`
            SELECT DISTINCT tm.user_id FROM team_members tm
            INNER JOIN event_teams et ON et.team_id = tm.team_id
            WHERE et.event_id = ?
          `)
          .bind(eventId)
          .all();
        const existingSet = new Set(allExisting.results?.map((e: any) => e.user_id) || []);

        for (const userId of userIds) {
          if (existingSet.has(userId)) {
            // This should have been deleted
            continue;
          }
          // User was not in the event
          failed.push({ userId, error: 'Not a participant' });
        }
      }

      await createAuditLog(
        env.DB,
        'event',
        'batch_leave',
        user!.user_id,
        eventId,
        `Batch removed ${successCount} users from event`,
        JSON.stringify({ total: userIds.length, success: successCount, failed: failed.length })
      );

      return {
        message: `Batch leave complete: ${successCount} removed, ${failed.length} failed`,
        leftCount: successCount,
        failed: failed.length > 0 ? failed : undefined,
      };
    }

    // ============================================================
    // SELF LEAVE MODE: User leaves themselves
    // ============================================================
    const result = await env.DB
      .prepare(`
        DELETE FROM team_members
        WHERE user_id = ?
        AND team_id IN (
          SELECT team_id FROM event_teams WHERE event_id = ?
        )
      `)
      .bind(user!.user_id, eventId)
      .run();

    if (!result.meta.changes) {
      throw new Error('You are not a participant in this event');
    }

    return {
      message: 'Left event successfully',
    };
  },
});
