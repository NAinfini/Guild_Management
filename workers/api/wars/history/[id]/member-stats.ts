/**
 * War Member Stats
 * GET /api/wars/history/[id]/member-stats
 * PUT /api/wars/history/[id]/member-stats
 */

import type { PagesFunction, Env } from '../../../_types';
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  notFoundResponse,
  utcNow,
  createAuditLog,
  etagFromTimestamp,
  assertIfMatch,
} from '../../../_utils';
import { withOptionalAuth, withModeratorAuth } from '../../../_middleware';
import { validateBody, memberStatsSchema } from '../../../_validation';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withOptionalAuth(context, async (authContext) => {
    const { env, params } = authContext;
    const warId = params.id;

    const war = await env.DB
      .prepare('SELECT * FROM war_history WHERE war_id = ?')
      .bind(warId)
      .first<any>();
    if (!war) return notFoundResponse('War history');

    const stats = await env.DB
      .prepare(`
        SELECT wms.*, u.username, u.class_code
        FROM war_member_stats wms
        JOIN users u ON wms.user_id = u.user_id
        WHERE wms.war_id = ?
        ORDER BY u.username
      `)
      .bind(warId)
      .all<any>();

    const etag = etagFromTimestamp(war.updated_at_utc);
    const resp = successResponse({ stats: stats.results || [] });
    if (etag) resp.headers.set('ETag', etag);
    return resp;
  });
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  return withModeratorAuth(context, async (authContext) => {
    const { request, env, params } = authContext;
    const { user } = authContext.data;
    const warId = params.id;

    const war = await env.DB
      .prepare('SELECT * FROM war_history WHERE war_id = ?')
      .bind(warId)
      .first<any>();
    if (!war) return notFoundResponse('War history');

    const currentEtag = etagFromTimestamp(war.updated_at_utc);
    const pre = assertIfMatch(request, currentEtag);
    if (pre) return pre;

    const body = await request.json();
    const items = Array.isArray(body) ? body : body?.stats;
    if (!Array.isArray(items) || items.length === 0) {
      return badRequestResponse('stats array is required');
    }

    for (const entry of items) {
      const validation = memberStatsSchema.safeParse(entry);
      if (!validation.success) {
        return badRequestResponse('Invalid member stat', validation.error.errors);
      }
      const data = validation.data;
      const userId = (data as any).userId || (data as any).user_id;
      if (!userId) {
        return badRequestResponse('userId is required for each stat');
      }

      const now = utcNow();

      // Upsert logic
      const existing = await env.DB
        .prepare('SELECT 1 FROM war_member_stats WHERE war_id = ? AND user_id = ?')
        .bind(warId, userId)
        .first();

      const fields = {
        kills: data.kills ?? null,
        deaths: data.deaths ?? null,
        assists: data.assists ?? null,
        damage: data.damage ?? null,
        healing: data.healing ?? null,
        building_damage: data.buildingDamage ?? null,
        damage_taken: data.damageTaken ?? null,
        credits: data.credits ?? null,
        note: data.note ?? null,
      };

      if (existing) {
        await env.DB
          .prepare(
            `
            UPDATE war_member_stats
            SET kills = ?, deaths = ?, assists = ?, damage = ?, healing = ?,
                building_damage = ?, damage_taken = ?, credits = ?, note = ?, updated_at_utc = ?
            WHERE war_id = ? AND user_id = ?
          `
          )
          .bind(
            fields.kills,
            fields.deaths,
            fields.assists,
            fields.damage,
            fields.healing,
            fields.building_damage,
            fields.damage_taken,
            fields.credits,
            fields.note,
            now,
            warId,
            userId
          )
          .run();
      } else {
        await env.DB
          .prepare(
            `
            INSERT INTO war_member_stats (
              war_id, user_id, kills, deaths, assists, damage, healing, building_damage, damage_taken, credits, note, created_at_utc, updated_at_utc
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `
          )
          .bind(
            warId,
            userId,
            fields.kills,
            fields.deaths,
            fields.assists,
            fields.damage,
            fields.healing,
            fields.building_damage,
            fields.damage_taken,
            fields.credits,
            fields.note,
            now,
            now
          )
          .run();
      }
    }

    const nowWar = utcNow();
    await env.DB
      .prepare('UPDATE war_history SET updated_at_utc = ?, updated_by = ? WHERE war_id = ?')
      .bind(nowWar, user.user_id, warId)
      .run();

    await createAuditLog(
      env.DB,
      'war',
      'update_member_stats',
      user.user_id,
      warId,
      'Updated war member stats',
      JSON.stringify({ count: items.length })
    );

    const etag = etagFromTimestamp(nowWar);
    const resp = successResponse({ ok: true });
    if (etag) resp.headers.set('ETag', etag);
    return resp;
  });
};
