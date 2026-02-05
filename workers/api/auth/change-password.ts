/**
 * Change Password endpoint
 * POST /api/auth/change-password
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../lib/types';
import { createEndpoint } from '../../lib/endpoint-factory';
import { utcNow, hashPassword, verifyPassword, createAuditLog } from '../../lib/utils';
import { validateBody, changePasswordSchema } from '../../lib/validation';

// ============================================================
// Types
// ============================================================

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

interface ChangePasswordResponse {
  message: string;
}

// ============================================================
// POST /api/auth/change-password
// ============================================================

export const onRequestPost = createEndpoint<ChangePasswordResponse, ChangePasswordBody>({
  auth: 'required',
  cacheControl: 'no-store',

  parseBody: (body) => {
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      throw new Error(JSON.stringify({ errors: validation.error.issues }));
    }
    return validation.data;
  },

  handler: async ({ env, user, session, body }) => {
    if (!user || !session) {
      throw new Error('User not authenticated');
    }

    // Get current password hash
    const authRecord = await env.DB
      .prepare('SELECT password_hash, salt FROM user_auth_password WHERE user_id = ?')
      .bind(user.user_id)
      .first<{ password_hash: string; salt: string }>();

    if (!authRecord) {
      throw new Error('Password record not found');
    }

    // Verify current password
    const isValid = await verifyPassword(body.currentPassword, authRecord.password_hash, authRecord.salt);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const { hash: newHash, salt: newSalt } = await hashPassword(body.newPassword);
    const now = utcNow();

    // Update password
    await env.DB
      .prepare('UPDATE user_auth_password SET password_hash = ?, salt = ?, updated_at_utc = ? WHERE user_id = ?')
      .bind(newHash, newSalt, now, user.user_id)
      .run();

    // Revoke all other sessions (keep current session)
    await env.DB
      .prepare('UPDATE sessions SET revoked_at_utc = ?, updated_at_utc = ? WHERE user_id = ? AND session_id != ?')
      .bind(now, now, user.user_id, session.session_id)
      .run();

    // Create audit log
    await createAuditLog(
      env.DB,
      'user',
      'password_change',
      user.user_id,
      user.user_id,
      'Password changed',
      'User changed their password'
    );

    return { message: 'Password changed successfully' };
  },
});
