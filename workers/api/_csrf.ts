/**
 * CSRF Protection Middleware
 * Validates CSRF tokens on state-changing operations
 */

import type { PagesFunction, Env } from './_types';
import { unauthorizedResponse } from './_utils';
import crypto from 'crypto';

const CSRF_HEADER = 'X-CSRF-Token';
const STATE_CHANGING_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomUUID();
}

/**
 * CSRF validation middleware
 * Must be used after authentication middleware (requires session)
 */
export function withCSRF(context: any, next: Function) {
  const { request } = context;
  const method = request.method.toUpperCase();
  
  // Skip CSRF check for safe methods
  if (!STATE_CHANGING_METHODS.includes(method)) {
    return next(context);
  }
  
  // Get CSRF token from header
  const tokenFromHeader = request.headers.get(CSRF_HEADER);
  
  // Get expected token from session
  const expectedToken = context.data?.session?.csrf_token;
  
  // Validate
  if (!tokenFromHeader || !expectedToken || tokenFromHeader !== expectedToken) {
    return unauthorizedResponse('Invalid or missing CSRF token');
  }
  
  return next(context);
}

/**
 * Helper to add CSRF token to session during login
 */
export async function setCSRFTokenInSession(
  env: Env,
  sessionId: string
): Promise<string> {
  const csrfToken = generateCSRFToken();
  
  await env.DB.prepare(
    'UPDATE sessions SET csrf_token = ? WHERE session_id = ?'
  ).bind(csrfToken, sessionId).run();
  
  return csrfToken;
}
