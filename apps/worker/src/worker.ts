/**
 * Cloudflare Worker - Main Entry Point
 * Handles API routes from api/ and serves static assets
 *
 * Uses registry-based routing for automatic endpoint discovery
 * Version: 2026-02-05-v2 (Force cache refresh)
 */

import type { Env } from './core/types';
import { corsHeaders, setAllowedOrigins } from '@guild/shared-utils/response';

// Import route registrar (auto-initializes all routes)
import './core/route-registrar';
import { matchRoute } from './core/route-loader';

// WebSocket Durable Object
export { ConnectionManager } from './websocket/ConnectionManager';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Configure CORS origins from environment
    if (env.ALLOWED_ORIGINS) {
      setAllowedOrigins(env.ALLOWED_ORIGINS);
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle WebSocket upgrade requests
    if (pathname === '/api/ws') {
      const upgradeHeader = request.headers.get('Upgrade');
      if (upgradeHeader === 'websocket') {
        // Get Durable Object ID (use a fixed ID or shard by user)
        const id = env.CONNECTIONS.idFromName('guild-main');
        const stub = env.CONNECTIONS.get(id);
        return stub.fetch(request);
      }
      return new Response('Expected WebSocket', { status: 426 });
    }

    // Handle API routes
    if (pathname.startsWith('/api/')) {
      const method = request.method.toUpperCase();
      const origin = request.headers.get('Origin');

      // Use registry-based route matching
      const routeMatch = matchRoute(pathname);

      if (!routeMatch) {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'API endpoint does not exist',
            },
            meta: {
              path: pathname,
              method,
              timestamp: new Date().toISOString(),
            },
          }),
          {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders(origin),
            },
          }
        );
      }

      const { handler, params, path } = routeMatch;

      // Handle API OPTIONS preflight with route-aware Allow header
      if (method === 'OPTIONS') {
        const allowedMethods = Object.keys(handler)
          .filter(k => k.startsWith('onRequest'))
          .map(k => k.replace('onRequest', '').toUpperCase());

        return new Response(null, {
          status: 204,
          headers: {
            ...corsHeaders(origin),
            'Allow': [...allowedMethods, 'OPTIONS'].join(', '),
          },
        });
      }

      // Map HTTP methods to handler functions
      let handlerFn;
      switch (method) {
        case 'GET':
          handlerFn = handler.onRequestGet;
          break;
        case 'POST':
          handlerFn = handler.onRequestPost;
          break;
        case 'PUT':
          handlerFn = handler.onRequestPut;
          break;
        case 'PATCH':
          handlerFn = handler.onRequestPatch;
          break;
        case 'DELETE':
          handlerFn = handler.onRequestDelete;
          break;
      }

      if (!handlerFn) {
        const allowedMethods = Object.keys(handler)
          .filter(k => k.startsWith('onRequest'))
          .map(k => k.replace('onRequest', '').toUpperCase());

        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'METHOD_NOT_ALLOWED',
              message: `Method ${method} does not exist for this API endpoint`,
            },
            meta: {
              path: pathname,
              method,
              allowedMethods,
            },
          }),
          {
            status: 405,
            headers: {
              'Content-Type': 'application/json',
              'Allow': [...allowedMethods, 'OPTIONS'].join(', '),
              ...corsHeaders(origin),
            },
          }
        );
      }

      // Create context object matching Pages Functions signature
      const context = {
        request,
        env,
        params,
        waitUntil: ctx.waitUntil.bind(ctx),
        passThroughOnException: () => {},
        next: async (_input?: Request | string, _init?: RequestInit) => new Response(null, { status: 404 }),
        functionPath: path, // Use matched pattern path
        data: {},
      };

      try {
        const rawResponse = await handlerFn(context);
        const response = new Response(rawResponse.body, rawResponse);
        const cors = corsHeaders(origin);
        Object.entries(cors).forEach(([k, v]) => response.headers.set(k, v));
        return response;
      } catch (error) {
        console.error('[Worker] API handler error:', {
          path: pathname,
          method,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        const origin = request.headers.get('Origin');
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: 'An internal error occurred',
            },
            meta: {
              timestamp: new Date().toISOString(),
            },
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders(origin),
            },
          }
        );
      }
    }

    // Handle non-API OPTIONS preflight
    if (request.method === 'OPTIONS') {
      const origin = request.headers.get('Origin');
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    // For non-API routes, serve static assets
    // The "single-page-application" mode in wrangler.toml automatically
    // serves index.html for non-asset routes, so we just pass through
    return env.ASSETS.fetch(request);
  },
};
