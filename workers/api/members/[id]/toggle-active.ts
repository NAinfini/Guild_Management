/**
 * Member Actions - Toggle Active Status
 * POST /api/members/[id]/toggle-active
 * 
 * Toggles the active status of a member
 */

import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog, assertIfMatch, etagFromTimestamp, successResponse } from '../../../lib/utils';
import type { User } from '../../../lib/types';

interface ToggleActiveResponse {
  message: string;
  isActive: boolean;
}

export const onRequestPost = createEndpoint<ToggleActiveResponse>({
  auth: 'moderator',
  cacheControl: 'no-store',

  handler: async ({ env, user, params, request }) => {
    const memberId = params.id;
    
    // 1. Fetch current state
    const member = await env.DB
      .prepare('SELECT * FROM users WHERE user_id = ?')
      .bind(memberId)
      .first<User>();

    if (!member) {
      throw new Error('Member not found');
    }

    // 2. Concurrency check
    const currentEtag = etagFromTimestamp(member.updated_at_utc);
    const preconditionError = assertIfMatch(request, currentEtag);
    if (preconditionError) return preconditionError;

    // 3. Toggle state
    // is_active: 0 | 1
    const newStatus = member.is_active === 1 ? 0 : 1;
    const now = utcNow();

    // 4. Update
    await env.DB
      .prepare('UPDATE users SET is_active = ?, updated_at_utc = ? WHERE user_id = ?')
      .bind(newStatus, now, memberId)
      .run();

    // 5. Audit Log
    await createAuditLog(
      env.DB,
      'member',
      newStatus === 1 ? 'activate' : 'deactivate',
      user!.user_id,
      memberId,
      `${newStatus === 1 ? 'Activated' : 'Deactivated'} member: ${member.username}`,
      undefined
    );

    // 6. Return result
    const updated = await env.DB
            .prepare('SELECT updated_at_utc FROM users WHERE user_id = ?')
            .bind(memberId)
            .first<{ updated_at_utc: string }>();

    const newEtag = etagFromTimestamp(updated?.updated_at_utc) || undefined;

    return successResponse<ToggleActiveResponse>(
      {
        message: `Member ${newStatus === 1 ? 'activated' : 'deactivated'} successfully`,
        isActive: newStatus === 1,
      },
      200,
      newEtag ? { etag: newEtag } : undefined
    );
  },
});
