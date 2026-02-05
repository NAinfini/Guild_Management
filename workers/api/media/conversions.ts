/**
 * Media Conversions List API
 * GET /media/conversions - List all conversions (admin only)
 */

import { createEndpoint } from '../../../lib/endpoint-factory';

interface ConversionListQuery {
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  limit?: number;
  offset?: number;
}

interface ConversionStatus {
  conversion_id: string;
  media_id: string;
  target_format: 'webp' | 'opus';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress_percent: number;
  error_message: string | null;
  created_at_utc: string;
  updated_at_utc: string;
}

interface ConversionListResponse {
  conversions: ConversionStatus[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * GET /media/conversions - List all conversions (admin only)
 */
export const onRequestGet = createEndpoint<ConversionListResponse, never, ConversionListQuery>({
  auth: 'admin',
  etag: true,
  cacheControl: 'private, max-age=10',

  parseQuery: (searchParams) => ({
    status: (searchParams.get('status') as any) || undefined,
    limit: parseInt(searchParams.get('limit') || '50'),
    offset: parseInt(searchParams.get('offset') || '0'),
  }),

  handler: async ({ env, query }) => {
    const conditions: string[] = [];
    const params: any[] = [];

    // Filter by status
    if (query.status) {
      const validStatuses = ['pending', 'processing', 'completed', 'failed'];
      if (!validStatuses.includes(query.status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
      conditions.push('status = ?');
      params.push(query.status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM media_conversions ${whereClause}`;
    const countResult = await env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();
    const total = countResult?.total || 0;

    // Get paginated results
    const limit = Math.min(query.limit || 50, 100); // Max 100 per page
    const offset = query.offset || 0;

    const conversionsQuery = `
      SELECT * FROM media_conversions
      ${whereClause}
      ORDER BY created_at_utc DESC
      LIMIT ? OFFSET ?
    `;

    const conversions = await env.DB
      .prepare(conversionsQuery)
      .bind(...params, limit, offset)
      .all();

    return {
      conversions: (conversions.results || []).map((row: any) => ({
        conversion_id: row.conversion_id,
        media_id: row.media_id,
        target_format: row.target_format,
        status: row.status,
        progress_percent: row.progress_percent,
        error_message: row.error_message,
        created_at_utc: row.created_at_utc,
        updated_at_utc: row.updated_at_utc,
      })),
      total,
      limit,
      offset,
    };
  },
});
