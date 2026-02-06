/**
 * Event Actions - Lock/Unlock
 * POST /api/events/[id]/lock
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog } from '../../../lib/utils';

// ============================================================
// Types
// ============================================================

interface LockEventBody {
  isLocked: boolean;
}

interface LockEventResponse {
  message: string;
  isLocked: boolean;
}

// ============================================================
// POST /api/events/[id]/lock
// ============================================================

export const onRequestPost = createEndpoint<LockEventResponse, LockEventBody, any>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => body as LockEventBody,

  handler: async ({ env, user, params, body }) => {
    const eventId = params.id;
    const { isLocked } = body;
    const now = utcNow();

    const result = await env.DB
      .prepare('UPDATE events SET signup_locked = ?, updated_at_utc = ? WHERE event_id = ?')
      .bind(isLocked ? 1 : 0, now, eventId)
      .run();

    if (!result.meta.changes) {
      throw new Error('Event not found');
    }

    await createAuditLog(
      env.DB,
      'event',
      isLocked ? 'lock' : 'unlock',
      user!.user_id,
      eventId,
      `${isLocked ? 'Locked' : 'Unlocked'} event signup`,
      undefined
    );

    return {
      message: `Event signup ${isLocked ? 'locked' : 'unlocked'} successfully`,
      isLocked,
    };
  },
});
