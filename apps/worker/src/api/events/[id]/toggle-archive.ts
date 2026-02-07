/**
 * Event Actions - Toggle Archive
 * POST /api/events/[id]/toggle-archive
 * 
 * Toggles the archived state of an event
 */

import { createEndpoint } from '../../../core/endpoint-factory';
import { broadcastUpdate } from '../../../core/broadcast';
import { utcNow, createAuditLog, assertIfMatch, etagFromTimestamp, successResponse } from '../../../core/utils';
import type { Event } from '../../../core/types';
import { NotFoundError } from '../../../core/errors';

interface ToggleArchiveResponse {
  message: string;
  isArchived: boolean;
}

export const onRequestPost = createEndpoint<ToggleArchiveResponse>({
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
    const newArchiveState = event.is_archived === 1 ? 0 : 1;
    const now = utcNow();

    // 4. Update
    await env.DB
      .prepare('UPDATE events SET is_archived = ?, updated_at_utc = ? WHERE event_id = ?')
      .bind(newArchiveState, now, eventId)
      .run();

    // 5. Audit Log
    await createAuditLog(
      env.DB,
      'event',
      newArchiveState ? 'archive' : 'restore',
      user!.user_id,
      eventId,
      `${newArchiveState ? 'Archived' : 'Restored'} event: ${event.title}`,
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

    return successResponse<ToggleArchiveResponse>(
      {
        message: `Event ${newArchiveState ? 'archived' : 'restored'} successfully`,
        isArchived: newArchiveState === 1,
      },
      200,
      newEtag ? { etag: newEtag } : undefined
    );
  },
});
