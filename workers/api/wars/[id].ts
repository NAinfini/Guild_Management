/**
 * Guild War API - Single War Operations
 * GET /api/wars/[id] - Get war by event_id
 * PUT /api/wars/[id] - Update war (alias to /wars/[id]/result)
 * DELETE /api/wars/[id] - Archive/delete war event
 *
 * These endpoints provide CRUD operations on wars using the event_id
 */

import type { Env } from '../../lib/types';
import { createEndpoint } from '../../lib/endpoint-factory';
import { utcNow, createAuditLog, etagFromTimestamp, assertIfMatch } from '../../lib/utils';
import { notFoundResponse, noContentResponse } from '../../../shared/utils/response';

// ============================================================
// Types
// ============================================================

interface UpdateWarBody {
  result?: 'win' | 'loss' | 'draw' | 'unknown';
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
  notes?: string;
}

interface WarResponse {
  war: any;
}

// ============================================================
// GET /api/wars/[id] - Get War by Event ID
// ============================================================

export const onRequestGet = createEndpoint<WarResponse>({
  auth: 'optional',
  etag: true,
  cacheControl: 'public, max-age=30',
  pollable: true,
  pollEntity: 'wars',

  handler: async ({ env, params }) => {
    const eventId = params.id;

    // Get the event
    const event = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ? AND deleted_at_utc IS NULL')
      .bind(eventId)
      .first();

    if (!event) {
      throw notFoundResponse('Event');
    }

    // Get war history if exists
    const warHistory = await env.DB
      .prepare('SELECT * FROM war_history WHERE event_id = ?')
      .bind(eventId)
      .first();

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
          member_count: members.results?.length || 0,
          members: (members.results || []).map((m: any) => ({
            user_id: m.user_id,
            username: m.username,
            wechat_name: m.wechat_name,
            power: m.power,
            sort_order: m.sort_order,
          })),
        };
      })
    );

    return {
      war: {
        ...event,
        warHistory,
        teams: teamsWithMembers,
      },
    };
  },
});

// ============================================================
// PUT /api/wars/[id] - Update War (alias to result update)
// ============================================================

export const onRequestPut = createEndpoint<WarResponse, UpdateWarBody>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => body as UpdateWarBody,

  handler: async ({ env, user, params, body, request }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const eventId = params.id;

    // Get or create war_history
    let war = await env.DB
      .prepare('SELECT * FROM war_history WHERE event_id = ?')
      .bind(eventId)
      .first<{ war_id: string; updated_at_utc: string }>();

    let warId: string;
    let now = utcNow();

    if (!war) {
      // Create war_history record
      warId = `war_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Get event details
      const event = await env.DB
        .prepare('SELECT title FROM events WHERE event_id = ?')
        .bind(eventId)
        .first<{ title: string }>();

      if (!event) {
        throw notFoundResponse('Event');
      }

      await env.DB
        .prepare(`
          INSERT INTO war_history (
            war_id, event_id, title, war_date, result,
            created_by, updated_by, created_at_utc, updated_at_utc
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          warId,
          eventId,
          event.title,
          now,
          body.result || 'unknown',
          user.user_id,
          user.user_id,
          now,
          now
        )
        .run();

      await createAuditLog(
        env.DB,
        'war',
        'create',
        user.user_id,
        warId,
        `Created war history for event: ${event.title}`,
        JSON.stringify({ eventId, result: body.result })
      );
    } else {
      warId = war.war_id;

      // ETag validation
      const currentEtag = etagFromTimestamp(war.updated_at_utc);
      const pre = assertIfMatch(request, currentEtag);
      if (pre) return pre;

      // Build update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      const fieldMap: Record<string, string> = {
        result: 'result',
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
        notes: 'notes',
      };

      for (const [key, column] of Object.entries(fieldMap)) {
        const val = (body as any)[key];
        if (val !== undefined) {
          updateFields.push(`${column} = ?`);
          updateValues.push(val);
        }
      }

      if (updateFields.length > 0) {
        updateFields.push('updated_at_utc = ?', 'updated_by = ?');
        updateValues.push(now, user.user_id, warId);

        const query = `UPDATE war_history SET ${updateFields.join(', ')} WHERE war_id = ?`;
        await env.DB.prepare(query).bind(...updateValues).run();

        await createAuditLog(
          env.DB,
          'war',
          'update',
          user.user_id,
          warId,
          'Updated war',
          JSON.stringify(body)
        );
      }
    }

    const updated = await env.DB
      .prepare('SELECT * FROM war_history WHERE war_id = ?')
      .bind(warId)
      .first<any>();

    return { war: updated };
  },
});

// ============================================================
// DELETE /api/wars/[id] - Archive War Event
// ============================================================

export const onRequestDelete = createEndpoint({
  auth: 'moderator',
  cacheControl: 'no-store',

  handler: async ({ env, user, params, request }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const eventId = params.id;

    // Check if event exists
    const event = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first<{ title: string }>();

    if (!event) {
      throw notFoundResponse('Event');
    }

    // Soft delete the event (archive)
    const now = utcNow();
    await env.DB
      .prepare('UPDATE events SET is_archived = 1, updated_at_utc = ? WHERE event_id = ?')
      .bind(now, eventId)
      .run();

    await createAuditLog(
      env.DB,
      'war',
      'archive',
      user.user_id,
      eventId,
      `Archived war event: ${event.title}`,
      null
    );

    const origin = request.headers.get('Origin');
    return noContentResponse(origin);
  },
});
