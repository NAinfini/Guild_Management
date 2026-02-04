/**
 * Change password endpoint
 * POST /api/auth/change-password
 */

import type { PagesFunction, Env } from '../_types';
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  unauthorizedResponse,
  hashPassword,
  verifyPassword,
  utcNow,
  createAuditLog,
} from '../_utils';
import { withAuth } from '../_middleware';
import { validateBody, changePasswordSchema } from '../_validation';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  return withAuth(context, async (authContext) => {
    const { request, env } = authContext;
    const { user, session } = authContext.data;

    // Validate request body
    const validation = await validateBody(request, changePasswordSchema);
    if (!validation.success) {
      return badRequestResponse('Invalid request body', validation.error.errors);
    }

    const { currentPassword, newPassword } = validation.data;

    try {
      // Get current password hash
      const authRecord = await env.DB
        .prepare('SELECT password_hash, salt FROM user_auth_password WHERE user_id = ?')
        .bind(user.user_id)
        .first<{ password_hash: string; salt: string }>();

      if (!authRecord) {
        return errorResponse('INTERNAL_ERROR', 'Password record not found', 500);
      }

      // Verify current password
      const isValid = await verifyPassword(currentPassword, authRecord.password_hash, authRecord.salt);
      if (!isValid) {
        return unauthorizedResponse('Current password is incorrect');
      }

      // Hash new password
      const { hash: newHash, salt: newSalt } = await hashPassword(newPassword);
      const now = utcNow();

      // Update password
      await env.DB
        .prepare('UPDATE user_auth_password SET password_hash = ?, salt = ?, updated_at_utc = ? WHERE user_id = ?')
        .bind(newHash, newSalt, now, user.user_id)
        .run();

      // Revoke all other sessions (keep current session)
      await env.DB
        .prepare('UPDATE sessions SET revoked_at_utc = ?, updated_at_utc = ? WHERE user_id = ? AND session_id != ?')
        .bind(now, now, user.user_id, session!.session_id)
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

      return successResponse({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while changing password', 500);
    }
  });
};
