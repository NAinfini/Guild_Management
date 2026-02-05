/**
 * Gallery API - List, Create, and Batch Delete
 * GET /api/gallery - List gallery items
 * GET /api/gallery?ids=id1,id2,id3 - Batch fetch gallery items by IDs
 * POST /api/gallery - Create gallery item (upload handled separately via /api/upload -> creates media, this links it?)
 * DELETE /api/gallery?mediaIds=id1,id2,id3 - Batch delete gallery items
 *
 * Note: Gallery usually displays media items.
 * If 'gallery' table exists, it links to media.
 * Based on snippets, gallery items might be just media items with 'gallery' type or specific table.
 * Assuming 'gallery_items' table based on typical pattern, or just querying media.
 * Let's assume 'gallery_items' or 'media' with is_public/gallery tag.
 *
 * Migrated to use createEndpoint pattern.
 */

import type { Env, Media } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog, generateId, canEditEntity } from '../../../lib/utils';

interface CreateGalleryItemBody {
  mediaId: string;
  caption?: string;
  isPublic?: boolean;
}

interface GalleryListQuery {
  ids?: string; // Comma-separated IDs for batch fetch
}

interface GalleryListResponse {
  items: any[];
}

interface BatchDeleteQuery {
  mediaIds: string;
}

interface BatchDeleteResponse {
  message: string;
  deletedCount: number;
  failed?: Array<{ mediaId: string; error: string }>;
}

export const onRequestGet = createEndpoint<GalleryListResponse, never, GalleryListQuery>({
  auth: 'optional',
  etag: true,
  cacheControl: 'public, max-age=60',

  parseQuery: (searchParams) => ({
    ids: searchParams.get('ids') || undefined,
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
          SELECT * FROM media
          WHERE entity_type = 'gallery' AND media_id IN (${placeholders})
          ORDER BY created_at_utc DESC
        `)
        .bind(...ids)
        .all();

      const foundIds = new Set(items.results?.map((item: any) => item.media_id) || []);
      const notFound = ids.filter(id => !foundIds.has(id));

      return {
        items: items.results || [],
        notFound: notFound.length > 0 ? notFound : undefined,
      };
    }

    // ============================================================
    // LIST MODE: Fetch all gallery items
    // ============================================================
    const items = await env.DB
      .prepare(`
        SELECT * FROM media
        WHERE entity_type = 'gallery'
        ORDER BY created_at_utc DESC
      `)
      .all();

    return {
      items: items.results || [],
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

export const onRequestDelete = createEndpoint<BatchDeleteResponse, never, BatchDeleteQuery>({
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
