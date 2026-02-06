/**
 * War Member Stats
 * GET /api/wars/history/[id]/member-stats
 * PUT /api/wars/history/[id]/member-stats
 * 
 * Migrated to createEndpoint and shared contracts to eliminate guessing.
 */

import type { Env } from '../../../../lib/types';
import { createEndpoint } from '../../../../lib/endpoint-factory';
import {
  utcNow,
  createAuditLog,
  etagFromTimestamp
} from '../../../../lib/utils';
import { notFoundResponse } from '../../../../../shared/utils/response';
import { memberStatsSchema } from '../../../../lib/validation';
import type { WarMemberStatDTO } from '../../../../../shared/api/contracts';

// ============================================================
// Types
// ============================================================

interface MemberStatsResponse {
  stats: WarMemberStatDTO[];
}

// ============================================================
// GET /api/wars/history/[id]/member-stats
// ============================================================

export const onRequestGet = createEndpoint<MemberStatsResponse>({
  auth: 'optional',
  etag: true,
  cacheControl: 'public, max-age=60',
  
  handler: async ({ env, params }) => {
    const warId = params.id;

    // Verify war exists
    const war = await env.DB
      .prepare('SELECT war_id, updated_at_utc FROM war_history WHERE war_id = ?')
      .bind(warId)
      .first<{ war_id: string; updated_at_utc: string }>();

    if (!war) {
      throw notFoundResponse('War history');
    }

    // Fetch stats with joins for username
    // Note: We map to WarMemberStatDTO manually to ensure type safety
    const statsResult = await env.DB
      .prepare(`
        SELECT 
          wms.war_id, wms.user_id, wms.kills, wms.deaths, wms.assists, 
          wms.damage, wms.healing, wms.building_damage, wms.damage_taken, 
          wms.credits, wms.note, wms.created_at_utc, wms.updated_at_utc,
          u.username,
          (SELECT class_code FROM member_classes mc WHERE mc.user_id = u.user_id ORDER BY sort_order LIMIT 1) as class_code
        FROM war_member_stats wms
        JOIN users u ON wms.user_id = u.user_id
        WHERE wms.war_id = ?
        ORDER BY u.username
      `)
      .bind(warId)
      .all<any>();

    const stats: WarMemberStatDTO[] = (statsResult.results || []).map(row => ({
      war_id: row.war_id,
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
      created_at_utc: row.created_at_utc,
      updated_at_utc: row.updated_at_utc
    }));

    return { stats };
  },
});

// ============================================================
// PUT /api/wars/history/[id]/member-stats
// ============================================================

export const onRequestPut = createEndpoint<{ ok: boolean }, any>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => {
    // Legacy support: body can be array or { stats: [] }
    const items = Array.isArray(body) ? body : body?.stats;
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('stats array is required');
    }
    return items;
  },

  handler: async ({ env, user, params, body: items, waitUntil }) => {
    if (!user) throw new Error('User not authenticated');
    
    const warId = params.id;

    // Verify war exists
    const war = await env.DB
      .prepare('SELECT war_id FROM war_history WHERE war_id = ?')
      .bind(warId)
      .first();

    if (!war) {
      throw notFoundResponse('War history');
    }

    const now = utcNow();

    // Process updates
    for (const entry of items) {
       // Validate using existing schema
       const validation = memberStatsSchema.safeParse(entry);
       if (!validation.success) {
         throw new Error(`Invalid member stat for user: ${validation.error.message}`);
       }
       
       const data = validation.data;
       const userId = (data as any).userId || (data as any).user_id;

       if (!userId) {
         throw new Error('userId is required');
       }

       // Upsert
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
        await env.DB.prepare(`
            UPDATE war_member_stats
            SET kills = ?, deaths = ?, assists = ?, damage = ?, healing = ?,
                building_damage = ?, damage_taken = ?, credits = ?, note = ?, updated_at_utc = ?
            WHERE war_id = ? AND user_id = ?
        `).bind(
            fields.kills, fields.deaths, fields.assists, fields.damage, fields.healing,
            fields.building_damage, fields.damage_taken, fields.credits, fields.note, now,
            warId, userId
        ).run();
      } else {
        await env.DB.prepare(`
            INSERT INTO war_member_stats (
              war_id, user_id, kills, deaths, assists, damage, healing, 
              building_damage, damage_taken, credits, note, created_at_utc, updated_at_utc
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            warId, userId,
            fields.kills, fields.deaths, fields.assists, fields.damage, fields.healing,
            fields.building_damage, fields.damage_taken, fields.credits, fields.note, now, now
        ).run();
      }
    }

    // Update war timestamp
    await env.DB
      .prepare('UPDATE war_history SET updated_at_utc = ?, updated_by = ? WHERE war_id = ?')
      .bind(now, user.user_id, warId)
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

    // TODO: Broadcast update if needed (not in original code)

    return { ok: true };
  },
});
