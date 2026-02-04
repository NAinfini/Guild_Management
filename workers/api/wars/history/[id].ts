/**
 * War History - Detail Update
 * GET /api/wars/history/[id]  (optional)
 * PUT /api/wars/history/[id]  (update stats/notes with ETag)
 */

import type { PagesFunction, Env } from '../../_types';
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  notFoundResponse,
  utcNow,
  createAuditLog,
  etagFromTimestamp,
  assertIfMatch,
} from '../../_utils';
import { withOptionalAuth, withModeratorAuth } from '../../_middleware';
import { validateBody, updateWarStatsSchema } from '../../_validation';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withOptionalAuth(context, async (authContext) => {
    const { env, params } = authContext;
    const warId = params.id;

    const war = await env.DB
      .prepare('SELECT * FROM war_history WHERE war_id = ?')
      .bind(warId)
      .first();

    if (!war) return notFoundResponse('War history');

    const etag = etagFromTimestamp((war as any).updated_at_utc);
    const pre = assertIfMatch(authContext.request, etag);
    if (pre) return pre;

    const response = successResponse({ war });
    if (etag) response.headers.set('ETag', etag);
    return response;
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

    const validation = await validateBody(request, updateWarStatsSchema);
    if (!validation.success) {
      return badRequestResponse('Invalid request body', validation.error.errors);
    }

    const updates = validation.data;
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
      const val = (updates as any)[key];
      if (val !== undefined) {
        updateFields.push(`${column} = ?`);
        updateValues.push(val);
      }
    }

    if (updateFields.length === 0) {
      return badRequestResponse('No fields to update');
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
      JSON.stringify(updates)
    );

    const updated = await env.DB
      .prepare('SELECT * FROM war_history WHERE war_id = ?')
      .bind(warId)
      .first<any>();

    const etag = etagFromTimestamp(updated?.updated_at_utc);
    const response = successResponse({ war: updated });
    if (etag) response.headers.set('ETag', etag);
    return response;
  });
};
