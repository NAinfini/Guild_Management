/**
 * Gallery API - List, Create, and Batch Delete
 * GET /api/gallery - List gallery items (with filtering)
 * GET /api/gallery?ids=id1,id2,id3 - Batch fetch gallery items by IDs
 * POST /api/gallery - Create gallery item
 * DELETE /api/gallery?mediaIds=id1,id2,id3 - Batch delete gallery items
 *
 * Schema: gallery_images table (gallery_id, media_id, title, description, category, is_featured, uploaded_by)
 *
 * Migrated to use createEndpoint pattern.
 */

import type { Env, MediaObject } from '../../core/types';
import { createEndpoint } from '../../core/endpoint-factory';
import { utcNow, createAuditLog, generateId, canEditEntity } from '../../core/utils';

interface CreateGalleryItemBody {
  mediaId: string;
  title?: string;
  description?: string;
  category?: 'screenshot' | 'meme' | 'event' | 'achievement' | 'other';
}

interface GalleryListQuery {
  ids?: string; // Comma-separated IDs for batch fetch
  category?: string; // Filter by category
  featured?: string; // Filter by is_featured (boolean)
  uploader?: string; // Filter by uploaded_by (user_id)
  search?: string; // Search in title or description
  limit?: number; // Pagination limit
  offset?: number; // Pagination offset
  startDate?: string; // Filter by created_at_utc
  endDate?: string; // Filter by created_at_utc
}

interface GalleryImage {
  gallery_id: string;
  media_id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  is_featured: boolean;
  uploaded_by: string | null;
  uploader_username: string | null;
  created_at_utc: string;
  url: string;
}

interface GalleryListResponse {
  images: GalleryImage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface BatchDeleteQuery {
  mediaIds: string;
}

interface BatchDeleteResponse {
  message: string;
  deletedCount: number;
  failed?: Array<{ mediaId: string; error: string }>;
}

/**
 * GET /api/gallery - List gallery items with filtering
 */
export const onRequestGet = createEndpoint<GalleryListResponse, GalleryListQuery, any>({
  auth: 'optional',
  etag: true,
  cacheControl: 'public, max-age=60',

  parseQuery: (searchParams) => ({
    ids: searchParams.get('ids') || undefined,
    category: searchParams.get('category') || undefined,
    featured: searchParams.get('featured') || undefined,
    uploader: searchParams.get('uploader') || undefined,
    search: searchParams.get('search') || undefined,
    limit: parseInt(searchParams.get('limit') || '50'),
    offset: parseInt(searchParams.get('offset') || '0'),
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
  }),

  handler: async ({ env, query }) => {
    // ============================================================
    // BATCH FETCH MODE: Fetch specific gallery items by IDs
    // ============================================================
    if (query.ids) {
      const ids = query.ids.split(',').map(id => id.trim()).filter(id => id.length > 0);
      const placeholders = ids.map(() => '?').join(',');

      const items = await env.DB
        .prepare(`
          SELECT gi.*, mo.r2_key, u.username as uploader_username
          FROM gallery_images gi
          JOIN media_objects mo ON gi.media_id = mo.media_id
          LEFT JOIN users u ON mo.created_by = u.user_id
          WHERE gi.gallery_id IN (${placeholders})
          ORDER BY gi.created_at_utc DESC
        `)
        .bind(...ids)
        .all();

      const foundIds = new Set(items.results?.map((item: any) => item.gallery_id) || []);
      const notFound = ids.filter(id => !foundIds.has(id));

      return {
        images: (items.results || []).map((row: any) => ({
          gallery_id: row.gallery_id,
          media_id: row.media_id,
          title: row.title,
          description: row.description,
          category: row.category,
          is_featured: row.is_featured === 1,
          uploaded_by: row.uploaded_by,
          uploader_username: row.uploader_username,
          created_at_utc: row.created_at_utc,
          url: row.r2_key ? `/api/media/${row.r2_key}` : '',
        })),
        notFound: notFound.length > 0 ? notFound : undefined,
        pagination: {
          page: 1,
          limit: items.results?.length || 0,
          total: items.results?.length || 0,
          pages: 1
        }
      };
    }

    // ============================================================
    // LIST MODE: Fetch gallery items with filtering
    // ============================================================
    const conditions: string[] = [];
    const params: any[] = [];

    // Category filter
    if (query.category) {
      const validCategories = ['screenshot', 'meme', 'event', 'achievement', 'other'];
      if (!validCategories.includes(query.category)) {
        throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
      }
      conditions.push('gi.category = ?');
      params.push(query.category);
    }

    // Featured filter
    if (query.featured !== undefined) {
      const isFeatured = query.featured === 'true' || query.featured === '1';
      conditions.push('gi.is_featured = ?');
      params.push(isFeatured ? 1 : 0);
    }

    // Uploader filter
    if (query.uploader) {
      conditions.push('gi.uploaded_by = ?');
      params.push(query.uploader);
    }

    // Search filter
    if (query.search) {
      const search = `%${query.search.toLowerCase()}%`;
      conditions.push('(LOWER(gi.title) LIKE ? OR LOWER(gi.description) LIKE ? OR LOWER(u.username) LIKE ?)');
      params.push(search, search, search);
    }

    if (query.startDate) {
      conditions.push('gi.created_at_utc >= ?');
      params.push(query.startDate);
    }

    if (query.endDate) {
      conditions.push('gi.created_at_utc <= ?');
      params.push(query.endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM gallery_images gi 
      JOIN media_objects mo ON gi.media_id = mo.media_id
      LEFT JOIN users u ON mo.created_by = u.user_id
      ${whereClause}
    `;
    const countResult = await env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();
    const total = countResult?.total || 0;

    // Get paginated results
    const limit = Math.min(query.limit || 50, 100); // Max 100 per page
    const offset = query.offset || 0;

    const itemsQuery = `
      SELECT gi.*, mo.r2_key, u.username as uploader_username
      FROM gallery_images gi
      JOIN media_objects mo ON gi.media_id = mo.media_id
      LEFT JOIN users u ON mo.created_by = u.user_id
      ${whereClause}
      ORDER BY gi.created_at_utc DESC
      LIMIT ? OFFSET ?
    `;

    const items = await env.DB
      .prepare(itemsQuery)
      .bind(...params, limit, offset)
      .all();

    return {
      images: (items.results || []).map((row: any) => ({
        gallery_id: row.gallery_id,
        media_id: row.media_id,
        title: row.title,
        description: row.description,
        category: row.category,
        is_featured: row.is_featured === 1,
        uploaded_by: row.uploaded_by,
        uploader_username: row.uploader_username,
        created_at_utc: row.created_at_utc,
        url: row.r2_key ? `/api/media/${row.r2_key}` : '',
      })),
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },
});

export const onRequestPost = createEndpoint<{ message: string; item: GalleryImage }, CreateGalleryItemBody, any>({
  auth: 'required',
  cacheControl: 'no-store',

  parseBody: (body) => {
    if (!body.mediaId) throw new Error('mediaId required');
    return body as CreateGalleryItemBody;
  },

  handler: async ({ env, user, body }) => {
    const { mediaId, title, description, category } = body;
    const now = utcNow();

    // Check media exists and get created_by for permission check
    const media = await env.DB
      .prepare('SELECT * FROM media_objects WHERE media_id = ?')
      .bind(mediaId)
      .first<MediaObject>();

    if (!media) {
      throw new Error('Media not found');
    }

    if (!canEditEntity(user!, media.created_by)) {
      throw new Error('You do not have permission to add this media to gallery');
    }

    // Create gallery entry
    const galleryId = generateId('gal');
    await env.DB
      .prepare(`
        INSERT INTO gallery_images (
          gallery_id, media_id, title, description, category, uploaded_by,
          created_at_utc, updated_at_utc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(galleryId, mediaId, title || null, description || null, category || null, user!.user_id, now, now)
      .run();

    await createAuditLog(
      env.DB,
      'gallery',
      'add_item',
      user!.user_id,
      galleryId,
      'Added item to gallery',
      JSON.stringify(body)
    );

    const item = await env.DB
      .prepare(`
        SELECT gi.*, mo.r2_key, u.username as uploader_username
        FROM gallery_images gi
        JOIN media_objects mo ON gi.media_id = mo.media_id
        LEFT JOIN users u ON gi.uploaded_by = u.user_id
        WHERE gi.gallery_id = ?
      `)
      .bind(galleryId)
      .first<any>();

    // Get R2 public URL from environment or construct from R2 binding
    // For Cloudflare R2, use the public URL or R2 dev URL
    // For Cloudflare R2, construct URL from R2 binding
    // In production, use R2 custom domain or workers.dev path
    const url = item?.r2_key ? `/api/media/${item.r2_key}` : '';

    return {
      message: 'Gallery item added',
      item: {
        gallery_id: item!.gallery_id,
        media_id: item!.media_id,
        title: item!.title,
        description: item!.description,
        category: item!.category,
        is_featured: item!.is_featured === 1,
        uploaded_by: item!.uploaded_by,
        uploader_username: item!.uploader_username,
        created_at_utc: item!.created_at_utc,
        url,
      },
    };
  },
});

// ============================================================
// DELETE /api/gallery - Batch delete gallery items
// ============================================================

export const onRequestDelete = createEndpoint<BatchDeleteResponse, BatchDeleteQuery, any>({
  auth: 'required',
  cacheControl: 'no-store',

  parseQuery: (searchParams) => {
    const mediaIds = searchParams.get('mediaIds');
    if (!mediaIds) {
      throw new Error('mediaIds query parameter is required');
    }
    return { mediaIds };
  },

  handler: async ({ env, user, query }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const galleryIds = query.mediaIds.split(',').map(id => id.trim()).filter(id => id.length > 0);
    const failed: Array<{ mediaId: string; error: string }> = [];
    let deletedCount = 0;

    // Validate IDs are provided
    if (galleryIds.length === 0) {
      throw new Error('At least one gallery item ID is required');
    }

    if (galleryIds.length > 100) {
      throw new Error('Maximum 100 gallery items per batch delete');
    }

    // ============================================================
    // PHASE 1: Fetch all gallery items and validate ownership
    // ============================================================
    const placeholders = galleryIds.map(() => '?').join(',');
    const galleryItems = await env.DB
      .prepare(`
        SELECT gi.*, mo.r2_key, mo.created_by as media_created_by
        FROM gallery_images gi
        JOIN media_objects mo ON gi.media_id = mo.media_id
        WHERE gi.gallery_id IN (${placeholders})
      `)
      .bind(...galleryIds)
      .all();

    const foundItems = new Map<string, any>(
      (galleryItems.results || []).map((item: any) => [item.gallery_id, item])
    );

    // Identify not found items
    for (const galleryId of galleryIds) {
      if (!foundItems.has(galleryId)) {
        failed.push({ mediaId: galleryId, error: 'Gallery item not found' });
      }
    }

    // ============================================================
    // PHASE 2: Filter items user can delete and track failures
    // ============================================================
    const deletableItems: Array<{ id: string; r2Key: string | null; mediaId: string }> = [];

    for (const [galleryId, item] of foundItems) {
      // Check if user can delete (uploaded_by or admin/moderator)
      if (canEditEntity(user, item.uploaded_by)) {
        deletableItems.push({ id: galleryId, r2Key: item.r2_key, mediaId: item.media_id });
      } else {
        failed.push({ mediaId: galleryId, error: 'Permission denied' });
      }
    }

    // ============================================================
    // PHASE 3: Batch delete from database (gallery_images table)
    // ============================================================
    if (deletableItems.length > 0) {
      const deletePlaceholders = deletableItems.map(() => '?').join(',');
      const deletableIds = deletableItems.map(item => item.id);

      const result = await env.DB
        .prepare(`DELETE FROM gallery_images WHERE gallery_id IN (${deletePlaceholders})`)
        .bind(...deletableIds)
        .run();

      deletedCount = result.meta.changes || 0;

      // Create audit log entries
      for (const { id } of deletableItems) {
        await createAuditLog(
          env.DB,
          'gallery',
          'delete',
          user.user_id,
          id,
          'Deleted gallery item (batch)',
          undefined
        );
      }
    }

    // ============================================================
    // PHASE 4: Delete media_objects and R2 files (optional - if media is only used by gallery)
    // ============================================================
    // Note: We check if media_objects are referenced elsewhere before deleting
    const r2Failed: Array<{ mediaId: string; error: string }> = [];
    for (const { id, r2Key, mediaId } of deletableItems) {
      // Check if media is used elsewhere (member_media, announcement_media, event_attachments)
      const usageCheck = await env.DB
        .prepare(`
          SELECT COUNT(*) as count
          FROM (
            SELECT 1 FROM member_media WHERE media_id = ?
            UNION ALL
            SELECT 1 FROM announcement_media WHERE media_id = ?
            UNION ALL
            SELECT 1 FROM event_attachments WHERE media_id = ?
          )
        `)
        .bind(mediaId, mediaId, mediaId)
        .first<{ count: number }>();

      if (usageCheck?.count === 0) {
        // Safe to delete media_objects and R2 file
        await env.DB.prepare('DELETE FROM media_objects WHERE media_id = ?').bind(mediaId).run();

        if (r2Key) {
          try {
            await env.BUCKET.delete(r2Key);
          } catch (error: any) {
            r2Failed.push({ mediaId: id, error: `R2 deletion failed: ${error.message || 'Unknown error'}` });
          }
        }
      }
    }

    // Add R2 failures to the failed array
    failed.push(...r2Failed);

    // ============================================================
    // PHASE 5: Return response
    // ============================================================
    return {
      message: `Batch delete complete: ${deletedCount} deleted, ${failed.length} failed`,
      deletedCount,
      failed: failed.length > 0 ? failed : undefined,
    };
  },
});
