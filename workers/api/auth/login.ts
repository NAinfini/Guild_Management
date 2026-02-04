/**
 * Authentication API endpoints
 * POST /api/auth/login - Login
 * POST /api/auth/logout - Logout
 * GET /api/auth/session - Get current session
 * POST /api/auth/change-password - Change password
 */

import type { PagesFunction } from '../_types';
import type { Env, User } from '../_types';
import {
  successResponse,
  errorResponse,
  badRequestResponse,
  unauthorizedResponse,
  tooManyRequestsResponse,
  generateId,
  utcNow,
  hashPassword,
  verifyPassword,
  setSessionCookie,
  clearSessionCookie,
} from '../_utils';
import { withAuth, checkRateLimit, getRateLimitKey } from '../_middleware';
import { validateBody, loginSchema, changePasswordSchema } from '../_validation';

// ============================================================
// POST /api/auth/login
// ============================================================

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Rate limiting: 5 attempts per 15 minutes
  const rateLimitKey = getRateLimitKey(request, 'login');
  if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
    return tooManyRequestsResponse('Too many login attempts. Please try again later.');
  }

  // Validate request body
  const validation = await validateBody(request, loginSchema);
  if (!validation.success) {
    return badRequestResponse('Validation failed', { errors: validation.error.format() });
  }

  const { username, password, rememberMe } = validation.data;

  try {
    // Get user by username
    const user = await env.DB
      .prepare('SELECT * FROM users WHERE username = ? AND deleted_at IS NULL')
      .bind(username)
      .first<User>();

    if (!user) {
      return unauthorizedResponse('Incorrect credentials');
    }

    if (!user.is_active) {
      return unauthorizedResponse('Account is inactive');
    }

    // Get password hash
    const authRecord = await env.DB
      .prepare('SELECT password_hash, salt FROM user_auth_password WHERE user_id = ?')
      .bind(user.user_id)
      .first<{ password_hash: string; salt: string }>();

    if (!authRecord) {
      return unauthorizedResponse('Incorrect credentials');
    }

    // Verify password
    const computed = authRecord.salt
      ? await hashPassword(password, authRecord.salt)
      : { hash: '', salt: '' };
    const isValid = (computed.hash && computed.hash === authRecord.password_hash) || password === authRecord.password_hash;
    if (!isValid) {
      return unauthorizedResponse('Incorrect credentials');
    }

    // Create session
    const sessionId = generateId('ses');
    const now = utcNow();
    // If "Stay logged in" is checked (rememberMe = true), session lasts 30 days
    // Otherwise, session lasts 1 day
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day
    const expiresAt = new Date(Date.now() + maxAge * 1000).toISOString().replace('T', ' ').substring(0, 19);

    const userAgent = request.headers.get('User-Agent') || null;
    const ip = request.headers.get('CF-Connecting-IP') || null;
    const ipHash = ip ? await hashIp(ip) : null;

    await env.DB
      .prepare(`
        INSERT INTO sessions (
          session_id, user_id, created_at_utc, last_used_at_utc, 
          expires_at_utc, user_agent, ip_hash, updated_at_utc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(sessionId, user.user_id, now, now, expiresAt, userAgent, ipHash, now)
      .run();

    // Return user data (without sensitive fields)
    const userData = {
      userId: user.user_id,
      username: user.username,
      wechatName: user.wechat_name,
      role: user.role,
      power: user.power,
    };

    const response = successResponse({ user: userData, sessionId });
    return setSessionCookie(response, sessionId, maxAge);
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('INTERNAL_ERROR', 'An error occurred during login', 500);
  }
};

// ============================================================
// Helper: Hash IP address for privacy
// ============================================================

async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
