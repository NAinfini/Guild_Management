/**
 * Members API
 * GET /api/members - List all members or fetch specific members by IDs
 * PATCH /api/members - Batch update member roles or activation status
 *
 * Features:
 * - List members with filters (role, active status)
 * - Fetch specific members by IDs (batch read)
 * - Batch update roles or activation status via query parameters
 * - Cursor-based pagination
 * - Field filtering for sparse responses
 * - Backward compatible with existing API
 */

import type { Env, User } from '../../core/types';
import { createEndpoint } from '../../core/endpoint-factory';
import { successResponse, errorResponse, utcNow, createAuditLog } from '../../core/utils';
import { DB_TABLES, MEMBER_USER_SELECT_FIELDS, pickAllowedFields } from '../../core/db-schema';
import {
  buildCursorWhereClause,
  buildPaginatedResponse,
  filterFields,
  parseFieldsQuery,
  parsePaginationQuery,
  type PaginatedResponse,
  type PaginationQuery,
} from '@guild/shared-utils/pagination';

// ============================================================
// Types
// ============================================================

interface MemberListQuery extends PaginationQuery {
  includeInactive?: string;
  role?: string;
  fields?: string;
  ids?: string; // Comma-separated IDs for batch fetch
  since?: string; // ISO timestamp for incremental polling
}

interface BatchUpdateQuery {
  action?: 'role' | 'activate' | 'deactivate';
  role?: 'admin' | 'moderator' | 'member';
  userIds?: string; // Comma-separated IDs for batch update
}

interface BatchUpdateResponse {
  message: string;
  updatedCount?: number;
  failed?: Array<{ userId: string; error: string }>;
}

interface MemberProfile {
  user_id: string;
  username: string;
  wechat_name: string | null;
  role: string;
  power: number;
  is_active: number;
  title_html: string | null;
  classes: string[];
  media_count: number;
  created_at_utc: string;
  updated_at_utc: string;
}

interface BatchReadResponse {
  members: any[];
  totalCount: number;
  notFound: string[];
}

const MEMBER_BATCH_FIELD_MAP: Record<string, string> = {
  userId: 'user_id',
  username: 'username',
  wechatName: 'wechat_name',
  power: 'power',
  isActive: 'is_active',
  role: 'role',
  createdAt: 'created_at_utc',
  updatedAt: 'updated_at_utc',
  user_id: 'user_id',
  wechat_name: 'wechat_name',
  is_active: 'is_active',
  created_at_utc: 'created_at_utc',
  updated_at_utc: 'updated_at_utc',
};

// ============================================================
// GET /api/members - List Members or Batch Fetch by IDs
// ============================================================

export const onRequestGet = createEndpoint<
  PaginatedResponse<MemberProfile> | MemberProfile[] | BatchReadResponse,
  MemberListQuery
>({
  auth: 'optional',
  pollable: true,
  pollEntity: 'members',
  etag: true,
  cacheControl: 'public, max-age=60, must-revalidate',

  parseQuery: (searchParams) => ({
    includeInactive: searchParams.get('includeInactive') || undefined,
    role: searchParams.get('role') || undefined,
    limit: searchParams.get('limit') || undefined,
    cursor: searchParams.get('cursor') || undefined,
    fields: searchParams.get('fields') || undefined,
    ids: searchParams.get('ids') || undefined, // NEW: Support for batch fetch
    since: searchParams.get('since') || undefined, // Incremental polling
  }),

  handler: async ({ env, query }) => {
    // ============================================================
    // BATCH FETCH MODE: Fetch specific members by IDs
    // ============================================================
    if (query.ids) {
      const ids = query.ids.split(',').map(id => id.trim()).filter(id => id.length > 0);

      if (ids.length === 0) {
        throw new Error('No IDs provided');
      }

      if (ids.length > 100) {
        throw new Error('Maximum 100 IDs per request');
      }

      const fields = query.fields?.split(',').map(f => f.trim()).filter(f => f.length > 0) || [];
      const mappedRequested = fields.map((f) => MEMBER_BATCH_FIELD_MAP[f]).filter(Boolean);
      const selectFields = pickAllowedFields(mappedRequested, MEMBER_USER_SELECT_FIELDS, MEMBER_USER_SELECT_FIELDS).join(', ');

      const placeholders = ids.map(() => '?').join(',');
      const sqlQuery = `
        SELECT ${selectFields}
        FROM ${DB_TABLES.users}
        WHERE user_id IN (${placeholders})
          AND deleted_at_utc IS NULL
        ORDER BY power DESC, username ASC
      `;

      const result = await env.DB.prepare(sqlQuery).bind(...ids).all();
      const foundMembers = result.results || [];
      const foundIds = new Set(foundMembers.map((m: any) => m.user_id));
      const notFound = ids.filter(id => !foundIds.has(id));

      // Convert snake_case to camelCase for response
      const members = foundMembers.map((member: any) => {
        if (fields && fields.length > 0) {
          const converted: any = {};
          for (const field of fields) {
            const snakeField = MEMBER_BATCH_FIELD_MAP[field] || field;
            if (member[snakeField] !== undefined) {
              converted[field] = member[snakeField];
            }
          }
          return converted;
        }
        return member;
      });

      return {
        members,
        totalCount: members.length,
        notFound,
      };
    }

    // ============================================================
    // LIST MODE: List members with filters and pagination
    // ============================================================
    try {
      const { limit, cursor } = parsePaginationQuery(query);
      const requestedFields = parseFieldsQuery(query.fields, [
        'user_id',
        'username',
        'wechat_name',
        'role',
        'power',
        'is_active',
        'title_html',
        'classes',
        'media_count',
        'created_at_utc',
        'updated_at_utc',
      ]);

      const whereClauses = ['u.deleted_at_utc IS NULL'];
      const bindings: any[] = [];

      if (query.includeInactive !== 'true') {
        whereClauses.push('u.is_active = 1');
      }

      if (query.role) {
        whereClauses.push('u.role = ?');
        bindings.push(query.role);
      }

      if (query.since) {
        whereClauses.push('u.updated_at_utc > ?');
        bindings.push(query.since);
      }

      const cursorClause = buildCursorWhereClause(cursor, 'u.created_at_utc', 'u.user_id');
      if (cursorClause.clause) {
        whereClauses.push(cursorClause.clause);
        bindings.push(...cursorClause.bindings);
      }

      const sqlQuery = `
        SELECT
          u.*,
          mp.title_html,
          GROUP_CONCAT(DISTINCT mc.class_code ORDER BY mc.sort_order) as classes_csv,
          COUNT(DISTINCT mm.media_id) as media_count
        FROM users u
        LEFT JOIN member_profiles mp ON u.user_id = mp.user_id
        LEFT JOIN member_classes mc ON u.user_id = mc.user_id
        LEFT JOIN member_media mm ON u.user_id = mm.user_id
        WHERE ${whereClauses.join(' AND ')}
        GROUP BY u.user_id
        ORDER BY u.created_at_utc DESC, u.user_id DESC
        LIMIT ?
      `;

      const result = await env.DB.prepare(sqlQuery).bind(...bindings, limit + 1).all();

      const members: MemberProfile[] = (result.results || []).map((row: any) => ({
          user_id: row.user_id,
          username: row.username,
          wechat_name: row.wechat_name,
          role: row.role,
          power: row.power,
          is_active: row.is_active,
          title_html: row.title_html || null,
          classes: row.classes_csv ? row.classes_csv.split(',') : [],
          media_count: row.media_count || 0,
          created_at_utc: row.created_at_utc,
          updated_at_utc: row.updated_at_utc,
        }));

      const paginated = buildPaginatedResponse(members, limit, 'created_at_utc', 'user_id');
      if (requestedFields) {
        paginated.items = paginated.items.map((member) => filterFields(member, requestedFields) as MemberProfile);
      }

      return paginated;
    } catch (error: any) {
      console.error('List members error:', error.message, error.stack);
      throw error;
    }
  },
});

// ============================================================
// PATCH /api/members - Batch Update Members
// ============================================================

export const onRequestPatch = createEndpoint<BatchUpdateResponse, BatchUpdateQuery>({
  auth: 'admin',
  cacheControl: 'no-store',

  parseQuery: (searchParams) => ({
    action: (searchParams.get('action') || undefined) as 'role' | 'activate' | 'deactivate' | undefined,
    role: (searchParams.get('role') || undefined) as 'admin' | 'moderator' | 'member' | undefined,
    userIds: searchParams.get('userIds') || undefined,
  }),

  handler: async ({ env, user, query }) => {
    const { action, role, userIds } = query;

    if (!action) {
      throw new Error('Missing action parameter (role, activate, deactivate)');
    }

    if (!userIds) {
      throw new Error('Missing userIds query parameter');
    }

    const ids = userIds.split(',').map(id => id.trim()).filter(id => id.length > 0);

    if (ids.length === 0) {
      throw new Error('No user IDs provided');
    }

    if (ids.length > 100) {
      throw new Error('Maximum 100 user IDs per batch operation');
    }

    const now = utcNow();
    let successCount = 0;
    const failed: Array<{ userId: string; error: string }> = [];

    if (action === 'role') {
      if (!role || !['admin', 'moderator', 'member'].includes(role)) {
        throw new Error('Valid role is required (admin, moderator, member)');
      }

      const placeholders = ids.map(() => '?').join(',');
      const result = await env.DB
        .prepare(`UPDATE users SET role = ?, updated_at_utc = ? WHERE user_id IN (${placeholders}) AND deleted_at_utc IS NULL`)
        .bind(role, now, ...ids)
        .run();

      successCount = result.meta.changes || 0;

      await createAuditLog(
        env.DB,
        'member',
        'batch_update_role',
        user!.user_id,
        'batch',
        `Batch changed role to ${role} for ${successCount} members`,
        JSON.stringify({ userIds: ids, role })
      );
    } else if (action === 'activate') {
      const placeholders = ids.map(() => '?').join(',');
      const result = await env.DB
        .prepare(`UPDATE users SET is_active = 1, updated_at_utc = ? WHERE user_id IN (${placeholders}) AND deleted_at_utc IS NULL`)
        .bind(now, ...ids)
        .run();

      successCount = result.meta.changes || 0;

      await createAuditLog(
        env.DB,
        'member',
        'batch_activate',
        user!.user_id,
        'batch',
        `Batch activated ${successCount} members`,
        JSON.stringify({ userIds: ids })
      );
    } else if (action === 'deactivate') {
      const placeholders = ids.map(() => '?').join(',');
      const result = await env.DB
        .prepare(`UPDATE users SET is_active = 0, updated_at_utc = ? WHERE user_id IN (${placeholders}) AND deleted_at_utc IS NULL`)
        .bind(now, ...ids)
        .run();

      successCount = result.meta.changes || 0;

      await createAuditLog(
        env.DB,
        'member',
        'batch_deactivate',
        user!.user_id,
        'batch',
        `Batch deactivated ${successCount} members`,
        JSON.stringify({ userIds: ids })
      );
    } else {
      throw new Error('Invalid action. Use: role, activate, or deactivate');
    }

    return {
      message: `Batch ${action} complete: ${successCount} updated`,
      updatedCount: successCount,
    };
  },
});
