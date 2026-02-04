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
      return unauthorizedResponse('No valid session');
    }

    // Return user data and CSRF token
    const userData = {
      userId: user.user_id,
      username: user.username,
      wechatName: user.wechat_name,
      role: user.role,
      power: user.power,
      isActive: user.is_active === 1,
      sessionExpiresAt: session?.expires_at_utc,
    };

    return successResponse({ 
      user: userData,
      csrfToken: session?.csrf_token || null 
    });
  });
};
