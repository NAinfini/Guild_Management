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

    // Get war history (if exists)
    const warHistory = await env.DB
      .prepare('SELECT * FROM war_history WHERE event_id = ?')
      .bind(eventId)
      .first<{ war_id: string; updated_at_utc: string }>();

    // Get teams assigned to this event via event_teams
    const eventTeamsResult = await env.DB
      .prepare(`
        SELECT t.*, et.assigned_at_utc
        FROM event_teams et
        JOIN teams t ON et.team_id = t.team_id
        WHERE et.event_id = ?
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
          is_locked: !!team.is_locked,
          members: members.results || [],
        };
      })
    );

    // Pool = all active members NOT assigned to any team for this event
    const assignedUserIds = teamsWithMembers
      .flatMap(t => t.members)
      .map((m: any) => m.user_id);

    const poolQuery = assignedUserIds.length > 0
      ? `SELECT u.user_id, u.username, u.power, u.wechat_name
         FROM users u
         WHERE u.is_active = 1
           AND u.user_id NOT IN (${assignedUserIds.map(() => '?').join(',')})
         ORDER BY u.power DESC`
      : `SELECT u.user_id, u.username, u.power, u.wechat_name
         FROM users u
         WHERE u.is_active = 1
         ORDER BY u.power DESC`;

    const pool = await env.DB
      .prepare(poolQuery)
      .bind(...assignedUserIds)
      .all();

    return {
      teams: teamsWithMembers,
      pool: pool.results || [],
      warUpdatedAt: warHistory?.updated_at_utc || null,
    };
  },
});
