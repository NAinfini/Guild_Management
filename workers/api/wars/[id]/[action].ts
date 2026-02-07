/**
 * Guild War API - War Actions
 * POST /api/wars/[id]/[action] - Perform war actions (update result, etc.)
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

interface UpdateWarResultBody {
  result: 'win' | 'loss' | 'draw' | 'unknown';
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

interface UpdateWarResultResponse {
  war: any;
}

// ============================================================
// POST /api/wars/[id]/result - Update War Result
// ============================================================

export const onRequestPost = createEndpoint<UpdateWarResultResponse, UpdateWarResultBody>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => {
    return body as UpdateWarResultBody;
  },

  handler: async ({ env, user, params, body, request }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const eventId = params.id;

    // Get war_history
    const war = await env.DB
      .prepare('SELECT * FROM war_history WHERE event_id = ?')
      .bind(eventId)
      .first<{ war_id: string; updated_at_utc: string }>();

    if (!war) {
      throw new NotFoundError('War history');
    }

    const warId = war.war_id;

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
      'update_result',
      user.user_id,
      warId,
      'Updated war result',
      JSON.stringify(body)
    );

    const updated = await env.DB
      .prepare('SELECT * FROM war_history WHERE war_id = ?')
      .bind(warId)
      .first<any>();

    return { war: updated };
  },
});
