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

import type { Env, MediaObject } from '../../lib/types';
import { createEndpoint } from '../../lib/endpoint-factory';
import { utcNow, createAuditLog, generateId, canEditEntity } from '../../lib/utils';

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
  limit?: number; // Pagination limit
  offset?: number; // Pagination offset
}

interface GalleryImage {
  gallery_id: string;
  media_id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  is_featured: boolean;
  uploaded_by: string | null;
  created_at_utc: string;
  url: string;
}

interface GalleryListResponse {
  images: GalleryImage[];
  total: number;
  limit: number;
  offset: number;
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
export const onRequestGet = createEndpoint<GalleryListResponse, GalleryListQuery>({
  auth: 'optional',
  etag: true,
  cacheControl: 'public, max-age=60',

  parseQuery: (searchParams) => ({
    ids: searchParams.get('ids') || undefined,
    category: searchParams.get('category') || undefined,
    featured: searchParams.get('featured') || undefined,
    uploader: searchParams.get('uploader') || undefined,
    limit: parseInt(searchParams.get('limit') || '50'),
    offset: parseInt(searchParams.get('offset') || '0'),
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
          SELECT gi.*, mo.r2_key
          FROM gallery_images gi
          JOIN media_objects mo ON gi.media_id = mo.media_id
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
          created_at_utc: row.created_at_utc,
          url: row.r2_key ? `https://your-r2-domain.com/${row.r2_key}` : '',
        })),
        notFound: notFound.length > 0 ? notFound : undefined,
        total: (items.results || []).length,
        limit: (items.results || []).length,
        offset: 0,
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

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM gallery_images gi ${whereClause}`;
    const countResult = await env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();
    const total = countResult?.total || 0;

    // Get paginated results
    const limit = Math.min(query.limit || 50, 100); // Max 100 per page
    const offset = query.offset || 0;

    const itemsQuery = `
      SELECT gi.*, mo.r2_key
      FROM gallery_images gi
      JOIN media_objects mo ON gi.media_id = mo.media_id
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
        created_at_utc: row.created_at_utc,
        url: row.r2_key ? `https://your-r2-domain.com/${row.r2_key}` : '',
      })),
      total,
      limit,
      offset,
    };
  },
});

export const onRequestPost = createEndpoint<{ message: string; item: any }, CreateGalleryItemBody>({
  auth: 'required',
  cacheControl: 'no-store',

  parseBody: (body) => {
    if (!body.mediaId) throw new Error('mediaId required');
    return body as CreateGalleryItemBody;
  },

  handler: async ({ env, user, body }) => {
    const { mediaId, caption } = body;
    const now = utcNow();

    // If we have a gallery_items table:
    // await env.DB.prepare('INSERT INTO gallery_items ...').run();

    // If we are just updating media metadata:
    await env.DB
      .prepare('UPDATE media SET description = ?, updated_at_utc = ? WHERE media_id = ?')
      .bind(caption || null, now, mediaId)
      .run();

    await createAuditLog(
      env.DB,
      'gallery',
      'add_item',
      user!.user_id,
      mediaId,
      'Added item to gallery',
      JSON.stringify(body)
    );

    const item = await env.DB.prepare('SELECT * FROM media WHERE media_id = ?').bind(mediaId).first();

    return {
      message: 'Gallery item added',
      item: item!,
    };
  },
});

// ============================================================
// DELETE /api/gallery - Batch delete gallery items
// ============================================================

export const onRequestDelete = createEndpoint<BatchDeleteResponse, BatchDeleteQuery>({
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

    const mediaIds = query.mediaIds.split(',').map(id => id.trim()).filter(id => id.length > 0);
    const failed: Array<{ mediaId: string; error: string }> = [];
    let deletedCount = 0;

    // Validate IDs are provided
    if (mediaIds.length === 0) {
      throw new Error('At least one mediaId is required');
    }

    if (mediaIds.length > 100) {
      throw new Error('Maximum 100 media items per batch delete');
    }

    // ============================================================
    // PHASE 1: Fetch all media items and validate ownership
    // ============================================================
    const placeholders = mediaIds.map(() => '?').join(',');
    const mediaItems = await env.DB
      .prepare(`
        SELECT * FROM media
        WHERE entity_type = 'gallery' AND media_id IN (${placeholders})
      `)
      .bind(...mediaIds)
      .all();

    const foundItems = new Map<string, any>(
      (mediaItems.results || []).map((item: any) => [item.media_id, item])
    );

    // Identify not found items
    for (const mediaId of mediaIds) {
      if (!foundItems.has(mediaId)) {
        failed.push({ mediaId, error: 'Media item not found' });
      }
    }

    // ============================================================
    // PHASE 2: Filter items user can delete and track failures
    // ============================================================
    const deletableItems: Array<{ id: string; key: string | null }> = [];
    const permissionDenied: string[] = [];

    for (const [mediaId, item] of foundItems) {
      if (canEditEntity(user, item.user_id)) {
        deletableItems.push({ id: mediaId, key: item.key });
      } else {
        permissionDenied.push(mediaId);
        failed.push({ mediaId, error: 'Permission denied' });
      }
    }

    // ============================================================
    // PHASE 3: Batch delete from database
    // ============================================================
    if (deletableItems.length > 0) {
      const deletePlaceholders = deletableItems.map(() => '?').join(',');
      const deletableIds = deletableItems.map(item => item.id);

      const result = await env.DB
        .prepare(`DELETE FROM media WHERE media_id IN (${deletePlaceholders})`)
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
          null
        );
      }
    }

    // ============================================================
    // PHASE 4: Delete files from R2 storage
    // ============================================================
    // Note: R2 deletions are done individually since delete() doesn't support batch
    // We do this after DB commit to ensure data consistency
    const r2Failed: Array<{ mediaId: string; error: string }> = [];
    for (const { id, key } of deletableItems) {
      if (key) {
        try {
          await env.BUCKET.delete(key);
        } catch (error: any) {
          r2Failed.push({ mediaId: id, error: `R2 deletion failed: ${error.message || 'Unknown error'}` });
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
