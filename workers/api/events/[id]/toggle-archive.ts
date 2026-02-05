/**
 * Event Actions - Toggle Archive
 * POST /api/events/[id]/toggle-archive
 * 
 * Toggles the archived state of an event
 */

import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog, assertIfMatch, etagFromTimestamp, successResponse } from '../../../lib/utils';
import type { Event } from '../../../lib/types';

interface ToggleArchiveResponse {
  message: string;
  isArchived: boolean;
}

export const onRequestPost = createEndpoint<ToggleArchiveResponse>({
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
      throw new Error('Event not found');
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
    const updated = await env.DB
            .prepare('SELECT updated_at_utc FROM events WHERE event_id = ?')
            .bind(eventId)
            .first<{ updated_at_utc: string }>();

    const newEtag = etagFromTimestamp(updated?.updated_at_utc) || undefined;

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
