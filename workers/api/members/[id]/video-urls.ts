/**
 * Member Video URLs Management
 * POST /members/:id/video-urls - Add external video URL
 * GET /members/:id/video-urls - List member's video URLs
 *
 * Max 10 video URLs per member (enforced by DB trigger)
 * Must be external_url storage type (enforced by DB trigger)
 */

import { createEndpoint } from '../../../../lib/endpoint-factory';
import { generateId } from '../../../../../shared/utils/id';
import { utcNow } from '../../../../../shared/utils/date';
import { createAuditLog } from '../../../../lib/utils';

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
export const onRequestPost = createEndpoint<VideoUrlResponse>({
  auth: 'required',
  cacheControl: 'no-store',

  handler: async ({ env, user, params, request }) => {
    const memberId = params.id;
    const body = (await request.json()) as VideoUrlCreateRequest;

    if (!body.url) {
      throw new Error('URL is required');
    }

    // Check permissions
    if (user!.user_id !== memberId && user!.role !== 'admin' && user!.role !== 'moderator') {
      throw new Error('You can only add video URLs to your own profile');
    }

    // Validate URL format
    try {
      const urlObj = new URL(body.url);
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
      .first();

    if (!member) {
      throw new Error('Member not found');
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
      .bind(mediaId, body.url, memberId, now, now)
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

    const nextSortOrder = (maxSortResult?.max_sort || -1) + 1;

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
      `Added video URL: ${body.title || body.url}`,
      JSON.stringify({ url: body.url, title: body.title }),
    );

    return {
      media_id: mediaId,
      user_id: memberId,
      url: body.url,
      title: body.title || null,
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
