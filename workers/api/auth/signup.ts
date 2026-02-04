/**
 * Member Signup API
 * POST /api/auth/signup - Create new member account
 */

import type { PagesFunction, Env } from '../_types';
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  conflictResponse,
  generateId,
  utcNow,
  hashPassword,
  validateUsername,
  setSessionCookie,
} from '../_utils';
import { validateBody, signupSchema } from '../_validation';
import { checkRateLimit, getRateLimitKey } from '../_middleware';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Rate limiting: 3 signups per hour per IP
  const rateLimitKey = getRateLimitKey(request, 'signup');
  if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) {
    return errorResponse('RATE_LIMIT', 'Too many signup attempts. Please try again later.', 429);
  }

  const validation = await validateBody(request, signupSchema);
  if (!validation.success) {
    return badRequestResponse('Invalid request body', validation.error.errors);
  }

  const { username, password, wechatName } = validation.data;

  try {
    // Validate username
    if (!validateUsername(username)) {
      return badRequestResponse('Invalid username. Must be 3-20 characters, alphanumeric and underscores only.');
    }

    // Check if username already exists
    const existing = await env.DB
      .prepare('SELECT user_id FROM users WHERE username = ?')
      .bind(username)
      .first();

    if (existing) {
      return conflictResponse('Username already taken');
    }

    const userId = generateId('usr');
    const now = utcNow();

    // Hash password
    const { hash: passwordHash, salt } = await hashPassword(password);

    // Create user
    await env.DB
      .prepare(`
        INSERT INTO users (
          user_id, username, wechat_name, role, power, is_active,
          created_at_utc, updated_at_utc
        ) VALUES (?, ?, ?, 'member', 0, 1, ?, ?)
      `)
      .bind(userId, username, wechatName || null, now, now)
      .run();

    // Create password record
    await env.DB
      .prepare(`
        INSERT INTO user_auth_password (user_id, password_hash, salt, created_at_utc, updated_at_utc)
        VALUES (?, ?, ?, ?, ?)
      `)
      .bind(userId, passwordHash, salt, now, now)
      .run();

    // Create default member profile
    await env.DB
      .prepare(`
        INSERT INTO member_profiles (user_id, created_at_utc, updated_at_utc)
        VALUES (?, ?, ?)
      `)
      .bind(userId, now, now)
      .run();

    // Create session
    const sessionId = generateId('ses');
    const maxAge = 24 * 60 * 60; // 1 day
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
      .bind(sessionId, userId, now, now, expiresAt, userAgent, ipHash, now)
      .run();

    const userData = {
      user_id: userId,
      username,
      wechat_name: wechatName,
      role: 'member',
      power: 0,
    };

    const response = successResponse({ user: userData, sessionId }, 201);
    return setSessionCookie(response, sessionId, maxAge);
  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse('INTERNAL_ERROR', 'An error occurred during signup', 500);
  }
};

async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
