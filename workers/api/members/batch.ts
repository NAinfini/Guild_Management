/**
 * Member Batch Actions API
 * POST /api/members/batch - Batch process multiple members
 * GET /api/members/batch?ids=... - Get multiple members by IDs
 */

import type { PagesFunction, Env } from '../_types';
import {
  successResponse,
  badRequestResponse,
  unauthorizedResponse,
  errorResponse,
  utcNow,
  createAuditLog,
} from '../_utils';
import { withAdminAuth, withOptionalAuth } from '../_middleware';
import { validateBody, batchMemberActionSchema } from '../_validation';

/**
 * GET /api/members/batch - Get multiple members by IDs
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withOptionalAuth(context, async (authContext) => {
    const { request, env } = authContext;

    try {
      const url = new URL(request.url);
      const idsParam = url.searchParams.get('ids');
      
      if (!idsParam) {
        return badRequestResponse('Missing ids parameter');
      }

      const ids = idsParam.split(',').map(id => id.trim()).filter(Boolean);
      
      if (ids.length === 0) {
        return badRequestResponse('No valid IDs provided');
      }

      if (ids.length > 100) {
        return badRequestResponse('Maximum 100 IDs allowed per request');
      }

      const placeholders = ids.map(() => '?').join(',');
      
      // Get users with their profiles
      const query = `
        SELECT 
          u.user_id,
          u.username,
          u.wechat_name,
          u.role,
          u.power,
          u.is_active,
          u.created_at_utc,
          u.updated_at_utc,
          mp.title_html,
          mp.bio_text,
          mp.vacation_start_at_utc,
          mp.vacation_end_at_utc
        FROM users u
        LEFT JOIN member_profiles mp ON mp.user_id = u.user_id
        WHERE u.user_id IN (${placeholders}) AND u.deleted_at IS NULL
      `;
      
      const result = await env.DB.prepare(query).bind(...ids).all();

      // Get classes for each member
      const classQuery = `SELECT user_id, class_code FROM member_classes WHERE user_id IN (${placeholders})`;
      const classResult = await env.DB.prepare(classQuery).bind(...ids).all();
      
      const classMap = classResult.results.reduce<Record<string, string[]>>((acc, row: any) => {
        if (!acc[row.user_id]) acc[row.user_id] = [];
        acc[row.user_id].push(row.class_code);
        return acc;
      }, {});

      const members = result.results?.map((m: any) => ({
        id: m.user_id,
        username: m.username,
        wechat_name: m.wechat_name,
        role: m.role,
        power: m.power,
        classes: classMap[m.user_id] || [],
        active_status: m.is_active ? 'active' : 'inactive',
        title_html: m.title_html,
        bio: m.bio_text,
        vacation_start: m.vacation_start_at_utc || undefined,
        vacation_end: m.vacation_end_at_utc || undefined,
        created_at: m.created_at_utc,
        updated_at: m.updated_at_utc,
      })) || [];

      return successResponse({
        members,
        count: members.length
      });
    } catch (error) {
      console.error('Batch get members error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while fetching members', 500);
    }
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  return withAdminAuth(context, async (authContext) => {
    const { request, env } = authContext;
    const { user: admin } = authContext.data;

    const validation = await validateBody(request, batchMemberActionSchema);
    if (!validation.success) {
      return badRequestResponse('Invalid request body', validation.error.flatten());
    }

    const { userIds, action, role } = validation.data;

    // Guaranteed by withAdminAuth middleware, but for TS:
    if (!admin) return unauthorizedResponse();

    if (action === 'set_role' && !role) {
      return badRequestResponse('Role is required for set_role action');
    }

    try {
      const now = utcNow();
      const statements = [];

      // 1. Prepare Update Statements
      if (action === 'set_role' && role) {
        // Prevent self-demotion in batch
        const filteredIds = userIds.filter(id => id !== admin.user_id);
        if (filteredIds.length === 0) {
          return badRequestResponse('Cannot change your own role in batch');
        }

        const placeholders = filteredIds.map(() => '?').join(',');
        statements.push(
          env.DB.prepare(`UPDATE users SET role = ?, updated_at_utc = ? WHERE user_id IN (${placeholders})`)
            .bind(role, now, ...filteredIds)
        );

        // Individual audit logs for role changes
        for (const id of filteredIds) {
          await createAuditLog(
            env.DB,
            'user',
            'role_change_batch',
            admin.user_id,
            id,
            `Batch changed role to ${role}`
          );
        }

      } else if (action === 'deactivate' || action === 'reactivate') {
        const isActive = action === 'reactivate' ? 1 : 0;
        const filteredIds = userIds.filter(id => id !== admin.user_id);

        if (filteredIds.length === 0) {
          return badRequestResponse('Cannot deactivate yourself in batch');
        }

        const placeholders = filteredIds.map(() => '?').join(',');
        statements.push(
          env.DB.prepare(`UPDATE users SET is_active = ?, updated_at_utc = ? WHERE user_id IN (${placeholders})`)
            .bind(isActive, now, ...filteredIds)
        );

        if (isActive === 0) {
          // Revoke sessions for deactivated users
          statements.push(
            env.DB.prepare(`UPDATE sessions SET revoked_at_utc = ?, updated_at_utc = ? WHERE user_id IN (${placeholders})`)
              .bind(now, now, ...filteredIds)
          );
        }

        for (const id of filteredIds) {
          await createAuditLog(
            env.DB,
            'user',
            action,
            admin.user_id,
            id,
            `Batch ${action}d user`
          );
        }
      }

      // Execute main updates
      if (statements.length > 0) {
        await env.DB.batch(statements);
      }

      return successResponse({
        message: 'Batch action completed successfully',
        affectedCount: userIds.length,
        action,
      });
    } catch (error) {
      console.error('Batch member action error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred during batch processing', 500);
    }
  });
};
