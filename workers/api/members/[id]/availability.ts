/**
 * Member Availability Management
 * PUT /api/members/[id]/availability - Update availability blocks
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
import { validateBody, updateAvailabilitySchema } from '../../../_validation';

export const onRequestPut: PagesFunction<Env> = async (context) => {
  return withAuth(context, async (authContext) => {
    const { request, env, params } = authContext;
    const { user } = authContext.data;
    const userId = params.id;

    // Only self can update availability
    if (userId !== user.user_id) {
      return forbiddenResponse('You can only update your own availability');
    }

    const current = await env.DB
      .prepare('SELECT updated_at_utc, created_at_utc FROM users WHERE user_id = ?')
      .bind(userId)
      .first<{ updated_at_utc: string; created_at_utc: string }>();
    const currentEtag = etagFromTimestamp(current?.updated_at_utc || current?.created_at_utc);
    const pre = assertIfMatch(request, currentEtag);
    if (pre) return pre;

    const validation = await validateBody(request, updateAvailabilitySchema);
    if (!validation.success) {
      return badRequestResponse('Invalid request body', validation.error.errors);
    }

    const { blocks } = validation.data;

    try {
      const now = utcNow();

      // Delete existing availability
      await env.DB
        .prepare('DELETE FROM member_availability WHERE user_id = ?')
        .bind(userId)
        .run();

      // Insert new blocks
      for (const block of blocks) {
        await env.DB
          .prepare(`
            INSERT INTO member_availability (
              user_id, weekday, start_min, end_min, created_at_utc, updated_at_utc
            ) VALUES (?, ?, ?, ?, ?, ?)
          `)
          .bind(userId, block.weekday, block.startMin, block.endMin, now, now)
          .run();
      }

      return successResponse({
        message: 'Availability updated successfully',
        blocks,
      });
    } catch (error) {
      console.error('Update availability error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while updating availability', 500);
    }
  });
};
