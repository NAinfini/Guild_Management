/**
 * Logout endpoint
 * POST /api/auth/logout
 */

import type { PagesFunction, Env } from '../_types';
import { successResponse, errorResponse, clearSessionCookie, getCookieValue, utcNow } from '../_utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
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
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse('INTERNAL_ERROR', 'An error occurred during logout', 500);
  }
};
