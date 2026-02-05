/**
 * Announcement Actions - Toggle Archive
 * POST /api/announcements/[id]/toggle-archive
 * 
 * Toggles the archived state of an announcement
 */

import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog, assertIfMatch, etagFromTimestamp, successResponse } from '../../../lib/utils';
import type { Announcement } from '../../../lib/types';

interface ToggleArchiveResponse {
  message: string;
  isArchived: boolean;
}

export const onRequestPost = createEndpoint<ToggleArchiveResponse>({
  auth: 'moderator',
  cacheControl: 'no-store',

  handler: async ({ env, user, params, request }) => {
    const announcementId = params.id;
    
    // 1. Fetch current state
    const announcement = await env.DB
      .prepare('SELECT * FROM announcements WHERE announcement_id = ?')
      .bind(announcementId)
      .first<Announcement>();

    if (!announcement) {
      throw new Error('Announcement not found');
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
    const updated = await env.DB
            .prepare('SELECT updated_at_utc FROM announcements WHERE announcement_id = ?')
            .bind(announcementId)
            .first<{ updated_at_utc: string }>();

    const newEtag = etagFromTimestamp(updated?.updated_at_utc) || undefined;

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
