/**
 * Incremental Polling API Endpoint
 * Returns only data that has changed since the provided timestamp
 * Reduces bandwidth and improves performance for frequent polling
 */

import { successResponse, errorResponse } from '../_utils';
import type { Env } from '../../../types/cloudflare';

interface PollResponse {
  members: {
    updated: any[];
    deleted: string[];
  };
  events: {
    updated: any[];
    deleted: string[];
  };
  announcements: {
    updated: any[];
    deleted: string[];
  };
  latestTimestamp: string;
}

export const onRequestGet = async (context: { request: Request; env: Env; data: { session?: any; user?: any } }) => {
  const { request, env, data } = context;
  const { session, user } = data;

  if (!session || !user) {
    return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
  }

  try {
    const url = new URL(request.url);
    const sinceParam = url.searchParams.get('since');

    if (!sinceParam) {
      return errorResponse('INVALID_REQUEST', 'Missing "since" timestamp parameter', 400);
    }

    // Validate timestamp format
    const sinceTimestamp = new Date(sinceParam);
    if (isNaN(sinceTimestamp.getTime())) {
      return errorResponse('INVALID_REQUEST', 'Invalid timestamp format', 400);
    }

    const since = sinceTimestamp.toISOString().replace('T', ' ').substring(0, 19);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Query updated members
    const membersStmt = env.DB.prepare(`
      SELECT 
        id, username, wechat_name, role, power, classes, avatar_url,
        title_html, active_status, bio, notes, audio_url, updated_at_utc,
        vacation_start, vacation_end
      FROM users
      WHERE updated_at_utc > ? AND updated_at_utc <= ?
      ORDER BY updated_at_utc DESC
    `).bind(since, now);

    const membersResult = await membersStmt.all();
    const updatedMembers = membersResult.results || [];

    // Query updated events
    const eventsStmt = env.DB.prepare(`
      SELECT 
        event_id as id, type, title, description, start_at_utc as start_time,
        end_at_utc as end_time, capacity, is_locked, is_pinned, is_archived,
        updated_at_utc
      FROM events
      WHERE updated_at_utc > ? AND updated_at_utc <= ?
      ORDER BY updated_at_utc DESC
    `).bind(since, now);

    const eventsResult = await eventsStmt.all();
    const updatedEvents = eventsResult.results || [];

    // Query updated announcements
    const announcementsStmt = env.DB.prepare(`
      SELECT 
        announcement_id as id, title, content_html, author_id,
        created_at_utc as created_at, updated_at_utc as updated_at,
        is_pinned, is_archived
      FROM announcements
      WHERE updated_at_utc > ? AND updated_at_utc <= ?
      ORDER BY updated_at_utc DESC
    `).bind(since, now);

    const announcementsResult = await announcementsStmt.all();
    const updatedAnnouncements = announcementsResult.results || [];

    // For deleted items, we'd need a separate "deleted_items" table
    // or a soft-delete flag. For now, returning empty arrays
    const response: PollResponse = {
      members: {
        updated: updatedMembers.map((m: any) => ({
          ...m,
          classes: m.classes ? JSON.parse(m.classes) : [],
        })),
        deleted: [], // Would need deletion tracking
      },
      events: {
        updated: updatedEvents,
        deleted: [],
      },
      announcements: {
        updated: updatedAnnouncements,
        deleted: [],
      },
      latestTimestamp: now.replace(' ', 'T') + 'Z',
    };

    // Don't cache poll endpoint - always fresh
    return successResponse(response, 200, {
      method: 'GET',
      maxAge: 0,
    });
  } catch (error) {
    console.error('[Poll API] Error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch poll data', 500);
  }
};
