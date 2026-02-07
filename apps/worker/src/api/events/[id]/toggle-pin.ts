/**
 * Event Actions - Toggle Pin Status
 * POST /api/events/[id]/toggle-pin
 */

import { createEndpoint } from '../../../core/endpoint-factory';
import { broadcastUpdate } from '../../../core/broadcast';
import { utcNow, createAuditLog, assertIfMatch, etagFromTimestamp, successResponse } from '../../../core/utils';
import type { Event } from '../../../core/types';
import { NotFoundError } from '../../../core/errors';

interface TogglePinResponse {
  message: string;
  isPinned: boolean;
}

export const onRequestPost = createEndpoint<TogglePinResponse>({
  auth: 'moderator',
  cacheControl: 'no-store',

  handler: async ({ env, user, params, request, waitUntil }) => {
    const eventId = params.id;
    
    // 1. Fetch current state
    const event = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first<Event>();

    if (!event) {
      throw new NotFoundError('Event');
    }

    // 2. Concurrency check
    const currentEtag = etagFromTimestamp(event.updated_at_utc);
    const preconditionError = assertIfMatch(request, currentEtag);
    if (preconditionError) return preconditionError;

    // 3. Toggle state
    // is_pinned: 0 | 1
    const newPinState = event.is_pinned === 1 ? 0 : 1;
    const now = utcNow();

    // 4. Update
    await env.DB
      .prepare('UPDATE events SET is_pinned = ?, updated_at_utc = ? WHERE event_id = ?')
      .bind(newPinState, now, eventId)
      .run();

    // 5. Audit Log
    await createAuditLog(
      env.DB,
      'event',
      newPinState === 1 ? 'pin' : 'unpin',
      user!.user_id,
      eventId,
      `${newPinState === 1 ? 'Pinned' : 'Unpinned'} event: ${event.title}`,
      undefined
    );

    // 6. Return result
    const updatedEvent = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first<Event>();

    const newEtag = etagFromTimestamp(updatedEvent?.updated_at_utc) || undefined;

    if (updatedEvent) {
      waitUntil(broadcastUpdate(env, {
        entity: 'events',
        action: 'updated',
        payload: [updatedEvent],
        ids: [eventId],
        excludeUserId: user!.user_id,
      }));
    }

    return successResponse<TogglePinResponse>(
      {
        message: `Event ${newPinState === 1 ? 'pinned' : 'unpinned'} successfully`,
        isPinned: newPinState === 1,
      },
      200,
      newEtag ? { etag: newEtag } : undefined
    );
  },
});
