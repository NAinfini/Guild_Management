/**
 * Members List API
 * GET /api/members - List all members with optional filters
 */

import type { PagesFunction, Env, User } from '../_types';
import { successResponse, errorResponse, etagFromTimestamp } from '../_utils';
import { withOptionalAuth } from '../_middleware';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withOptionalAuth(context, async (authContext) => {
    const { env, request } = authContext;

    try {
      const url = new URL(request.url);
      const includeInactive = url.searchParams.get('includeInactive') === 'true';
      const role = url.searchParams.get('role');

      let query = 'SELECT * FROM users WHERE deleted_at_utc IS NULL';
      const params: any[] = [];

      if (!includeInactive) {
        query += ' AND is_active = 1';
      }

      if (role) {
        query += ' AND role = ?';
        params.push(role);
      }

      query += ' ORDER BY username ASC';

      const result = await env.DB.prepare(query).bind(...params).all<User>();

      // Get additional data for each member
      const membersWithData = await Promise.all(
        (result.results || []).map(async (user) => {
          // Get profile
          const profile = await env.DB
            .prepare('SELECT * FROM member_profiles WHERE user_id = ?')
            .bind(user.user_id)
            .first<{ title_html?: string }>();

          // Get classes
          const classes = await env.DB
            .prepare('SELECT class_code FROM member_classes WHERE user_id = ? ORDER BY sort_order')
            .bind(user.user_id)
            .all<{ class_code: string }>();

          // Get media count
          const mediaCount = await env.DB
            .prepare('SELECT COUNT(*) as count FROM member_media WHERE user_id = ?')
            .bind(user.user_id)
            .first<{ count: number }>();

          return {
            user_id: user.user_id,
            username: user.username,
            wechat_name: user.wechat_name,
            role: user.role,
            power: user.power,
            is_active: user.is_active, // Keep raw 0/1 or boolean? Client DTO says number.
            title_html: profile?.title_html || null,
            classes: classes.results?.map(c => c.class_code) || [],
            media_count: mediaCount?.count || 0,
            created_at_utc: user.created_at_utc,
            updated_at_utc: user.updated_at_utc,
          };
        })
      );

      const maxUpdated = (membersWithData as any[]).reduce((max, m) => {
        const ts = (m as any).updatedAt || (m as any).createdAt;
        return ts && (!max || ts > max) ? ts : max;
      }, null as string | null);
      
      const etag = etagFromTimestamp(maxUpdated);
      return successResponse({ members: membersWithData }, 200, { 
        etag: etag ||undefined, 
        method: 'GET',
        maxAge: 30 // Cache for 30 seconds - member data changes frequently
      });
    } catch (error) {
      console.error('List members error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while fetching members', 500);
    }
  });
};
