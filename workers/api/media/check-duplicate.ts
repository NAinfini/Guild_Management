/**
 * Media Deduplication Check API
 * GET /media/check-duplicate - Check if media with given SHA-256 hash already exists
 *
 * Useful for client-side deduplication before upload
 */

import { createEndpoint } from '../../lib/endpoint-factory';

interface DuplicateCheckQuery {
  sha256: string;
}

interface DuplicateCheckResponse {
  exists: boolean;
  media_id?: string;
  storage_type?: string;
  created_at_utc?: string;
}

/**
 * GET /media/check-duplicate - Check for duplicate media by SHA-256 hash
 */
export const onRequestGet = createEndpoint<DuplicateCheckResponse, DuplicateCheckQuery>({
  auth: 'required', // Must be authenticated to check for duplicates
  etag: true,
  cacheControl: 'private, max-age=300', // Cache for 5 minutes

  parseQuery: (searchParams) => {
    const sha256 = searchParams.get('sha256');
    if (!sha256) {
      throw new Error('sha256 query parameter is required');
    }
    return { sha256 };
  },

  handler: async ({ env, query }) => {
    const { sha256 } = query;

    // Validate SHA-256 format (64 hexadecimal characters)
    if (!/^[a-fA-F0-9]{64}$/.test(sha256)) {
      throw new Error('Invalid SHA-256 hash format. Must be 64 hexadecimal characters');
    }

    // Check if media with this hash exists
    const existing = await env.DB
      .prepare(
        `SELECT media_id, storage_type, created_at_utc
         FROM media_objects
         WHERE sha256 = ?
         LIMIT 1`
      )
      .bind(sha256.toLowerCase()) // Normalize to lowercase
      .first<any>();

    if (existing) {
      return {
        exists: true,
        media_id: existing.media_id,
        storage_type: existing.storage_type,
        created_at_utc: existing.created_at_utc,
      };
    }

    return {
      exists: false,
    };
  },
});
