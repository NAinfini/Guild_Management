/**
 * Members Batch Read API
 * GET /api/members/batch-read - Batch fetch multiple members by IDs
 *
 * Efficiently fetch multiple members in a single request.
 * Supports field filtering to reduce payload size.
 */

import type { Env } from '../../lib/types';
import { createEndpoint } from '../../lib/endpoint-factory';
import { DB_TABLES, MEMBER_USER_SELECT_FIELDS, pickAllowedFields } from '../../lib/db-schema';

// ============================================================
// Types
// ============================================================

interface BatchReadQuery {
  ids: string[];
  fields?: string[];
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
// GET /api/members/batch-read
// ============================================================

export const onRequestGet = createEndpoint<BatchReadResponse, BatchReadQuery>({
  auth: 'optional',
  etag: true,
  cacheControl: 'public, max-age=30',

  parseQuery: (searchParams) => {
    const idsParam = searchParams.get('ids');
    const fieldsParam = searchParams.get('fields');

    if (!idsParam) {
      throw new Error('Missing required parameter: ids');
    }

    const ids = idsParam.split(',').map(id => id.trim()).filter(id => id.length > 0);

    if (ids.length === 0) {
      throw new Error('No IDs provided');
    }

    if (ids.length > 100) {
      throw new Error('Maximum 100 IDs per request');
    }

    const fields = fieldsParam
      ? fieldsParam.split(',').map(f => f.trim()).filter(f => f.length > 0)
      : undefined;

    return { ids, fields };
  },

  handler: async ({ env, query }) => {
    const { ids, fields } = query;

    // Build SELECT clause based on requested fields
    // Always include user_id for identification
    const mappedRequested = (fields || []).map((f) => MEMBER_BATCH_FIELD_MAP[f]).filter(Boolean);
    const baseFields = pickAllowedFields(mappedRequested, MEMBER_USER_SELECT_FIELDS, MEMBER_USER_SELECT_FIELDS);
    const selectFields = baseFields.join(', ');

    // Build query with placeholders
    const placeholders = ids.map(() => '?').join(',');
    const sqlQuery = `
      SELECT ${selectFields}
      FROM ${DB_TABLES.users}
      WHERE user_id IN (${placeholders})
        AND deleted_at_utc IS NULL
      ORDER BY power DESC, username ASC
    `;

    const result = await env.DB
      .prepare(sqlQuery)
      .bind(...ids)
      .all();

    const foundMembers = result.results || [];
    const foundIds = new Set(foundMembers.map((m: any) => m.user_id));
    const notFound = ids.filter(id => !foundIds.has(id));

    // Convert snake_case to camelCase for response
    const members = foundMembers.map((member: any) => {
      if (fields && fields.length > 0) {
        // Only convert requested fields
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
  },
});
