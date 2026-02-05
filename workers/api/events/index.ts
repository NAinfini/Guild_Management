/**
 * Events API
 * GET /api/events - List events or fetch specific events by IDs
 * POST /api/events - Create event(s) - single or multiple
 *
 * Features:
 * - List events with filters and pagination
 * - Fetch specific events by IDs (batch read)
 * - Batch delete/archive via query parameters
 * - Backward compatible with existing API
 */

import type { Env, Event } from '../../lib/types';
import { createEndpoint } from '../../lib/endpoint-factory';
import { utcNow, createAuditLog, generateId } from '../../lib/utils';
import {
  parsePaginationQuery,
  buildPaginatedResponse,
  type PaginatedResponse,
  type PaginationQuery,
} from '../../../shared/utils/pagination';

// ============================================================
// Types
// ============================================================

interface EventsListQuery extends PaginationQuery {
  ids?: string; // NEW: Comma-separated IDs for batch fetch
  fields?: string; // NEW: Field filtering
}

interface CreateEventBody {
  title: string;
  description?: string;
  eventDate: string;
  eventType: string;
  minLevel?: number;
  maxParticipants?: number;
}

interface CreateEventsBody {
  events: CreateEventBody[]; // NEW: Support for multiple events
}

interface BatchDeleteQuery {
  action?: 'delete' | 'archive';
  eventIds?: string;
}

interface EventsListResponse {
  events: Event[];
}

interface CreateEventResponse {
  message: string;
  event: Event;
}

interface BatchReadResponse {
  events: any[];
  totalCount: number;
  notFound: string[];
}

// ============================================================
// GET /api/events - List Events or Batch Fetch by IDs
// ============================================================

export const onRequestGet = createEndpoint<
  EventsListResponse | PaginatedResponse<Event> | BatchReadResponse,
  EventsListQuery
>({
  auth: 'optional',
  etag: true,
  cacheControl: 'public, max-age=60',
  pollable: true,
  pollEntity: 'events',

  parseQuery: (searchParams) => ({
    limit: searchParams.get('limit') || undefined,
    cursor: searchParams.get('cursor') || undefined,
    ids: searchParams.get('ids') || undefined,
    fields: searchParams.get('fields') || undefined,
  }),

  handler: async ({ env, query }) => {
    // ============================================================
    // BATCH FETCH MODE: Fetch specific events by IDs
    // ============================================================
    if (query.ids) {
      const ids = query.ids.split(',').map(id => id.trim()).filter(id => id.length > 0);

      if (ids.length === 0) {
        throw new Error('No IDs provided');
      }

      if (ids.length > 100) {
        throw new Error('Maximum 100 IDs per request');
      }

      const fields = query.fields?.split(',').map(f => f.trim()).filter(f => f.length > 0);
      const selectFields = fields && fields.length > 0 ? fields.join(', ') : '*';

      const placeholders = ids.map(() => '?').join(',');
      const sqlQuery = `
        SELECT ${selectFields}
        FROM events
        WHERE event_id IN (${placeholders})
          AND deleted_at_utc IS NULL
        ORDER BY start_at_utc DESC, event_id DESC
      `;

      const result = await env.DB.prepare(sqlQuery).bind(...ids).all();
      const foundEvents = result.results || [];
      const foundIds = new Set(foundEvents.map((e: any) => e.event_id));
      const notFound = ids.filter(id => !foundIds.has(id));

      return {
        events: foundEvents,
        totalCount: foundEvents.length,
        notFound,
      };
    }

    // ============================================================
    // LIST MODE: List events with pagination (ALWAYS paginated)
    // ============================================================
    const { limit, cursor } = parsePaginationQuery(query);

    const whereClauses = ['is_archived = 0', 'deleted_at_utc IS NULL'];
    const bindings: any[] = [];

    if (cursor) {
      whereClauses.push('(start_at_utc < ? OR (start_at_utc = ? AND event_id < ?))');
      bindings.push(cursor.timestamp, cursor.timestamp, cursor.id);
    }

    const sqlQuery = `
      SELECT * FROM events
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY start_at_utc DESC, event_id DESC
      LIMIT ${limit + 1}
    `;

    const events = await env.DB.prepare(sqlQuery).bind(...bindings).all<Event>();

    return buildPaginatedResponse(events.results || [], limit, 'start_at_utc', 'event_id');
  },
});

// ============================================================
// POST /api/events - Create Single or Multiple Events
// ============================================================

export const onRequestPost = createEndpoint<
  CreateEventResponse | { message: string; events: Event[] },
  CreateEventBody | CreateEventsBody
>({
  auth: 'required',
  cacheControl: 'no-store',

  parseBody: (body) => {
    // Check if it's a batch create (has 'events' array)
    if ('events' in body && Array.isArray(body.events)) {
      if (body.events.length === 0) {
        throw new Error('Events array cannot be empty');
      }
      if (body.events.length > 50) {
        throw new Error('Maximum 50 events per batch create');
      }
      // Validate each event
      for (const event of body.events) {
        if (!event.title || !event.eventDate || !event.eventType) {
          throw new Error('Each event requires title, eventDate, and eventType');
        }
      }
      return body as CreateEventsBody;
    }

    // Single event create
    if (!body.title || !body.eventDate || !body.eventType) {
      throw new Error('Title, eventDate, and eventType are required');
    }
    return body as CreateEventBody;
  },

  handler: async ({ env, user, body }) => {
    const now = utcNow();

    // ============================================================
    // BATCH CREATE MODE: Create multiple events
    // ============================================================
    if ('events' in body) {
      const { events: eventsToCreate } = body as CreateEventsBody;
      const createdEvents: Event[] = [];

      for (const eventData of eventsToCreate) {
        const eventId = generateId();
        const { title, description, eventDate, eventType, minLevel, maxParticipants } = eventData;

        await env.DB
          .prepare(`
            INSERT INTO events (
              event_id, title, description, start_at_utc, type,
              min_level, max_participants, created_by, created_at_utc, updated_at_utc
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            eventId,
            title,
            description || null,
            eventDate,
            eventType,
            minLevel || 0,
            maxParticipants || 0,
            user!.user_id,
            now,
            now
          )
          .run();

        createdEvents.push((await env.DB
          .prepare('SELECT * FROM events WHERE event_id = ?')
          .bind(eventId)
          .first<Event>())!);
      }

      await createAuditLog(
        env.DB,
        'event',
        'batch_create',
        user!.user_id,
        'batch',
        `Batch created ${eventsToCreate.length} events`,
        JSON.stringify({ count: eventsToCreate.length })
      );

      return {
        message: `Created ${eventsToCreate.length} events successfully`,
        events: createdEvents,
      };
    }

    // ============================================================
    // SINGLE CREATE MODE: Create one event
    // ============================================================
    const eventId = generateId();
    const { title, description, eventDate, eventType, minLevel, maxParticipants } = body as CreateEventBody;

    await env.DB
      .prepare(`
        INSERT INTO events (
          event_id, title, description, start_at_utc, type,
          min_level, max_participants, created_by, created_at_utc, updated_at_utc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        eventId,
        title,
        description || null,
        eventDate,
        eventType,
        minLevel || 0,
        maxParticipants || 0,
        user!.user_id,
        now,
        now
      )
      .run();

    await createAuditLog(
      env.DB,
      'event',
      'create',
      user!.user_id,
      eventId,
      `Created event: ${title}`,
      JSON.stringify(body)
    );

    const newEvent = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first<Event>();

    return {
      message: 'Event created successfully',
      event: newEvent!,
    };
  },
});

// ============================================================
// DELETE /api/events - Batch delete/archive events via query params
// ============================================================

export const onRequestDelete = createEndpoint<
  { message: string; affectedCount: number; action: string },
  BatchDeleteQuery
>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseQuery: (searchParams) => ({
    action: (searchParams.get('action') || 'delete') as 'delete' | 'archive',
    eventIds: searchParams.get('eventIds') || undefined,
  }),

  handler: async ({ env, user, query }) => {
    const { action, eventIds } = query;

    if (!eventIds) {
      throw new Error('Missing eventIds query parameter');
    }

    const ids = eventIds.split(',').map(id => id.trim()).filter(id => id.length > 0);

    if (ids.length === 0) {
      throw new Error('No event IDs provided');
    }

    if (ids.length > 100) {
      throw new Error('Maximum 100 event IDs per batch operation');
    }

    const now = utcNow();
    let affectedCount = 0;

    const placeholders = ids.map(() => '?').join(',');

    if (action === 'delete') {
      const result = await env.DB
        .prepare(`
          UPDATE events SET deleted_at_utc = ?, updated_at_utc = ?
          WHERE event_id IN (${placeholders}) AND deleted_at_utc IS NULL
        `)
        .bind(now, now, ...ids)
        .run();
      affectedCount = result.meta.changes || 0;
    } else if (action === 'archive') {
      const result = await env.DB
        .prepare(`
          UPDATE events SET is_archived = 1, updated_at_utc = ?
          WHERE event_id IN (${placeholders})
        `)
        .bind(now, ...ids)
        .run();
      affectedCount = result.meta.changes || 0;
    }

    await createAuditLog(
      env.DB,
      'event',
      `batch_${action}`,
      user!.user_id,
      'batch',
      `Batch ${action} on ${ids.length} events`,
      JSON.stringify({ eventIds: ids, action })
    );

    return {
      message: `Batch ${action} completed`,
      affectedCount,
      action,
    };
  },
});
