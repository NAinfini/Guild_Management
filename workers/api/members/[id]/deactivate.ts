/**
 * Member Deactivation
 * POST /api/members/[id]/deactivate - Deactivate member
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env, User } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog, etagFromTimestamp, assertIfMatch } from '../../../lib/utils';

// ============================================================
// Types
// ============================================================

interface DeactivateResponse {
  message: string;
}

// ============================================================
// POST /api/members/[id]/deactivate
// ============================================================

export const onRequestPost = createEndpoint<DeactivateResponse>({
  auth: 'admin',
  cacheControl: 'no-store',

  handler: async ({ env, user: admin, params, request }) => {
    const userId = params.id;

    if (userId === admin!.user_id) {
      throw new Error('Cannot deactivate yourself');
    }

    // Get target user
    const targetUser = await env.DB
      .prepare('SELECT * FROM users WHERE user_id = ?')
      .bind(userId)
      .first<User>();

    if (!targetUser) {
      throw new Error('Member not found');
    }

    if (targetUser.deleted_at_utc) {
      throw new Error('Member is already deactivated');
    }

    const currentEtag = etagFromTimestamp(targetUser.updated_at_utc || targetUser.created_at_utc);
    const pre = assertIfMatch(request, currentEtag);
    if (pre) return pre;

    const now = utcNow();

    // Deactivate user
    await env.DB
      .prepare('UPDATE users SET deleted_at_utc = ?, updated_at_utc = ? WHERE user_id = ?')
      .bind(now, now, userId)
      .run();

    // Revoke sessions
    await env.DB
      .prepare('UPDATE sessions SET revoked_at_utc = ?, updated_at_utc = ? WHERE user_id = ?')
      .bind(now, now, userId)
      .run();

    await createAuditLog(
      env.DB,
      'member',
      'deactivate',
      admin!.user_id,
      userId,
      'Deactivated member',
      undefined
    );

    return { message: 'Member deactivated successfully' };
  },
});
