import type { Env } from '../../lib/types';
import { createEndpoint } from '../../lib/endpoint-factory';
import type { ActiveWarDTO, WarTeamDTO, WarPoolMemberDTO } from '../../../shared/api/contracts';

// ============================================================
// Types
// ============================================================

interface ActiveWarQuery {
  includeArchived?: boolean;
}

// ============================================================
// GET /api/wars/active - Get Active War
// ============================================================

export const onRequestGet = createEndpoint<ActiveWarDTO[], ActiveWarQuery>({
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
        SELECT e.*, wh.*, wh.updated_at_utc as war_updated_at
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

    // If no war history, we can't fully map to ActiveWarDTO if it requires war_id
    // But let's assume valid wars have history.
    if (warIds.length === 0) {
       // Return what we have, but it might not match strict DTO if war_id is missing.
       // For now, let's filter out invalid wars or return empty if essential data missing.
       return [];
    }

    // For each war/event, get teams and members using correct schema
    const warsWithData: ActiveWarDTO[] = [];

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
      const teamsWithMembers: WarTeamDTO[] = await Promise.all(
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
            note: team.note,
            sort_order: team.sort_order || 0,
            is_locked: team.is_locked ? 1 : 0,
            members: (members.results || []).map((m: any) => ({
              user_id: m.user_id,
              username: m.username,
              wechat_name: m.wechat_name,
              power: m.power,
              role_tag: m.role_tag,
              sort_order: m.sort_order
            })),
            member_count: members.results?.length || 0
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

      const poolResult = await env.DB
        .prepare(poolQuery)
        .bind(...assignedUserIds)
        .all();
      
      const pool: WarPoolMemberDTO[] = (poolResult.results || []).map((p: any) => ({
          user_id: p.user_id,
          username: p.username,
          power: p.power,
          wechat_name: p.wechat_name
      }));

      warsWithData.push({
        war_id: war.war_id,
        event_id: war.event_id,
        title: war.title,
        war_date: war.war_date,
        result: war.result,
        our_kills: war.our_kills,
        enemy_kills: war.enemy_kills,
        our_towers: war.our_towers,
        enemy_towers: war.enemy_towers,
        our_base_hp: war.our_base_hp,
        enemy_base_hp: war.enemy_base_hp,
        our_distance: war.our_distance,
        enemy_distance: war.enemy_distance,
        our_credits: war.our_credits,
        enemy_credits: war.enemy_credits,
        notes: war.notes,
        updated_at_utc: war.war_updated_at || war.updated_at_utc,
        teams: teamsWithMembers,
        pool: pool
      });
    }

    return warsWithData;

  },
});
