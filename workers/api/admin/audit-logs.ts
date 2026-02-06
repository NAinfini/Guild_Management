/**
 * Admin Audit Logs
 * GET /api/admin/audit-logs
 * POST /api/admin/audit-logs
 *
 * Enhanced with cursor-based pagination and mandatory date range filtering
 */

import type { Env, AuditLog } from '../../lib/types';
import { createEndpoint } from '../../lib/endpoint-factory';
import { generateId } from '../../lib/utils';
import { utcNow } from '../../lib/utils';

interface AuditLogEntry {
  audit_id: string;
  entity_type: string;
  action: string;
  actor_id: string | null;
  entity_id: string;
  diff_title: string | null;
  detail_text: string | null;
  created_at_utc: string;
  updated_at_utc: string;
}

interface AuditLogsResponse {
  entries: AuditLogEntry[];
  has_next: boolean;
  cursor?: string;
  total_in_range: number;
  range_start: string;
  range_end: string;
}

interface AuditLogQuery {
  cursor?: string;
  limit?: number;
  date_range_start?: string; // Optional (defaults to last 30 days)
  date_range_end?: string;   // Optional (defaults to now)
  entity_type?: string;
  actor_id?: string;
  search?: string;
}

/**
 * Encode cursor for pagination
 */
function encodeCursor(createdAt: string, auditId: string): string {
  return btoa(JSON.stringify({ created_at: createdAt, audit_id: auditId }));
}

/**
 * Decode cursor for pagination
 */
function decodeCursor(cursor: string): { created_at: string; audit_id: string } | null {
  try {
    const decoded = atob(cursor);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Validate date range
 */
function validateDateRange(start: string, end: string): { start: Date; end: Date } {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime())) {
    throw new Error('Invalid date_range_start format. Use ISO 8601 format (YYYY-MM-DD)');
  }

  if (isNaN(endDate.getTime())) {
    throw new Error('Invalid date_range_end format. Use ISO 8601 format (YYYY-MM-DD)');
  }

  if (endDate < startDate) {
    throw new Error('date_range_end must be after date_range_start');
  }

  // Check max range (365 days)
  const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff > 365) {
    throw new Error('Date range cannot exceed 365 days');
  }

  return { start: startDate, end: endDate };
}

/**
 * GET /api/admin/audit-logs
 * Enhanced with cursor-based pagination and mandatory date range filtering
 */
export const onRequestGet = createEndpoint<AuditLogsResponse, AuditLogQuery>({
  auth: 'admin',
  etag: true,
  cacheControl: 'no-store',

  handler: async ({ env, request }) => {
    const url = new URL(request.url);

    // Parse query parameters
    const cursor = url.searchParams.get('cursor') || undefined;
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 50); // Max 50
    const dateRangeStart = url.searchParams.get('date_range_start');
    const dateRangeEnd = url.searchParams.get('date_range_end');
    const entityType = url.searchParams.get('entity_type') || undefined;
    const actorId = url.searchParams.get('actor_id') || undefined;
    const search = url.searchParams.get('search') || undefined;

    // Default to last 30 days if no range provided
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const startStr = dateRangeStart || thirtyDaysAgo.toISOString();
    const endStr = dateRangeEnd || now.toISOString();

    const { start: startDate, end: endDate } = validateDateRange(startStr, endStr);

    // Decode cursor if provided
    let cursorData: { created_at: string; audit_id: string } | null = null;
    if (cursor) {
      cursorData = decodeCursor(cursor);
      if (!cursorData) {
        throw new Error('Invalid cursor');
      }
    }

    // Build query
    const conditions: string[] = [];
    const params: any[] = [];

    // Date range filter (REQUIRED)
    conditions.push('created_at_utc >= ?');
    conditions.push('created_at_utc < ?');
    params.push(startDate.toISOString(), endDate.toISOString());

    // Cursor-based pagination
    if (cursorData) {
      conditions.push('(created_at_utc < ? OR (created_at_utc = ? AND audit_id < ?))');
      params.push(cursorData.created_at, cursorData.created_at, cursorData.audit_id);
    }

    // Optional filters
    if (entityType) {
      conditions.push('entity_type = ?');
      params.push(entityType);
    }

    if (actorId) {
      conditions.push('actor_id = ?');
      params.push(actorId);
    }

    if (search) {
      conditions.push('detail_text LIKE ?');
      params.push(`%${search}%`);
    }

    // Build final query
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const query = `
      SELECT * FROM audit_log
      ${whereClause}
      ORDER BY created_at_utc DESC, audit_id DESC
      LIMIT ?
    `;
    params.push(limit + 1); // Fetch one extra to check if there's a next page

    const result = await env.DB.prepare(query).bind(...params).all();
    const rows = (result.results || []) as any[];

    // Check if there's a next page
    const hasNext = rows.length > limit;
    const entries = hasNext ? rows.slice(0, limit) : rows;

    // Generate next cursor
    let nextCursor: string | undefined;
    if (hasNext && entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      nextCursor = encodeCursor(lastEntry.created_at_utc, lastEntry.audit_id);
    }

    // Get total count in range
    const countQuery = `
      SELECT COUNT(*) as total FROM audit_log
      WHERE created_at_utc >= ? AND created_at_utc < ?
      ${entityType ? 'AND entity_type = ?' : ''}
      ${actorId ? 'AND actor_id = ?' : ''}
      ${search ? 'AND detail_text LIKE ?' : ''}
    `;
    const countParams = [startDate.toISOString(), endDate.toISOString()];
    if (entityType) countParams.push(entityType);
    if (actorId) countParams.push(actorId);
    if (search) countParams.push(`%${search}%`);

    const totalResult = await env.DB.prepare(countQuery).bind(...countParams).first<{ total: number }>();

    return {
      entries: entries.map(row => ({
        audit_id: row.audit_id,
        entity_type: row.entity_type,
        action: row.action,
        actor_id: row.actor_id,
        entity_id: row.entity_id,
        diff_title: row.diff_title,
        detail_text: row.detail_text,
        created_at_utc: row.created_at_utc,
        updated_at_utc: row.updated_at_utc,
      })),
      has_next: hasNext,
      cursor: nextCursor,
      total_in_range: totalResult?.total || 0,
      range_start: startStr,
      range_end: endStr,
    };
  },
});

/**
 * POST /api/admin/audit-logs
 * Create audit log entry
 */
interface CreateAuditLogRequest {
  entity_type: string;
  action: string;
  entity_id: string;
  diff_title?: string;
  detail_text?: string;
}

export const onRequestPost = createEndpoint<AuditLogEntry>({
  auth: 'admin',
  handler: async ({ env, user, request }) => {
    const body = (await request.json()) as CreateAuditLogRequest;

    if (!body.entity_type || !body.action || !body.entity_id) {
      throw new Error('entity_type, action, and entity_id are required');
    }

    const auditId = generateId('aud');
    const now = utcNow();

    await env.DB.prepare(
      `INSERT INTO audit_log (
        audit_id, entity_type, action, actor_id, entity_id,
        diff_title, detail_text, created_at_utc, updated_at_utc
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        auditId,
        body.entity_type,
        body.action,
        user!.user_id,
        body.entity_id,
        body.diff_title || null,
        body.detail_text || null,
        now,
        now,
      )
      .run();

    return {
      audit_id: auditId,
      entity_type: body.entity_type,
      action: body.action,
      actor_id: user!.user_id,
      entity_id: body.entity_id,
      diff_title: body.diff_title || null,
      detail_text: body.detail_text || null,
      created_at_utc: now,
      updated_at_utc: now,
    };
  },
});
