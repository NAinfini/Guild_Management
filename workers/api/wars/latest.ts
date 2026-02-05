/**
 * Guild War API - Active War Management
 * GET /api/wars/active - Get active war
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../lib/types';
import { createEndpoint } from '../../lib/endpoint-factory';

// ============================================================
// Types
// ============================================================

interface ActiveWarQuery {
  includeArchived?: boolean;
}

// ============================================================
// GET /api/wars/active - Get Active War
// ============================================================

export const onRequestGet = createEndpoint<any[], ActiveWarQuery>({
  auth: 'optional',
  pollable: true,
  pollEntity: 'wars',
  etag: true,
  cacheControl: 'public, max-age=30',

  parseQuery: (searchParams) => ({
    includeArchived: searchParams.get('includeArchived') === 'true',
  }),

  handler: async ({ env, query }) => {
    // Get active guild war events
    const wars = await env.DB
      .prepare(`
        SELECT e.*, wh.war_id, wh.updated_at_utc as war_updated_at
        FROM events e
        LEFT JOIN war_history wh ON e.event_id = wh.event_id
        WHERE e.type = 'guild_war' AND e.is_archived = 0
        ORDER BY e.start_at_utc DESC
        LIMIT 1
      `)
      .all();

    if (!wars.results || wars.results.length === 0) {
      return [];
    }

    // Collect all war IDs
    const warIds = wars.results
      .map((w: any) => w.war_id)
      .filter((id: any) => id !== null);

    if (warIds.length === 0) {
      return wars.results.map((w: any) => ({ ...w, teams: [], pool: [] }));
    }

    // For each war/event, get teams and members using correct schema
    const warsWithData: any[] = [];

    for (const war of wars.results as any[]) {
      const eventId = war.event_id;

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

      // Get members for each team
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
            team_id: team.team_id,
            team_name: team.team_name,
            sort_order: team.sort_order || 0,
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

      warsWithData.push({
        ...war,
        warId: war.war_id,
        teams: teamsWithMembers,
        pool: pool.results || [],
        warUpdatedAt: war.war_updated_at,
      });
    }

    return warsWithData;

  },
});
