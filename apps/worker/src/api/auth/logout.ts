/**
 * Logout endpoint
 * POST /api/auth/logout
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../core/types';
import { createEndpoint } from '../../core/endpoint-factory';
import { getCookieValue, utcNow, clearSessionCookie, successResponse } from '../../core/utils';

// ============================================================
// Types
// ============================================================

interface LogoutResponse {
  message: string;
}

// ============================================================
// POST /api/auth/logout
// ============================================================

export const onRequestPost = createEndpoint<LogoutResponse | Response>({
  auth: 'none', // No auth required - we'll manually get session from cookie
  cacheControl: 'no-store',

  handler: async ({ env, request }) => {
    // Get session from cookie
    const sessionId = getCookieValue(request, 'session_id');

    if (sessionId) {
      // Revoke session in database
      const now = utcNow();
      await env.DB
        .prepare('UPDATE sessions SET revoked_at_utc = ?, updated_at_utc = ? WHERE session_id = ?')
        .bind(now, now, sessionId)
        .run();
    }

    // Clear cookie and return success
    const response = successResponse({ message: 'Logged out successfully' });
    return clearSessionCookie(response);
  },
});
