/**
 * Guild War API - Active War Management
 * GET /api/wars/active - Get active war
 * POST /api/wars/[id]/teams - Create team
 * PUT /api/wars/[id]/teams/[teamId] - Update team
 * DELETE /api/wars/[id]/teams/[teamId] - Delete team
 * POST /api/wars/[id]/assign - Assign member to team
 * POST /api/wars/[id]/unassign - Remove member from team
 */

import type { PagesFunction, Env } from '../../_types';
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
  conflictResponse,
  generateId,
  utcNow,
  createAuditLog,
} from '../../_utils';
import { withOptionalAuth, withModeratorAuth } from '../../_middleware';

// ============================================================
// GET /api/wars/active - Get Active War
// ============================================================

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withOptionalAuth(context, async (authContext) => {
    const { env } = authContext;

    try {
      // Get active guild war events
      const wars = await env.DB
        .prepare(`
          SELECT * FROM events 
          WHERE type = 'guild_war' AND is_archived = 0 
          ORDER BY start_at_utc DESC
          LIMIT 5
        `)
        .all();

      // For each war, get teams, pool, and assignments
      const warsWithData = await Promise.all(
        (wars.results || []).map(async (war: any) => {
          // Get war_history record if exists
          const warHistory = await env.DB
            .prepare('SELECT * FROM war_history WHERE event_id = ?')
            .bind(war.event_id)
            .first<{ war_id: string; updated_at_utc: string }>();

          const warId = warHistory?.war_id;

          if (!warId) {
            return { ...war, teams: [], pool: [] };
          }

          // Get teams
          const teams = await env.DB
            .prepare('SELECT * FROM war_teams WHERE war_id = ? ORDER BY sort_order')
            .bind(warId)
            .all();

          // Get team members for each team
          const teamsWithMembers = await Promise.all(
            (teams.results || []).map(async (team: any) => {
              const members = await env.DB
                .prepare(`
                  SELECT wtm.*, u.username, u.power
                  FROM war_team_members wtm
                  JOIN users u ON wtm.user_id = u.user_id
                  WHERE wtm.war_team_id = ?
                  ORDER BY wtm.sort_order
                `)
                .bind(team.war_team_id)
                .all();

              return { ...team, members: members.results || [] };
            })
          );

          // Get pool members
          const pool = await env.DB
            .prepare(`
              SELECT wpm.*, u.username, u.power
              FROM war_pool_members wpm
              JOIN users u ON wpm.user_id = u.user_id
              WHERE wpm.war_id = ?
            `)
            .bind(warId)
            .all();

          return {
            ...war,
            warId,
            warUpdatedAt: warHistory?.updated_at_utc || null,
            teams: teamsWithMembers,
            pool: pool.results || [],
          };
        })
      );

      return successResponse({ wars: warsWithData });
    } catch (error) {
      console.error('Get active wars error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while fetching active wars', 500);
    }
  });
};

// ============================================================
// POST /api/wars/[id]/teams - Create Team
// ============================================================

export const onRequestPost: PagesFunction<Env> = async (context) => {
  return withModeratorAuth(context, async (authContext) => {
    const { request, env, params } = authContext;
    const { user } = authContext.data;
    const eventId = params.id;

    try {
      const body = await request.json();
      const { name, note } = body;

      if (!name) {
        return badRequestResponse('Team name is required');
      }

      // Get or create war_history record
      let warHistory = await env.DB
        .prepare('SELECT * FROM war_history WHERE event_id = ?')
        .bind(eventId)
        .first<{ war_id: string }>();

      if (!warHistory) {
        // Create war_history record
        const warId = generateId('war');
        const now = utcNow();

        const event = await env.DB
          .prepare('SELECT * FROM events WHERE event_id = ?')
          .bind(eventId)
          .first<{ start_at_utc: string; title: string }>();

        if (!event) {
          return notFoundResponse('Event');
        }

        await env.DB
          .prepare(`
            INSERT INTO war_history (
              war_id, event_id, war_date, title, result, created_by, updated_by, created_at_utc, updated_at_utc
            ) VALUES (?, ?, ?, ?, 'unknown', ?, ?, ?, ?)
          `)
          .bind(warId, eventId, event.start_at_utc, event.title, user.user_id, user.user_id, now, now)
          .run();

        warHistory = { war_id: warId };
      }

      // Get max sort_order
      const maxSort = await env.DB
        .prepare('SELECT MAX(sort_order) as max_sort FROM war_teams WHERE war_id = ?')
        .bind(warHistory.war_id)
        .first<{ max_sort: number | null }>();

      const sortOrder = (maxSort?.max_sort || 0) + 1;

      // Create team
      const teamId = generateId('team');
      const now = utcNow();

      await env.DB
        .prepare(`
          INSERT INTO war_teams (
            war_team_id, war_id, name, note, is_locked, sort_order, created_at_utc, updated_at_utc
          ) VALUES (?, ?, ?, ?, 0, ?, ?, ?)
        `)
        .bind(teamId, warHistory.war_id, name, note || null, sortOrder, now, now)
        .run();

      await createAuditLog(
        env.DB,
        'war',
        'create_team',
        user.user_id,
        warHistory.war_id,
        `Created team: ${name}`,
        JSON.stringify({ teamId, name })
      );

      const team = await env.DB
        .prepare('SELECT * FROM war_teams WHERE war_team_id = ?')
        .bind(teamId)
        .first();

      return successResponse({ team }, 201);
    } catch (error) {
      console.error('Create team error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while creating team', 500);
    }
  });
};
