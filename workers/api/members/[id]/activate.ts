/**
 * Member Activation
 * POST /api/members/[id]/activate - Activate/Restore member
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env, User } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog, etagFromTimestamp, assertIfMatch } from '../../../lib/utils';

// ============================================================
// Types
// ============================================================

interface ActivateResponse {
  message: string;
}

// ============================================================
// POST /api/members/[id]/activate
// ============================================================

export const onRequestPost = createEndpoint<ActivateResponse>({
  auth: 'admin',
  cacheControl: 'no-store',

  handler: async ({ env, user: admin, params, request }) => {
    const userId = params.id;

    // Get target user
    const targetUser = await env.DB
      .prepare('SELECT * FROM users WHERE user_id = ?')
      .bind(userId)
      .first<User>();

    if (!targetUser) {
      throw new Error('Member not found');
    }

    if (!targetUser.deleted_at_utc) {
      throw new Error('Member is already active');
    }

    const currentEtag = etagFromTimestamp(targetUser.updated_at_utc || targetUser.created_at_utc);
    const pre = assertIfMatch(request, currentEtag);
    if (pre) return pre;

    const now = utcNow();

    // Activate user
    await env.DB
      .prepare('UPDATE users SET deleted_at_utc = NULL, updated_at_utc = ? WHERE user_id = ?')
      .bind(now, userId)
      .run();

    await createAuditLog(
      env.DB,
      'member',
      'activate',
      admin!.user_id,
      userId,
      'Activated/Restored member',
      null
    );

    return { message: 'Member activated successfully' };
  },
});
