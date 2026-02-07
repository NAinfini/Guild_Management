/**
 * Shared Pagination Utilities
 * Provides cursor-based pagination helpers for consistent pagination across all list endpoints
 */

export interface PaginationMeta {
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
  total?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface PaginationQuery {
  limit?: string;
  cursor?: string;
}

/**
 * Encode cursor from timestamp and ID
 * Format: base64(timestamp|id)
 * Uses Web APIs (btoa) instead of Node.js Buffer for Cloudflare Workers compatibility
 */
export function encodeCursor(timestamp: string, id: string): string {
  // btoa expects ASCII string, so we encode to UTF-8 first if needed
  const data = `${timestamp}|${id}`;
  try {
    return btoa(data);
  } catch (e) {
    // If btoa fails (non-ASCII chars), use encodeURIComponent
    return btoa(encodeURIComponent(data));
  }
}

/**
 * Decode cursor to timestamp and ID
 * Returns [timestamp, id]
 * Uses Web APIs (atob) instead of Node.js Buffer for Cloudflare Workers compatibility
 */
export function decodeCursor(cursor: string): [string, string] {
  try {
    let decoded: string;
    try {
      decoded = atob(cursor);
    } catch (e) {
      // Try decoding URI component if direct atob fails
      decoded = decodeURIComponent(atob(cursor));
    }

    const parts = decoded.split('|');
    if (parts.length !== 2) {
      throw new Error('Invalid cursor format');
    }
    return parts as [string, string];
  } catch (error) {
    throw new Error('Invalid cursor');
  }
}

/**
 * Parse pagination parameters from query
 * Returns { limit, cursor }
 */
export function parsePaginationQuery(query: PaginationQuery): {
  limit: number;
  cursor: { timestamp: string; id: string } | null;
} {
  const limit = query.limit ? Math.min(parseInt(query.limit), 100) : 50;

  let cursor: { timestamp: string; id: string } | null = null;
  if (query.cursor) {
    const [timestamp, id] = decodeCursor(query.cursor);
    cursor = { timestamp, id };
  }

  return { limit, cursor };
}

/**
 * Build pagination WHERE clause for SQL
 * Returns { clause, bindings }
 */
export function buildCursorWhereClause(
  cursor: { timestamp: string; id: string } | null,
  timestampColumn: string = 'created_at_utc',
  idColumn: string = 'id'
): { clause: string; bindings: any[] } {
  if (!cursor) {
    return { clause: '', bindings: [] };
  }

  return {
    clause: `(${timestampColumn} < ? OR (${timestampColumn} = ? AND ${idColumn} < ?))`,
    bindings: [cursor.timestamp, cursor.timestamp, cursor.id],
  };
}

/**
 * Build paginated response from results
 * Takes results array (with +1 extra for hasMore check) and metadata
 */
export function buildPaginatedResponse<T extends Record<string, any>>(
  results: T[],
  limit: number,
  timestampField: keyof T,
  idField: keyof T
): PaginatedResponse<T> {
  const items = results.slice(0, limit);
  const hasMore = results.length > limit;

  const nextCursor = hasMore && items.length > 0
    ? encodeCursor(
        String(items[items.length - 1][timestampField]),
        String(items[items.length - 1][idField])
      )
    : null;

  return {
    items,
    pagination: {
      nextCursor,
      hasMore,
      limit,
    },
  };
}

/**
 * Parse fields parameter for sparse fieldsets
 * Returns array of allowed fields
 */
export function parseFieldsQuery(
  fieldsParam: string | undefined,
  allowedFields: string[]
): string[] | null {
  if (!fieldsParam) {
    return null;
  }

  const requestedFields = fieldsParam
    .split(',')
    .map(f => f.trim())
    .filter(f => f.length > 0);

  return requestedFields.filter(f => allowedFields.includes(f));
}

/**
 * Filter object to only include requested fields
 */
export function filterFields<T extends Record<string, any>>(
  obj: T,
  fields: string[] | null
): Partial<T> | T {
  if (!fields || fields.length === 0) {
    return obj;
  }

  const filtered: any = {};
  fields.forEach(field => {
    if (Object.prototype.hasOwnProperty.call(obj, field)) {
      filtered[field] = obj[field];
    }
  });
  return filtered;
}
