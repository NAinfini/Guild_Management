/**
 * Session validation endpoint
 * GET /api/auth/session
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env, User, Session } from '../../lib/types';
import { createEndpoint } from '../../lib/endpoint-factory';

// ============================================================
// Types
// ============================================================

interface SessionResponse {
  user: {
    user_id: string;
    username: string;
    wechat_name: string | null;
    role: string;
    power: number;
    is_active: number;
  } | null;
  csrfToken: string | null;
}

// ============================================================
// GET /api/auth/session
// ============================================================

export const onRequestGet = createEndpoint<SessionResponse>({
  auth: 'optional',
  cacheControl: 'no-store', // Never cache session data

  handler: async ({ user, session, isAuthenticated }) => {
    if (!isAuthenticated || !user) {
      // Guest session - return null user but success (allows portal access)
      return {
        user: null,
        csrfToken: session?.csrf_token || null,
      };
    }

    // Return user data and CSRF token
    const userData = {
      user_id: user.user_id,
      username: user.username,
      wechat_name: user.wechat_name,
      role: user.role,
      power: user.power,
      is_active: user.is_active,
    };

    return {
      user: userData,
      csrfToken: session?.csrf_token || null,
    };
  },
});
