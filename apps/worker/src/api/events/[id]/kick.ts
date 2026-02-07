/**
 * Event Actions - Kick participants
 * POST /api/events/[id]/kick
 * Body: { userId?: string; userIds?: string[] }
 */

import type { Event } from '../../../core/types';
import { createEndpoint } from '../../../core/endpoint-factory';
import { broadcastUpdate } from '../../../core/broadcast';
import { createAuditLog, utcNow } from '../../../core/utils';
import { NotFoundError } from '../../../core/errors';

interface KickBody {
  userId?: string;
  userIds?: string[];
}

interface KickResponse {
  message: string;
  removedCount: number;
}

export const onRequestPost = createEndpoint<KickResponse, any, KickBody>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => {
    const userIds = Array.isArray(body?.userIds)
      ? body.userIds
      : body?.userId
      ? [body.userId]
      : [];

    if (userIds.length === 0) {
      throw new Error('userId or userIds is required');
    }

    if (userIds.length > 100) {
      throw new Error('Maximum 100 users per kick operation');
    }

    return { userIds };
  },

  handler: async ({ env, user, params, body, waitUntil }) => {
    const eventId = params.id;
    const now = utcNow();
    const userIds = (body as any).userIds as string[];

    const event = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first<Event>();

    if (!event) {
      throw new NotFoundError('Event');
    }

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

    const removedCount = result.meta.changes || 0;

    await createAuditLog(
      env.DB,
      'event',
      'kick',
      user!.user_id,
      eventId,
      `Removed ${removedCount} participant(s) from event`,
      JSON.stringify({ userIds, removedCount, at: now })
    );

    const updatedEvent = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first<Event>();

    if (updatedEvent) {
      waitUntil(
        broadcastUpdate(env, {
          entity: 'events',
          action: 'updated',
          payload: [updatedEvent],
          ids: [eventId],
          excludeUserId: user!.user_id,
        })
      );
    }

    return {
      message: `Removed ${removedCount} participant(s)`,
      removedCount,
    };
  },
});
