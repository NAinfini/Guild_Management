/**
 * Gallery API - Detail
 * GET /api/gallery/[id] - Get item
 * PUT /api/gallery/[id] - Update metadata
 * DELETE /api/gallery/[id] - Delete item
 *
 * Migrated to use createEndpoint pattern + proper gallery_images schema
 */

import type { Env } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { createAuditLog, canEditEntity, utcNow } from '../../../lib/utils';

interface GalleryImage {
  gallery_id: string;
  media_id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  is_featured: boolean;
  uploaded_by: string | null;
  created_at_utc: string;
  updated_at_utc: string;
  url: string;
}

interface UpdateGalleryRequest {
  title?: string;
  description?: string;
  category?: 'screenshot' | 'meme' | 'event' | 'achievement' | 'other';
  is_featured?: boolean;
}

/**
 * GET /api/gallery/:id - Get gallery item
 */
export const onRequestGet = createEndpoint<GalleryImage>({
  auth: 'optional',
  etag: true,
  cacheControl: 'public, max-age=60',

  handler: async ({ env, params }) => {
    const galleryId = params.id;

    const item = await env.DB
      .prepare(`
        SELECT gi.*, mo.r2_key
        FROM gallery_images gi
        JOIN media_objects mo ON gi.media_id = mo.media_id
        WHERE gi.gallery_id = ?
      `)
      .bind(galleryId)
      .first();

    if (!item) {
      throw new Error('Gallery item not found');
    }

    return {
      gallery_id: (item as any).gallery_id,
      media_id: (item as any).media_id,
      title: (item as any).title,
      description: (item as any).description,
      category: (item as any).category,
      is_featured: (item as any).is_featured === 1,
      uploaded_by: (item as any).uploaded_by,
      created_at_utc: (item as any).created_at_utc,
      updated_at_utc: (item as any).updated_at_utc,
      url: (item as any).r2_key ? `https://your-r2-domain.com/${(item as any).r2_key}` : '',
    };
  },
});

/**
 * PUT /api/gallery/:id - Update gallery metadata
 */
export const onRequestPut = createEndpoint<GalleryImage>({
  auth: 'required',
  handler: async ({ env, user, params, request }) => {
    const galleryId = params.id;
    const body = (await request.json()) as UpdateGalleryRequest;

    // Get existing gallery item
    const existing = await env.DB.prepare(
      `SELECT * FROM gallery_images WHERE gallery_id = ?`
    )
      .bind(galleryId)
      .first<any>();

    if (!existing) {
      throw new Error('Gallery item not found');
    }

    // Check permissions: uploader or moderator/admin can update
    const canEdit =
      existing.uploaded_by === user!.user_id ||
      user!.role === 'admin' ||
      user!.role === 'moderator';

    if (!canEdit) {
      throw new Error('You can only edit your own gallery uploads');
    }

    // Only admin/moderator can update is_featured
    if (body.is_featured !== undefined && user!.role !== 'admin' && user!.role !== 'moderator') {
      throw new Error('Only admins and moderators can feature gallery items');
    }

    // Validate category
    if (body.category) {
      const validCategories = ['screenshot', 'meme', 'event', 'achievement', 'other'];
      if (!validCategories.includes(body.category)) {
        throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
      }
    }

    // Build update query
    const updates: string[] = [];
    const params: any[] = [];

    if (body.title !== undefined) {
      updates.push('title = ?');
      params.push(body.title);
    }

    if (body.description !== undefined) {
      updates.push('description = ?');
      params.push(body.description);
    }

    if (body.category !== undefined) {
      updates.push('category = ?');
      params.push(body.category);
    }

    if (body.is_featured !== undefined) {
      updates.push('is_featured = ?');
      params.push(body.is_featured ? 1 : 0);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    const now = utcNow();
    updates.push('updated_at_utc = ?');
    params.push(now);

    params.push(galleryId);

    await env.DB.prepare(
      `UPDATE gallery_images SET ${updates.join(', ')} WHERE gallery_id = ?`
    )
      .bind(...params)
      .run();

    // Create audit log
    await createAuditLog(
      env.DB,
      'gallery',
      'update',
      user!.user_id,
      galleryId,
      'Updated gallery item metadata',
      JSON.stringify(body),
    );

    // Return updated item
    const updated = await env.DB.prepare(`
      SELECT gi.*, mo.r2_key
      FROM gallery_images gi
      JOIN media_objects mo ON gi.media_id = mo.media_id
      WHERE gi.gallery_id = ?
    `)
      .bind(galleryId)
      .first<any>();

    return {
      gallery_id: updated!.gallery_id,
      media_id: updated!.media_id,
      title: updated!.title,
      description: updated!.description,
      category: updated!.category,
      is_featured: updated!.is_featured === 1,
      uploaded_by: updated!.uploaded_by,
      created_at_utc: updated!.created_at_utc,
      updated_at_utc: updated!.updated_at_utc,
      url: updated!.r2_key ? `https://your-r2-domain.com/${updated!.r2_key}` : '',
    };
  },
});

/**
 * DELETE /api/gallery/:id - Delete gallery item
 */
export const onRequestDelete = createEndpoint<{ success: true; message: string }>({
  auth: 'required',
  cacheControl: 'no-store',

  handler: async ({ env, user, params }) => {
    const galleryId = params.id;

    const existing = await env.DB.prepare(
      `SELECT gi.*, mo.r2_key
       FROM gallery_images gi
       JOIN media_objects mo ON gi.media_id = mo.media_id
       WHERE gi.gallery_id = ?`
    )
      .bind(galleryId)
      .first<any>();

    if (!existing) {
      throw new Error('Gallery item not found');
    }

    // Check permissions
    if (!canEditEntity(user!, existing.uploaded_by)) {
      throw new Error('You can only delete your own gallery uploads');
    }

    // Delete from R2
    if (existing.r2_key) {
      await env.BUCKET.delete(existing.r2_key);
    }

    // Delete from gallery_images
    await env.DB.prepare('DELETE FROM gallery_images WHERE gallery_id = ?')
      .bind(galleryId)
      .run();

    // Delete from media_objects (hard delete)
    await env.DB.prepare('DELETE FROM media_objects WHERE media_id = ?')
      .bind(existing.media_id)
      .run();

    await createAuditLog(
      env.DB,
      'gallery',
      'delete',
      user!.user_id,
      galleryId,
      'Deleted gallery item',
      null,
    );

    return {
      success: true,
      message: 'Gallery item deleted successfully',
    };
  },
});
