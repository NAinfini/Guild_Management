/**
 * Announcement Actions - Toggle Archive
 * POST /api/announcements/[id]/toggle-archive
 * 
 * Toggles the archived state of an announcement
 */

import { createEndpoint } from '../../../core/endpoint-factory';
import { broadcastUpdate } from '../../../core/broadcast';
import { utcNow, createAuditLog, assertIfMatch, etagFromTimestamp, successResponse } from '../../../core/utils';
import type { Announcement } from '../../../core/types';
import { NotFoundError } from '../../../core/errors';

interface ToggleArchiveResponse {
  message: string;
  isArchived: boolean;
}

export const onRequestPost = createEndpoint<ToggleArchiveResponse>({
  auth: 'moderator',
  cacheControl: 'no-store',

  handler: async ({ env, user, params, request, waitUntil }) => {
    const announcementId = params.id;
    
    // 1. Fetch current state
    const announcement = await env.DB
      .prepare('SELECT * FROM announcements WHERE announcement_id = ?')
      .bind(announcementId)
      .first<Announcement>();

    if (!announcement) {
      throw new NotFoundError('Announcement');
    }

    // 2. Concurrency check
    const currentEtag = etagFromTimestamp(announcement.updated_at_utc);
    const preconditionError = assertIfMatch(request, currentEtag);
    if (preconditionError) return preconditionError;

    // 3. Toggle state
    const newArchiveState = announcement.is_archived === 1 ? 0 : 1;
    const now = utcNow();

    // 4. Update
    await env.DB
      .prepare('UPDATE announcements SET is_archived = ?, updated_at_utc = ? WHERE announcement_id = ?')
      .bind(newArchiveState, now, announcementId)
      .run();

    // 5. Audit Log
    await createAuditLog(
      env.DB,
      'announcement',
      newArchiveState ? 'archive' : 'restore',
      user!.user_id,
      announcementId,
      `${newArchiveState ? 'Archived' : 'Restored'} announcement: ${announcement.title}`,
      undefined
    );

    // 6. Return result
    const updatedAnnouncement = await env.DB
      .prepare('SELECT * FROM announcements WHERE announcement_id = ?')
      .bind(announcementId)
      .first<Announcement>();

    const newEtag = etagFromTimestamp(updatedAnnouncement?.updated_at_utc) || undefined;

    if (updatedAnnouncement) {
      waitUntil(broadcastUpdate(env, {
        entity: 'announcements',
        action: 'updated',
        payload: [updatedAnnouncement],
        ids: [announcementId],
        excludeUserId: user!.user_id,
      }));
    }

    return successResponse<ToggleArchiveResponse>(
      {
        message: `Announcement ${newArchiveState ? 'archived' : 'restored'} successfully`,
        isArchived: newArchiveState === 1,
      },
      200,
      newEtag ? { etag: newEtag } : undefined
    );
  },
});
