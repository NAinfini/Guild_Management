/**
 * Gallery Unfeature API
 * POST /gallery/:id/unfeature - Unfeature a gallery item
 *
 * Convenience endpoint - same functionality as PUT /gallery/:id with is_featured=false
 */

import { createEndpoint } from '../../../../lib/endpoint-factory';
import { utcNow, createAuditLog } from '../../../../lib/utils';

interface UnfeatureResponse {
  message: string;
  gallery_id: string;
  is_featured: boolean;
}

/**
 * POST /gallery/:id/unfeature - Unfeature gallery item
 */
export const onRequestPost = createEndpoint<UnfeatureResponse>({
  auth: 'moderator', // Only moderators/admins can unfeature items
  cacheControl: 'no-store',

  handler: async ({ env, user, params }) => {
    const galleryId = params.id;

    // Check gallery item exists
    const item = await env.DB
      .prepare('SELECT * FROM gallery_images WHERE gallery_id = ?')
      .bind(galleryId)
      .first<any>();

    if (!item) {
      throw new Error('Gallery item not found');
    }

    // If already not featured, just return success
    if (item.is_featured === 0) {
      return {
        message: 'Gallery item is already not featured',
        gallery_id: galleryId,
        is_featured: false,
      };
    }

    const now = utcNow();

    // Set is_featured to false
    await env.DB
      .prepare(
        `UPDATE gallery_images
         SET is_featured = 0, updated_at_utc = ?
         WHERE gallery_id = ?`
      )
      .bind(now, galleryId)
      .run();

    // Audit log
    await createAuditLog(
      env.DB,
      'gallery',
      'unfeature',
      user!.user_id,
      galleryId,
      'Unfeatured gallery item',
      null,
    );

    return {
      message: 'Gallery item unfeatured successfully',
      gallery_id: galleryId,
      is_featured: false,
    };
  },
});
