/**
 * Guild War - Teams & Pool (GET)
 * GET /api/wars/[id]/teams
 * Returns teams (with members) and pool for a given event (id = event_id)
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../../../core/types';
import { createEndpoint } from '../../../../core/endpoint-factory';
import { etagFromTimestamp, generateId, utcNow, createAuditLog } from '../../../../core/utils';

// ============================================================
// Types
// ============================================================

interface WarTeamsResponse {
  teams: any[];
  pool: any[];
  warUpdatedAt?: string;
}

interface CreateTeamBody {
  name: string;
  note?: string;
  description?: string;
}

interface CreateTeamResponse {
  team: any;
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

// ============================================================
// POST /api/wars/[id]/teams
// ============================================================

export const onRequestPost = createEndpoint<CreateTeamResponse, CreateTeamBody>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => body as CreateTeamBody,

  handler: async ({ env, user, params, body }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (!body?.name || body.name.trim().length === 0) {
      throw new Error('Team name is required');
    }

    const eventId = params.id;

    const event = await env.DB
      .prepare('SELECT event_id, title FROM events WHERE event_id = ? AND deleted_at_utc IS NULL')
      .bind(eventId)
      .first<{ event_id: string; title: string }>();

    if (!event) {
      throw new Error('Event not found');
    }

    const now = utcNow();
    const teamId = generateId('team');
    const description = body.description ?? body.note ?? null;

    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO teams (team_id, name, description, is_locked, created_by, created_at_utc, updated_at_utc)
         VALUES (?, ?, ?, 0, ?, ?, ?)`
      ).bind(teamId, body.name.trim(), description, user.user_id, now, now),
      env.DB.prepare(
        `INSERT INTO event_teams (event_id, team_id, assigned_at_utc)
         VALUES (?, ?, ?)`
      ).bind(eventId, teamId, now),
    ]);

    const created = await env.DB
      .prepare('SELECT * FROM teams WHERE team_id = ?')
      .bind(teamId)
      .first<any>();

    await createAuditLog(
      env.DB,
      'war',
      'create_team',
      user.user_id,
      teamId,
      `Created team ${body.name.trim()} for event ${event.title}`,
      JSON.stringify({ eventId })
    );

    return { team: created };
  },
});
