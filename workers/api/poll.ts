import { Env, PagesFunction, errorResponse, generateETag } from './_shared';

interface PollResponse {
  version: string;
  timestamp: string;
  members: any[];
  events: any[];
  announcements: any[];
  hasChanges: boolean;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const since = url.searchParams.get('since');
    const entities = url.searchParams.get('entities')?.split(',') || ['members', 'events', 'announcements'];

    const now = new Date().toISOString();
  const response: PollResponse = {
    version: now,
    timestamp: now,
    members: [],
    events: [],
    announcements: [],
    hasChanges: false
  };

  // Preload class map for member/event mapping
  const { results: classRows } = await context.env.DB.prepare('SELECT user_id, class_code FROM member_classes').all();
  const classMap = classRows.reduce<Record<string, string[]>>((acc, row: any) => {
    if (!acc[row.user_id]) acc[row.user_id] = [];
    acc[row.user_id].push(row.class_code);
    return acc;
  }, {});

    // Query members if requested
    if (entities.includes('members')) {
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
        ORDER BY (u.role = \'admin\') DESC, (u.role = \'moderator\') DESC, u.power DESC
      `;

      const stmt = since
        ? context.env.DB.prepare(memberQuery).bind(since)
        : context.env.DB.prepare(memberQuery);

      const { results: members } = await stmt.all();

      response.members = members.map((m: any) => ({
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
      if (response.members.length > 0) response.hasChanges = true;
    }

    // Query events if requested
    if (entities.includes('events')) {
      const eventQuery = since
        ? `SELECT * FROM events WHERE updated_at_utc > ? ORDER BY start_at_utc ASC`
        : `SELECT * FROM events WHERE is_archived = 0 ORDER BY start_at_utc ASC`;

      const stmt = since
        ? context.env.DB.prepare(eventQuery).bind(since)
        : context.env.DB.prepare(eventQuery);

      const { results: events } = await stmt.all();

      const eventIds = events.map((e: any) => e.event_id);
      const participantsByEvent: Record<string, any[]> = {};
      if (eventIds.length > 0) {
        const placeholders = eventIds.map(() => '?').join(',');
        const { results: participants } = await context.env.DB.prepare(
          `
            SELECT ep.event_id, u.user_id, u.username, u.role, u.power, u.is_active
            FROM event_participants ep
            JOIN users u ON ep.user_id = u.user_id
            WHERE ep.event_id IN (${placeholders})
          `
        ).bind(...eventIds).all();

        for (const p of participants) {
          if (!participantsByEvent[p.event_id]) participantsByEvent[p.event_id] = [];
          participantsByEvent[p.event_id].push({
            id: p.user_id,
            username: p.username,
            role: p.role,
            power: p.power,
            classes: classMap[p.user_id] || [],
            active_status: p.is_active ? 'active' : 'inactive',
          });
        }
      }

      response.events = events.map((event: any) => {
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
      if (response.events.length > 0) response.hasChanges = true;
    }

    // Query announcements if requested
    if (entities.includes('announcements')) {
      const announcementQuery = since
        ? `SELECT * FROM announcements WHERE updated_at_utc > ? ORDER BY created_at_utc DESC`
        : `SELECT * FROM announcements WHERE is_archived = 0 ORDER BY is_pinned DESC, created_at_utc DESC`;

      const stmt = since
        ? context.env.DB.prepare(announcementQuery).bind(since)
        : context.env.DB.prepare(announcementQuery);

      const { results } = await stmt.all();
      response.announcements = results.map((a: any) => ({
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
      if (response.announcements.length > 0) response.hasChanges = true;
    }

    // ETag support for caching
    const etag = generateETag(response);
    const ifNoneMatch = context.request.headers.get('If-None-Match');
    
    if (ifNoneMatch === etag) {
      return new Response(null, { status: 304 });
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'ETag': etag,
        'Cache-Control': 'no-cache'
      }
    });
  } catch (err) {
    console.error('Poll error:', err);
    return errorResponse((err as Error).message, 500);
  }
};
