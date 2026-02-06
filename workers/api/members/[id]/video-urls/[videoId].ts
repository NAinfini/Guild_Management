/**
 * Member Video URL Management - Individual
 * PUT /members/:id/video-urls/:videoId - Update video URL
 * DELETE /members/:id/video-urls/:videoId - Delete video URL
 */

import { createEndpoint } from '../../../../lib/endpoint-factory';
import { utcNow } from '../../../../lib/utils';
import { createAuditLog } from '../../../../lib/utils';

interface VideoUrlUpdateRequest {
  url?: string;
  title?: string;
}

interface VideoUrlResponse {
  media_id: string;
  user_id: string;
  url: string;
  title: string | null;
  sort_order: number;
  updated_at_utc: string;
}

/**
 * PUT /members/:id/video-urls/:videoId - Update video URL
 */
export const onRequestPut = createEndpoint<VideoUrlResponse, any, VideoUrlUpdateRequest>({
  auth: 'required',
  cacheControl: 'no-store',

  handler: async ({ env, user, params, request }) => {
    const memberId = params.id;
    const videoId = params.videoId;
    const body = (await request.json()) as VideoUrlUpdateRequest;

    if (!body) {
      throw new Error('Body is required');
    }

    if (!body.url && !body.title) {
      throw new Error('URL or title is required');
    }

    // Check permissions
    if (user!.user_id !== memberId && user!.role !== 'admin' && user!.role !== 'moderator') {
      throw new Error('You can only update video URLs on your own profile');
    }

    // Check video URL exists and belongs to member
    const existing = await env.DB
      .prepare(
        `SELECT mm.*, mo.external_url
         FROM member_media mm
         JOIN media_objects mo ON mm.media_id = mo.media_id
         WHERE mm.user_id = ? AND mm.media_id = ? AND mm.kind = 'video_url'`
      )
      .bind(memberId, videoId)
      .first<any>();

    if (!existing) {
      throw new Error('Video URL not found');
    }

    const now = utcNow();

    // Update URL if provided
    if (body.url) {
      // Validate URL format
      try {
        const urlObj = new URL(body.url);
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
          throw new Error('URL must use HTTP or HTTPS protocol');
        }
      } catch {
        throw new Error('Invalid URL format');
      }

      await env.DB
        .prepare(
          `UPDATE media_objects
           SET external_url = ?, updated_at_utc = ?
           WHERE media_id = ?`
        )
        .bind(body.url, now, videoId)
        .run();
    }

    // Update member_media timestamp
    await env.DB
      .prepare(
        `UPDATE member_media
         SET updated_at_utc = ?
         WHERE user_id = ? AND media_id = ?`
      )
      .bind(now, memberId, videoId)
      .run();

    // Audit log
    await createAuditLog(
      env.DB,
      'member',
      'update_video_url',
      user!.user_id,
      memberId,
      `Updated video URL ${videoId}`,
      JSON.stringify(body),
    );

    // Return updated video URL
    const updated = await env.DB
      .prepare(
        `SELECT mm.*, mo.external_url
         FROM member_media mm
         JOIN media_objects mo ON mm.media_id = mo.media_id
         WHERE mm.user_id = ? AND mm.media_id = ?`
      )
      .bind(memberId, videoId)
      .first<any>();

    return {
      media_id: updated!.media_id,
      user_id: updated!.user_id,
      url: updated!.external_url,
      title: null,
      sort_order: updated!.sort_order,
      updated_at_utc: updated!.updated_at_utc,
    };
  },
});

/**
 * DELETE /members/:id/video-urls/:videoId - Delete video URL
 */
export const onRequestDelete = createEndpoint<{ success: true; message: string }>({
  auth: 'required',
  cacheControl: 'no-store',

  handler: async ({ env, user, params }) => {
    const memberId = params.id;
    const videoId = params.videoId;

    // Check permissions
    if (user!.user_id !== memberId && user!.role !== 'admin' && user!.role !== 'moderator') {
      throw new Error('You can only delete video URLs from your own profile');
    }

    // Check video URL exists
    const existing = await env.DB
      .prepare(
        `SELECT * FROM member_media
         WHERE user_id = ? AND media_id = ? AND kind = 'video_url'`
      )
      .bind(memberId, videoId)
      .first();

    if (!existing) {
      throw new Error('Video URL not found');
    }

    // Delete from member_media (will cascade delete from media_objects)
    await env.DB
      .prepare('DELETE FROM member_media WHERE user_id = ? AND media_id = ?')
      .bind(memberId, videoId)
      .run();

    // Delete from media_objects
    await env.DB
      .prepare('DELETE FROM media_objects WHERE media_id = ?')
      .bind(videoId)
      .run();

    // Reorder remaining video URLs to fill gap
    const remaining = await env.DB
      .prepare(
        `SELECT media_id FROM member_media
         WHERE user_id = ? AND kind = 'video_url'
         ORDER BY sort_order ASC`
      )
      .bind(memberId)
      .all();

    const now = utcNow();

    if (remaining.results && remaining.results.length > 0) {
      for (let i = 0; i < remaining.results.length; i++) {
        const row = remaining.results[i] as any;
        await env.DB
          .prepare(
            `UPDATE member_media
             SET sort_order = ?, updated_at_utc = ?
             WHERE user_id = ? AND media_id = ?`
          )
          .bind(i, now, memberId, row.media_id)
          .run();
      }
    }

    // Audit log
    await createAuditLog(
      env.DB,
      'member',
      'delete_video_url',
      user!.user_id,
      memberId,
      `Deleted video URL ${videoId}`,
      undefined,
    );

    return {
      success: true,
      message: 'Video URL deleted successfully',
    };
  },
});
