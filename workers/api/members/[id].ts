/**
 * Members API - Profile Management
 * GET /api/members/[id] - Get member profile
 * PUT /api/members/[id] - Update member profile
 * PUT /api/members/[id]/role - Change role (admin only)
 * PUT /api/members/[id]/username - Change username
 * POST /api/members/[id]/deactivate - Deactivate member
 */

import type { PagesFunction, Env, User, MemberProfile } from '../../_types';
import {
  successResponse,
  badRequestResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
  conflictResponse,
  utcNow,
  createAuditLog,
  sanitizeHtml,
  hashPassword,
  verifyPassword,
  etagFromTimestamp,
  assertIfMatch,
} from '../../_utils';
import { withAuth, withAdminAuth } from '../../_middleware';
import { validateBody, updateProfileSchema, updateRoleSchema, updateUsernameSchema } from '../../_validation';

// ============================================================
// GET /api/members/[id] - Get Member Profile
// ============================================================

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withAuth(context, async (authContext) => {
    const { env, params } = authContext;
    const userId = params.id;

    try {
      // Get user
      const user = await env.DB
        .prepare('SELECT * FROM users WHERE user_id = ? AND deleted_at IS NULL')
        .bind(userId)
        .first<User>();

      if (!user) {
        return notFoundResponse('Member');
      }

      // Get profile
      const profile = await env.DB
        .prepare('SELECT * FROM member_profiles WHERE user_id = ?')
        .bind(userId)
        .first<MemberProfile>();

      // Get classes
      const classes = await env.DB
        .prepare('SELECT class_code FROM member_classes WHERE user_id = ? ORDER BY sort_order')
        .bind(userId)
        .all<{ class_code: string }>();

      // Get media
      const media = await env.DB
        .prepare(`
          SELECT mm.*, mo.storage_type, mo.r2_key, mo.url, mo.content_type
          FROM member_media mm
          JOIN media_objects mo ON mm.media_id = mo.media_id
          WHERE mm.user_id = ?
          ORDER BY mm.kind, mm.sort_order
        `)
        .bind(userId)
        .all();

      const memberData = {
        userId: user.user_id,
        username: user.username,
        wechatName: user.wechat_name,
        role: user.role,
        power: user.power,
        isActive: user.is_active === 1,
        profile: profile || null,
        classes: classes.results?.map(c => c.class_code) || [],
        media: media.results || [],
      };

      const resp = successResponse({ member: memberData });
      const etag = etagFromTimestamp(user.updated_at_utc || user.created_at_utc);
      if (etag) resp.headers.set('ETag', etag);
      return resp;
    } catch (error) {
      console.error('Get member error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while fetching member', 500);
    }
  });
};

// ============================================================
// PUT /api/members/[id] - Update Member Profile
// ============================================================

export const onRequestPut: PagesFunction<Env> = async (context) => {
  return withAuth(context, async (authContext) => {
    const { request, env, params } = authContext;
    const { user, isAdmin, isModerator } = authContext.data;
    const userId = params.id;

    // Check permissions (self or admin/mod)
    if (userId !== user.user_id && !isAdmin && !isModerator) {
      return forbiddenResponse('You do not have permission to edit this profile');
    }

    const current = await env.DB
      .prepare('SELECT * FROM users WHERE user_id = ? AND deleted_at IS NULL')
      .bind(userId)
      .first<User>();

    if (!current) {
      return notFoundResponse('Member');
    }

    const currentEtag = etagFromTimestamp(current.updated_at_utc || current.created_at_utc);
    const pre = assertIfMatch(request, currentEtag);
    if (pre) return pre;

    const validation = await validateBody(request, updateProfileSchema);
    if (!validation.success) {
      return badRequestResponse('Invalid request body', validation.error.errors);
    }

    const updates = validation.data;

    try {
      const now = utcNow();

      // Update power in users table (if provided and user is admin/mod)
      if (updates.power !== undefined && (isAdmin || isModerator)) {
        await env.DB
          .prepare('UPDATE users SET power = ?, updated_at_utc = ? WHERE user_id = ?')
          .bind(updates.power, now, userId)
          .run();
      }

      // Update or create profile
      const existingProfile = await env.DB
        .prepare('SELECT * FROM member_profiles WHERE user_id = ?')
        .bind(userId)
        .first();

      if (existingProfile) {
        // Update existing profile
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (updates.titleHtml !== undefined) {
          updateFields.push('title_html = ?');
          updateValues.push(updates.titleHtml ? sanitizeHtml(updates.titleHtml) : null);
        }
        if (updates.bioText !== undefined) {
          updateFields.push('bio_text = ?');
          updateValues.push(updates.bioText || null);
        }
        if (updates.vacationStart !== undefined) {
          const vacationStartUtc = updates.vacationStart
            ? new Date(updates.vacationStart).toISOString().replace('T', ' ').substring(0, 19)
            : null;
          updateFields.push('vacation_start_at_utc = ?');
          updateValues.push(vacationStartUtc);
        }
        if (updates.vacationEnd !== undefined) {
          const vacationEndUtc = updates.vacationEnd
            ? new Date(updates.vacationEnd).toISOString().replace('T', ' ').substring(0, 19)
            : null;
          updateFields.push('vacation_end_at_utc = ?');
          updateValues.push(vacationEndUtc);
        }

        if (updateFields.length > 0) {
          updateFields.push('updated_at_utc = ?');
          updateValues.push(now, userId);

          const query = `UPDATE member_profiles SET ${updateFields.join(', ')} WHERE user_id = ?`;
          await env.DB.prepare(query).bind(...updateValues).run();
        }
      } else {
        // Create new profile
        const titleHtml = updates.titleHtml ? sanitizeHtml(updates.titleHtml) : null;
        const vacationStartUtc = updates.vacationStart
          ? new Date(updates.vacationStart).toISOString().replace('T', ' ').substring(0, 19)
          : null;
        const vacationEndUtc = updates.vacationEnd
          ? new Date(updates.vacationEnd).toISOString().replace('T', ' ').substring(0, 19)
          : null;

        await env.DB
          .prepare(`
            INSERT INTO member_profiles (
              user_id, title_html, bio_text, vacation_start_at_utc, vacation_end_at_utc,
              created_at_utc, updated_at_utc
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(userId, titleHtml, updates.bioText || null, vacationStartUtc, vacationEndUtc, now, now)
          .run();
      }

      // Create audit log if admin/mod editing another user
      if (userId !== user.user_id) {
        await createAuditLog(
          env.DB,
          'member',
          'update',
          user.user_id,
          userId,
          'Updated member profile',
          JSON.stringify(updates)
        );
      }

      const updatedUser = await env.DB
        .prepare('SELECT * FROM users WHERE user_id = ?')
        .bind(userId)
        .first<User>();

      const etag = etagFromTimestamp(updatedUser?.updated_at_utc || updatedUser?.created_at_utc);
      const resp = successResponse({
        message: 'Profile updated successfully',
        user: {
          userId: updatedUser?.user_id,
          username: updatedUser?.username,
          role: updatedUser?.role,
          power: updatedUser?.power,
          isActive: updatedUser?.is_active === 1,
          updatedAt: updatedUser?.updated_at_utc,
        },
      });
      if (etag) resp.headers.set('ETag', etag);
      return resp;
    } catch (error) {
      console.error('Update profile error:', error);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while updating profile', 500);
    }
  });
};
