/**
 * Shared Response Utilities
 * Provides consistent response formatting, headers, and CORS for server-side endpoints
 *
 * All API endpoints should use these utilities to ensure:
 * - Consistent response format (ApiResponse<T>)
 * - Proper cache headers
 * - Origin-based CORS validation
 * - ETag support for caching
 */

import { generateWeakETag } from './etag';

// ============================================================
// Types
// ============================================================

/**
 * Standard API response format
 * Used by all endpoints to ensure consistent structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta: {
    timestamp: string;
    pagination?: PaginationMeta;
  };
}

/**
 * Standard error format
 */
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Pagination metadata for list endpoints
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

/**
 * Options for response generation
 */
export interface ResponseOptions {
  /** ETag value (string) or auto-generate (true) */
  etag?: string | boolean;
  /** Cache-Control max-age in seconds (default: 60 for GET, 0 for mutations) */
  maxAge?: number;
  /** HTTP method (determines default caching behavior) */
  method?: string;
  /** Origin for CORS headers */
  origin?: string | null;
  /** Pagination metadata for list endpoints */
  pagination?: PaginationMeta;
  /** Rate limit metadata for rate-limited endpoints */
  rateLimit?: {
    remaining: number;
    resetAt: number;
    limit: number;
  };
}

// ============================================================
// CORS Configuration
// ============================================================

/**
 * Allowed origins for CORS
 * Add development/staging origins as needed
 */
const ALLOWED_ORIGINS = [
  'https://guild-management.na-infini.workers.dev',
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // Alternative dev port
];

/**
 * Allowed HTTP headers for CORS
 */
const ALLOWED_HEADERS = 'Content-Type, Authorization, If-None-Match, If-Match';

/**
 * Generate CORS headers with origin validation
 *
 * Implements origin-based access control:
 * - If origin is in allowlist → use origin
 * - Otherwise → use default production origin
 *
 * @param origin - Origin from request headers
 * @returns CORS headers object
 */
export function corsHeaders(origin?: string | null): HeadersInit {
  // Normalize origin (handle null string and undefined)
  const normalizedOrigin = origin && origin !== 'null' ? origin : '';

  // Check if origin is allowed
  const allowOrigin = ALLOWED_ORIGINS.includes(normalizedOrigin)
    ? normalizedOrigin
    : ALLOWED_ORIGINS[0]; // Default to production

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': ALLOWED_HEADERS,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Vary': 'Origin', // Important for caching with multiple origins
  };
}

// ============================================================
// Response Generators
// ============================================================

/**
 * Create a standardized success response
 *
 * Automatically handles:
 * - Response wrapping in ApiResponse<T> format
 * - ETag generation and headers
 * - Cache-Control based on HTTP method
 * - CORS headers
 * - Pagination metadata
 *
 * @param data - Response data (will be wrapped in ApiResponse.data)
 * @param status - HTTP status code (default: 200)
 * @param options - Response options (etag, caching, CORS, pagination)
 * @returns Response object with proper headers
 *
 * @example
 * // Simple success response
 * return successResponse({ id: 1, name: 'Alice' });
 *
 * @example
 * // With ETag and custom caching
 * return successResponse(data, 200, {
 *   etag: true,
 *   maxAge: 300, // 5 minutes
 *   origin: request.headers.get('Origin'),
 * });
 *
 * @example
 * // With pagination
 * return successResponse(items, 200, {
 *   pagination: {
 *     page: 1,
 *     pageSize: 50,
 *     total: 150,
 *     hasMore: true,
 *   },
 * });
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  options: ResponseOptions = {}
): Response {
  const {
    etag,
    maxAge,
    method = 'GET',
    origin,
    pagination,
    rateLimit,
  } = options;

  // Build response payload
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...(pagination && { pagination }),
    },
  };

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...corsHeaders(origin),
  };

  // Add ETag if requested
  if (etag) {
    const etagValue = typeof etag === 'string'
      ? etag
      : generateWeakETag(data);
    headers['ETag'] = etagValue;
  }

  // Set Cache-Control based on method
  if (method === 'GET' || method === 'HEAD') {
    // GET/HEAD: cacheable with max-age
    const cacheMaxAge = maxAge !== undefined ? maxAge : 60; // Default 60s
    headers['Cache-Control'] = `public, max-age=${cacheMaxAge}, must-revalidate`;
  } else {
    // POST/PUT/DELETE/PATCH: no caching
    headers['Cache-Control'] = 'no-store';
  }

  // Add rate limit headers if provided
  if (rateLimit) {
    headers['RateLimit-Limit'] = String(rateLimit.limit);
    headers['RateLimit-Remaining'] = String(rateLimit.remaining);
    headers['RateLimit-Reset'] = new Date(rateLimit.resetAt).toISOString();
  }

  return new Response(JSON.stringify(response), {
    status,
    headers,
  });
}

/**
 * Create a standardized error response
 *
 * @param code - Error code (e.g., 'NOT_FOUND', 'UNAUTHORIZED')
 * @param message - Human-readable error message
 * @param status - HTTP status code (default: 500)
 * @param details - Additional error details (optional)
 * @param origin - Origin for CORS headers (optional)
 * @returns Response object with error payload
 *
 * @example
 * return errorResponse('NOT_FOUND', 'Resource not found', 404);
 *
 * @example
 * // With validation details
 * return errorResponse('BAD_REQUEST', 'Validation failed', 400, {
 *   fields: { email: 'Invalid email format' }
 * });
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 500,
  details?: unknown,
  origin?: string | null
): Response {
  const error: ApiError = { code, message, details };
  const response: ApiResponse = {
    success: false,
    error,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store', // Never cache errors
      ...corsHeaders(origin),
    },
  });
}

// ============================================================
// Convenience Error Responses
// ============================================================

/**
 * 404 Not Found response
 */
export function notFoundResponse(
  resource: string,
  origin?: string | null
): Response {
  return errorResponse(
    'NOT_FOUND',
    `${resource} not found`,
    404,
    undefined,
    origin
  );
}

/**
 * 401 Unauthorized response
 */
export function unauthorizedResponse(
  message = 'Unauthorized',
  origin?: string | null
): Response {
  return errorResponse('UNAUTHORIZED', message, 401, undefined, origin);
}

/**
 * 403 Forbidden response
 */
export function forbiddenResponse(
  message = 'Forbidden',
  origin?: string | null
): Response {
  return errorResponse('FORBIDDEN', message, 403, undefined, origin);
}

/**
 * 400 Bad Request response
 */
export function badRequestResponse(
  message: string,
  details?: unknown,
  origin?: string | null
): Response {
  return errorResponse('BAD_REQUEST', message, 400, details, origin);
}

/**
 * 409 Conflict response
 */
export function conflictResponse(
  message: string,
  origin?: string | null
): Response {
  return errorResponse('CONFLICT', message, 409, undefined, origin);
}

/**
 * 429 Too Many Requests response
 */
export function tooManyRequestsResponse(
  message = 'Too many requests',
  origin?: string | null
): Response {
  return errorResponse('RATE_LIMIT_EXCEEDED', message, 429, undefined, origin);
}

/**
 * 422 Unprocessable Entity response
 * Used for validation errors with structured field-level details
 */
export function validationErrorResponse(
  errors: Array<{ field: string; message: string; code?: string }>,
  origin?: string | null
): Response {
  return errorResponse(
    'VALIDATION_ERROR',
    'Request validation failed',
    422,
    { errors },
    origin
  );
}

/**
 * 412 Precondition Failed response
 * Used when If-Match or If-Unmodified-Since fails
 */
export function preconditionFailedResponse(
  message = 'Precondition failed',
  origin?: string | null
): Response {
  return errorResponse(
    'PRECONDITION_FAILED',
    message,
    412,
    undefined,
    origin
  );
}

// ============================================================
// Special Response Types
// ============================================================

/**
 * 304 Not Modified response
 * Used when If-None-Match matches current ETag
 *
 * @param etag - Current ETag value
 * @returns 304 response with ETag header
 *
 * @example
 * const ifNoneMatch = request.headers.get('If-None-Match');
 * if (ifNoneMatch === currentETag) {
 *   return notModifiedResponse(currentETag);
 * }
 */
export function notModifiedResponse(etag: string): Response {
  return new Response(null, {
    status: 304,
    headers: {
      'ETag': etag,
      'Cache-Control': 'public, max-age=60, must-revalidate',
    },
  });
}

/**
 * 204 No Content response
 * Used for successful mutations with no response body
 *
 * @param origin - Origin for CORS headers (optional)
 * @returns 204 response with CORS headers
 *
 * @example
 * // DELETE endpoint
 * await deleteResource(id);
 * return noContentResponse(request.headers.get('Origin'));
 */
export function noContentResponse(origin?: string | null): Response {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(origin),
    },
  });
}

/**
 * Handle CORS preflight (OPTIONS) request
 *
 * @param request - Request object
 * @returns 204 response with CORS headers or null if not OPTIONS
 *
 * @example
 * const corsResponse = handleCorsPreflightRequest(request);
 * if (corsResponse) return corsResponse;
 */
export function handleCorsPreflightRequest(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('Origin');
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }
  return null;
}

// ============================================================
// Utilities
// ============================================================

/**
 * Parse Cache-Control max-age from header value
 *
 * @param cacheControl - Cache-Control header value
 * @returns max-age in seconds or undefined
 *
 * @example
 * parseCacheControlMaxAge('public, max-age=300');
 * // Returns: 300
 */
export function parseCacheControlMaxAge(cacheControl: string): number | undefined {
  const match = cacheControl.match(/max-age=(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

/**
 * Add origin to allowed origins list (for development/testing)
 * Not recommended for production - use environment config instead
 *
 * @param origin - Origin to allow
 */
export function addAllowedOrigin(origin: string): void {
  if (!ALLOWED_ORIGINS.includes(origin)) {
    ALLOWED_ORIGINS.push(origin);
  }
}

/**
 * Get list of allowed origins (for debugging)
 */
export function getAllowedOrigins(): readonly string[] {
  return Object.freeze([...ALLOWED_ORIGINS]);
}
