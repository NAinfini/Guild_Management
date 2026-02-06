/**
 * Event Actions - Pin/Unpin
 * POST /api/events/[id]/pin
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env, Event } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog } from '../../../lib/utils';

// ============================================================
// Types
// ============================================================

interface PinEventBody {
  isPinned: boolean;
}

interface PinEventResponse {
  message: string;
  isPinned: boolean;
}

// ============================================================
// POST /api/events/[id]/pin
// ============================================================

export const onRequestPost = createEndpoint<PinEventResponse, PinEventBody, any>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => body as PinEventBody,

  handler: async ({ env, user, params, body }) => {
    const eventId = params.id;
    const { isPinned } = body;
    const now = utcNow();

    const result = await env.DB
      .prepare('UPDATE events SET is_pinned = ?, updated_at_utc = ? WHERE event_id = ?')
      .bind(isPinned ? 1 : 0, now, eventId)
      .run();

    if (!result.meta.changes) {
      throw new Error('Event not found');
    }

    await createAuditLog(
      env.DB,
      'event',
      isPinned ? 'pin' : 'unpin',
      user!.user_id,
      eventId,
      `${isPinned ? 'Pinned' : 'Unpinned'} event`,
      undefined
    );

    return {
      message: `Event ${isPinned ? 'pinned' : 'unpinned'} successfully`,
      isPinned,
    };
  },
});
