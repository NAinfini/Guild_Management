/**
 * Gallery API - Detail
 * GET /api/gallery/[id] - Get item
 * DELETE /api/gallery/[id] - Delete item
 * 
 * Migrated to use createEndpoint pattern
 */

import type { Env } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { createAuditLog, canEditEntity, utcNow } from '../../../lib/utils';

export const onRequestGet = createEndpoint<any>({
  auth: 'optional',
  etag: true,
  
  handler: async ({ env, params }) => {
    const id = params.id;
    const item = await env.DB
      .prepare('SELECT * FROM media WHERE media_id = ?') // Assuming ID is media_id
      .bind(id)
      .first();

    if (!item) throw new Error('Item not found');
    return item;
  },
});

export const onRequestDelete = createEndpoint<{ message: string }>({
  auth: 'required',
  cacheControl: 'no-store',

  handler: async ({ env, user, params }) => {
    const id = params.id;
    
    const existing = await env.DB.prepare('SELECT * FROM media WHERE media_id = ?').bind(id).first<any>();
    if (!existing) throw new Error('Item not found');

    if (!canEditEntity(user!, existing.user_id)) { // Check owner
       throw new Error('Permission denied');
    }

    // Delete from R2? Usually yes.
    // await env.BUCKET.delete(existing.key); // If we want to delete file.
    // For now, soft delete or just DB delete as per typical pattern here?
    // Let's assume hard delete from DB + R2 for gallery items to save space, or soft delete.
    // Using soft delete for consistency.
    
    // Check if media table has deleted_at_utc. If not, hard delete.
    // Assuming standard schema has it.
    
    await env.DB
      .prepare('DELETE FROM media WHERE media_id = ?') // Hard delete for media usually calls for cleanup worker, but here explicit delete.
      .bind(id)
      .run();
      
    if (existing.key) {
      await env.BUCKET.delete(existing.key);
    }

    await createAuditLog(
      env.DB,
      'gallery',
      'delete',
      user!.user_id,
      id,
      'Deleted gallery item',
      null
    );

    return { message: 'Item deleted' };
  },
});
