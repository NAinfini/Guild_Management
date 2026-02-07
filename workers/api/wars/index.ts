/**
 * Wars API
 * GET /api/wars - List all wars or fetch specific by IDs
 * POST /api/wars - Create war(s) - single or multiple
 *
 * Features:
 * - List wars with filters
 * - Fetch specific wars by IDs (batch read)
 * - Batch create wars
 * - Backward compatible with existing API
 */

import type { Env } from '../../lib/types';
import { createEndpoint } from '../../lib/endpoint-factory';
import { broadcastUpdate } from '../../lib/broadcast';
import { generateId, utcNow, createAuditLog } from '../../lib/utils';

// ============================================================
// Types
// ============================================================

interface WarsQuery {
  limit?: number;
  offset?: number;
  includeArchived?: boolean;
  ids?: string; // NEW: Comma-separated IDs for batch fetch
}

interface CreateWarBody {
  title: string;
  startDate: string; // ISO date string
  startAtUtc?: string; // ISO datetime string
  type?: 'guild_war' | 'territory_war' | 'other';
  notes?: string;
  // War history fields
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

interface CreateWarsBody {
  wars: CreateWarBody[]; // NEW: Support for multiple
}

interface CreateWarResponse {
  event: any;
  war: any;
}

interface WarsListResponse {
  wars: any[];
  total: number;
}

// ============================================================
// GET /api/wars - List Wars or Batch Fetch by IDs
// ============================================================

export const onRequestGet = createEndpoint<
  WarsListResponse | { wars: any[]; totalCount: number; notFound: string[] },
  WarsQuery
>({
  auth: 'optional',
  etag: true,
  cacheControl: 'public, max-age=60',

  parseQuery: (searchParams) => ({
    limit: parseInt(searchParams.get('limit') || '50'),
    offset: parseInt(searchParams.get('offset') || '0'),
    includeArchived: searchParams.get('includeArchived') === 'true',
    ids: searchParams.get('ids') || undefined,
  }),

  handler: async ({ env, query }) => {
    // ============================================================
    // BATCH FETCH MODE: Fetch specific wars by IDs
    // ============================================================
    if (query.ids) {
      const ids = query.ids.split(',').map(id => id.trim()).filter(id => id.length > 0);

      if (ids.length === 0) {
        throw new Error('No IDs provided');
      }

      if (ids.length > 100) {
        throw new Error('Maximum 100 IDs per request');
      }

      const placeholders = ids.map(() => '?').join(',');
      const wars = await env.DB
        .prepare(`
          SELECT
            e.*,
            wh.war_id,
            wh.war_date,
            wh.our_kills,
            wh.enemy_kills,
            wh.our_towers,
            wh.enemy_towers,
            wh.our_base_hp,
            wh.enemy_base_hp,
            wh.our_distance,
            wh.enemy_distance,
            wh.our_credits,
            wh.enemy_credits,
            wh.result,
            wh.notes as war_notes,
            wh.updated_at_utc as war_updated_at
          FROM events e
          LEFT JOIN war_history wh ON e.event_id = wh.event_id
          WHERE e.event_id IN (${placeholders}) AND e.deleted_at_utc IS NULL
          ORDER BY e.start_at_utc DESC
        `)
        .bind(...ids)
        .all();

      const foundWars = wars.results || [];
      const foundIds = new Set(foundWars.map((w: any) => w.event_id));
      const notFound = ids.filter(id => !foundIds.has(id));

      return {
        wars: foundWars,
        totalCount: foundWars.length,
        notFound,
      };
    }

    // ============================================================
    // LIST MODE: List wars with pagination
    // ============================================================
    const whereClause = query.includeArchived
      ? `e.type = 'guild_war'`
      : `e.type = 'guild_war' AND e.is_archived = 0`;

    const wars = await env.DB
      .prepare(`
        SELECT
          e.*,
          wh.war_id,
          wh.war_date,
          wh.our_kills,
          wh.enemy_kills,
          wh.our_towers,
          wh.enemy_towers,
          wh.our_base_hp,
          wh.enemy_base_hp,
          wh.our_distance,
          wh.enemy_distance,
          wh.our_credits,
          wh.enemy_credits,
          wh.result,
          wh.notes as war_notes,
          wh.updated_at_utc as war_updated_at
        FROM events e
        LEFT JOIN war_history wh ON e.event_id = wh.event_id
        WHERE ${whereClause} AND e.deleted_at_utc IS NULL
        ORDER BY e.start_at_utc DESC
        LIMIT ? OFFSET ?
      `)
      .bind(query.limit, query.offset)
      .all();

    const count = await env.DB
      .prepare(`
        SELECT COUNT(*) as total
        FROM events e
        WHERE ${whereClause} AND e.deleted_at_utc IS NULL
      `)
      .first<{ total: number }>();

    return {
      wars: wars.results || [],
      total: count?.total || 0,
    };
  },
});

// ============================================================
// POST /api/wars - Create Single or Multiple Wars
// ============================================================

export const onRequestPost = createEndpoint<
  CreateWarResponse | { message: string; wars: { event: any; war: any }[] },
  CreateWarBody | CreateWarsBody
>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => {
    // Check if it's a batch create (has 'wars' array)
    if ('wars' in body && Array.isArray(body.wars)) {
      if (body.wars.length === 0) {
        throw new Error('Wars array cannot be empty');
      }
      if (body.wars.length > 20) {
        throw new Error('Maximum 20 wars per batch create');
      }
      // Validate each war
      for (const war of body.wars) {
        if (!war.title || !war.startDate) {
          throw new Error('Each war requires title and startDate');
        }
      }
      return body as CreateWarsBody;
    }

    // Single war create
    if (!body.title || !body.startDate) {
      throw new Error('title and startDate are required');
    }
    return body as CreateWarBody;
  },

  handler: async ({ env, user, body, waitUntil }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const now = utcNow();

    // ============================================================
    // BATCH CREATE MODE: Create multiple wars
    // ============================================================
    if ('wars' in body) {
      const { wars: warsToCreate } = body as CreateWarsBody;
      const created: { event: any; war: any }[] = [];

      for (const warData of warsToCreate) {
        const eventId = generateId('evt');
        const warId = generateId('war');

        const startDateUtc = new Date(warData.startDate).toISOString().replace('T', ' ').substring(0, 10);
        const startAt = warData.startAtUtc
          ? new Date(warData.startAtUtc).toISOString().replace('T', ' ').substring(0, 19)
          : startDateUtc + ' 20:00:00';

        // Create the event
        await env.DB
          .prepare(`
            INSERT INTO events (
              event_id, type, title, start_at_utc, description,
              is_archived, created_by, updated_by, created_at_utc, updated_at_utc
            ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
          `)
          .bind(
            eventId,
            warData.type || 'guild_war',
            warData.title,
            startAt,
            warData.notes || null,
            user.user_id,
            user.user_id,
            now,
            now
          )
          .run();

        // Create the war history record
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
            eventId,
            startDateUtc,
            warData.title,
            warData.notes || null,
            warData.ourKills || null,
            warData.enemyKills || null,
            warData.ourTowers || null,
            warData.enemyTowers || null,
            warData.ourBaseHp || null,
            warData.enemyBaseHp || null,
            warData.ourDistance || null,
            warData.enemyDistance || null,
            warData.ourCredits || null,
            warData.enemyCredits || null,
            warData.result || 'unknown',
            user.user_id,
            user.user_id,
            now,
            now
          )
          .run();

        created.push({
          event: (await env.DB.prepare('SELECT * FROM events WHERE event_id = ?').bind(eventId).first())!,
          war: (await env.DB.prepare('SELECT * FROM war_history WHERE war_id = ?').bind(warId).first())!,
        });
      }

      await createAuditLog(
        env.DB,
        'war',
        'batch_create',
        user.user_id,
        'batch',
        `Batch created ${warsToCreate.length} wars`,
        JSON.stringify({ count: warsToCreate.length })
      );

      // Broadcast batch create
      waitUntil(broadcastUpdate(env, {
        entity: 'wars',
        action: 'created',
        payload: created.map(c => ({ ...c.event, ...c.war })),
        ids: created.map(c => c.event.event_id),
        excludeUserId: user.user_id
      }));

      return {
        message: `Created ${warsToCreate.length} wars successfully`,
        wars: created,
      };
    }

    // ============================================================
    // SINGLE CREATE MODE: Create one war
    // ============================================================
    const {
      title,
      startDate,
      startAtUtc,
      type = 'guild_war',
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
    } = body as CreateWarBody;

    const eventId = generateId('evt');
    const warId = generateId('war');

    const startDateUtc = new Date(startDate).toISOString().replace('T', ' ').substring(0, 10);
    const startAt = startAtUtc
      ? new Date(startAtUtc).toISOString().replace('T', ' ').substring(0, 19)
      : startDateUtc + ' 20:00:00';

    await env.DB
      .prepare(`
        INSERT INTO events (
          event_id, type, title, start_at_utc, description,
          is_archived, created_by, updated_by, created_at_utc, updated_at_utc
        ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
      `)
      .bind(
        eventId,
        type,
        title,
        startAt,
        notes || null,
        user.user_id,
        user.user_id,
        now,
        now
      )
      .run();

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
        eventId,
        startDateUtc,
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
      'create',
      user.user_id,
      warId,
      `Created new war: ${title}`,
      JSON.stringify({ startDate, result })
    );

    const event = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first();

    const war = await env.DB
      .prepare('SELECT * FROM war_history WHERE war_id = ?')
      .bind(warId)
      .first();

    // Broadcast single create
    waitUntil(broadcastUpdate(env, {
      entity: 'wars',
      action: 'created',
      payload: [Object.assign({}, event || {}, war || {})],
      ids: [eventId!],
      excludeUserId: user.user_id
    }));

    return {
      event,
      war,
    };
  },
});
