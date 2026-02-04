/**
 * Guild War API - Team Assignment
 * POST /api/wars/[id]/assign - Assign member to team or pool
 * POST /api/wars/[id]/unassign - Remove member from team
 */

import type { PagesFunction, Env } from '../../_types';
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  notFoundResponse,
  conflictResponse,
  utcNow,
  etagFromTimestamp,
  assertIfMatch,
} from '../../_utils';
import { withModeratorAuth } from '../../_middleware';
import { validateBody, assignMemberSchema } from '../../_validation';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const action = context.params.action;

  if (action === 'assign') {
    return handleAssign(context);
  } else if (action === 'unassign') {
    return handleUnassign(context);
  }

  return errorResponse('INVALID_ACTION', 'Invalid action', 400);
};

async function handleAssign(context: any): Promise<Response> {
  return withModeratorAuth(context, async (authContext) => {
    const { request, env, params } = authContext;
    const eventId = params.id;

    const validation = await validateBody(request, assignMemberSchema);
    if (!validation.success) {
      return badRequestResponse('Invalid request body', validation.error.errors);
    }

    const payload = validation.data as any;
    const operations = Array.isArray(payload.operations) ? payload.operations : [payload];

    try {
      // Get war_history
      const warHistory = await env.DB
        .prepare('SELECT * FROM war_history WHERE event_id = ?')
        .bind(eventId)
        .first<{ war_id: string; updated_at_utc: string }>();

      if (!warHistory) {
        return notFoundResponse('War');
      }

      const warId = warHistory.war_id;
      const now = utcNow();
      const currentEtag = etagFromTimestamp(warHistory.updated_at_utc);
      const pre = assertIfMatch(request, currentEtag);
      if (pre) return pre;

      const results: any[] = [];

      for (const op of operations) {
        const userId = op.userId || op.user_id;
        const teamId = op.teamId || op.team_id;
        const roleTag = op.roleTag || op.role_tag;

        if (!userId) {
          return badRequestResponse('userId is required');
        }

        // Check if member is already assigned
        const existingTeam = await env.DB
          .prepare('SELECT * FROM war_team_members WHERE war_id = ? AND user_id = ?')
          .bind(warId, userId)
          .first();

        const existingPool = await env.DB
          .prepare('SELECT * FROM war_pool_members WHERE war_id = ? AND user_id = ?')
          .bind(warId, userId)
          .first();

        if (existingTeam) {
          await env.DB
            .prepare('DELETE FROM war_team_members WHERE war_id = ? AND user_id = ?')
            .bind(warId, userId)
            .run();
        }
        if (existingPool) {
          await env.DB
            .prepare('DELETE FROM war_pool_members WHERE war_id = ? AND user_id = ?')
            .bind(warId, userId)
            .run();
        }

        if (teamId) {
          const team = await env.DB
            .prepare('SELECT * FROM war_teams WHERE war_team_id = ? AND war_id = ?')
            .bind(teamId, warId)
            .first<{ is_locked: number; war_team_id: string }>();

          if (!team) {
            return notFoundResponse('Team');
          }
          if (team.is_locked) {
            return conflictResponse('TEAM_LOCKED', 'Team is locked and cannot accept members');
          }

          const maxSort = await env.DB
            .prepare('SELECT MAX(sort_order) as max_sort FROM war_team_members WHERE war_team_id = ?')
            .bind(teamId)
            .first<{ max_sort: number | null }>();
          const sortOrder = (maxSort?.max_sort || 0) + 1;

          await env.DB
            .prepare(`
              INSERT INTO war_team_members (
                war_id, war_team_id, user_id, role_tag, sort_order, created_at_utc, updated_at_utc
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(warId, teamId, userId, roleTag || null, sortOrder, now, now)
            .run();

          results.push({ userId, to: teamId, from: existingTeam ? existingTeam.war_team_id : existingPool ? 'pool' : null });
        } else {
          await env.DB
            .prepare(`
              INSERT INTO war_pool_members (war_id, user_id, created_at_utc, updated_at_utc)
              VALUES (?, ?, ?, ?)
            `)
            .bind(warId, userId, now, now)
            .run();

          results.push({ userId, to: 'pool', from: existingTeam ? existingTeam.war_team_id : 'pool' });
        }
      }

      await env.DB
        .prepare('UPDATE war_history SET updated_at_utc = ?, updated_by = ? WHERE war_id = ?')
        .bind(now, authContext.data.user.user_id, warId)
        .run();

      const newEtag = etagFromTimestamp(now);
      const resp = successResponse({
        message: 'Members assigned successfully',
        undo: { operations: results, warId, expiresInMs: 5000 },
      });
      if (newEtag) resp.headers.set('ETag', newEtag);
      return resp;
    } catch (error) {
      console.error('Assign member error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while assigning member', 500);
    }
  });
}

async function handleUnassign(context: any): Promise<Response> {
  return withModeratorAuth(context, async (authContext) => {
    const { request, env, params } = authContext;
    const eventId = params.id;

    const validation = await validateBody(request, assignMemberSchema);
    if (!validation.success) {
      return badRequestResponse('Invalid request body', validation.error.errors);
    }

    const payload = validation.data;
    const userId = payload.userId || (payload as any).user_id;

    try {
      if (!userId) {
        return badRequestResponse('userId is required');
      }

      // Get war_history
      const warHistory = await env.DB
        .prepare('SELECT * FROM war_history WHERE event_id = ?')
        .bind(eventId)
        .first<{ war_id: string }>();

      if (!warHistory) {
        return notFoundResponse('War');
      }

      const warId = warHistory.war_id;

      // Remove from team
      await env.DB
        .prepare('DELETE FROM war_team_members WHERE war_id = ? AND user_id = ?')
        .bind(warId, userId)
        .run();

      // Remove from pool
      await env.DB
        .prepare('DELETE FROM war_pool_members WHERE war_id = ? AND user_id = ?')
        .bind(warId, userId)
        .run();

      const newEtag = etagFromTimestamp(utcNow());
      const resp = successResponse({ message: 'Member unassigned successfully' });
      if (newEtag) resp.headers.set('ETag', newEtag);
      return resp;
    } catch (error) {
      console.error('Unassign member error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while unassigning member', 500);
    }
  });
}
