/**
 * Member Classes Management
 * PUT /api/members/[id]/classes - Update member classes
 */

import type { PagesFunction, Env } from '../../../_types';
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  forbiddenResponse,
  utcNow,
  etagFromTimestamp,
  assertIfMatch,
} from '../../../_utils';
import { withAuth } from '../../../_middleware';
import { validateBody, memberClassesSchema } from '../../../_validation';

export const onRequestPut: PagesFunction<Env> = async (context) => {
  return withAuth(context, async (authContext) => {
    const { request, env, params } = authContext;
    const { user, isAdmin, isModerator } = authContext.data;
    const userId = params.id;

    // Check permissions (self or admin/mod)
    if (userId !== user.user_id && !isAdmin && !isModerator) {
      return forbiddenResponse('You do not have permission to edit this member');
    }

    const current = await env.DB
      .prepare('SELECT updated_at_utc, created_at_utc FROM users WHERE user_id = ?')
      .bind(userId)
      .first<{ updated_at_utc: string; created_at_utc: string }>();
    const currentEtag = etagFromTimestamp(current?.updated_at_utc || current?.created_at_utc);
    const pre = assertIfMatch(request, currentEtag);
    if (pre) return pre;

    const validation = await validateBody(request, memberClassesSchema);
    if (!validation.success) {
      return badRequestResponse('Invalid request body', validation.error.errors);
    }

    const { classes } = validation.data;

    try {
      const now = utcNow();

      // Delete existing classes
      await env.DB
        .prepare('DELETE FROM member_classes WHERE user_id = ?')
        .bind(userId)
        .run();

      // Insert new classes
      for (let i = 0; i < classes.length; i++) {
        await env.DB
          .prepare(`
            INSERT INTO member_classes (user_id, class_code, sort_order, created_at_utc, updated_at_utc)
            VALUES (?, ?, ?, ?, ?)
          `)
          .bind(userId, classes[i], i, now, now)
          .run();
      }

      return successResponse({
        message: 'Classes updated successfully',
        classes,
      });
    } catch (error) {
      console.error('Update classes error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while updating classes', 500);
    }
  });
};
