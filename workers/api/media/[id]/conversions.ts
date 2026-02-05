/**
 * Media Conversion Status API
 * GET /media/:id/conversions - Get conversion status for specific media
 * POST /media/:id/conversions/retry - Retry failed conversion
 */

import { createEndpoint } from '../../../../lib/endpoint-factory';
import { utcNow } from '../../../../../shared/utils/date';

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

/**
 * GET /media/:id/conversions - Get conversion status
 */
export const onRequestGet = createEndpoint<ConversionStatus[]>({
  auth: 'optional',
  etag: true,
  cacheControl: 'private, max-age=10',

  handler: async ({ env, params }) => {
    const mediaId = params.id;

    // Check media exists
    const media = await env.DB
      .prepare('SELECT * FROM media_objects WHERE media_id = ?')
      .bind(mediaId)
      .first();

    if (!media) {
      throw new Error('Media not found');
    }

    const conversions = await env.DB
      .prepare(
        `SELECT * FROM media_conversions
         WHERE media_id = ?
         ORDER BY created_at_utc DESC`
      )
      .bind(mediaId)
      .all();

    return (conversions.results || []).map((row: any) => ({
      conversion_id: row.conversion_id,
      media_id: row.media_id,
      target_format: row.target_format,
      status: row.status,
      progress_percent: row.progress_percent,
      error_message: row.error_message,
      created_at_utc: row.created_at_utc,
      updated_at_utc: row.updated_at_utc,
    }));
  },
});
