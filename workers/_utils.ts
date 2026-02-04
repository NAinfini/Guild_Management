/**
 * Utility functions for API endpoints
 */

import type { Env, ApiResponse, ApiError, User, Session, D1Database } from './_types';
import { generateETag } from './_shared';

const allowedHeaders = 'Content-Type, Authorization';
const allowedOrigins = [
  'https://guild-management.na-infini.workers.dev',
];

// ============================================================
// Response Helpers
// ============================================================

export function successResponse<T>(data: T, status = 200, origin?: string | null): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      ...corsHeaders(origin),
    },
  });
}

export function errorResponse(code: string, message: string, status = 500, details?: unknown, origin?: string | null): Response {
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
      'Cache-Control': 'no-cache',
      ...corsHeaders(origin),
    },
  });
}

export function notFoundResponse(resource: string, origin?: string | null): Response {
  return errorResponse('NOT_FOUND', `${resource} not found`, 404, undefined, origin);
}

export function unauthorizedResponse(message = 'Unauthorized', origin?: string | null): Response {
  return errorResponse('UNAUTHORIZED', message, 401, undefined, origin);
}

export function forbiddenResponse(message = 'Forbidden', origin?: string | null): Response {
  return errorResponse('FORBIDDEN', message, 403, undefined, origin);
}

export function badRequestResponse(message: string, details?: unknown, origin?: string | null): Response {
  return errorResponse('BAD_REQUEST', message, 400, details, origin);
}

export function conflictResponse(message: string, origin?: string | null): Response {
  return errorResponse('CONFLICT', message, 409, undefined, origin);
}

export function tooManyRequestsResponse(message = 'Too many requests', origin?: string | null): Response {
  return errorResponse('RATE_LIMIT_EXCEEDED', message, 429, undefined, origin);
}

// ============================================================
// Database Helpers
// ============================================================

export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${timestamp}${random}`;
}

export function utcNow(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

export async function getUser(db: D1Database, userId: string): Promise<User | null> {
  const result = await db
    .prepare('SELECT * FROM users WHERE user_id = ? AND deleted_at_utc IS NULL')
    .bind(userId)
    .first<User>();
  return result;
}

export async function getSession(db: D1Database, sessionId: string): Promise<Session | null> {
  const result = await db
    .prepare(`
      SELECT * FROM sessions 
      WHERE session_id = ? 
        AND revoked_at_utc IS NULL 
        AND expires_at_utc > datetime('now')
    `)
    .bind(sessionId)
    .first<Session>();
  return result;
}

export async function createAuditLog(
  db: D1Database,
  entityType: string,
  action: string,
  actorId: string | null,
  entityId: string,
  diffTitle?: string,
  detailText?: string
): Promise<void> {
  const auditId = generateId('aud');
  const now = utcNow();

  await db
    .prepare(`
      INSERT INTO audit_log (
        audit_id, entity_type, action, actor_id, entity_id, 
        diff_title, detail_text, created_at_utc, updated_at_utc
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(auditId, entityType, action, actorId, entityId, diffTitle, detailText, now, now)
    .run();
}

// ============================================================
// Authentication Helpers
// ============================================================

export async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  // NOTE: Lightweight SHA-256 + salt for compatibility. Replace with bcrypt/scrypt/argon2 in production.
  const useSalt = salt || crypto.randomUUID();
  const encoder = new TextEncoder();
  const data = encoder.encode(`${useSalt}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return { hash, salt: useSalt };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const { hash: testHash } = await hashPassword(password, salt);
  return testHash === hash;
}

export function getCookieValue(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const cookie = cookies.find(c => c.startsWith(`${name}=`));
  if (!cookie) return null;

  return cookie.substring(name.length + 1);
}

export function setSessionCookie(response: Response, sessionId: string, maxAge: number): Response {
  const newResponse = new Response(response.body, response);
  newResponse.headers.set(
    'Set-Cookie',
    `session_id=${sessionId}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${maxAge}`
  );
  return newResponse;
}

export function clearSessionCookie(response: Response): Response {
  const newResponse = new Response(response.body, response);
  newResponse.headers.set(
    'Set-Cookie',
    'session_id=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0'
  );
  return newResponse;
}

// ============================================================
// Validation Helpers
// ============================================================

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUsername(username: string): boolean {
  // 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, use a proper library
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
}

export function validateVideoUrl(url: string): boolean {
  const whitelist = ['youtube.com', 'youtu.be', 'bilibili.com', 'vimeo.com'];
  try {
    const urlObj = new URL(url);
    return whitelist.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

/**
 * Parses multiple values from a query parameter.
 * Supports both comma-separated values (?ids=1,2,3) 
 * and multiple parameter instances (?id=1&id=2&id=3).
 */
export function getMultiQueryParam(request: Request, name: string): string[] {
  const url = new URL(request.url);
  const params = url.searchParams;
  
  // Try getting all instances of the parameter
  const values = params.getAll(name);
  if (values.length > 0) {
    // If any value contains a comma, split it
    return values.flatMap(v => v.split(',')).map(v => v.trim()).filter(Boolean);
  }
  
  // Try singular version + 's' (e.g., if asking for 'id', also look for 'ids')
  const pluralValues = params.getAll(name + 's');
  if (pluralValues.length > 0) {
    return pluralValues.flatMap(v => v.split(',')).map(v => v.trim()).filter(Boolean);
  }

  return [];
}

// ============================================================
// Permission Helpers
// ============================================================

export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

export function isModerator(user: User | null): boolean {
  return user?.role === 'moderator' || user?.role === 'admin';
}

export function canEditEntity(user: User | null, createdBy: string | null): boolean {
  if (!user) return false;
  if (isAdmin(user) || isModerator(user)) return true;
  return user.user_id === createdBy;
}

// ============================================================
// ETag Helpers
// ============================================================

export function checkETag(request: Request, data: unknown): Response | null {
  const etag = generateETag(data);
  const ifNoneMatch = request.headers.get('If-None-Match');

  if (ifNoneMatch === etag) {
    return new Response(null, {
      status: 304,
      headers: { 'ETag': etag },
    });
  }

  return null;
}

export function addETag(response: Response, data: unknown): Response {
  const etag = generateETag(data);
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('ETag', etag);
  return newResponse;
}

// Generate a weak ETag from an updated_at timestamp string (UTC ISO).
export function etagFromTimestamp(updatedAtUtc: string | null | undefined): string {
  if (!updatedAtUtc) return '';
  return `W/"${updatedAtUtc}"`;
}

// Enforce If-Match header when updating resources; throws Response if mismatch.
export function assertIfMatch(request: Request, currentUpdatedAtUtc: string | null | undefined): void {
  const ifMatch = request.headers.get('If-Match');
  const currentEtag = etagFromTimestamp(currentUpdatedAtUtc);
  if (ifMatch && currentEtag && ifMatch !== currentEtag) {
    throw conflictResponse('Resource has been modified. Please refresh and retry.');
  }
}

// ============================================================
// CORS Helpers
// ============================================================

export function corsHeaders(origin?: string | null): HeadersInit {
  const normalizedOrigin = origin && origin !== 'null' ? origin : '';
  const allowOrigin = allowedOrigins.includes(normalizedOrigin)
    ? normalizedOrigin
    : 'https://guild-management.na-infini.workers.dev';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': allowedHeaders,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export function handleCors(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('Origin');
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }
  return null;
}
