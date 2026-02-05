/**
 * Media Conversion Retry API
 * POST /media/:id/conversions/retry - Retry failed conversion
 */

import { createEndpoint } from '../../../../lib/endpoint-factory';
import { utcNow } from '../../../../lib/utils';

interface RetryConversionResponse {
  message: string;
  conversion_id: string;
  status: string;
}

/**
 * POST /media/:id/conversions/retry - Retry failed conversion
 */
export const onRequestPost = createEndpoint<RetryConversionResponse>({
  auth: 'admin', // Only admins can retry conversions
  cacheControl: 'no-store',

  handler: async ({ env, params }) => {
    const mediaId = params.id;

    // Find failed conversion for this media
    const failedConversion = await env.DB
      .prepare(
        `SELECT * FROM media_conversions
         WHERE media_id = ? AND status = 'failed'
         ORDER BY created_at_utc DESC
         LIMIT 1`
      )
      .bind(mediaId)
      .first<any>();

    if (!failedConversion) {
      throw new Error('No failed conversion found for this media');
    }

    const now = utcNow();

    // Reset conversion to pending status
    await env.DB
      .prepare(
        `UPDATE media_conversions
         SET status = 'pending',
             progress_percent = 0,
             error_message = NULL,
             updated_at_utc = ?
         WHERE conversion_id = ?`
      )
      .bind(now, failedConversion.conversion_id)
      .run();

    // Note: Actual conversion processing would be triggered by a background worker
    // This just resets the status to allow retry

    return {
      message: 'Conversion queued for retry',
      conversion_id: failedConversion.conversion_id,
      status: 'pending',
    };
  },
});
