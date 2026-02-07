/**
 * Guild War - War History Detail
 * GET /api/wars/history/[id] - Get war history detail
 * PUT /api/wars/history/[id] - Update war history
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog, etagFromTimestamp, assertIfMatch } from '../../../lib/utils';
import { NotFoundError } from '../../../lib/errors';

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
      .first();

    if (!war) {
      throw new NotFoundError('War history');
    }

    return { war };
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
