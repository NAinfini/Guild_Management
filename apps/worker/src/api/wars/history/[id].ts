/**
 * Guild War - War History Detail
 * GET /api/wars/history/[id] - Get war history detail
 * PUT /api/wars/history/[id] - Update war history
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../../core/types';
import { createEndpoint } from '../../../core/endpoint-factory';
import { utcNow, createAuditLog, etagFromTimestamp, assertIfMatch } from '../../../core/utils';
import { NotFoundError } from '../../../core/errors';

// ============================================================
// Types
// ============================================================

interface UpdateWarStatsBody {
  ourKills?: number;
  enemyKills?: number;
  ourTowers?: number;
  enemyTowers?: number;
  ourBaseHp?: number;
  enemyBaseHp?: number;
  ourDistance?: number;
  enemyDistance?: number;
  ourCredits?: number;
  enemyCredits?: number;
  result?: 'win' | 'loss' | 'draw' | 'unknown';
  notes?: string;
}

interface WarHistoryResponse {
  war: any;
}

type SnapshotMember = { user_id: string; role_tag?: string; username?: string };
type SnapshotTeam = {
  id: string;
  name: string;
  note?: string;
  is_locked?: boolean;
  members: SnapshotMember[];
};

async function buildEventTeamsSnapshot(env: Env, eventId: string): Promise<SnapshotTeam[]> {
  const teamRows = await env.DB
    .prepare(`
      SELECT t.team_id, t.name, t.description, t.is_locked
      FROM event_teams et
      JOIN teams t ON t.team_id = et.team_id
      WHERE et.event_id = ?
      ORDER BY t.name
    `)
    .bind(eventId)
    .all<{ team_id: string; name: string; description: string | null; is_locked: number }>();

  const memberRows = await env.DB
    .prepare(`
      SELECT tm.team_id, tm.user_id, tm.role_tag, u.username
      FROM event_teams et
      JOIN team_members tm ON tm.team_id = et.team_id
      JOIN users u ON u.user_id = tm.user_id
      WHERE et.event_id = ?
      ORDER BY tm.team_id, tm.sort_order, tm.user_id
    `)
    .bind(eventId)
    .all<{ team_id: string; user_id: string; role_tag: string | null; username: string }>();

  const membersByTeam = new Map<string, SnapshotMember[]>();
  for (const row of memberRows.results || []) {
    if (!membersByTeam.has(row.team_id)) membersByTeam.set(row.team_id, []);
    membersByTeam.get(row.team_id)!.push({
      user_id: row.user_id,
      role_tag: row.role_tag || undefined,
      username: row.username,
    });
  }

  return (teamRows.results || []).map((row) => ({
    id: row.team_id,
    name: row.name,
    note: row.description || undefined,
    is_locked: !!row.is_locked,
    members: membersByTeam.get(row.team_id) || [],
  }));
}

async function buildFallbackSnapshotFromMemberStats(env: Env, warId: string): Promise<SnapshotTeam[]> {
  const inferredRows = await env.DB
    .prepare(`
      SELECT
        tm.team_id,
        t.name AS team_name,
        t.description,
        t.is_locked,
        tm.user_id,
        tm.role_tag,
        u.username
      FROM war_member_stats wms
      JOIN team_members tm ON tm.user_id = wms.user_id
      JOIN teams t ON t.team_id = tm.team_id
      JOIN users u ON u.user_id = tm.user_id
      WHERE wms.war_id = ?
      ORDER BY t.name, tm.sort_order, tm.user_id
    `)
    .bind(warId)
    .all<{
      team_id: string;
      team_name: string;
      description: string | null;
      is_locked: number;
      user_id: string;
      role_tag: string | null;
      username: string;
    }>();

  if ((inferredRows.results || []).length === 0) return [];

  const teamsById = new Map<string, SnapshotTeam>();
  for (const row of inferredRows.results || []) {
    if (!teamsById.has(row.team_id)) {
      teamsById.set(row.team_id, {
        id: row.team_id,
        name: row.team_name,
        note: row.description || undefined,
        is_locked: !!row.is_locked,
        members: [],
      });
    }
    teamsById.get(row.team_id)!.members.push({
      user_id: row.user_id,
      role_tag: row.role_tag || undefined,
      username: row.username,
    });
  }

  return [...teamsById.values()];
}

// ============================================================
// GET /api/wars/history/[id]
// ============================================================

export const onRequestGet = createEndpoint<WarHistoryResponse>({
  auth: 'optional',
  etag: true,
  cacheControl: 'public, max-age=60',

  handler: async ({ env, params }) => {
    const warId = params.id;

    const war = await env.DB
      .prepare('SELECT * FROM war_history WHERE war_id = ?')
      .bind(warId)
      .first<any>();

    if (!war) {
      throw new NotFoundError('War history');
    }

    let teamsSnapshot: SnapshotTeam[] = [];

    if (war.event_id) {
      teamsSnapshot = await buildEventTeamsSnapshot(env, war.event_id);
    }

    // Fallback: if the war is no longer linked to event_teams, infer from war member stats.
    if (teamsSnapshot.length === 0) {
      teamsSnapshot = await buildFallbackSnapshotFromMemberStats(env, warId);
    }

    return { war: { ...war, teams_snapshot: teamsSnapshot } };
  },
});

// ============================================================
// PUT /api/wars/history/[id]
// ============================================================

export const onRequestPut = createEndpoint<WarHistoryResponse, UpdateWarStatsBody>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => body as UpdateWarStatsBody,

  handler: async ({ env, user, params, body, request }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const warId = params.id;

    const war = await env.DB
      .prepare('SELECT * FROM war_history WHERE war_id = ?')
      .bind(warId)
      .first<{ updated_at_utc: string }>();

    if (!war) {
      throw new NotFoundError('War history');
    }

    // ETag validation
    const currentEtag = etagFromTimestamp(war.updated_at_utc);
    const pre = assertIfMatch(request, currentEtag);
    if (pre) return pre;

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    const fieldMap: Record<string, string> = {
      ourKills: 'our_kills',
      enemyKills: 'enemy_kills',
      ourTowers: 'our_towers',
      enemyTowers: 'enemy_towers',
      ourBaseHp: 'our_base_hp',
      enemyBaseHp: 'enemy_base_hp',
      ourDistance: 'our_distance',
      enemyDistance: 'enemy_distance',
      ourCredits: 'our_credits',
      enemyCredits: 'enemy_credits',
      result: 'result',
      notes: 'notes',
    };

    for (const [key, column] of Object.entries(fieldMap)) {
      const val = (body as any)[key];
      if (val !== undefined) {
        updateFields.push(`${column} = ?`);
        updateValues.push(val);
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    const now = utcNow();
    updateFields.push('updated_at_utc = ?', 'updated_by = ?');
    updateValues.push(now, user.user_id, warId);

    const query = `UPDATE war_history SET ${updateFields.join(', ')} WHERE war_id = ?`;
    await env.DB.prepare(query).bind(...updateValues).run();

    await createAuditLog(
      env.DB,
      'war',
      'update_history',
      user.user_id,
      warId,
      'Updated war history stats',
      JSON.stringify(body)
    );

    const updated = await env.DB
      .prepare('SELECT * FROM war_history WHERE war_id = ?')
      .bind(warId)
      .first<any>();

    return { war: updated };
  },
});
