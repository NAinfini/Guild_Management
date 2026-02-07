/**
 * Signup endpoint
 * POST /api/auth/signup
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env, User } from '../../core/types';
import { createEndpoint } from '../../core/endpoint-factory';
import { generateId, utcNow, hashPassword, createAuditLog } from '../../core/utils';
import { checkRateLimit, getRateLimitKey } from '../../core/middleware';
import { validateBody, signupSchema } from '../../core/validation';

// ============================================================
// Types
// ============================================================

interface SignupBody {
  username: string;
  password: string;
  wechatName?: string;
}

interface SignupResponse {
  user: {
    user_id: string;
    username: string;
    wechat_name: string | null;
    role: string;
    power: number;
    is_active: number;
  };
  message: string;
}

// ============================================================
// POST /api/auth/signup
// ============================================================

export const onRequestPost = createEndpoint<SignupResponse, SignupBody>({
  auth: 'none',
  cacheControl: 'no-store',
  rateLimit: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 3 attempts per hour
  },

  parseBody: (body) => {
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      throw new Error(JSON.stringify({ errors: validation.error.issues }));
    }
    return validation.data;
  },

  handler: async ({ env, body, request }) => {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request, 'signup');
    if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) {
      throw new Error('Too many signup attempts. Please try again later.');
    }

    // Check if username already exists
    const existingUser = await env.DB
      .prepare('SELECT user_id FROM users WHERE username = ?')
      .bind(body.username)
      .first();

    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Create user
    const userId = generateId('usr');
    const now = utcNow();
    const { hash, salt } = await hashPassword(body.password);

    await env.DB.batch([
      env.DB
        .prepare(`
          INSERT INTO users (
            user_id, username, wechat_name, role, power, is_active,
            created_at_utc, updated_at_utc
          ) VALUES (?, ?, ?, 'member', 0, 1, ?, ?)
        `)
        .bind(userId, body.username, body.wechatName || null, now, now),
      env.DB
        .prepare(`
          INSERT INTO user_auth_password (
            user_id, password_hash, salt, created_at_utc, updated_at_utc
          ) VALUES (?, ?, ?, ?, ?)
        `)
        .bind(userId, hash, salt, now, now),
    ]);

    // Create audit log
    await createAuditLog(
      env.DB,
      'user',
      'signup',
      null,
      userId,
      `User signed up: ${body.username}`,
      JSON.stringify({ username: body.username })
    );

    const user = await env.DB
      .prepare('SELECT * FROM users WHERE user_id = ?')
      .bind(userId)
      .first<User>();

    return {
      user: {
        user_id: user!.user_id,
        username: user!.username,
        wechat_name: user!.wechat_name,
        role: user!.role,
        power: user!.power,
        is_active: user!.is_active,
      },
      message: 'Account created successfully. Please log in.',
    };
  },
});
