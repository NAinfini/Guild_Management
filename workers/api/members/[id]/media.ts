/**
 * Member Media Management
 * POST /members/:id/media - Upload/link media to member profile
 * DELETE /members/:id/media/:mediaId - Remove media from member profile
 */

import { createEndpoint } from '../../../lib/endpoint-factory';
import { generateId } from '../../../../shared/utils/id';
import { utcNow } from '../../../../shared/utils/date';

interface MediaUploadResponse {
  media_id: string;
  user_id: string;
  kind: 'image' | 'audio' | 'video_url';
  is_avatar: boolean;
  sort_order: number;
  url: string;
}

/**
 * POST /members/:id/media - Upload/link media to member profile
 */
export const onRequestPost = createEndpoint<MediaUploadResponse>({
  auth: 'required',
  handler: async ({ env, user, params, request }) => {
    const memberId = params.id;

    if (!memberId) {
      throw new Error('Member ID is required');
    }

    // Check permissions: user can only upload to their own profile, or admin/mod can upload to any
    if (user!.user_id !== memberId && user!.role !== 'admin' && user!.role !== 'moderator') {
      throw new Error('You can only upload media to your own profile');
    }

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const kind = (formData.get('kind') as string) || 'image';
    const isAvatar = formData.get('is_avatar') === 'true';

    if (!file) {
      throw new Error('File is required');
    }

    if (kind !== 'image' && kind !== 'audio') {
      throw new Error('Invalid media kind. Must be "image" or "audio"');
    }

    // Validate file type
    if (kind === 'image' && !file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    if (kind === 'audio' && !file.type.startsWith('audio/')) {
      throw new Error('File must be an audio file');
    }

    // Validate file size
    const maxSize = kind === 'image' ? 5 * 1024 * 1024 : 20 * 1024 * 1024; // 5MB for images, 20MB for audio
    if (file.size > maxSize) {
      const maxMB = kind === 'image' ? '5MB' : '20MB';
      throw new Error(`File size must be less than ${maxMB}`);
    }

    // Generate media ID and R2 key
    const mediaId = generateId('med');
    const fileExtension = file.name.split('.').pop() || (kind === 'image' ? 'webp' : 'opus');
    const r2Key = `guild/members/${memberId}/${kind}/${mediaId}.${fileExtension}`;

    // Upload to R2
    await env.BUCKET.put(r2Key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Calculate SHA-256 hash for deduplication (optional for now)
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha256 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const now = utcNow();

    // Insert into media_objects table
    await env.DB.prepare(
      `INSERT INTO media_objects (
        media_id, storage_type, r2_key, content_type, size_bytes,
        sha256, created_by, created_at_utc, updated_at_utc
      ) VALUES (?, 'r2', ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(mediaId, r2Key, file.type, file.size, sha256, memberId, now, now)
      .run();

    // Get current max sort_order for this member and kind
    const maxSortResult = await env.DB.prepare(
      `SELECT COALESCE(MAX(sort_order), -1) as max_sort
       FROM member_media
       WHERE user_id = ? AND kind = ?`
    )
      .bind(memberId, kind)
      .first();

    const sortOrder = (maxSortResult?.max_sort as number) + 1;

    // If this is an avatar, unset existing avatar
    if (isAvatar && kind === 'image') {
      await env.DB.prepare(
        `UPDATE member_media SET is_avatar = 0 WHERE user_id = ? AND kind = 'image'`
      )
        .bind(memberId)
        .run();
    }

    // Link to member via member_media table (DB triggers will enforce quotas)
    try {
      await env.DB.prepare(
        `INSERT INTO member_media (
          user_id, media_id, kind, is_avatar, sort_order,
          created_at_utc, updated_at_utc
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(memberId, mediaId, kind, isAvatar && kind === 'image' ? 1 : 0, sortOrder, now, now)
        .run();
    } catch (error: any) {
      // Check if quota exceeded (DB trigger will raise error)
      if (error.message?.includes('quota exceeded')) {
        // Clean up uploaded file
        await env.BUCKET.delete(r2Key);
        throw new Error(`Media quota exceeded for ${kind}. Max: ${kind === 'image' ? '10 images' : '1 audio'}`);
      }
      throw error;
    }

    // Generate signed URL for preview (valid for 1 hour)
    const url = await env.BUCKET.get(r2Key);
    const signedUrl = url ? `https://your-r2-domain.com/${r2Key}` : ''; // TODO: Replace with actual R2 public URL or signed URL

    return {
      media_id: mediaId,
      user_id: memberId,
      kind: kind as 'image' | 'audio',
      is_avatar: isAvatar && kind === 'image',
      sort_order: sortOrder,
      url: signedUrl,
    };
  },
});

/**
 * DELETE /members/:id/media/:mediaId - Remove media from member profile
 */
export const onRequestDelete = createEndpoint<{ success: true }>({
  auth: 'required',
  handler: async ({ env, user, params }) => {
    const memberId = params.id;
    const mediaId = params.mediaId;

    if (!memberId || !mediaId) {
      throw new Error('Member ID and Media ID are required');
    }

    // Check permissions
    if (user!.user_id !== memberId && user!.role !== 'admin' && user!.role !== 'moderator') {
      throw new Error('You can only remove media from your own profile');
    }

    // Check if media exists and belongs to this member
    const memberMedia = await env.DB.prepare(
      `SELECT mm.user_id, mm.media_id, mo.r2_key
       FROM member_media mm
       JOIN media_objects mo ON mm.media_id = mo.media_id
       WHERE mm.user_id = ? AND mm.media_id = ?`
    )
      .bind(memberId, mediaId)
      .first();

    if (!memberMedia) {
      throw new Error('Media not found for this member');
    }

    // Delete from R2
    if (memberMedia.r2_key) {
      await env.BUCKET.delete(memberMedia.r2_key as string);
    }

    // Delete from member_media (unlink from member)
    await env.DB.prepare(
      `DELETE FROM member_media WHERE user_id = ? AND media_id = ?`
    )
      .bind(memberId, mediaId)
      .run();

    // Delete from media_objects (hard delete)
    await env.DB.prepare(
      `DELETE FROM media_objects WHERE media_id = ?`
    )
      .bind(mediaId)
      .run();

    return { success: true };
  },
});
