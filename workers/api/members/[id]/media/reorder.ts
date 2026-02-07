/**
 * Member Media Reordering API
 * PUT /members/:id/media/reorder - Reorder member's media
 */

import { createEndpoint } from '../../../../lib/endpoint-factory';
import { utcNow, createAuditLog } from '../../../../lib/utils';
import { NotFoundError } from '../../../../lib/errors';

interface ReorderMediaRequest {
  media_ids: string[]; // Full ordered list of media IDs
  kind?: 'image' | 'audio' | 'video_url'; // Optional: reorder only specific kind
}

interface MediaItem {
  media_id: string;
  kind: string;
  sort_order: number;
}

interface ReorderMediaResponse {
  message: string;
  media: MediaItem[];
}

/**
 * PUT /members/:id/media/reorder - Reorder member's media
 */
export const onRequestPut = createEndpoint<ReorderMediaResponse>({
  auth: 'required',
  cacheControl: 'no-store',

  handler: async ({ env, user, params, request }) => {
    const memberId = params.id;
    const body = (await request.json()) as ReorderMediaRequest;

    if (!body.media_ids || !Array.isArray(body.media_ids)) {
      throw new Error('media_ids array is required');
    }

    // Check permissions
    if (user!.user_id !== memberId && user!.role !== 'admin' && user!.role !== 'moderator') {
      throw new Error('You can only reorder media on your own profile');
    }

    // Check member exists
    const member = await env.DB
      .prepare('SELECT * FROM users WHERE user_id = ?')
      .bind(memberId)
      .first();

    if (!member) {
      throw new NotFoundError('Member');
    }

    // Get current media for this member (optionally filtered by kind)
    const kindFilter = body.kind ? 'AND kind = ?' : '';
    const bindParams = body.kind ? [memberId, body.kind] : [memberId];

    const currentMedia = await env.DB
      .prepare(
        `SELECT media_id, kind FROM member_media
         WHERE user_id = ? ${kindFilter}
         ORDER BY sort_order`
      )
      .bind(...bindParams)
      .all();

    const currentMediaIds = (currentMedia.results || []).map((row: any) => row.media_id);

    // Verify all media IDs in request exist in current media
    const invalidIds = body.media_ids.filter(id => !currentMediaIds.includes(id));
    if (invalidIds.length > 0) {
      throw new Error(`Invalid media IDs: ${invalidIds.join(', ')}`);
    }

    // Verify all current media IDs are in the request (can't skip any)
    const missingIds = currentMediaIds.filter(id => !body.media_ids.includes(id));
    if (missingIds.length > 0) {
      throw new Error(`Missing media IDs in reorder: ${missingIds.join(', ')}`);
    }

    const now = utcNow();

    // Update sort_order for all media
    for (let i = 0; i < body.media_ids.length; i++) {
      await env.DB
        .prepare(
          `UPDATE member_media
           SET sort_order = ?, updated_at_utc = ?
           WHERE user_id = ? AND media_id = ?`
        )
        .bind(i, now, memberId, body.media_ids[i])
        .run();
    }

    // Audit log
    await createAuditLog(
      env.DB,
      'member',
      'reorder_media',
      user!.user_id,
      memberId,
      `Reordered ${body.kind || 'all'} media`,
      JSON.stringify({ kind: body.kind, count: body.media_ids.length }),
    );

    // Return updated media list
    const updatedMedia = await env.DB
      .prepare(
        `SELECT media_id, kind, sort_order FROM member_media
         WHERE user_id = ? ${kindFilter}
         ORDER BY sort_order ASC`
      )
      .bind(...bindParams)
      .all();

    return {
      message: 'Media reordered successfully',
      media: (updatedMedia.results || []).map((row: any) => ({
        media_id: row.media_id,
        kind: row.kind,
        sort_order: row.sort_order,
      })),
    };
  },
});
