/**
 * Session validation endpoint
 * GET /api/auth/session
 */

import type { PagesFunction, Env } from '../_types';
import { successResponse, unauthorizedResponse } from '../_utils';
import { withOptionalAuth } from '../_middleware';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withOptionalAuth(context, async (authContext) => {
    const { user, session, isAuthenticated } = authContext.data;

    if (!isAuthenticated || !user) {
      // Guest session - return null user but success (allows portal access)
      return successResponse({ 
        user: null, 
        csrfToken: session?.csrf_token || null 
      });
    }

    // Return user data and CSRF token
    const userData = {
      user_id: user.user_id,
      username: user.username,
      wechat_name: user.wechat_name,
      role: user.role,
      power: user.power,
      is_active: user.is_active,
      session_expires_at_utc: session?.expires_at_utc,
    };

    return successResponse({ 
      user: userData,
      csrfToken: session?.csrf_token || null 
    });
  });
};
