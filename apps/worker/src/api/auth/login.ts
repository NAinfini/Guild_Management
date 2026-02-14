/**
 * Authentication API - Login
 * POST /api/auth/login
 *
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env, User } from '../../core/types';
import { createEndpoint } from '../../core/endpoint-factory';
import {
  generateId,
  utcNow,
  hashPassword,
  setSessionCookie,
  successResponse,
} from '../../core/utils';
import { checkRateLimit, getRateLimitKey } from '../../core/middleware';
import { validateBody, loginSchema } from '../../core/validation';
import { AuthenticationError, ForbiddenError } from '../../core/errors';

// ============================================================
// Types
// ============================================================

interface LoginBody {
  username: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  user: {
    user_id: string;
    username: string;
    wechat_name: string | null;
    role: string;
    power: number;
    is_active: number;
  };
  sessionId: string;
}

// ============================================================
// POST /api/auth/login
// ============================================================

export const onRequestPost = createEndpoint<LoginResponse | Response, LoginBody>({
  auth: 'none',
  cacheControl: 'no-store',
  rateLimit: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },

  parseBody: (body) => {
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      throw new Error(JSON.stringify({ errors: validation.error.issues }));
    }
    return validation.data;
  },

  handler: async ({ env, body, request }) => {
    // Rate limiting: 5 attempts per 15 minutes
    const rateLimitKey = getRateLimitKey(request, 'login');
    if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
      throw new Error('Too many login attempts. Please try again later.');
    }

    // Get user by username
    let user: User | null = null;
    try {
      user = await env.DB
        .prepare('SELECT * FROM users WHERE username = ? AND deleted_at_utc IS NULL')
        .bind(body.username)
        .first<User>();
    } catch (dbError: any) {
      console.error('Login DB Error (User Fetch):', dbError.message, dbError.stack);
      throw dbError;
    }

    if (!user) {
      throw new AuthenticationError('Incorrect credentials');
    }

    if (!user.is_active) {
      throw new ForbiddenError('Account is inactive');
    }

    // Get password hash
    let authRecord: { password_hash: string; salt: string } | null = null;
    try {
      authRecord = await env.DB
        .prepare('SELECT password_hash, salt FROM user_auth_password WHERE user_id = ?')
        .bind(user.user_id)
        .first<{ password_hash: string; salt: string }>();
    } catch (dbAuthError: any) {
      console.error('Login DB Error (Auth Record Fetch):', dbAuthError.message, dbAuthError.stack);
      throw dbAuthError;
    }

    if (!authRecord) {
      throw new AuthenticationError('Incorrect credentials');
    }

    // Verify password
    let isValid = false;
    try {
      const computed = authRecord.salt
        ? await hashPassword(body.password, authRecord.salt)
        : { hash: '', salt: '' };
      isValid = (computed.hash && computed.hash === authRecord.password_hash) || body.password === authRecord.password_hash;
    } catch (cryptoError: any) {
      console.error('Login Crypto Error:', cryptoError.message, cryptoError.stack);
      throw cryptoError;
    }

    if (!isValid) {
      throw new AuthenticationError('Incorrect credentials');
    }

    // Create session
    const sessionId = generateId('ses');
    const now = utcNow();
    // If "Stay logged in" is checked (rememberMe = true), session lasts 30 days.
    // Otherwise, session lasts 2 hours and browser cookie is non-persistent.
    const maxAge = body.rememberMe ? 30 * 24 * 60 * 60 : 2 * 60 * 60; // 30 days or 2 hours
    const expiresAt = new Date(Date.now() + maxAge * 1000).toISOString().replace('T', ' ').substring(0, 19);

    const userAgent = request.headers.get('User-Agent') || null;
    const ip = request.headers.get('CF-Connecting-IP') || null;
    let ipHash: string | null = null;
    if (ip) {
      try {
        ipHash = await hashIp(ip);
      } catch (ipHashError: any) {
        console.error('Login IP Hash Error:', ipHashError.message);
        // Continue without IP hash if it fails
      }
    }

    try {
      await env.DB
        .prepare(`
          INSERT INTO sessions (
            session_id, user_id, created_at_utc, last_used_at_utc,
            expires_at_utc, user_agent, ip_hash, updated_at_utc
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(sessionId, user.user_id, now, now, expiresAt, userAgent, ipHash, now)
        .run();
    } catch (dbSessionError: any) {
      console.error('Login DB Error (Session Insert):', dbSessionError.message, dbSessionError.stack);
      throw dbSessionError;
    }

    // Return user data (without sensitive fields)
    const userData = {
      user_id: user.user_id,
      username: user.username,
      wechat_name: user.wechat_name,
      role: user.role,
      power: user.power,
      is_active: user.is_active,
    };

    // Return response with cookie
    const response = successResponse({ user: userData, sessionId });
    const cookieMaxAge = body.rememberMe ? maxAge : undefined;
    return setSessionCookie(response, sessionId, cookieMaxAge);
  },
});

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
