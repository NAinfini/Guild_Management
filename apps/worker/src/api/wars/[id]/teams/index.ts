/**
 * Guild War - Teams & Pool (GET)
 * GET /api/wars/[id]/teams
 * Returns teams (with members) and pool for a given event (id = event_id)
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../../../core/types';
import { createEndpoint } from '../../../../core/endpoint-factory';
import { etagFromTimestamp } from '../../../../core/utils';

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

    // Get war history (if exists)
    const warHistory = await env.DB
      .prepare('SELECT * FROM war_history WHERE event_id = ?')
      .bind(eventId)
      .first<{ war_id: string; updated_at_utc: string }>();

    // Get non-pool teams assigned to this event via event_teams
    const eventTeamsResult = await env.DB
      .prepare(`
        SELECT t.*, et.assigned_at_utc
        FROM event_teams et
        JOIN teams t ON et.team_id = t.team_id
        WHERE et.event_id = ? AND t.name != 'Pool'
        ORDER BY t.created_at_utc
      `)
      .bind(eventId)
      .all<any>();

    const teamsWithMembers = await Promise.all(
      (eventTeamsResult.results || []).map(async (team: any) => {
        const members = await env.DB
          .prepare(`
            SELECT tm.*, u.username, u.power, u.wechat_name
            FROM team_members tm
            JOIN users u ON tm.user_id = u.user_id
            WHERE tm.team_id = ?
            ORDER BY tm.sort_order
          `)
          .bind(team.team_id)
          .all();

        return {
          ...team,
          team_name: team.name,
          sort_order: 0,
          is_locked: !!team.is_locked,
          members: members.results || [],
        };
      })
    );

    // Pool = members currently assigned to the event's Pool team
    const poolTeam = await env.DB
      .prepare(`
        SELECT t.team_id
        FROM event_teams et
        JOIN teams t ON et.team_id = t.team_id
        WHERE et.event_id = ? AND t.name = 'Pool'
        LIMIT 1
      `)
      .bind(eventId)
      .first<{ team_id: string }>();

    const pool = poolTeam
      ? await env.DB
          .prepare(`
            SELECT tm.user_id, u.username, u.power, u.wechat_name
            FROM team_members tm
            JOIN users u ON tm.user_id = u.user_id
            WHERE tm.team_id = ?
            ORDER BY tm.sort_order, u.power DESC
          `)
          .bind(poolTeam.team_id)
          .all()
      : { results: [] as any[] };

    return {
      teams: teamsWithMembers,
      pool: pool.results || [],
      warUpdatedAt: warHistory?.updated_at_utc || undefined,
    };
  },
});
