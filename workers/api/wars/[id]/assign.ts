/**
 * Guild War - Assign Member(s) to Team(s)
 * POST /api/wars/[id]/assign - Assign one or multiple members to teams
 *
 * Features:
 * - Single assignment: { userId, teamId, roleTag? }
 * - Batch assignment: { assignments: [{ userId, teamId, roleTag? }, ...] }
 * - Backward compatible with existing single assignment
 */

import type { Env } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog } from '../../../lib/utils';

// ============================================================
// Types
// ============================================================

interface SingleAssignBody {
  userId: string;
  teamId: string;
  roleTag?: string;
}

interface BatchAssignBody {
  assignments: Array<{
    userId: string;
    teamId: string;
    roleTag?: string;
  }>;
}

interface AssignResponse {
  message: string;
  assignedCount?: number;
  failed?: Array<{ userId: string; teamId: string; error: string }>;
}

// ============================================================
// POST /api/wars/[id]/assign
// ============================================================

export const onRequestPost = createEndpoint<AssignResponse, SingleAssignBody | BatchAssignBody>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => {
    // Check if it's a batch assignment (has 'assignments' array)
    if ('assignments' in body && Array.isArray(body.assignments)) {
      if (body.assignments.length === 0) {
        throw new Error('Assignments array cannot be empty');
      }
      if (body.assignments.length > 100) {
        throw new Error('Maximum 100 assignments per batch');
      }
      // Validate each assignment
      for (const assignment of body.assignments) {
        if (!assignment.userId || !assignment.teamId) {
          throw new Error('Each assignment requires userId and teamId');
        }
      }
      return body as BatchAssignBody;
    }

    // Single assignment
    if (!body.userId || !body.teamId) {
      throw new Error('userId and teamId are required');
    }
    return body as SingleAssignBody;
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
    // BATCH ASSIGN MODE: Assign multiple members
    // ============================================================
    if ('assignments' in body) {
      const { assignments } = body as BatchAssignBody;
      let successCount = 0;
      const failed: Array<{ userId: string; teamId: string; error: string }> = [];

      // Pre-fetch all teams for validation
      const teamIds = [...new Set(assignments.map(a => a.teamId))];
      const teams = await env.DB
        .prepare(`SELECT war_team_id, team_name, sort_order FROM war_teams WHERE war_team_id IN (${teamIds.map(() => '?').join(',')}) AND war_id = ?`)
        .bind(...teamIds, warId)
        .all();
      const teamMap = new Map(teams.results?.map((t: any) => [t.war_team_id, t]) || []);

      // Pre-fetch existing assignments
      const userIds = [...new Set(assignments.map(a => a.userId))];
      const existing = await env.DB
        .prepare(`
          SELECT wtm.user_id, wt.war_team_id
          FROM war_team_members wtm
          JOIN war_teams wt ON wtm.war_team_id = wt.war_team_id
          WHERE wtm.user_id IN (${userIds.map(() => '?').join(',')}) AND wt.war_id = ?
        `)
        .bind(...userIds, warId)
        .all();
      const existingAssignments = new Set(existing.results?.map((e: any) => `${e.user_id}:${e.war_team_id}`) || []);

      // Process assignments
      for (const assignment of assignments) {
        try {
          const { userId, teamId, roleTag } = assignment;

          // Validate team exists
          if (!teamMap.has(teamId)) {
            failed.push({ userId, teamId, error: 'Team not found' });
            continue;
          }

          // Check if already assigned
          if (existingAssignments.has(`${userId}:${teamId}`)) {
            failed.push({ userId, teamId, error: 'User already assigned to this team' });
            continue;
          }

          // Check if user is assigned to a different team
          const userExistingTeam = [...existingAssignments].find(key => key.startsWith(`${userId}:`));
          if (userExistingTeam) {
            failed.push({ userId, teamId, error: 'User already assigned to a different team' });
            continue;
          }

          // Get next sort_order for this team
          const maxSort = await env.DB
            .prepare('SELECT MAX(sort_order) as max_sort FROM war_team_members WHERE war_team_id = ?')
            .bind(teamId)
            .first<{ max_sort: number | null }>();
          const sortOrder = (maxSort?.max_sort || 0) + 1;

          // Assign member to team
          await env.DB
            .prepare(`
              INSERT INTO war_team_members (
                war_team_id, user_id, sort_order, created_at_utc, updated_at_utc
              ) VALUES (?, ?, ?, ?, ?)
            `)
            .bind(teamId, userId, sortOrder, now, now)
            .run();

          // Remove from pool if exists
          await env.DB
            .prepare('DELETE FROM war_pool_members WHERE war_id = ? AND user_id = ?')
            .bind(warId, userId)
            .run();

          successCount++;
        } catch (error: any) {
          failed.push({ userId: assignment.userId, teamId: assignment.teamId, error: error.message || 'Unknown error' });
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
        'batch_assign',
        user.user_id,
        warId,
        `Batch assigned ${successCount} members to teams`,
        JSON.stringify({ total: assignments.length, success: successCount, failed: failed.length })
      );

      return {
        message: `Batch assignment complete: ${successCount} assigned, ${failed.length} failed`,
        assignedCount: successCount,
        failed: failed.length > 0 ? failed : undefined,
      };
    }

    // ============================================================
    // SINGLE ASSIGN MODE: Assign one member
    // ============================================================
    const { userId, teamId } = body as SingleAssignBody;

    // Verify team belongs to this war
    const team = await env.DB
      .prepare('SELECT * FROM war_teams WHERE war_team_id = ? AND war_id = ?')
      .bind(teamId, warId)
      .first();

    if (!team) {
      throw new Error('Team not found');
    }

    // Check if user is already assigned to a team in this war
    const existing = await env.DB
      .prepare(`
        SELECT * FROM war_team_members wtm
        JOIN war_teams wt ON wtm.war_team_id = wt.war_team_id
        WHERE wtm.user_id = ? AND wt.war_id = ?
      `)
      .bind(userId, warId)
      .first();

    if (existing) {
      throw new Error('User is already assigned to a team in this war');
    }

    // Get next sort_order
    const maxSort = await env.DB
      .prepare('SELECT MAX(sort_order) as max_sort FROM war_team_members WHERE war_team_id = ?')
      .bind(teamId)
      .first<{ max_sort: number | null }>();

    const sortOrder = (maxSort?.max_sort || 0) + 1;

    // Assign member to team
    await env.DB
      .prepare(`
        INSERT INTO war_team_members (
          war_team_id, user_id, sort_order, created_at_utc, updated_at_utc
        ) VALUES (?, ?, ?, ?, ?)
      `)
      .bind(teamId, userId, sortOrder, now, now)
      .run();

    // Remove from pool if exists
    await env.DB
      .prepare('DELETE FROM war_pool_members WHERE war_id = ? AND user_id = ?')
      .bind(warId, userId)
      .run();

    // Update war timestamp
    await env.DB
      .prepare('UPDATE war_history SET updated_at_utc = ? WHERE war_id = ?')
      .bind(now, warId)
      .run();

    await createAuditLog(
      env.DB,
      'war',
      'assign_member',
      user.user_id,
      warId,
      `Assigned user ${userId} to team ${teamId}`,
      JSON.stringify({ userId, teamId })
    );

    return { message: 'Member assigned successfully' };
  },
});
