/**
 * Guild War - Unassign Member(s) from Teams
 * POST /api/wars/[id]/unassign - Unassign one or multiple members from teams
 *
 * Features:
 * - Single unassignment: { userId }
 * - Batch unassignment: { userIds: string[] }
 * - Backward compatible with existing single unassignment
 */

import type { Env } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog } from '../../../lib/utils';

// ============================================================
// Types
// ============================================================

interface SingleUnassignBody {
  userId: string;
}

interface BatchUnassignBody {
  userIds: string[];
}

interface UnassignResponse {
  message: string;
  unassignedCount?: number;
  failed?: Array<{ userId: string; error: string }>;
}

// ============================================================
// POST /api/wars/[id]/unassign
// ============================================================

export const onRequestPost = createEndpoint<UnassignResponse, SingleUnassignBody | BatchUnassignBody>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => {
    // Check if it's a batch unassignment (has 'userIds' array)
    if ('userIds' in body && Array.isArray(body.userIds)) {
      if (body.userIds.length === 0) {
        throw new Error('UserIds array cannot be empty');
      }
      if (body.userIds.length > 100) {
        throw new Error('Maximum 100 users per batch unassignment');
      }
      return body as BatchUnassignBody;
    }

    // Single unassignment
    if (!body.userId) {
      throw new Error('userId is required');
    }
    return body as SingleUnassignBody;
  },

  handler: async ({ env, user, params, body }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const eventId = params.id;
    const now = utcNow();

    // Get war_id from event_id
    const warHistory = await env.DB
      .prepare('SELECT war_id FROM war_history WHERE event_id = ?')
      .bind(eventId)
      .first<{ war_id: string }>();

    if (!warHistory) {
      throw new Error('War not found');
    }

    const warId = warHistory.war_id;

    // ============================================================
    // BATCH UNASSIGN MODE: Unassign multiple members
    // ============================================================
    if ('userIds' in body) {
      const { userIds } = body as BatchUnassignBody;
      let successCount = 0;
      const failed: Array<{ userId: string; error: string }> = [];

      // Batch unassign from teams
      const placeholders = userIds.map(() => '?').join(',');
      const result = await env.DB
        .prepare(`
          DELETE FROM war_team_members
          WHERE user_id IN (${placeholders}) AND war_team_id IN (
            SELECT war_team_id FROM war_teams WHERE war_id = ?
          )
        `)
        .bind(...userIds, warId)
        .run();

      const deletedCount = result.meta.changes || 0;

      // Add all to pool (use INSERT OR IGNORE for safety)
      for (const userId of userIds) {
        try {
          await env.DB
            .prepare(`
              INSERT OR IGNORE INTO war_pool_members (
                war_id, user_id, created_at_utc, updated_at_utc
              ) VALUES (?, ?, ?, ?)
            `)
            .bind(warId, userId, now, now)
            .run();
          successCount++;
        } catch (error: any) {
          failed.push({ userId, error: error.message || 'Unknown error' });
        }
      }

      // Update war timestamp
      await env.DB
        .prepare('UPDATE war_history SET updated_at_utc = ? WHERE war_id = ?')
        .bind(now, warId)
        .run();

      await createAuditLog(
        env.DB,
        'war',
        'batch_unassign',
        user.user_id,
        warId,
        `Batch unassigned ${successCount} members from teams`,
        JSON.stringify({ total: userIds.length, success: successCount, failed: failed.length })
      );

      return {
        message: `Batch unassignment complete: ${successCount} unassigned, ${failed.length} failed`,
        unassignedCount: successCount,
        failed: failed.length > 0 ? failed : undefined,
      };
    }

    // ============================================================
    // SINGLE UNASSIGN MODE: Unassign one member
    // ============================================================
    const { userId } = body as SingleUnassignBody;

    // Remove from team
    const result = await env.DB
      .prepare(`
        DELETE FROM war_team_members
        WHERE user_id = ? AND war_team_id IN (
          SELECT war_team_id FROM war_teams WHERE war_id = ?
        )
      `)
      .bind(userId, warId)
      .run();

    if (!result.meta.changes) {
      throw new Error('User is not assigned to any team in this war');
    }

    // Add to pool
    await env.DB
      .prepare(`
        INSERT OR IGNORE INTO war_pool_members (
          war_id, user_id, created_at_utc, updated_at_utc
        ) VALUES (?, ?, ?, ?)
      `)
      .bind(warId, userId, now, now)
      .run();

    // Update war timestamp
    await env.DB
      .prepare('UPDATE war_history SET updated_at_utc = ? WHERE war_id = ?')
      .bind(now, warId)
      .run();

    await createAuditLog(
      env.DB,
      'war',
      'unassign_member',
      user.user_id,
      warId,
      `Unassigned user ${userId} from team`,
      JSON.stringify({ userId })
    );

    return { message: 'Member unassigned successfully' };
  },
});
