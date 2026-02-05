/**
 * Member Admin Actions
 * PUT /api/members/[id]/role - Change member role (admin only)
 * POST /api/members/[id]/deactivate - Deactivate member
 * POST /api/members/[id]/reset-password - Admin password reset
 */

import type { PagesFunction, Env, User } from '../../../lib/types';
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
  generateId,
  utcNow,
  hashPassword,
  createAuditLog,
  etagFromTimestamp,
  assertIfMatch,
} from '../../../lib/utils';
import { withAuth, withAdminAuth } from '../../../lib/middleware';
import { validateBody, updateRoleSchema } from '../../../lib/validation';

// ============================================================
// PUT /api/members/[id]/role - Change Role (Admin Only)
// ============================================================

export const onRequestPut: PagesFunction<Env> = async (context) => {
  return withAdminAuth(context, async (authContext) => {
    const { request, env, params } = authContext;
    const { user: admin } = authContext.data;
    const userId = params.id;

    const validation = await validateBody(request, updateRoleSchema);
    if (!validation.success) {
      return badRequestResponse('Invalid request body', validation.error.errors);
    }

    const { role } = validation.data;

    try {
      // Get target user
      const targetUser = await env.DB
        .prepare('SELECT * FROM users WHERE user_id = ? AND deleted_at_utc IS NULL')
        .bind(userId)
        .first<User>();

      if (!targetUser) {
        return notFoundResponse('Member');
      }

      const currentEtag = etagFromTimestamp(targetUser.updated_at_utc || targetUser.created_at_utc);
      const pre = assertIfMatch(request, currentEtag);
      if (pre) return pre;

      // Prevent self-demotion from admin
      if (userId === admin.user_id && role !== 'admin') {
        return forbiddenResponse('Cannot demote yourself from admin role');
      }

      const now = utcNow();

      // Update role
      await env.DB
        .prepare('UPDATE users SET role = ?, updated_at_utc = ? WHERE user_id = ?')
        .bind(role, now, userId)
        .run();

      // Create audit log
      await createAuditLog(
        env.DB,
        'user',
        'role_change',
        admin.user_id,
        userId,
        `Changed role from ${targetUser.role} to ${role}`,
        JSON.stringify({ oldRole: targetUser.role, newRole: role })
      );

      const updated = await env.DB
        .prepare('SELECT * FROM users WHERE user_id = ?')
        .bind(userId)
        .first<User>();

      const etag = etagFromTimestamp(updated?.updated_at_utc || updated?.created_at_utc);

      const resp = successResponse({
        message: 'Role updated successfully',
        userId,
        newRole: role,
      });
      if (etag) resp.headers.set('ETag', etag);
      return resp;
    } catch (error) {
      console.error('Change role error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while changing role', 500);
    }
  });
};

// ============================================================
// POST /api/members/[id]/deactivate - Deactivate Member
// ============================================================

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const action = context.params.action;

  if (action === 'deactivate') {
    return handleDeactivate(context);
  } else if (action === 'reset-password') {
    return handleResetPassword(context);
  }

  return errorResponse('INVALID_ACTION', 'Invalid action', 400);
};

async function handleDeactivate(context: any): Promise<Response> {
  return withAdminAuth(context, async (authContext) => {
    const { env, params } = authContext;
    const { user: admin } = authContext.data;
    const userId = params.id;

    try {
      // Get target user
      const targetUser = await env.DB
        .prepare('SELECT * FROM users WHERE user_id = ? AND deleted_at_utc IS NULL')
        .bind(userId)
        .first<User>();

      if (!targetUser) {
        return notFoundResponse('Member');
      }

      // Prevent self-deactivation
      if (userId === admin.user_id) {
        return forbiddenResponse('Cannot deactivate yourself');
      }

      const currentEtag = etagFromTimestamp(targetUser.updated_at_utc || targetUser.created_at_utc);
      const pre = assertIfMatch(authContext.request, currentEtag);
      if (pre) return pre;

      const now = utcNow();
      const newActiveState = targetUser.is_active === 1 ? 0 : 1;

      // Toggle is_active
      await env.DB
        .prepare('UPDATE users SET is_active = ?, updated_at_utc = ? WHERE user_id = ?')
        .bind(newActiveState, now, userId)
        .run();

      // Revoke all sessions if deactivating
      if (newActiveState === 0) {
        await env.DB
          .prepare('UPDATE sessions SET revoked_at_utc = ?, updated_at_utc = ? WHERE user_id = ?')
          .bind(now, now, userId)
          .run();
      }

      // Create audit log
      await createAuditLog(
        env.DB,
        'user',
        newActiveState === 0 ? 'deactivate' : 'reactivate',
        admin.user_id,
        userId,
        `${newActiveState === 0 ? 'Deactivated' : 'Reactivated'} user: ${targetUser.username}`,
        null
      );

      const updated = await env.DB
        .prepare('SELECT updated_at_utc FROM users WHERE user_id = ?')
        .bind(userId)
        .first<{ updated_at_utc: string }>();
      const etag = etagFromTimestamp(updated?.updated_at_utc || targetUser.updated_at_utc);

      const resp = successResponse({
        message: `Member ${newActiveState === 0 ? 'deactivated' : 'reactivated'} successfully`,
        userId,
        isActive: newActiveState === 1,
      });
      if (etag) resp.headers.set('ETag', etag);
      return resp;
    } catch (error) {
      console.error('Deactivate member error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while deactivating member', 500);
    }
  });
}

async function handleResetPassword(context: any): Promise<Response> {
  return withAdminAuth(context, async (authContext) => {
    const { env, params } = authContext;
    const { user: admin } = authContext.data;
    const userId = params.id;

    try {
      // Get target user
      const targetUser = await env.DB
        .prepare('SELECT * FROM users WHERE user_id = ? AND deleted_at_utc IS NULL')
        .bind(userId)
        .first<User>();

      if (!targetUser) {
        return notFoundResponse('Member');
      }

      // Generate temporary password (8 random characters)
      const tempPassword = generateTempPassword();
      const { hash: passwordHash, salt } = await hashPassword(tempPassword);
      const currentEtag = etagFromTimestamp(targetUser.updated_at_utc || targetUser.created_at_utc);
      const pre = assertIfMatch(authContext.request, currentEtag);
      if (pre) return pre;

      const now = utcNow();

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

      // Create audit log
      await createAuditLog(
        env.DB,
        'user',
        'password_reset',
        admin.user_id,
        userId,
        `Admin reset password for user: ${targetUser.username}`,
        null
      );

      const updated = await env.DB
        .prepare('SELECT updated_at_utc FROM users WHERE user_id = ?')
        .bind(userId)
        .first<{ updated_at_utc: string }>();
      const etag = etagFromTimestamp(updated?.updated_at_utc || targetUser.updated_at_utc);

      const resp = successResponse({
        message: 'Password reset successfully',
        userId,
        tempPassword, // Return temp password to admin (should be communicated securely to user)
      });
      if (etag) resp.headers.set('ETag', etag);
      return resp;
    } catch (error) {
      console.error('Reset password error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while resetting password', 500);
    }
  });
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
