/**
 * Endpoint Factory
 * Standardized endpoint creation with built-in features:
 * - Authentication handling
 * - Request parsing and validation
 * - ETag generation and conditional requests
 * - Standardized response formatting
 * - Error handling and logging
 * - Poll/push integration hooks
 */

import type {
  EventContext,
  Env,
  RequestContext,
  PagesFunction
} from './types';
import {
  withAuth,
  withOptionalAuth,
  withAdminAuth,
  withModeratorAuth
} from './middleware';

// Import shared utilities for consistent response handling
import { generateWeakETag, matchesETag } from '../../shared/utils/etag';
import {
  successResponse,
  errorResponse,
  badRequestResponse,
  notModifiedResponse,
  tooManyRequestsResponse,
  parseCacheControlMaxAge as parseMaxAge,
} from '../../shared/utils/response';

// Import rate limiting utilities
import {
  getRateLimitConfig,
  getUserTier,
  getRateLimitKey,
  checkRateLimit,
  getRateLimitRemaining,
} from './rate-limit';

// ============================================================
// Endpoint Configuration Types
// ============================================================

export type AuthLevel = 'none' | 'optional' | 'required' | 'moderator' | 'admin';

export interface EndpointContext<TQuery = any, TBody = any> {
  env: Env;
  request: Request;
  params: Record<string, string>;
  query: TQuery;
  body: TBody | null;
  user: RequestContext['user'];
  session: RequestContext['session'];
  isAuthenticated: boolean;
  isAdmin: boolean;
  isModerator: boolean;
}

export interface EndpointConfig<TData = any, TQuery = any, TBody = any> {
  /**
   * Authentication level required for this endpoint
   * - 'none': No authentication required
   * - 'optional': Authentication is optional, user may be null
   * - 'required': User must be authenticated
   * - 'moderator': User must be moderator or admin
   * - 'admin': User must be admin
   */
  auth?: AuthLevel;

  /**
   * Handler function that processes the request
   */
  handler: (context: EndpointContext<TQuery, TBody>) => Promise<TData | Response> | TData | Response;

  /**
   * Optional query parameter parser/validator
   */
  parseQuery?: (searchParams: URLSearchParams) => TQuery;

  /**
   * Optional body parser/validator
   */
  parseBody?: (body: any) => TBody;

  /**
   * Optional ETag generator function
   * If provided, generates ETag from response data
   * If string, uses that as ETag
   * If true, auto-generates from response data
   */
  etag?: ((data: TData) => string) | string | boolean;

  /**
   * Cache-Control header value
   * Default: 'public, max-age=60, must-revalidate' for GET
   *          'no-store' for mutations
   */
  cacheControl?: string | ((method: string) => string);

  /**
   * Whether this endpoint should be registered for poll integration
   */
  pollable?: boolean;

  /**
   * Poll entity type (e.g., 'members', 'events', 'announcements')
   * Used by poll endpoint to group and filter entities
   */
  pollEntity?: string;

  /**
   * Custom response transformer
   * Allows wrapping data in a specific structure
   */
  transformResponse?: (data: TData) => any;

  /**
   * Rate limit configuration (requests per window)
   */
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

// ============================================================
// Endpoint Factory
// ============================================================

/**
 * Creates a standardized endpoint handler
 */
export function createEndpoint<TData = any, TQuery = any, TBody = any>(
  config: EndpointConfig<TData, TQuery, TBody>
): PagesFunction<unknown> {
  const {
    auth = 'none',
    handler,
    parseQuery,
    parseBody,
    etag,
    cacheControl,
    transformResponse,
  } = config;

  // Select appropriate middleware based on auth level
  const middleware = getAuthMiddleware(auth);

  return async (context: EventContext<Env, any, any>) => {
    return middleware(context, async (authContext) => {
      try {
        const { request, env, params, data: authData } = authContext;
        const method = request.method;
        const origin = request.headers.get('Origin');

        // Extract path for rate limiting from request URL
        const url = new URL(request.url);
        const path = url.pathname;

        // Check rate limit (before executing handler)
        const rateLimitConfig = getRateLimitConfig(method, path);
        if (rateLimitConfig) {
          const userTier = getUserTier(authData.user, authData.isModerator);
          const tierConfig = rateLimitConfig[userTier];
          const rateLimitKey = getRateLimitKey(request, path, authData.user?.user_id);

          if (!checkRateLimit(rateLimitKey, tierConfig.requests, tierConfig.window)) {
            const { remaining, resetAt } = getRateLimitRemaining(rateLimitKey, tierConfig.requests);
            return tooManyRequestsResponse(
              `Rate limit exceeded. Try again in ${Math.ceil((resetAt - Date.now()) / 1000)} seconds.`,
              origin
            );
          }
        }

        // Parse query parameters
        let query: TQuery = {} as TQuery;
        if (parseQuery) {
          try {
            const url = new URL(request.url);
            query = parseQuery(url.searchParams);
          } catch (error) {
            return badRequestResponse(
              'Invalid query parameters',
              error instanceof Error ? error.message : undefined
            );
          }
        }

        // Parse body for mutations
        let body: TBody | null = null;
        if (method !== 'GET' && method !== 'HEAD') {
          try {
            const rawBody = await request.json();
            body = (parseBody ? parseBody(rawBody) : rawBody) as TBody;
          } catch (error) {
            // Body is optional for some mutations (e.g., DELETE)
            if (parseBody) {
              return badRequestResponse(
                'Invalid request body',
                error instanceof Error ? error.message : undefined
              );
            }
          }
        }

        // Build endpoint context
        const endpointContext: EndpointContext<TQuery, TBody> = {
          env,
          request,
          params,
          query,
          body,
          user: authData.user,
          session: authData.session,
          isAuthenticated: authData.isAuthenticated,
          isAdmin: authData.isAdmin,
          isModerator: authData.isModerator,
        };

        // Execute handler
        let data = await handler(endpointContext);

        // If handler returns a Response, return it directly
        if (data instanceof Response) {
          return data;
        }

        // Transform response if needed
        if (transformResponse) {
          data = transformResponse(data);
        }

        // Get rate limit info for response headers
        let rateLimitInfo;
        if (rateLimitConfig) {
          const userTier = getUserTier(authData.user, authData.isModerator);
          const tierConfig = rateLimitConfig[userTier];
          const rateLimitKey = getRateLimitKey(request, path, authData.user?.user_id);
          const { remaining, resetAt } = getRateLimitRemaining(rateLimitKey, tierConfig.requests);
          rateLimitInfo = {
            limit: tierConfig.requests,
            remaining,
            resetAt,
          };
        }

        // Check ETag for conditional requests (GET only)
        if (method === 'GET' && etag) {
          const etagValue = typeof etag === 'function'
            ? etag(data)
            : typeof etag === 'string'
            ? etag
            : generateWeakETag(data);

          // Check If-None-Match header
          const ifNoneMatch = request.headers.get('If-None-Match');
          if (matchesETag(ifNoneMatch, etagValue)) {
            return notModifiedResponse(etagValue);
          }

          // Generate success response with ETag
          const cacheControlValue = typeof cacheControl === 'function'
            ? cacheControl(method)
            : cacheControl || 'public, max-age=60, must-revalidate';

          return successResponse(data, 200, {
            etag: etagValue,
            maxAge: parseMaxAge(cacheControlValue),
            method,
            origin,
            rateLimit: rateLimitInfo,
          });
        }

        // Generate success response without ETag
        const cacheControlValue = typeof cacheControl === 'function'
          ? cacheControl(method)
          : cacheControl;

        return successResponse(data, 200, {
          maxAge: cacheControlValue ? parseMaxAge(cacheControlValue) : undefined,
          method,
          origin,
          rateLimit: rateLimitInfo,
        });

      } catch (error) {
        console.error('Endpoint error:', error);

        // If error is already a Response, return it
        if (error instanceof Response) {
          return error;
        }

        // Get origin for error responses
        const origin = authContext.request.headers.get('Origin');

        // Handle known error types
        if (error instanceof Error) {
          return errorResponse(
            'INTERNAL_ERROR',
            error.message,
            500,
            undefined,
            origin
          );
        }

        return errorResponse(
          'INTERNAL_ERROR',
          'An unexpected error occurred',
          500,
          undefined,
          origin
        );
      }
    });
  };
}

// ============================================================
// Helper Functions
// ============================================================

function getAuthMiddleware(auth: AuthLevel) {
  switch (auth) {
    case 'admin':
      return withAdminAuth;
    case 'moderator':
      return withModeratorAuth;
    case 'required':
      return withAuth;
    case 'optional':
      return withOptionalAuth;
    case 'none':
    default:
      return withOptionalAuth; // Use optional auth as default for consistency
  }
}

