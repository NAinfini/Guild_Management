/**
 * Member Media Delete
 * DELETE /members/:id/media/:mediaId - Remove media from member profile
 */

import { createEndpoint } from '../../../../core/endpoint-factory';

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
      .first<{ user_id: string; media_id: string; r2_key: string | null }>();

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
