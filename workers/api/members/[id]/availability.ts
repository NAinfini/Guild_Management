/**
 * Member Availability Management
 * PUT /api/members/[id]/availability - Update member availability
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, etagFromTimestamp, assertIfMatch, createAuditLog } from '../../../lib/utils';

// ============================================================
// Types
// ============================================================

interface AvailabilityBlock {
  weekday: number;
  startMin: number;
  endMin: number;
}

interface UpdateAvailabilityBody {
  blocks: AvailabilityBlock[];
}

interface UpdateAvailabilityResponse {
  message: string;
  blocks: AvailabilityBlock[];
}

// ============================================================
// PUT /api/members/[id]/availability
// ============================================================

export const onRequestPut = createEndpoint<UpdateAvailabilityResponse, any, UpdateAvailabilityBody>({
  auth: 'required',
  cacheControl: 'no-store',

  parseBody: (body) => {
    if (!body.blocks || !Array.isArray(body.blocks)) {
      throw new Error('blocks array is required');
    }
    return body as UpdateAvailabilityBody;
  },

  handler: async ({ env, user, params, body, request }) => {
    const userId = params.id;

    // Only self can update availability
    if (userId !== user!.user_id) {
      throw new Error('You can only update your own availability');
    }

    const current = await env.DB
      .prepare('SELECT updated_at_utc, created_at_utc FROM users WHERE user_id = ?')
      .bind(userId)
      .first<{ updated_at_utc: string; created_at_utc: string }>();

    const currentEtag = etagFromTimestamp(current?.updated_at_utc || current?.created_at_utc);
    const pre = assertIfMatch(request, currentEtag);
    if (pre) return pre;

    if (!body) throw new Error('Body required');
    const { blocks } = body;
    const now = utcNow();

    // Delete existing availability
    await env.DB
      .prepare('DELETE FROM member_availability WHERE user_id = ?')
      .bind(userId)
      .run();

    // Insert new blocks
    for (const block of blocks) {
      await env.DB
        .prepare(`
          INSERT INTO member_availability (
            user_id, weekday, start_min, end_min, created_at_utc, updated_at_utc
          ) VALUES (?, ?, ?, ?, ?, ?)
        `)
        .bind(userId, block.weekday, block.startMin, block.endMin, now, now)
        .run();
    }

    // Update user timestamp
    await env.DB
      .prepare('UPDATE users SET updated_at_utc = ? WHERE user_id = ?')
      .bind(now, userId)
      .run();

    // Create audit log
    await createAuditLog(
      env.DB,
      'member',
      'update_availability',
      user!.user_id,
      userId,
      'Updated availability',
      JSON.stringify({ blockCount: blocks.length })
    );

    return {
      message: 'Availability updated successfully',
      blocks,
    };
  },
});
