/**
 * Admin Audit Logs
 * GET /api/admin/audit-logs
 * 
 * Migrated to use createEndpoint pattern
 */

import type { Env, AuditLog } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';

interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
}

interface AuditLogQuery {
  page?: number;
  limit?: number;
  action?: string;
  userId?: string;
}

export const onRequestGet = createEndpoint<AuditLogsResponse, AuditLogQuery>({
  auth: 'admin',
  cacheControl: 'no-store',

  handler: async ({ env, request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const action = url.searchParams.get('action');
    const userId = url.searchParams.get('userId');

    let query = 'SELECT * FROM audit_logs';
    const params: any[] = [];
    const conditions: string[] = [];

    if (action) {
      conditions.push('action = ?');
      params.push(action);
    }
    if (userId) {
      conditions.push('user_id = ?');
      params.push(userId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at_utc DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const logs = await env.DB.prepare(query).bind(...params).all<AuditLog>();
    
    // Get total
    let countQuery = 'SELECT COUNT(*) as total FROM audit_logs';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const total = await env.DB.prepare(countQuery).bind(...params.slice(0, params.length - 2)).first<{ total: number }>();

    return {
      logs: logs.results || [],
      total: total?.total || 0,
    };
  },
});
