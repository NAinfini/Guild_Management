/**
 * War Team Management
 * PUT /api/wars/[id]/teams/[teamId] - Update team
 * DELETE /api/wars/[id]/teams/[teamId] - Delete team
 */

import type { PagesFunction, Env } from '../../../_types';
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  notFoundResponse,
  utcNow,
  createAuditLog,
} from '../../../_utils';
import { withModeratorAuth } from '../../../_middleware';
import { validateBody, updateWarTeamSchema } from '../../../_validation';

// ============================================================
// PUT /api/wars/[id]/teams/[teamId] - Update Team
// ============================================================

export const onRequestPut: PagesFunction<Env> = async (context) => {
  return withModeratorAuth(context, async (authContext) => {
    const { request, env, params } = authContext;
    const { user } = authContext.data;
    const teamId = params.teamId;

    const validation = await validateBody(request, updateWarTeamSchema);
    if (!validation.success) {
      return badRequestResponse('Invalid request body', validation.error.errors);
    }

    const updates = validation.data;

    try {
      const team = await env.DB
        .prepare('SELECT * FROM war_teams WHERE war_team_id = ?')
        .bind(teamId)
        .first();

      if (!team) {
        return notFoundResponse('Team');
      }

      const now = utcNow();
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(updates.name);
      }
      if (updates.note !== undefined) {
        updateFields.push('note = ?');
        updateValues.push(updates.note || null);
      }
      if (updates.isLocked !== undefined) {
        updateFields.push('is_locked = ?');
        updateValues.push(updates.isLocked ? 1 : 0);
      }
      if (updates.sortOrder !== undefined) {
        updateFields.push('sort_order = ?');
        updateValues.push(updates.sortOrder);
      }

      if (updateFields.length === 0) {
        return badRequestResponse('No fields to update');
      }

      updateFields.push('updated_at_utc = ?');
      updateValues.push(now, teamId);

      const query = `UPDATE war_teams SET ${updateFields.join(', ')} WHERE war_team_id = ?`;
      await env.DB.prepare(query).bind(...updateValues).run();

      await createAuditLog(
        env.DB,
        'war',
        'update_team',
        user.user_id,
        teamId,
        `Updated team: ${updates.name || team.name}`,
        JSON.stringify(updates)
      );

      const updatedTeam = await env.DB
        .prepare('SELECT * FROM war_teams WHERE war_team_id = ?')
        .bind(teamId)
        .first();

      return successResponse({ team: updatedTeam });
    } catch (error) {
      console.error('Update team error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while updating team', 500);
    }
  });
};

// ============================================================
// DELETE /api/wars/[id]/teams/[teamId] - Delete Team
// ============================================================

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  return withModeratorAuth(context, async (authContext) => {
    const { env, params } = authContext;
    const { user } = authContext.data;
    const teamId = params.teamId;

    try {
      const team = await env.DB
        .prepare('SELECT * FROM war_teams WHERE war_team_id = ?')
        .bind(teamId)
        .first<{ war_team_id: string; war_id: string; name: string }>();

      if (!team) {
        return notFoundResponse('Team');
      }

      const now = utcNow();

      // Move team members back to pool
      const members = await env.DB
        .prepare('SELECT user_id FROM war_team_members WHERE war_team_id = ?')
        .bind(teamId)
        .all<{ user_id: string }>();

      for (const member of members.results || []) {
        // Check if already in pool
        const inPool = await env.DB
          .prepare('SELECT * FROM war_pool_members WHERE war_id = ? AND user_id = ?')
          .bind(team.war_id, member.user_id)
          .first();

        if (!inPool) {
          await env.DB
            .prepare(`
              INSERT INTO war_pool_members (war_id, user_id, created_at_utc, updated_at_utc)
              VALUES (?, ?, ?, ?)
            `)
            .bind(team.war_id, member.user_id, now, now)
            .run();
        }
      }

      // Delete team (CASCADE will delete war_team_members)
      await env.DB
        .prepare('DELETE FROM war_teams WHERE war_team_id = ?')
        .bind(teamId)
        .run();

      await createAuditLog(
        env.DB,
        'war',
        'delete_team',
        user.user_id,
        teamId,
        `Deleted team: ${team.name}`,
        null
      );

      return successResponse({ message: 'Team deleted successfully' });
    } catch (error) {
      console.error('Delete team error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while deleting team', 500);
    }
  });
};
