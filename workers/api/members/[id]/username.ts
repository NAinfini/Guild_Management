/**
 * Member Username Management
 * PUT /api/members/[id]/username - Change username
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env, User } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog, etagFromTimestamp, assertIfMatch } from '../../../lib/utils';

// ============================================================
// Types
// ============================================================

interface UpdateUsernameBody {
  username: string;
}

interface UpdateUsernameResponse {
  message: string;
  username: string;
}

// ============================================================
// PUT /api/members/[id]/username
// ============================================================

export const onRequestPut = createEndpoint<UpdateUsernameResponse, any, UpdateUsernameBody>({
  auth: 'required', // Self or admin? Usually admin/mod or limited self.
  cacheControl: 'no-store',

  parseBody: (body) => {
    if (!body.username || body.username.length < 2) {
      throw new Error('Username must be at least 2 characters');
    }
    return body as UpdateUsernameBody;
  },

  handler: async ({ env, user, params, body, request, isAdmin, isModerator }) => {
    if (!body) {
      throw new Error('Request body is required');
    }
    const userId = params.id;
    const { username } = body;

    // Only self or admin/mod?
    if (userId !== user!.user_id && !isAdmin && !isModerator) {
      throw new Error('You do not have permission to change this username');
    }

    // Check if username is taken
    const existing = await env.DB
      .prepare('SELECT user_id FROM users WHERE username = ?')
      .bind(username)
      .first();

    if (existing) {
      throw new Error('Username is already taken');
    }

    const current = await env.DB
      .prepare('SELECT updated_at_utc, created_at_utc FROM users WHERE user_id = ?')
      .bind(userId)
      .first<{ updated_at_utc: string; created_at_utc: string }>();
    const currentEtag = etagFromTimestamp(current?.updated_at_utc || current?.created_at_utc);
    const pre = assertIfMatch(request, currentEtag);
    if (pre) return pre;

    const now = utcNow();

    await env.DB
      .prepare('UPDATE users SET username = ?, updated_at_utc = ? WHERE user_id = ?')
      .bind(username, now, userId)
      .run();

    await createAuditLog(
      env.DB,
      'member',
      'update_username',
      user!.user_id,
      userId,
      `Changed username to ${username}`,
      undefined
    );

    return {
      message: 'Username updated successfully',
      username,
    };
  },
});
