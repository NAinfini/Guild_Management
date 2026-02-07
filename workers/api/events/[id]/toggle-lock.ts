/**
 * Event Actions - Toggle Lock
 * POST /api/events/[id]/toggle-lock
 * 
 * Toggles the signup locked state of an event
 */

import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog, assertIfMatch, etagFromTimestamp, successResponse } from '../../../lib/utils';
import type { Event } from '../../../lib/types';
import { NotFoundError } from '../../../lib/errors';

interface ToggleLockResponse {
  message: string;
  isLocked: boolean;
}

export const onRequestPost = createEndpoint<ToggleLockResponse>({
  auth: 'moderator',
  cacheControl: 'no-store',

  handler: async ({ env, user, params, request }) => {
    const eventId = params.id;
    
    // 1. Fetch current state
    const event = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first<Event>();

    if (!event) {
      throw new NotFoundError('Event'); // validation error map handles this? actually generic error
    }

    // 2. Concurrency check
    const currentEtag = etagFromTimestamp(event.updated_at_utc);
    const preconditionError = assertIfMatch(request, currentEtag);
    if (preconditionError) return preconditionError;

    // 3. Toggle state
    const newLockState = event.signup_locked === 1 ? 0 : 1;
    const now = utcNow();

    // 4. Update
    await env.DB
      .prepare('UPDATE events SET signup_locked = ?, updated_at_utc = ? WHERE event_id = ?')
      .bind(newLockState, now, eventId)
      .run();

    // 5. Audit Log
    await createAuditLog(
      env.DB,
      'event',
      newLockState ? 'lock' : 'unlock',
      user!.user_id,
      eventId,
      `${newLockState ? 'Locked' : 'Unlocked'} event signup: ${event.title}`,
      undefined
    );

    // 6. Return new state
    const updated = await env.DB
        .prepare('SELECT updated_at_utc FROM events WHERE event_id = ?')
        .bind(eventId)
        .first<{ updated_at_utc: string }>();

    const newEtag = etagFromTimestamp(updated?.updated_at_utc) || undefined;

    return successResponse<ToggleLockResponse>(
      {
        message: `Event signup ${newLockState ? 'locked' : 'unlocked'} successfully`,
        isLocked: newLockState === 1,
      },
      200,
      newEtag ? { etag: newEtag } : undefined
    );
  },
});
