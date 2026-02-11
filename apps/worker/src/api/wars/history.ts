/**
 * Guild War History API
 * GET /api/wars/history - List war history
 * POST /api/wars/history - Create war history record
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../core/types';
import { createEndpoint } from '../../core/endpoint-factory';
import { generateId, utcNow, createAuditLog } from '../../core/utils';
import type { WarHistoryDTO } from '@guild/shared-api/contracts';

// ============================================================
// Types
// ============================================================

interface WarHistoryQuery {
  limit?: number;
  offset?: number;
}

interface CreateWarHistoryBody {
  eventId?: string;
  warDate: string;
  title: string;
  notes?: string;
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
}

interface CreateWarHistoryResponse {
  war: WarHistoryDTO;
}

// ============================================================
// GET /api/wars/history - List War History
// ============================================================

export const onRequestGet = createEndpoint<WarHistoryDTO[], WarHistoryQuery>({
  auth: 'optional',
  etag: true,
  cacheControl: 'public, max-age=60',

  parseQuery: (searchParams) => ({
    limit: parseInt(searchParams.get('limit') || '50'),
    offset: parseInt(searchParams.get('offset') || '0'),
  }),

  handler: async ({ env, query }) => {
    const wars = await env.DB
      .prepare(`
        SELECT * FROM war_history 
        ORDER BY war_date DESC 
        LIMIT ? OFFSET ?
      `)
      .bind(query.limit, query.offset)
      .all<WarHistoryDTO>();

    const warRows = wars.results || [];
    if (warRows.length === 0) return [];

    const warIds = warRows.map((war) => war.war_id);
    const placeholders = warIds.map(() => '?').join(', ');

    const memberStats = await env.DB
      .prepare(`
        SELECT
          wms.war_id,
          wms.user_id,
          u.username,
          u.class_code,
          wms.kills,
          wms.deaths,
          wms.assists,
          wms.damage,
          wms.healing,
          wms.building_damage,
          wms.damage_taken,
          wms.credits,
          wms.note
        FROM war_member_stats wms
        JOIN users u ON u.user_id = wms.user_id
        WHERE wms.war_id IN (${placeholders})
        ORDER BY wms.war_id, u.username
      `)
      .bind(...warIds)
      .all<any>();

    const memberStatsByWar = new Map<string, any[]>();
    for (const row of memberStats.results || []) {
      if (!memberStatsByWar.has(row.war_id)) memberStatsByWar.set(row.war_id, []);
      memberStatsByWar.get(row.war_id)!.push({
        user_id: row.user_id,
        username: row.username,
        class_code: row.class_code,
        kills: row.kills,
        deaths: row.deaths,
        assists: row.assists,
        damage: row.damage,
        healing: row.healing,
        building_damage: row.building_damage,
        damage_taken: row.damage_taken,
        credits: row.credits,
        note: row.note,
      });
    }

    return warRows.map((war) => ({
      ...war,
      member_stats: memberStatsByWar.get(war.war_id) || [],
    }));
  },
});

// ============================================================
// POST /api/wars/history - Create War History
// ============================================================

export const onRequestPost = createEndpoint<CreateWarHistoryResponse, CreateWarHistoryBody>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => {
    if (!body.warDate || !body.title) {
      throw new Error('warDate and title are required');
    }
    return body as CreateWarHistoryBody;
  },

  handler: async ({ env, user, body }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const {
      eventId,
      warDate,
      title,
      notes,
      ourKills,
      enemyKills,
      ourTowers,
      enemyTowers,
      ourBaseHp,
      enemyBaseHp,
      ourDistance,
      enemyDistance,
      ourCredits,
      enemyCredits,
      result,
    } = body;

    const warId = generateId('war');
    const now = utcNow();
    const warDateUtc = new Date(warDate).toISOString().replace('T', ' ').substring(0, 19);

    await env.DB
      .prepare(`
        INSERT INTO war_history (
          war_id, event_id, war_date, title, notes,
          our_kills, enemy_kills, our_towers, enemy_towers,
          our_base_hp, enemy_base_hp, our_distance, enemy_distance,
          our_credits, enemy_credits, result,
          created_by, updated_by, created_at_utc, updated_at_utc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        warId,
        eventId || null,
        warDateUtc,
        title,
        notes || null,
        ourKills || null,
        enemyKills || null,
        ourTowers || null,
        enemyTowers || null,
        ourBaseHp || null,
        enemyBaseHp || null,
        ourDistance || null,
        enemyDistance || null,
        ourCredits || null,
        enemyCredits || null,
        result || 'unknown',
        user.user_id,
        user.user_id,
        now,
        now
      )
      .run();

    await createAuditLog(
      env.DB,
      'war',
      'create_history',
      user.user_id,
      warId,
      `Created war history: ${title}`,
      JSON.stringify({ warDate, result })
    );

    const war = await env.DB
      .prepare('SELECT * FROM war_history WHERE war_id = ?')
      .bind(warId)
      .first<WarHistoryDTO>();

    if (!war) throw new Error('Failed to create war history');

    return { war };
  },
});
