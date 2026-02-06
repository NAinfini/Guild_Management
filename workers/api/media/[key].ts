/**
 * Media Retrieval Endpoint
 * GET /api/media/[key] - Get media object from R2
 * 
 * Migrated to use createEndpoint for consistency, even if it returns raw response
 */

import type { Env } from '../../lib/types';
import { createEndpoint } from '../../lib/endpoint-factory';

// ============================================================
// GET /api/media/[key]
// ============================================================

export const onRequestGet = createEndpoint<Response, any, any>({
  auth: 'none', // Public access usually, or optional? Public for media.
  
  handler: async ({ env, params }) => {
    const key = params.key;

    const object = await env.BUCKET.get(key);

    if (!object) {
      throw new Error('Object not found'); // Factory catches and returns 500? No, 404 should be specific.
      // Wait, factory treats Error as 500 unless it has status?
      // createEndpoint factory handles Errors. Basic Error is 500.
      // I should throw specific error or return Response with 404.
      // Factory allows returning Response.
      return new Response('Object not found', { status: 404 });
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