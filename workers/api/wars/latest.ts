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

    // Single query to get all teams with their members using JOINs
    const teamsQuery = `
      SELECT
        wt.war_id,
        wt.team_id,
        wt.team_name,
        wt.sort_order as team_sort_order,
        wta.user_id,
        wta.sort_order as member_sort_order,
        u.username,
        u.wechat_name,
        u.power
      FROM war_teams wt
      LEFT JOIN war_team_assignments wta ON wt.team_id = wta.team_id
      LEFT JOIN users u ON wta.user_id = u.user_id
      WHERE wt.war_id IN (${warIds.map(() => '?').join(',')})
      ORDER BY wt.war_id, wt.sort_order, wta.sort_order
    `;

    const teamsData = await env.DB.prepare(teamsQuery).bind(...warIds).all();

    // Single query to get pool members for all wars
    const poolQuery = `
      SELECT
        wh.war_id,
        u.user_id,
        u.username,
        u.wechat_name,
        u.power
      FROM war_history wh
      CROSS JOIN users u
      WHERE wh.war_id IN (${warIds.map(() => '?').join(',')})
        AND u.is_active = 1
        AND NOT EXISTS (
          SELECT 1 FROM war_team_assignments wta
          JOIN war_teams wt ON wta.team_id = wt.team_id
          WHERE wta.user_id = u.user_id AND wt.war_id = wh.war_id
        )
      ORDER BY wh.war_id, u.power DESC
    `;

    const poolData = await env.DB.prepare(poolQuery).bind(...warIds).all();

    // Group teams and members by war_id
    const teamsByWar = new Map<string, any[]>();
    const currentTeam: any = {};

    (teamsData.results || []).forEach((row: any) => {
      const warId = row.war_id;

      if (!teamsByWar.has(warId)) {
        teamsByWar.set(warId, []);
      }

      // Check if we need to start a new team
      if (!currentTeam[warId] || currentTeam[warId].team_id !== row.team_id) {
        currentTeam[warId] = {
          team_id: row.team_id,
          team_name: row.team_name,
          sort_order: row.team_sort_order,
          members: [],
        };
        teamsByWar.get(warId)!.push(currentTeam[warId]);
      }

      // Add member if present
      if (row.user_id) {
        currentTeam[warId].members.push({
          user_id: row.user_id,
          username: row.username,
          wechat_name: row.wechat_name,
          power: row.power,
          sort_order: row.member_sort_order,
        });
      }
    });

    // Group pool by war_id
    const poolByWar = new Map<string, any[]>();
    (poolData.results || []).forEach((row: any) => {
      const warId = row.war_id;
      if (!poolByWar.has(warId)) {
        poolByWar.set(warId, []);
      }
      poolByWar.get(warId)!.push({
        user_id: row.user_id,
        username: row.username,
        wechat_name: row.wechat_name,
        power: row.power,
      });
    });

    // Combine everything
    const warsWithData = wars.results.map((war: any) => ({
      ...war,
      warId: war.war_id,
      teams: teamsByWar.get(war.war_id) || [],
      pool: poolByWar.get(war.war_id) || [],
      warUpdatedAt: war.war_updated_at,
    }));

    return warsWithData;
  },
});
