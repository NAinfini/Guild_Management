import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../_types';
import { generateId, utcNow, successResponse, errorResponse, unauthorizedResponse, badRequestResponse, notFoundResponse } from '../../_utils';
import { withAuth, withOptionalAuth } from '../../_middleware';

// GET /api/gallery - List gallery images with pagination
export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withOptionalAuth(context as any, async (authContext) => {
    const { request, env } = authContext;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '24');
    const category = url.searchParams.get('category') || undefined;
    const featured = url.searchParams.get('featured') === 'true';

    try {
      const offset = (page - 1) * limit;

      let query = `
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
        WHERE 1=1
      `;
      const params: any[] = [];

      if (category) {
        query += ` AND g.category = ?`;
        params.push(category);
      }

      if (featured) {
        query += ` AND g.is_featured = 1`;
      }

      query += ` ORDER BY g.is_featured DESC, g.created_at_utc DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const { results } = await env.DB.prepare(query).bind(...params).all();

      // Get total count for pagination
      let countQuery = `SELECT COUNT(*) as total FROM gallery_images WHERE 1=1`;
      const countParams: any[] = [];
      
      if (category) {
        countQuery += ` AND category = ?`;
        countParams.push(category);
      }
      
      if (featured) {
        countQuery += ` AND is_featured = 1`;
      }

      const { total } = await env.DB.prepare(countQuery).bind(...countParams).first() as any;

      return successResponse({
        images: results,
        pagination: {
          page,
          limit,
          total: total || 0,
          pages: Math.ceil((total || 0) / limit),
        },
      });
    } catch (error) {
      console.error('List gallery error:', error);
      return errorResponse('INTERNAL_ERROR', 'Failed to fetch gallery', 500);
    }
  });
};

// POST /api/gallery - Create new gallery entry
export const onRequestPost: PagesFunction<Env> = async (context) => {
  return withAuth(context as any, async (authContext) => {
    const { request, env } = authContext;
    const { user } = authContext.data;

    if (!user) {
      return unauthorizedResponse();
    }

    try {
      const body = await request.json() as {
        media_id: string;
        title?: string;
        description?: string;
        category?: string;
      };

      if (!body.media_id) {
        return badRequestResponse('media_id is required');
      }

      // Verify media exists, is R2 type, and belongs to user (optional, but good practice if media is private)
      // Actually media_objects might be shared, but let's check basic existence
      const media = await env.DB.prepare(
        `SELECT media_id, storage_type FROM media_objects WHERE media_id = ?`
      ).bind(body.media_id).first<{ media_id: string; storage_type: string }>();

      if (!media) {
        return notFoundResponse('Media object');
      }

      if (media.storage_type !== 'r2') {
        return badRequestResponse('Gallery images must be stored in R2');
      }

      const now = utcNow();
      const galleryId = generateId('gal');

      await env.DB.prepare(`
        INSERT INTO gallery_images (
          gallery_id,
          media_id,
          title,
          description,
          category,
          is_featured,
          uploaded_by,
          created_at_utc,
          updated_at_utc
        ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
      `).bind(
        galleryId,
        body.media_id,
        body.title || null,
        body.description || null,
        body.category || 'other',
        user.user_id,
        now,
        now
      ).run();

      // Fetch the created gallery image with media info
      const created = await env.DB.prepare(`
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

      return successResponse(created, 201);
    } catch (error) {
      console.error('Create gallery error:', error);
      return errorResponse('INTERNAL_ERROR', 'Failed to create gallery entry', 500);
    }
  });
};
