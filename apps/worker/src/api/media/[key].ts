/**
 * Media Retrieval Endpoint
 * GET /api/media/[key] - Get media object from R2
 * 
 * Migrated to use createEndpoint for consistency, even if it returns raw response
 */

import type { Env } from '../../core/types';
import { createEndpoint } from '../../core/endpoint-factory';
import { NotFoundError } from '../../core/errors';

// ============================================================
// GET /api/media/[key]
// ============================================================

export const onRequestGet = createEndpoint<Response, any, any>({
  auth: 'none', // Public access usually, or optional? Public for media.
  
  handler: async ({ env, params }) => {
    const key = decodeURIComponent(params.key);

    const object = await env.BUCKET.get(key);

    if (!object) {
      throw new NotFoundError('Object');
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new Response(object.body, {
      headers,
    });
  },
});
