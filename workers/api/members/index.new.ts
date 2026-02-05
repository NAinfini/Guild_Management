/**
 * Members List API - EXAMPLE MIGRATION
 * GET /api/members - List all members with optional filters
 * 
 * This demonstrates the new endpoint factory pattern
 */

import type { Env } from '../../lib/types';
import { createEndpoint } from '../../lib/endpoint-factory';
import { registerEndpoint } from '../../lib/endpoint-registry';

// ============================================================
// Types
// ============================================================

interface MembersQuery {
  includeInactive?: boolean;
  role?: 'member' | 'moderator' | 'admin';
}

interface MemberDTO {
  user_id: string;
  username: string;
  wechat_name: string | null;
  role: 'member' | 'moderator' | 'admin';
  power: number;
  is_active: number;
  title_html: string | null;
  classes: string[];
  media_count: number;
  created_at_utc: string;
  updated_at_utc: string;
}

// ============================================================
// Query Parser
// ============================================================

function parseQuery(searchParams: URLSearchParams): MembersQuery {
  return {
    includeInactive: searchParams.get('includeInactive') === 'true',
    role: (searchParams.get('role') as any) || undefined,
  };
}

// ============================================================
// Endpoint Registration
// ============================================================

registerEndpoint('/members', ['GET'], {
  authLevel: 'optional',
  pollable: true,
  pollEntity: 'members',
  cache: { etag: true },
  description: 'List all guild members with optional filters',
});

// ============================================================
// Endpoint Handler
// ============================================================

export const onRequestGet = createEndpoint<MemberDTO[], MembersQuery>({
  auth: 'optional',
  parseQuery,
  
  handler: async ({ env, query }) => {
    let sqlQuery = 'SELECT * FROM users WHERE deleted_at_utc IS NULL';
    const params: any[] = [];

    if (!query.includeInactive) {
      sqlQuery += ' AND is_active = 1';
    }

    if (query.role) {
      sqlQuery += ' AND role = ?';
      params.push(query.role);
    }

    sqlQuery += ' ORDER BY username ASC';

    const result = await env.DB.prepare(sqlQuery).bind(...params).all<any>();

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
          is_active: user.is_active,
          title_html: profile?.title_html || null,
          classes: classes.results?.map(c => c.class_code) || [],
          media_count: mediaCount?.count || 0,
          created_at_utc: user.created_at_utc,
          updated_at_utc: user.updated_at_utc,
        };
      })
    );

    return membersWithData;
  },

  // Generate ETag from member update timestamps
  etag: (data) => {
    const timestamps = data.map(m => m.updated_at_utc).join('|');
    return timestamps;
  },

  cacheControl: 'public, max-age=60, must-revalidate',
  pollable: true,
  pollEntity: 'members',
});
