/**
 * Guild War - Teams & Pool (GET)
 * GET /api/wars/[id]/teams
 * Returns teams (with members) and pool for a given event (id = event_id)
 */

import type { PagesFunction, Env } from '../../../_types';
import { successResponse, errorResponse, notFoundResponse, etagFromTimestamp } from '../../../_utils';
import { withOptionalAuth } from '../../../_middleware';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withOptionalAuth(context, async (authContext) => {
    const { env, params } = authContext;
    const eventId = params.id;

    try {
      const warHistory = await env.DB
        .prepare('SELECT * FROM war_history WHERE event_id = ?')
        .bind(eventId)
        .first<{ war_id: string; updated_at_utc: string }>();

      if (!warHistory) {
        return notFoundResponse('War');
      }

      const warId = warHistory.war_id;

      const teams = await env.DB
        .prepare('SELECT * FROM war_teams WHERE war_id = ? ORDER BY sort_order')
        .bind(warId)
        .all<any>();

      const teamsWithMembers = await Promise.all(
        (teams.results || []).map(async (team: any) => {
          const members = await env.DB
            .prepare(`
              SELECT wtm.*, u.username, u.power, u.class_code, u.wechat_name
              FROM war_team_members wtm
              JOIN users u ON wtm.user_id = u.user_id
              WHERE wtm.war_team_id = ?
              ORDER BY wtm.sort_order
            `)
            .bind(team.war_team_id)
            .all();

          return {
            ...team,
            is_locked: !!team.is_locked,
            members: members.results || [],
          };
        })
      );

      const pool = await env.DB
        .prepare(`
          SELECT wpm.*, u.username, u.power, u.class_code, u.wechat_name
          FROM war_pool_members wpm
          JOIN users u ON wpm.user_id = u.user_id
          WHERE wpm.war_id = ?
          ORDER BY u.power DESC
        `)
        .bind(warId)
        .all();

      const response = successResponse({
        warId,
        warUpdatedAt: warHistory.updated_at_utc,
        teams: teamsWithMembers,
        pool: pool.results || [],
      });
      const etag = etagFromTimestamp(warHistory.updated_at_utc);
      if (etag) response.headers.set('ETag', etag);
      return response;
    } catch (error) {
      console.error('Get war teams error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while fetching war teams', 500);
    }
  });
};
