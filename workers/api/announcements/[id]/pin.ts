/**
 * Announcements Pin Toggle
 * POST /api/announcements/[id]/pin - Pin/unpin announcement
 */

import type { PagesFunction, Env, Announcement } from '../../../_types';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  utcNow,
  createAuditLog,
} from '../../../_utils';
import { withModeratorAuth } from '../../../_middleware';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  return withModeratorAuth(context, async (authContext) => {
    const { env, params } = authContext;
    const { user } = authContext.data;
    const announcementId = params.id;

    try {
      const announcement = await env.DB
        .prepare('SELECT * FROM announcements WHERE announcement_id = ?')
        .bind(announcementId)
        .first<Announcement>();

      if (!announcement) {
        return notFoundResponse('Announcement');
      }

      const newPinState = announcement.is_pinned === 1 ? 0 : 1;
      const now = utcNow();

      await env.DB
        .prepare('UPDATE announcements SET is_pinned = ?, updated_at_utc = ? WHERE announcement_id = ?')
        .bind(newPinState, now, announcementId)
        .run();

      await createAuditLog(
        env.DB,
        'announcement',
        newPinState ? 'pin' : 'unpin',
        user.user_id,
        announcementId,
        `${newPinState ? 'Pinned' : 'Unpinned'} announcement: ${announcement.title}`,
        null
      );

      return successResponse({
        message: `Announcement ${newPinState ? 'pinned' : 'unpinned'} successfully`,
        isPinned: newPinState === 1,
      });
    } catch (error) {
      console.error('Pin announcement error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while pinning announcement', 500);
    }
  });
};
