/**
 * Audit Log Entity History API
 * GET /admin/audit-logs/entity/:entityId - Get all audit logs for a specific entity
 *
 * Convenience endpoint - can be done via existing GET /admin/audit-logs with filters
 */

import { createEndpoint } from '../../../../core/endpoint-factory';

interface EntityHistoryQuery {
  limit?: number;
  offset?: number;
}

interface AuditLogEntry {
  audit_id: string;
  entity_type: string;
  action: string;
  actor_id: string | null;
  entity_id: string;
  diff_title: string | null;
  detail_text: string | null;
  created_at_utc: string;
}

interface EntityHistoryResponse {
  entity_id: string;
  entries: AuditLogEntry[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * GET /admin/audit-logs/entity/:entityId - Get entity history
 */
export const onRequestGet = createEndpoint<EntityHistoryResponse, EntityHistoryQuery>({
  auth: 'admin',
  etag: true,
  cacheControl: 'private, max-age=60',

  parseQuery: (searchParams) => ({
    limit: parseInt(searchParams.get('limit') || '50'),
    offset: parseInt(searchParams.get('offset') || '0'),
  }),

  handler: async ({ env, params, query }) => {
    const entityId = params.entityId;

    if (!entityId) {
      throw new Error('Entity ID is required');
    }

    // Get total count for this entity
    const countResult = await env.DB
      .prepare('SELECT COUNT(*) as total FROM audit_log WHERE entity_id = ?')
      .bind(entityId)
      .first<{ total: number }>();

    const total = countResult?.total || 0;

    // Get paginated entries
    const limit = Math.min(query.limit || 50, 100);
    const offset = query.offset || 0;

    const entries = await env.DB
      .prepare(
        `SELECT * FROM audit_log
         WHERE entity_id = ?
         ORDER BY created_at_utc DESC
         LIMIT ? OFFSET ?`
      )
      .bind(entityId, limit, offset)
      .all();

    return {
      entity_id: entityId,
      entries: (entries.results || []).map((row: any) => ({
        audit_id: row.audit_id,
        entity_type: row.entity_type,
        action: row.action,
        actor_id: row.actor_id,
        entity_id: row.entity_id,
        diff_title: row.diff_title,
        detail_text: row.detail_text,
        created_at_utc: row.created_at_utc,
      })),
      total,
      limit,
      offset,
    };
  },
});
