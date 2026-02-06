/**
 * Utility functions for API endpoints
 */

import type { Env, ApiResponse, ApiError, User, Session, D1Database } from './types';

// ============================================================
// Response Helpers
// ============================================================

interface SuccessResponseOptions {
  maxAge?: number;
  etag?: string;
  method?: string;
}

export function successResponse<T>(
  data: T, 
  status?: number, 
  options?: SuccessResponseOptions
): Response {
  const responseStatus = status || 200;
  const opts = options || {};
  
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add ETag if provided
  if (opts.etag) {
    headers['ETag'] = opts.etag;
  }

  // Add Cache-Control header based on method
  const method = opts.method || 'GET';
  if (method === 'GET') {
    const maxAge = opts.maxAge !== undefined ? opts.maxAge : 60; // Default 60 seconds for GET
    headers['Cache-Control'] = `public, max-age=${maxAge}, must-revalidate`;
  } else {
    headers['Cache-Control'] = 'no-store'; // No caching for mutations
  }

  return new Response(JSON.stringify(response), {
    status: responseStatus,
    headers,
  });
}

export function errorResponse(code: string, message: string, status = 500, details?: unknown): Response {
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
    },
  });
}

export function notFoundResponse(resource: string): Response {
  return errorResponse('NOT_FOUND', `${resource} not found`, 404);
}

export function unauthorizedResponse(message = 'Unauthorized'): Response {
  return errorResponse('UNAUTHORIZED', message, 401);
}


export function forbiddenResponse(message = 'Forbidden'): Response {
  return errorResponse('FORBIDDEN', message, 403);
}

export function badRequestResponse(message: string, details?: unknown): Response {
  return errorResponse('BAD_REQUEST', message, 400, details);
}

export function conflictResponse(message: string): Response {
  return errorResponse('CONFLICT', message, 409);
}

export function tooManyRequestsResponse(message = 'Too many requests'): Response {
  return errorResponse('RATE_LIMIT_EXCEEDED', message, 429);
}

// ============================================================
// Database Helpers
// ============================================================

// Nano ID implementation using Web Crypto API
// URL-safe alphabet (A-Za-z0-9_-)
const NANOID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';

export function generateId(prefix: string, size: number = 21): string {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);

  let id = '';
  for (let i = 0; i < size; i++) {
    // Use modulo to map random bytes to alphabet
    id += NANOID_ALPHABET[bytes[i] & 63]; // 63 = 0b111111 (6 bits)
  }

  return `${prefix}_${id}`;
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
  // NOTE: Lightweight SHA-256 + salt; replace with bcrypt/argon2 in production.
  const useSalt = salt || crypto.randomUUID();
  const encoder = new TextEncoder();
  const data = encoder.encode(`${useSalt}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
    `session_id=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`
  );
  return newResponse;
}

export function clearSessionCookie(response: Response): Response {
  const newResponse = new Response(response.body, response);
  newResponse.headers.set(
    'Set-Cookie',
    'session_id=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
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

/**
 * Generate a strong ETag from data using crypto hashing
 */
export async function generateStrongETag(data: unknown): Promise<string> {
  const str = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `"${hashHex.substring(0, 16)}"`; // Use first 16 chars for brevity
}

/**
 * Generate a weak ETag from data (fast, non-cryptographic)
 * Uses simple hash for performance
 */
export function generateETag(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `W/"${Math.abs(hash).toString(16)}"`; // Weak ETag
}

/**
 * Check If-None-Match header and return 304 if ETag matches
 */
export function checkETag(request: Request, etag: string): Response | null {
  const ifNoneMatch = request.headers.get('If-None-Match');

  if (ifNoneMatch === etag) {
    return new Response(null, {
      status: 304,
      headers: { 'ETag': etag },
    });
  }

  return null;
}

/**
 * Check If-Match header for optimistic concurrency control
 * Returns conflict response if ETag doesn't match
 */
export function checkIfMatch(request: Request, currentETag: string | null): Response | null {
  const ifMatch = request.headers.get('If-Match');
  
  if (!ifMatch || !currentETag) {
    return null; // No If-Match header or no current ETag
  }
  
  if (ifMatch !== currentETag) {
    return conflictResponse('Resource was modified by another action');
  }
  
  return null;
}

/**
 * Add ETag header to response
 */
export function addETag(response: Response, data: unknown): Response {
  const etag = generateETag(data);
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('ETag', etag);
  return newResponse;
}

/**
 * Derive weak ETag from updated_at_utc timestamp
 */
export function etagFromTimestamp(updatedAt?: string | null): string | null {
  if (!updatedAt) return null;
  return generateETag(updatedAt);
}

/**
 * Legacy alias for checkIfMatch
 * @deprecated Use checkIfMatch instead
 */
export function assertIfMatch(request: Request, currentEtag: string | null): Response | null {
  return checkIfMatch(request, currentEtag);
}

// ============================================================
// CORS Helpers
// ============================================================

export function corsHeaders(origin: string | null = '*'): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export function handleCors(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }
  return null;
}

