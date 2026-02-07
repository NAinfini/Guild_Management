/**
 * Media Upload API - Image Upload
 * POST /api/upload/image
 *
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../core/types';
import { createEndpoint } from '../../core/endpoint-factory';
import { generateId, utcNow } from '../../core/utils';

// ============================================================
// Types
// ============================================================

interface ImageUploadResponse {
  mediaId: string;
  r2Key: string;
  message: string;
}

// ============================================================
// POST /api/upload/image
// ============================================================

export const onRequestPost = createEndpoint<ImageUploadResponse, any, any>({
  auth: 'required',
  cacheControl: 'no-store',

  handler: async ({ env, user, request }) => {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as unknown as File;
    const kind = formData.get('kind') as string; // 'avatar' or 'gallery'
    const isAvatar = kind === 'avatar';

    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type (should be WebP from client conversion)
    if (!file.type.includes('image')) {
      throw new Error('Invalid file type. Must be an image.');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 5MB.');
    }

    // Check quota (max 10 images per user)
    const imageCount = await env.DB
      .prepare('SELECT COUNT(*) as count FROM member_media WHERE user_id = ? AND kind = ?')
      .bind(user!.user_id, 'image')
      .first<{ count: number }>();

    if (imageCount && imageCount.count >= 10) {
      throw new Error('Image quota exceeded. Maximum 10 images per member.');
    }

    // Generate unique R2 key
    const mediaId = generateId('med');
    const extension = file.name.split('.').pop() || 'webp';
    const r2Key = `members/${user!.user_id}/images/${mediaId}.${extension}`;

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

    // If setting as avatar, unset previous avatar
    if (isAvatar) {
      await env.DB
        .prepare('UPDATE member_media SET is_avatar = 0 WHERE user_id = ? AND kind = ?')
        .bind(user!.user_id, 'image')
        .run();
    }

    // Get current max sort_order
    const maxSort = await env.DB
      .prepare('SELECT MAX(sort_order) as max_sort FROM member_media WHERE user_id = ? AND kind = ?')
      .bind(user!.user_id, 'image')
      .first<{ max_sort: number | null }>();

    const sortOrder = (maxSort?.max_sort || 0) + 1;

    // Create member_media record
    await env.DB
      .prepare(`
        INSERT INTO member_media (
          user_id, media_id, kind, is_avatar, sort_order, created_at_utc, updated_at_utc
        ) VALUES (?, ?, 'image', ?, ?, ?, ?)
      `)
      .bind(user!.user_id, mediaId, isAvatar ? 1 : 0, sortOrder, now, now)
      .run();

    return {
      mediaId,
      r2Key,
      message: 'Image uploaded successfully',
    };
  },
});
