/**
 * Guild War - Team Management
 * GET /api/wars/[id]/teams/[teamId] - Get team details
 * PUT /api/wars/[id]/teams/[teamId] - Update team
 * DELETE /api/wars/[id]/teams/[teamId] - Delete team
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../../../lib/types';
import { createEndpoint } from '../../../../lib/endpoint-factory';
import { utcNow, createAuditLog } from '../../../../lib/utils';
import { NotFoundError } from '../../../../lib/errors';

// ============================================================
// Types
// ============================================================

interface UpdateTeamBody {
  name?: string;
  isLocked?: boolean;
}

interface TeamResponse {
  team: any;
}

// ============================================================
// GET /api/wars/[id]/teams/[teamId]
// ============================================================

export const onRequestGet = createEndpoint<TeamResponse>({
  auth: 'optional',
  etag: true,
  cacheControl: 'public, max-age=30',

  handler: async ({ env, params }) => {
    const teamId = params.teamId;
    const eventId = params.id;

    // Verify team is linked to this event
    const eventTeam = await env.DB
      .prepare('SELECT * FROM event_teams WHERE event_id = ? AND team_id = ?')
      .bind(eventId, teamId)
      .first();

    if (!eventTeam) {
      throw new Error('Team not found for this event');
    }

    const team = await env.DB
      .prepare('SELECT * FROM teams WHERE team_id = ?')
      .bind(teamId)
      .first();

    if (!team) {
      throw new NotFoundError('Team');
    }

    const members = await env.DB
      .prepare(`
        SELECT tm.*, u.username, u.power, u.wechat_name
        FROM team_members tm
        JOIN users u ON tm.user_id = u.user_id
        WHERE tm.team_id = ?
        ORDER BY tm.sort_order
      `)
      .bind(teamId)
      .all();

    return {
      team: {
        ...team,
        members: members.results || [],
      },
    };
  },
});

// ============================================================
// PUT /api/wars/[id]/teams/[teamId]
// ============================================================

export const onRequestPut = createEndpoint<TeamResponse, any, UpdateTeamBody>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => body as UpdateTeamBody,

  handler: async ({ env, user, params, body }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    if (!body) throw new Error('Body required');

    const teamId = params.teamId;
    const eventId = params.id;

    // Verify team is linked to this event
    const eventTeam = await env.DB
      .prepare('SELECT * FROM event_teams WHERE event_id = ? AND team_id = ?')
      .bind(eventId, teamId)
      .first();

    if (!eventTeam) {
      throw new Error('Team not found for this event');
    }

    const team = await env.DB
      .prepare('SELECT * FROM teams WHERE team_id = ?')
      .bind(teamId)
      .first();

    if (!team) {
      throw new NotFoundError('Team');
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (body.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(body.name);
    }

    if (body.isLocked !== undefined) {
      updateFields.push('is_locked = ?');
      updateValues.push(body.isLocked ? 1 : 0);
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    const now = utcNow();
    updateFields.push('updated_at_utc = ?');
    updateValues.push(now, teamId);

    await env.DB
      .prepare(`UPDATE teams SET ${updateFields.join(', ')} WHERE team_id = ?`)
      .bind(...updateValues)
      .run();

    // Update war timestamp
    const warHistory = await env.DB
      .prepare('SELECT war_id FROM war_history WHERE event_id = ?')
      .bind(eventId)
      .first<{ war_id: string }>();

    if (warHistory) {
      await env.DB
        .prepare('UPDATE war_history SET updated_at_utc = ? WHERE war_id = ?')
        .bind(now, warHistory.war_id)
        .run();

      await createAuditLog(
        env.DB,
        'war',
        'update_team',
        user.user_id,
        warHistory.war_id,
        `Updated team ${teamId}`,
        JSON.stringify(body)
      );
    }

    const updated = await env.DB
      .prepare('SELECT * FROM teams WHERE team_id = ?')
      .bind(teamId)
      .first();

    return { team: updated };
  },
});

// ============================================================
// DELETE /api/wars/[id]/teams/[teamId]
// ============================================================

export const onRequestDelete = createEndpoint<{ message: string }>({
  auth: 'moderator',
  cacheControl: 'no-store',

  handler: async ({ env, user, params }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const teamId = params.teamId;
    const eventId = params.id;

    // Verify team is linked to this event
    const eventTeam = await env.DB
      .prepare('SELECT * FROM event_teams WHERE event_id = ? AND team_id = ?')
      .bind(eventId, teamId)
      .first();

    if (!eventTeam) {
      throw new Error('Team not found for this event');
    }

    const team = await env.DB
      .prepare('SELECT * FROM teams WHERE team_id = ?')
      .bind(teamId)
      .first();

    if (!team) {
      throw new NotFoundError('Team');
    }

    const now = utcNow();

    // Move all team members back to pool before deleting team
    const poolTeam = await env.DB
      .prepare(`
        SELECT t.team_id FROM teams t
        JOIN event_teams et ON t.team_id = et.team_id
        WHERE et.event_id = ? AND t.name = 'Pool'
      `)
      .bind(eventId)
      .first<{ team_id: string }>();

    if (poolTeam) {
      // Move members to pool instead of deleting
      await env.DB
        .prepare('UPDATE team_members SET team_id = ?, role_tag = NULL WHERE team_id = ?')
        .bind(poolTeam.team_id, teamId)
        .run();
    } else {
      // No pool exists, just delete members
      await env.DB
        .prepare('DELETE FROM team_members WHERE team_id = ?')
        .bind(teamId)
        .run();
    }

    // Unlink team from event (don't delete the team itself, it might be used elsewhere)
    await env.DB
      .prepare('DELETE FROM event_teams WHERE event_id = ? AND team_id = ?')
      .bind(eventId, teamId)
      .run();

    // Update war timestamp
    const warHistory = await env.DB
      .prepare('SELECT war_id FROM war_history WHERE event_id = ?')
      .bind(eventId)
      .first<{ war_id: string }>();

    if (warHistory) {
      await env.DB
        .prepare('UPDATE war_history SET updated_at_utc = ? WHERE war_id = ?')
        .bind(now, warHistory.war_id)
        .run();

      await createAuditLog(
        env.DB,
        'war',
        'remove_team_from_event',
        user.user_id,
        warHistory.war_id,
        `Removed team ${teamId} from event`,
        undefined
      );
    }

    return { message: 'Team removed from event successfully' };
  },
});
