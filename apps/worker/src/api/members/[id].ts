/**
 * Member Profile Management
 * GET /api/members/[id] - Get member profile
 * PUT /api/members/[id] - Update member profile
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env, User, MemberProfile } from '../../core/types';
import { createEndpoint } from '../../core/endpoint-factory';
import { broadcastUpdate } from '../../core/broadcast';
import { utcNow, createAuditLog, etagFromTimestamp, assertIfMatch, sanitizeHtml } from '../../core/utils';
import { NotFoundError } from '../../core/errors';
import { DB_TABLES } from '../../core/db-schema';

// ============================================================
// Types
// ============================================================

interface UpdateProfileBody {
  wechatName?: string;
  wechat_name?: string;
  power?: number;
  titleHtml?: string;
  title_html?: string;
  bioText?: string;
  bio_text?: string;
  vacationStart?: string | null;
  vacation_start?: string | null;
  vacationEnd?: string | null;
  vacation_end?: string | null;
}

interface MemberResponse {
  user: User;
  profile: MemberProfile;
  classes: any[];
  media: any[];
  progression: any[];
  notes?: any[]; // For admins/mods
}

// ============================================================
// GET /api/members/[id]
// ============================================================

export const onRequestGet = createEndpoint<MemberResponse>({
  auth: 'optional',
  etag: true,
  cacheControl: 'public, max-age=60',

  handler: async ({ env, user, params, request, isAdmin, isModerator }) => {
    const userId = params.id;

    // Get user
    const targetUser = await env.DB
      .prepare(`SELECT * FROM ${DB_TABLES.users} WHERE user_id = ? AND deleted_at_utc IS NULL`)
      .bind(userId)
      .first<User>();

    if (!targetUser) {
      throw new NotFoundError('Member');
    }

    // Get profile
    const profile = await env.DB
      .prepare(`SELECT * FROM ${DB_TABLES.memberProfiles} WHERE user_id = ?`)
      .bind(userId)
      .first<MemberProfile>();

    // Get classes
    const classes = await env.DB
      .prepare(`SELECT class_code FROM ${DB_TABLES.memberClasses} WHERE user_id = ? ORDER BY sort_order`)
      .bind(userId)
      .all();

    // Get media
    const media = await env.DB
      .prepare(`
        SELECT
          mm.media_id,
          mm.kind,
          mm.is_avatar,
          mm.sort_order,
          mo.storage_type,
          mo.r2_key,
          mo.url,
          mo.content_type,
          mo.size_bytes,
          mo.width,
          mo.height,
          mo.duration_ms,
          mo.created_at_utc,
          mo.updated_at_utc
        FROM ${DB_TABLES.memberMedia} mm
        INNER JOIN ${DB_TABLES.mediaObjects} mo ON mo.media_id = mm.media_id
        WHERE mm.user_id = ?
        ORDER BY mm.sort_order, mo.created_at_utc DESC
      `)
      .bind(userId)
      .all();

    // Get progression
    const progression = await env.DB
      .prepare(`SELECT * FROM ${DB_TABLES.memberProgression} WHERE user_id = ?`)
      .bind(userId)
      .all();

    let notes: any[] = [];
    if (isAdmin || isModerator) {
      const notesResult = await env.DB
        .prepare(`
          SELECT man.*, u.username as updated_by_username
          FROM ${DB_TABLES.memberNotes} man
          LEFT JOIN ${DB_TABLES.users} u ON man.updated_by = u.user_id
          WHERE man.user_id = ?
          ORDER BY man.slot
        `)
        .bind(userId)
        .all();
      notes = notesResult.results || [];
    }

    return {
      user: targetUser,
      profile: profile || {} as MemberProfile,
      classes: classes.results || [],
      media: media.results || [],
      progression: progression.results || [],
      notes,
    };
  },
});

// ============================================================
// PUT /api/members/[id]
// ============================================================

export const onRequestPut = createEndpoint<{ message: string; profile: any }, UpdateProfileBody>({
  auth: 'required',
  cacheControl: 'no-store',

  parseBody: (body) => body as UpdateProfileBody,

  handler: async ({ env, user, params, body, request, isAdmin, isModerator, waitUntil }) => {
    const userId = params.id;

    // Only self or admin/mod can update profile
    if (userId !== user!.user_id && !isAdmin && !isModerator) {
      throw new Error('You do not have permission to edit this profile');
    }

    const current = await env.DB
      .prepare(`SELECT updated_at_utc, created_at_utc FROM ${DB_TABLES.users} WHERE user_id = ?`)
      .bind(userId)
      .first<{ updated_at_utc: string; created_at_utc: string }>();
    const currentEtag = etagFromTimestamp(current?.updated_at_utc || current?.created_at_utc);
    const pre = assertIfMatch(request, currentEtag);
    if (pre) return pre;

    const wechatName = body.wechat_name ?? body.wechatName;
    const power = body.power;
    const titleHtmlInput = body.title_html ?? body.titleHtml;
    const bioText = body.bio_text ?? body.bioText;
    const vacationStart = body.vacation_start ?? body.vacationStart;
    const vacationEnd = body.vacation_end ?? body.vacationEnd;
    const now = utcNow();

    // Update user table fields (wechat + power)
    const userUpdates: string[] = [];
    const userValues: any[] = [];
    if (wechatName !== undefined) {
      userUpdates.push('wechat_name = ?');
      userValues.push(wechatName);
    }
    if (power !== undefined) {
      userUpdates.push('power = ?');
      userValues.push(power);
    }
    if (userUpdates.length > 0) {
      userUpdates.push('updated_at_utc = ?');
      userValues.push(now, userId);
      await env.DB
        .prepare(`UPDATE ${DB_TABLES.users} SET ${userUpdates.join(', ')} WHERE user_id = ?`)
        .bind(...userValues)
        .run();
    }

    // Upsert profile fields (title/bio/vacation)
    if (
      titleHtmlInput !== undefined ||
      bioText !== undefined ||
      vacationStart !== undefined ||
      vacationEnd !== undefined
    ) {
      const existingProfile = await env.DB
        .prepare(`SELECT * FROM ${DB_TABLES.memberProfiles} WHERE user_id = ?`)
        .bind(userId)
        .first<MemberProfile>();

      const nextTitleHtml =
        titleHtmlInput !== undefined
          ? sanitizeHtml(titleHtmlInput)
          : existingProfile?.title_html ?? null;
      const nextBioText = bioText !== undefined ? bioText : existingProfile?.bio_text ?? null;
      const nextVacationStart =
        vacationStart !== undefined ? vacationStart : existingProfile?.vacation_start_at_utc ?? null;
      const nextVacationEnd =
        vacationEnd !== undefined ? vacationEnd : existingProfile?.vacation_end_at_utc ?? null;

      await env.DB
        .prepare(`
          INSERT INTO ${DB_TABLES.memberProfiles}
            (user_id, title_html, bio_text, vacation_start_at_utc, vacation_end_at_utc, created_at_utc, updated_at_utc)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            title_html = excluded.title_html,
            bio_text = excluded.bio_text,
            vacation_start_at_utc = excluded.vacation_start_at_utc,
            vacation_end_at_utc = excluded.vacation_end_at_utc,
            updated_at_utc = excluded.updated_at_utc
        `)
        .bind(userId, nextTitleHtml, nextBioText, nextVacationStart, nextVacationEnd, now, now)
        .run();

      // Touch users.updated_at_utc so list/poll etags reflect profile changes.
      await env.DB
        .prepare(`UPDATE ${DB_TABLES.users} SET updated_at_utc = ? WHERE user_id = ?`)
        .bind(now, userId)
        .run();
    }
    await createAuditLog(
      env.DB,
      'member',
      'update_profile',
      user!.user_id,
      userId,
      'Updated profile',
      JSON.stringify(body)
    );

    const updatedProfile = await env.DB
      .prepare(`SELECT * FROM ${DB_TABLES.memberProfiles} WHERE user_id = ?`)
      .bind(userId)
      .first();

    const fullUser = await env.DB
      .prepare(`SELECT * FROM ${DB_TABLES.users} WHERE user_id = ?`)
      .bind(userId)
      .first();

    // Broadcast change to all sessions
    waitUntil(broadcastUpdate(env, {
      entity: 'members',
      action: 'updated',
      payload: [fullUser],
      ids: [userId],
      excludeUserId: user!.user_id
    }));

    return {
      message: 'Profile updated successfully',
      profile: updatedProfile,
    };
  },
});
