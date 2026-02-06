/**
 * Gallery Featured Toggle API
 * POST /gallery/:id/feature - Feature a gallery item
 * POST /gallery/:id/unfeature - Unfeature a gallery item
 *
 * Convenience endpoints - same functionality as PUT /gallery/:id with is_featured
 */

import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog } from '../../../lib/utils';

interface FeatureToggleResponse {
  message: string;
  gallery_id: string;
  is_featured: boolean;
}

/**
 * POST /gallery/:id/feature - Feature gallery item
 */
export const onRequestPost = createEndpoint<FeatureToggleResponse, any, any>({
  auth: 'moderator', // Only moderators/admins can feature items
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

    // If already featured, just return success
    if (item.is_featured === 1) {
      return {
        message: 'Gallery item is already featured',
        gallery_id: galleryId,
        is_featured: true,
      };
    }

    const now = utcNow();

    // Set is_featured to true
    await env.DB
      .prepare(
        `UPDATE gallery_images
         SET is_featured = 1, updated_at_utc = ?
         WHERE gallery_id = ?`
      )
      .bind(now, galleryId)
      .run();

    // Audit log
    await createAuditLog(
      env.DB,
      'gallery',
      'feature',
      user!.user_id,
      galleryId,
      'Featured gallery item',
      undefined
    );

    return {
      message: 'Gallery item featured successfully',
      gallery_id: galleryId,
      is_featured: true,
    };
  },
});
