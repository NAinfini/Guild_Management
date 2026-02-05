/**
 * Guild War - Team Management
 * GET /api/wars/[id]/teams/[teamId] - Get team details
 * PUT /api/wars/[id]/teams/[teamId] - Update team
 * DELETE /api/wars/[id]/teams/[teamId] - Delete team
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../../_types';
import { createEndpoint } from '../../../_endpoint-factory';
import { utcNow, createAuditLog } from '../../../_utils';

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

    const team = await env.DB
      .prepare('SELECT * FROM war_teams WHERE war_team_id = ?')
      .bind(teamId)
      .first();

    if (!team) {
      throw new Error('Team not found');
    }

    const members = await env.DB
      .prepare(`
        SELECT wtm.*, u.username, u.power, u.class_code, u.wechat_name
        FROM war_team_members wtm
        JOIN users u ON wtm.user_id = u.user_id
        WHERE wtm.war_team_id = ?
        ORDER BY wtm.sort_order
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

export const onRequestPut = createEndpoint<TeamResponse, UpdateTeamBody>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => body as UpdateTeamBody,

  handler: async ({ env, user, params, body }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const teamId = params.teamId;

    const team = await env.DB
      .prepare('SELECT * FROM war_teams WHERE war_team_id = ?')
      .bind(teamId)
      .first<{ war_id: string }>();

    if (!team) {
      throw new Error('Team not found');
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
      .prepare(`UPDATE war_teams SET ${updateFields.join(', ')} WHERE war_team_id = ?`)
      .bind(...updateValues)
      .run();

    // Update war timestamp
    await env.DB
      .prepare('UPDATE war_history SET updated_at_utc = ? WHERE war_id = ?')
      .bind(now, team.war_id)
      .run();

    await createAuditLog(
      env.DB,
      'war',
      'update_team',
      user.user_id,
      team.war_id,
      `Updated team ${teamId}`,
      JSON.stringify(body)
    );

    const updated = await env.DB
      .prepare('SELECT * FROM war_teams WHERE war_team_id = ?')
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

    const team = await env.DB
      .prepare('SELECT * FROM war_teams WHERE war_team_id = ?')
      .bind(teamId)
      .first<{ war_id: string }>();

    if (!team) {
      throw new Error('Team not found');
    }

    const now = utcNow();

    // Delete team members
    await env.DB
      .prepare('DELETE FROM war_team_members WHERE war_team_id = ?')
      .bind(teamId)
      .run();

    // Delete team
    await env.DB
      .prepare('DELETE FROM war_teams WHERE war_team_id = ?')
      .bind(teamId)
      .run();

    // Update war timestamp
    await env.DB
      .prepare('UPDATE war_history SET updated_at_utc = ? WHERE war_id = ?')
      .bind(now, team.war_id)
      .run();

    await createAuditLog(
      env.DB,
      'war',
      'delete_team',
      user.user_id,
      team.war_id,
      `Deleted team ${teamId}`,
      null
    );

    return { message: 'Team deleted successfully' };
  },
});
