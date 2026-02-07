/**
 * Member Video URLs Management
 * POST /members/:id/video-urls - Add external video URL
 * GET /members/:id/video-urls - List member's video URLs
 *
 * Max 10 video URLs per member (enforced by DB trigger)
 * Must be external_url storage type (enforced by DB trigger)
 */

import { createEndpoint } from '../../../lib/endpoint-factory';
import { generateId } from '../../../lib/utils';
import { utcNow } from '../../../lib/utils';
import { createAuditLog } from '../../../lib/utils';
import { NotFoundError } from '../../../lib/errors';

interface VideoUrlCreateRequest {
  url: string;
  title?: string;
}

interface VideoUrlResponse {
  media_id: string;
  user_id: string;
  url: string;
  title: string | null;
  sort_order: number;
  created_at_utc: string;
}

/**
 * POST /members/:id/video-urls - Add external video URL
 */
export const onRequestPost = createEndpoint<VideoUrlResponse, any, VideoUrlCreateRequest>({
  auth: 'required',
  cacheControl: 'no-store',

  parseBody: (body) => {
    if (!body.url) {
      throw new Error('URL is required');
    }
    return body as VideoUrlCreateRequest;
  },

  handler: async ({ env, user, params, body }) => {
    if (!body) throw new Error('Body required');
    const memberId = params.id;
    const { url, title } = body;

    // Check permissions
    if (user!.user_id !== memberId && user!.role !== 'admin' && user!.role !== 'moderator') {
      throw new Error('You can only add video URLs to your own profile');
    }

    // Validate URL format
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('URL must use HTTP or HTTPS protocol');
      }
    } catch {
      throw new Error('Invalid URL format');
    }

    // Check member exists
    const member = await env.DB
      .prepare('SELECT * FROM users WHERE user_id = ?')
      .bind(memberId)
      .first<{ user_id: string }>();

    if (!member) {
      throw new NotFoundError('Member');
    }

    const now = utcNow();
    const mediaId = generateId('med');

    // Create media_object with external_url storage type
    await env.DB
      .prepare(
        `INSERT INTO media_objects (
          media_id, storage_type, external_url, content_type,
          created_by, created_at_utc, updated_at_utc
        ) VALUES (?, 'external_url', ?, 'video/external', ?, ?, ?)`
      )
      .bind(mediaId, url, memberId, now, now)
      .run();

    // Get next sort_order
    const maxSortResult = await env.DB
      .prepare(
        `SELECT COALESCE(MAX(sort_order), -1) as max_sort
         FROM member_media
         WHERE user_id = ? AND kind = 'video_url'`
      )
      .bind(memberId)
      .first<{ max_sort: number }>();

    const nextSortOrder = (maxSortResult?.max_sort ?? -1) + 1;

    // Insert into member_media (trigger will enforce quota and storage type)
    await env.DB
      .prepare(
        `INSERT INTO member_media (
          user_id, media_id, kind, is_avatar, sort_order,
          created_at_utc, updated_at_utc
        ) VALUES (?, ?, 'video_url', 0, ?, ?, ?)`
      )
      .bind(memberId, mediaId, nextSortOrder, now, now)
      .run();

    // Audit log
    await createAuditLog(
      env.DB,
      'member',
      'add_video_url',
      user!.user_id,
      memberId,
      `Added video URL: ${title || url}`,
      JSON.stringify({ url, title })
    );

    return {
      media_id: mediaId,
      user_id: memberId,
      url: url,
      title: title || null,
      sort_order: nextSortOrder,
      created_at_utc: now,
    };
  },
});

/**
 * GET /members/:id/video-urls - List member's video URLs
 */
export const onRequestGet = createEndpoint<VideoUrlResponse[]>({
  auth: 'optional',
  etag: true,
  cacheControl: 'public, max-age=60',

  handler: async ({ env, params }) => {
    const memberId = params.id;

    const videoUrls = await env.DB
      .prepare(
        `SELECT mm.*, mo.external_url
         FROM member_media mm
         JOIN media_objects mo ON mm.media_id = mo.media_id
         WHERE mm.user_id = ? AND mm.kind = 'video_url'
         ORDER BY mm.sort_order ASC`
      )
      .bind(memberId)
      .all();

    return (videoUrls.results || []).map((row: any) => ({
      media_id: row.media_id,
      user_id: row.user_id,
      url: row.external_url,
      title: null, // Title not stored in current schema
      sort_order: row.sort_order,
      created_at_utc: row.created_at_utc,
    }));
  },
});
