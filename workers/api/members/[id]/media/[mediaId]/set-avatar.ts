/**
 * Member Media - Set Avatar
 * POST /members/:id/media/:mediaId/set-avatar
 *
 * Sets the specified media as the member's avatar
 * Unsets any previously set avatar for this member
 */

import { createEndpoint } from '../../../../../../lib/endpoint-factory';
import { utcNow, createAuditLog } from '../../../../../../lib/utils';

interface SetAvatarResponse {
  message: string;
  media_id: string;
  user_id: string;
  url: string;
}

/**
 * POST /members/:id/media/:mediaId/set-avatar
 */
export const onRequestPost = createEndpoint<SetAvatarResponse>({
  auth: 'required',
  cacheControl: 'no-store',

  handler: async ({ env, user, params }) => {
    const memberId = params.id;
    const mediaId = params.mediaId;

    if (!memberId || !mediaId) {
      throw new Error('Member ID and Media ID are required');
    }

    // Check permissions: user can only set avatar for their own profile, or admin/mod can set for any
    if (user!.user_id !== memberId && user!.role !== 'admin' && user!.role !== 'moderator') {
      throw new Error('You can only set avatar for your own profile');
    }

    // Check if member exists
    const member = await env.DB
      .prepare('SELECT * FROM users WHERE user_id = ?')
      .bind(memberId)
      .first();

    if (!member) {
      throw new Error('Member not found');
    }

    // Check if media exists and belongs to this member
    const media = await env.DB
      .prepare(
        `SELECT mm.*, mo.r2_key, mo.content_type
         FROM member_media mm
         JOIN media_objects mo ON mm.media_id = mo.media_id
         WHERE mm.user_id = ? AND mm.media_id = ?`
      )
      .bind(memberId, mediaId)
      .first<any>();

    if (!media) {
      throw new Error('Media not found or does not belong to this member');
    }

    // Verify it's an image
    if (media.kind !== 'image') {
      throw new Error('Only images can be set as avatars');
    }

    const now = utcNow();

    // Unset all other avatars for this member
    await env.DB
      .prepare(
        `UPDATE member_media
         SET is_avatar = 0, updated_at_utc = ?
         WHERE user_id = ? AND is_avatar = 1`
      )
      .bind(now, memberId)
      .run();

    // Set this media as avatar
    await env.DB
      .prepare(
        `UPDATE member_media
         SET is_avatar = 1, updated_at_utc = ?
         WHERE user_id = ? AND media_id = ?`
      )
      .bind(now, memberId, mediaId)
      .run();

    // Audit log
    await createAuditLog(
      env.DB,
      'member',
      'set_avatar',
      user!.user_id,
      memberId,
      `Set avatar to media ${mediaId}`,
      null,
    );

    return {
      message: 'Avatar set successfully',
      media_id: mediaId,
      user_id: memberId,
      url: media.r2_key ? `https://your-r2-domain.com/${media.r2_key}` : '',
    };
  },
});
