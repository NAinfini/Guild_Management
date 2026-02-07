/**
 * Member Role Management
 * PUT /api/members/[id]/role - Change member role (admin only)
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env, User } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog, etagFromTimestamp, assertIfMatch } from '../../../lib/utils';
import { NotFoundError } from '../../../lib/errors';

// ============================================================
// Types
// ============================================================

interface UpdateRoleBody {
  role: 'admin' | 'moderator' | 'member';
}

interface UpdateRoleResponse {
  message: string;
  role: string;
}

// ============================================================
// PUT /api/members/[id]/role
// ============================================================

export const onRequestPut = createEndpoint<UpdateRoleResponse, any, UpdateRoleBody>({
  auth: 'admin',
  cacheControl: 'no-store',

  parseBody: (body) => {
    if (!body.role || !['admin', 'moderator', 'member'].includes(body.role)) {
      throw new Error('Valid role is required (admin, moderator, member)');
    }
    return body as UpdateRoleBody;
  },

  handler: async ({ env, user: admin, params, body, request }) => {
    const userId = params.id;
    if (!body) {
      throw new Error('Request body is required');
    }
    const { role } = body;

    // Prevent self-demotion/promotion if needed, though 'admin' auth implies powerful access.
    if (userId === admin!.user_id && role !== 'admin') {
      throw new Error('Cannot demote yourself from admin immediately. Ask another admin.');
    }

    // Get target user
    const targetUser = await env.DB
      .prepare('SELECT * FROM users WHERE user_id = ? AND deleted_at_utc IS NULL')
      .bind(userId)
      .first<User>();

    if (!targetUser) {
      throw new NotFoundError('Member');
    }

    const currentEtag = etagFromTimestamp(targetUser.updated_at_utc || targetUser.created_at_utc);
    const pre = assertIfMatch(request, currentEtag);
    if (pre) return pre;

    const now = utcNow();

    await env.DB
      .prepare('UPDATE users SET role = ?, updated_at_utc = ? WHERE user_id = ?')
      .bind(role, now, userId)
      .run();

    await createAuditLog(
      env.DB,
      'member',
      'update_role',
      admin!.user_id,
      userId,
      `Changed role to ${role}`,
      JSON.stringify({ oldRole: targetUser.role, newRole: role })
    );

    return {
      message: 'Role updated successfully',
      role,
    };
  },
});
