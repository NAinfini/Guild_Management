import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../_types';
import { utcNow, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, badRequestResponse } from '../../_utils';
import { withAuth, withOptionalAuth } from '../../_middleware';

// GET /api/gallery/[id] - Get single gallery image
export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withOptionalAuth(context as any, async (authContext) => {
    const { params, env } = authContext;
    const galleryId = params.id as string;

    try {
      const image = await env.DB.prepare(`
        SELECT 
          g.*,
          m.r2_key,
          m.content_type,
          m.width,
          m.height,
          u.username as uploader_username
        FROM gallery_images g
        JOIN media_objects m ON g.media_id = m.media_id
        LEFT JOIN users u ON g.uploaded_by = u.user_id
        WHERE g.gallery_id = ?
      `).bind(galleryId).first();

      if (!image) {
        return notFoundResponse('Gallery image');
      }

      return successResponse(image);
    } catch (error) {
      console.error('Get gallery image error:', error);
      return errorResponse('INTERNAL_ERROR', 'Failed to fetch gallery image', 500);
    }
  });
};

// PATCH /api/gallery/[id] - Update gallery entry
export const onRequestPatch: PagesFunction<Env> = async (context) => {
  return withAuth(context as any, async (authContext) => {
    const { request, params, env } = authContext;
    const { user } = authContext.data;
    const galleryId = params.id as string;

    if (!user) {
      return unauthorizedResponse();
    }

    try {
      const existing = await env.DB.prepare(
        `SELECT gallery_id, uploaded_by FROM gallery_images WHERE gallery_id = ?`
      ).bind(galleryId).first<{ gallery_id: string; uploaded_by: string }>();

      if (!existing) {
        return notFoundResponse('Gallery image');
      }

      // Check permissions: uploader or moderator/admin can edit
      const isModerator = user.role === 'moderator' || user.role === 'admin';
      if (existing.uploaded_by !== user.user_id && !isModerator) {
        return forbiddenResponse('You can only edit your own uploads');
      }

      const body = await request.json() as {
        title?: string;
        description?: string;
        category?: string;
        is_featured?: boolean;
      };

      const updates: string[] = [];
      const bindParams: any[] = [];

      if (body.title !== undefined) {
        updates.push('title = ?');
        bindParams.push(body.title || null);
      }

      if (body.description !== undefined) {
        updates.push('description = ?');
        bindParams.push(body.description || null);
      }

      if (body.category !== undefined) {
        updates.push('category = ?');
        bindParams.push(body.category);
      }

      // Only moderator/admin can feature images
      if (body.is_featured !== undefined && isModerator) {
        updates.push('is_featured = ?');
        bindParams.push(body.is_featured ? 1 : 0);
      }

      if (updates.length === 0) {
        return badRequestResponse('No valid fields to update');
      }

      updates.push('updated_at_utc = ?');
      bindParams.push(utcNow());
      bindParams.push(galleryId);

      await env.DB.prepare(`
        UPDATE gallery_images 
        SET ${updates.join(', ')}
        WHERE gallery_id = ?
      `).bind(...bindParams).run();

      const updated = await env.DB.prepare(`
        SELECT 
          g.*,
          m.r2_key,
          m.content_type,
          m.width,
          m.height,
          u.username as uploader_username
        FROM gallery_images g
        JOIN media_objects m ON g.media_id = m.media_id
        LEFT JOIN users u ON g.uploaded_by = u.user_id
        WHERE g.gallery_id = ?
      `).bind(galleryId).first();

      return successResponse(updated);
    } catch (error) {
      console.error('Update gallery error:', error);
      return errorResponse('INTERNAL_ERROR', 'Failed to update gallery image', 500);
    }
  });
};

// DELETE /api/gallery/[id] - Remove from gallery
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  return withAuth(context as any, async (authContext) => {
    const { params, env } = authContext;
    const { user } = authContext.data;
    const galleryId = params.id as string;

    if (!user) {
      return unauthorizedResponse();
    }

    try {
      const existing = await env.DB.prepare(
        `SELECT gallery_id, uploaded_by, media_id FROM gallery_images WHERE gallery_id = ?`
      ).bind(galleryId).first<{ gallery_id: string; uploaded_by: string }>();

      if (!existing) {
        return notFoundResponse('Gallery image');
      }

      const isModerator = user.role === 'moderator' || user.role === 'admin';
      if (existing.uploaded_by !== user.user_id && !isModerator) {
        return forbiddenResponse('You can only delete your own uploads');
      }

      await env.DB.prepare(`DELETE FROM gallery_images WHERE gallery_id = ?`)
        .bind(galleryId)
        .run();

      return new Response(null, { status: 204 });
    } catch (error) {
      console.error('Delete gallery error:', error);
      return errorResponse('INTERNAL_ERROR', 'Failed to delete gallery image', 500);
    }
  });
};
