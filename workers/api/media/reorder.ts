/**
 * Media Reorder API
 * PUT /api/media/reorder - Reorder media items
 */

import type { PagesFunction, Env } from '../_types';
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  forbiddenResponse,
  utcNow,
} from '../_utils';
import { withAuth } from '../_middleware';
import { validateBody, reorderMediaSchema } from '../_validation';

export const onRequestPut: PagesFunction<Env> = async (context) => {
  return withAuth(context, async (authContext) => {
    const { request, env } = authContext;
    const { user } = authContext.data;

    const validation = await validateBody(request, reorderMediaSchema);
    if (!validation.success) {
      return badRequestResponse('Invalid request body', validation.error.errors);
    }

    const { mediaIds } = validation.data;

    try {
      // Verify all media belongs to user
      for (const mediaId of mediaIds) {
        const media = await env.DB
          .prepare('SELECT user_id FROM member_media WHERE media_id = ?')
          .bind(mediaId)
          .first<{ user_id: string }>();

        if (!media || media.user_id !== user.user_id) {
          return forbiddenResponse('You do not have permission to reorder this media');
        }
      }

      const now = utcNow();

      // Update sort_order for each media item
      for (let i = 0; i < mediaIds.length; i++) {
        await env.DB
          .prepare('UPDATE member_media SET sort_order = ?, updated_at_utc = ? WHERE media_id = ?')
          .bind(i, now, mediaIds[i])
          .run();
      }

      return successResponse({ message: 'Media reordered successfully' });
    } catch (error) {
      console.error('Reorder media error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while reordering media', 500);
    }
  });
};
