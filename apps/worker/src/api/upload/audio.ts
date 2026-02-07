/**
 * Media Upload API - Audio Upload
 * POST /api/upload/audio
 *
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../core/types';
import { createEndpoint } from '../../core/endpoint-factory';
import { generateId, utcNow } from '../../core/utils';

// ============================================================
// Types
// ============================================================

interface AudioUploadResponse {
  mediaId: string;
  r2Key: string;
  message: string;
}

// ============================================================
// POST /api/upload/audio
// ============================================================

export const onRequestPost = createEndpoint<AudioUploadResponse, any, any>({
  auth: 'required',
  cacheControl: 'no-store',

  handler: async ({ env, user, request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as unknown as File;

    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type (should be Opus from client conversion)
    if (!file.type.includes('audio')) {
      throw new Error('Invalid file type. Must be an audio file.');
    }

    // Validate file size (max 20MB)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 20MB.');
    }

    // Check quota (max 1 audio per user)
    const audioCount = await env.DB
      .prepare('SELECT COUNT(*) as count FROM member_media WHERE user_id = ? AND kind = ?')
      .bind(user!.user_id, 'audio')
      .first<{ count: number }>();

    if (audioCount && audioCount.count >= 1) {
      // Delete existing audio
      const existing = await env.DB
        .prepare(`
          SELECT mm.media_id, mo.r2_key
          FROM member_media mm
          JOIN media_objects mo ON mm.media_id = mo.media_id
          WHERE mm.user_id = ? AND mm.kind = ?
        `)
        .bind(user!.user_id, 'audio')
        .first<{ media_id: string; r2_key: string }>();

      if (existing) {
        // Delete from R2
        await env.BUCKET.delete(existing.r2_key);
        // Delete from database (CASCADE will delete member_media)
        await env.DB
          .prepare('DELETE FROM media_objects WHERE media_id = ?')
          .bind(existing.media_id)
          .run();
      }
    }

    // Generate unique R2 key
    const mediaId = generateId('med');
    const extension = file.name.split('.').pop() || 'opus';
    const r2Key = `members/${user!.user_id}/audio/${mediaId}.${extension}`;

    // Upload to R2
    const arrayBuffer = await file.arrayBuffer();
    await env.BUCKET.put(r2Key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Calculate SHA256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha256 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const now = utcNow();

    // Create media_objects record
    await env.DB
      .prepare(`
        INSERT INTO media_objects (
          media_id, storage_type, r2_key, content_type, size_bytes, sha256,
          created_by, created_at_utc, updated_at_utc
        ) VALUES (?, 'r2', ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(mediaId, r2Key, file.type, file.size, sha256, user!.user_id, now, now)
      .run();

    // Create member_media record
    await env.DB
      .prepare(`
        INSERT INTO member_media (
          user_id, media_id, kind, is_avatar, sort_order, created_at_utc, updated_at_utc
        ) VALUES (?, ?, 'audio', 0, 0, ?, ?)
      `)
      .bind(user!.user_id, mediaId, now, now)
      .run();

    return {
      mediaId,
      r2Key,
      message: 'Audio uploaded successfully',
    };
  },
});
