/**
 * Admin Password Reset
 * POST /api/members/[id]/reset-password - Admin reset password
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env, User } from '../../../core/types';
import { createEndpoint } from '../../../core/endpoint-factory';
import {
  utcNow,
  createAuditLog,
  etagFromTimestamp,
  assertIfMatch,
  hashPassword
} from '../../../core/utils';
import { NotFoundError } from '../../../core/errors';

// ============================================================
// Types
// ============================================================

interface ResetPasswordResponse {
  message: string;
  tempPassword: string;
  userId: string;
}

// ============================================================
// POST /api/members/[id]/reset-password
// ============================================================

export const onRequestPost = createEndpoint<ResetPasswordResponse>({
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
      throw new NotFoundError('Member');
    }

    const currentEtag = etagFromTimestamp(targetUser.updated_at_utc || targetUser.created_at_utc);
    const pre = assertIfMatch(request, currentEtag);
    if (pre) return pre;

    const now = utcNow();
    const tempPassword = generateTempPassword();
    const { hash: passwordHash, salt } = await hashPassword(tempPassword);

    // Update password
    await env.DB
      .prepare('UPDATE user_auth_password SET password_hash = ?, salt = ?, updated_at_utc = ? WHERE user_id = ?')
      .bind(passwordHash, salt, now, userId)
      .run();

    // Revoke all sessions
    await env.DB
      .prepare('UPDATE sessions SET revoked_at_utc = ?, updated_at_utc = ? WHERE user_id = ?')
      .bind(now, now, userId)
      .run();

    await createAuditLog(
      env.DB,
      'user',
      'password_reset',
      admin!.user_id,
      userId,
      `Admin reset password for user: ${targetUser.username}`,
      undefined
    );

    return {
      message: 'Password reset successfully',
      userId,
      tempPassword,
    };
  },
});

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const array = new Uint8Array(12);
  crypto.getRandomValues(array);
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(array[i] % chars.length);
  }
  return password;
}
