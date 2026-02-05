/**
 * Audit Log Stats API
 * GET /admin/audit-logs/stats - Get aggregated audit log statistics
 */

import { createEndpoint } from '../../../../lib/endpoint-factory';

interface AuditStatsQuery {
  date_range_start?: string;
  date_range_end?: string;
}

interface EntityTypeStats {
  entity_type: string;
  count: number;
}

interface ActorStats {
  actor_id: string;
  count: number;
}

interface ActionStats {
  action: string;
  count: number;
}

interface AuditStatsResponse {
  total: number;
  by_entity_type: EntityTypeStats[];
  by_actor: ActorStats[];
  by_action: ActionStats[];
  date_range?: {
    start: string;
    end: string;
  };
}

/**
 * GET /admin/audit-logs/stats - Get audit log statistics
 */
export const onRequestGet = createEndpoint<AuditStatsResponse, never, AuditStatsQuery>({
  auth: 'admin',
  etag: true,
  cacheControl: 'private, max-age=300', // Cache for 5 minutes

  parseQuery: (searchParams) => ({
    date_range_start: searchParams.get('date_range_start') || undefined,
    date_range_end: searchParams.get('date_range_end') || undefined,
  }),

  handler: async ({ env, query }) => {
    const conditions: string[] = [];
    const params: any[] = [];

    // Optional date range filter
    if (query.date_range_start && query.date_range_end) {
      conditions.push('created_at_utc >= ?');
      conditions.push('created_at_utc < ?');
      params.push(query.date_range_start, query.date_range_end);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const totalResult = await env.DB
      .prepare(`SELECT COUNT(*) as total FROM audit_log ${whereClause}`)
      .bind(...params)
      .first<{ total: number }>();

    const total = totalResult?.total || 0;

    // Get stats by entity_type
    const entityTypeStats = await env.DB
      .prepare(
        `SELECT entity_type, COUNT(*) as count
         FROM audit_log
         ${whereClause}
         GROUP BY entity_type
         ORDER BY count DESC`
      )
      .bind(...params)
      .all();

    // Get stats by actor
    const actorStats = await env.DB
      .prepare(
        `SELECT actor_id, COUNT(*) as count
         FROM audit_log
         ${whereClause}
         GROUP BY actor_id
         ORDER BY count DESC
         LIMIT 20`
      )
      .bind(...params)
      .all();

    // Get stats by action
    const actionStats = await env.DB
      .prepare(
        `SELECT action, COUNT(*) as count
         FROM audit_log
         ${whereClause}
         GROUP BY action
         ORDER BY count DESC`
      )
      .bind(...params)
      .all();

    return {
      total,
      by_entity_type: (entityTypeStats.results || []).map((row: any) => ({
        entity_type: row.entity_type,
        count: row.count,
      })),
      by_actor: (actorStats.results || []).map((row: any) => ({
        actor_id: row.actor_id,
        count: row.count,
      })),
      by_action: (actionStats.results || []).map((row: any) => ({
        action: row.action,
        count: row.count,
      })),
      date_range: query.date_range_start && query.date_range_end
        ? {
            start: query.date_range_start,
            end: query.date_range_end,
          }
        : undefined,
    };
  },
});
