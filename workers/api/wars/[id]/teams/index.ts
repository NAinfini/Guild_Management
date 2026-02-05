/**
 * Guild War - Teams & Pool (GET)
 * GET /api/wars/[id]/teams
 * Returns teams (with members) and pool for a given event (id = event_id)
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../../../lib/types';
import { createEndpoint } from '../../../../lib/endpoint-factory';
import { etagFromTimestamp } from '../../../../lib/utils';

// ============================================================
// Types
// ============================================================

interface WarTeamsResponse {
  teams: any[];
  pool: any[];
  warUpdatedAt?: string;
}

// ============================================================
// GET /api/wars/[id]/teams
// ============================================================

export const onRequestGet = createEndpoint<WarTeamsResponse>({
  auth: 'optional',
  etag: true,
  cacheControl: 'public, max-age=30',

  handler: async ({ env, params }) => {
    const eventId = params.id;

    const warHistory = await env.DB
      .prepare('SELECT * FROM war_history WHERE event_id = ?')
      .bind(eventId)
      .first<{ war_id: string; updated_at_utc: string }>();

    if (!warHistory) {
      throw new Error('War not found');
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

    return {
      teams: teamsWithMembers,
      pool: pool.results || [],
      warUpdatedAt: warHistory.updated_at_utc,
    };
  },
});
