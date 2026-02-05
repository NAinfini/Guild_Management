/**
 * Poll Handlers
 * Handlers for fetching pollable entity data
 * These handlers are registered with the endpoint registry for poll integration
 */

import type { Env } from '../../lib/types';

// ============================================================
// Poll Handler Types
// ============================================================

export interface PollHandler {
  (env: Env, since?: string): Promise<any[]>;
}

// ============================================================
// Members Poll Handler
// ============================================================

export async function fetchMembers(env: Env, since?: string): Promise<any[]> {
  // Preload class map
  const { results: classRows } = await env.DB.prepare('SELECT user_id, class_code FROM member_classes').all();
  const classMap = classRows.reduce<Record<string, string[]>>((acc, row: any) => {
    if (!acc[row.user_id]) acc[row.user_id] = [];
    acc[row.user_id].push(row.class_code);
    return acc;
  }, {});

  const memberQuery = `
    SELECT
      u.user_id,
      u.username,
      u.role,
      u.power,
      u.is_active,
      u.created_at_utc,
      u.updated_at_utc,
      mp.title_html,
      mp.bio_text,
      mp.vacation_start_at_utc,
      mp.vacation_end_at_utc
    FROM users u
    LEFT JOIN member_profiles mp ON mp.user_id = u.user_id
    WHERE u.deleted_at IS NULL
    ${since ? 'AND u.updated_at_utc > ?' : ''}
    ORDER BY (u.role = 'admin') DESC, (u.role = 'moderator') DESC, u.power DESC
  `;

  const stmt = since
    ? env.DB.prepare(memberQuery).bind(since)
    : env.DB.prepare(memberQuery);

  const { results: members } = await stmt.all();

  return members.map((m: any) => ({
    id: m.user_id,
    username: m.username,
    role: m.role,
    power: m.power,
    classes: classMap[m.user_id] || [],
    active_status: m.is_active ? 'active' : 'inactive',
    title_html: m.title_html,
    bio: m.bio_text,
    vacation_start: m.vacation_start_at_utc || undefined,
    vacation_end: m.vacation_end_at_utc || undefined,
    created_at: m.created_at_utc,
    updated_at: m.updated_at_utc,
  }));
}

// ============================================================
// Events Poll Handler
// ============================================================

export async function fetchEvents(env: Env, since?: string): Promise<any[]> {
  const eventQuery = since
    ? `SELECT * FROM events WHERE updated_at_utc > ? ORDER BY start_at_utc ASC`
    : `SELECT * FROM events WHERE is_archived = 0 ORDER BY start_at_utc ASC`;

  const stmt = since
    ? env.DB.prepare(eventQuery).bind(since)
    : env.DB.prepare(eventQuery);

  const { results: events } = await stmt.all();

  // Get participants for events
  const eventIds = events.map((e: any) => e.event_id);
  const participantsByEvent: Record<string, any[]> = {};

  if (eventIds.length > 0) {
    const placeholders = eventIds.map(() => '?').join(',');
    const { results: participants } = await env.DB.prepare(
      `
        SELECT ep.event_id, u.user_id, u.username, u.role, u.power, u.is_active
        FROM event_participants ep
        JOIN users u ON ep.user_id = u.user_id
        WHERE ep.event_id IN (${placeholders})
      `
    ).bind(...eventIds).all();

    for (const p of participants as any[]) {
      if (!participantsByEvent[p.event_id]) participantsByEvent[p.event_id] = [];
      participantsByEvent[p.event_id].push({
        id: p.user_id,
        username: p.username,
        role: p.role,
        power: p.power,
        active_status: p.is_active ? 'active' : 'inactive',
      });
    }
  }

  return events.map((event: any) => {
    const members = participantsByEvent[event.event_id] || [];
    return {
      id: event.event_id,
      type: event.type,
      title: event.title,
      description: event.description,
      start_time: event.start_at_utc,
      end_time: event.end_at_utc,
      capacity: event.capacity,
      is_locked: !!event.signup_locked,
      is_pinned: !!event.is_pinned,
      is_archived: !!event.is_archived,
      participants: members,
      current: members.length,
      updated_at: event.updated_at_utc,
    };
  });
}

// ============================================================
// Announcements Poll Handler
// ============================================================

export async function fetchAnnouncements(env: Env, since?: string): Promise<any[]> {
  const announcementQuery = since
    ? `SELECT * FROM announcements WHERE updated_at_utc > ? ORDER BY created_at_utc DESC`
    : `SELECT * FROM announcements WHERE is_archived = 0 ORDER BY is_pinned DESC, created_at_utc DESC`;

  const stmt = since
    ? env.DB.prepare(announcementQuery).bind(since)
    : env.DB.prepare(announcementQuery);

  const { results } = await stmt.all();

  return results.map((a: any) => ({
    id: a.announcement_id,
    title: a.title,
    content_html: a.body_html,
    author_id: a.created_by,
    created_at: a.created_at_utc,
    updated_at: a.updated_at_utc,
    is_pinned: !!a.is_pinned,
    is_archived: !!a.is_archived,
    media_urls: [],
  }));
}

// ============================================================
// Export Handlers Map
// ============================================================

export const POLL_HANDLERS: Record<string, PollHandler> = {
  members: fetchMembers,
  events: fetchEvents,
  announcements: fetchAnnouncements,
};
