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

import type { Env, Event } from '../../core/types';
import { createEndpoint } from '../../core/endpoint-factory';
import { broadcastUpdate } from '../../core/broadcast';
import { utcNow, createAuditLog, generateId } from '../../core/utils';
import { DB_TABLES, EVENT_COLUMNS, EVENT_SELECT_FIELDS, pickAllowedFields } from '../../core/db-schema';
import {
  parsePaginationQuery,
  buildPaginatedResponse,
  type PaginatedResponse,
  type PaginationQuery,
} from '@guild/shared-utils/pagination';

// ============================================================
// Types
// ============================================================

interface EventsListQuery extends PaginationQuery {
  ids?: string; // NEW: Comma-separated IDs for batch fetch
  fields?: string; // NEW: Field filtering
  include?: string; // Comma-separated expansions, e.g. participants
  startDate?: string;
  endDate?: string;
  since?: string; // Incremental polling
}

interface CreateEventBody {
  title: string;
  description?: string;
  eventDate: string;
  eventType: string;
  maxParticipants?: number;
  capacity?: number;
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
    include: searchParams.get('include') || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    since: searchParams.get('since') || undefined,
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

      const requestedFields = query.fields?.split(',').map(f => f.trim()).filter(f => f.length > 0);
      const selectFields = pickAllowedFields(requestedFields, EVENT_SELECT_FIELDS, EVENT_SELECT_FIELDS).join(', ');

      const placeholders = ids.map(() => '?').join(',');
      const sqlQuery = `
        SELECT ${selectFields}
        FROM ${DB_TABLES.events}
        WHERE ${EVENT_COLUMNS.id} IN (${placeholders})
          AND ${EVENT_COLUMNS.deletedAt} IS NULL
        ORDER BY ${EVENT_COLUMNS.startAt} DESC, ${EVENT_COLUMNS.id} DESC
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

    const whereClauses = [`${EVENT_COLUMNS.isArchived} = 0`, `${EVENT_COLUMNS.deletedAt} IS NULL`];
    const bindings: any[] = [];

    if (cursor) {
      whereClauses.push(`(${EVENT_COLUMNS.startAt} < ? OR (${EVENT_COLUMNS.startAt} = ? AND ${EVENT_COLUMNS.id} < ?))`);
      bindings.push(cursor.timestamp, cursor.timestamp, cursor.id);
    }

    if (query.startDate) {
      whereClauses.push(`${EVENT_COLUMNS.startAt} >= ?`);
      bindings.push(query.startDate);
    }

    if (query.endDate) {
      whereClauses.push(`${EVENT_COLUMNS.startAt} <= ?`);
      bindings.push(query.endDate);
    }

    if (query.since) {
      whereClauses.push(`${EVENT_COLUMNS.updatedAt} > ?`);
      bindings.push(query.since);
    }

    const requestedFields = query.fields?.split(',').map((field) => field.trim()).filter(Boolean);
    const selectedFields = pickAllowedFields(requestedFields, EVENT_SELECT_FIELDS, EVENT_SELECT_FIELDS);
    const selectedFieldSet = new Set(selectedFields);
    selectedFieldSet.add(EVENT_COLUMNS.id);
    selectedFieldSet.add(EVENT_COLUMNS.startAt);
    const selectClause = Array.from(selectedFieldSet).join(', ');

    const includeSet = new Set(
      (query.include || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    );
    const includeParticipants = query.include ? includeSet.has('participants') : true;

    const sqlQuery = `
      SELECT ${selectClause} FROM ${DB_TABLES.events}
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY ${EVENT_COLUMNS.startAt} DESC, ${EVENT_COLUMNS.id} DESC
      LIMIT ?
    `;

    const events = await env.DB.prepare(sqlQuery).bind(...bindings, limit + 1).all<Event>();
    const eventRows = events.results || [];

    // Load participants for each event via team_members + event_teams
    const eventIds = eventRows.map((e: any) => e.event_id);
    let participantsMap: Record<string, any[]> = {};

    if (includeParticipants && eventIds.length > 0) {
      const placeholders = eventIds.map(() => '?').join(',');
      const participantsResult = await env.DB
        .prepare(`
          SELECT DISTINCT
            et.event_id,
            tm.user_id,
            u.username,
            u.wechat_name,
            u.power,
            mc.class_code
          FROM ${DB_TABLES.teamMembers} tm
          INNER JOIN ${DB_TABLES.eventTeams} et ON et.team_id = tm.team_id
          INNER JOIN ${DB_TABLES.users} u ON tm.user_id = u.user_id
          LEFT JOIN ${DB_TABLES.memberClasses} mc ON mc.user_id = tm.user_id AND mc.sort_order = 0
          WHERE et.event_id IN (${placeholders})
          ORDER BY tm.joined_at_utc
        `)
        .bind(...eventIds)
        .all();

      for (const p of (participantsResult.results || [])) {
        const eid = (p as any).event_id;
        if (!participantsMap[eid]) participantsMap[eid] = [];
        participantsMap[eid].push(p);
      }
    }

    // Attach participants to each event when requested.
    const eventsWithParticipants = includeParticipants
      ? eventRows.map((e: any) => ({
          ...e,
          participants: participantsMap[e.event_id] || [],
          participantCount: (participantsMap[e.event_id] || []).length,
        }))
      : eventRows;

    return buildPaginatedResponse(eventsWithParticipants, limit, 'start_at_utc', 'event_id');
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

  handler: async ({ env, user, body, waitUntil }) => {
    const now = utcNow();

    // ============================================================
    // BATCH CREATE MODE: Create multiple events
    // ============================================================
    if ('events' in body) {
      const { events: eventsToCreate } = body as CreateEventsBody;
      const createdEvents: Event[] = [];

      for (const eventData of eventsToCreate) {
        const eventId = generateId('evt');
        const { title, description, eventDate, eventType, maxParticipants, capacity } = eventData;

        await env.DB
          .prepare(`
            INSERT INTO ${DB_TABLES.events} (
              ${EVENT_COLUMNS.id}, ${EVENT_COLUMNS.title}, ${EVENT_COLUMNS.description}, ${EVENT_COLUMNS.startAt}, ${EVENT_COLUMNS.type},
              ${EVENT_COLUMNS.capacity}, ${EVENT_COLUMNS.createdBy}, ${EVENT_COLUMNS.createdAt}, ${EVENT_COLUMNS.updatedAt}
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            eventId,
            title,
            description || null,
            eventDate,
            eventType,
            capacity ?? maxParticipants ?? null,
            user!.user_id,
            now,
            now
          )
          .run();

        createdEvents.push((await env.DB
          .prepare(`SELECT * FROM ${DB_TABLES.events} WHERE ${EVENT_COLUMNS.id} = ?`)
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

      // Broadcast batch create
      waitUntil(broadcastUpdate(env, {
        entity: 'events',
        action: 'created',
        payload: createdEvents,
        ids: createdEvents.map(e => e.event_id),
        excludeUserId: user!.user_id
      }));

      return {
        message: `Created ${eventsToCreate.length} events successfully`,
        events: createdEvents,
      };
    }

    // ============================================================
    // SINGLE CREATE MODE: Create one event
    // ============================================================
    const eventId = generateId('evt');
    const { title, description, eventDate, eventType, maxParticipants, capacity } = body as CreateEventBody;

    await env.DB
      .prepare(`
        INSERT INTO ${DB_TABLES.events} (
          ${EVENT_COLUMNS.id}, ${EVENT_COLUMNS.title}, ${EVENT_COLUMNS.description}, ${EVENT_COLUMNS.startAt}, ${EVENT_COLUMNS.type},
          ${EVENT_COLUMNS.capacity}, ${EVENT_COLUMNS.createdBy}, ${EVENT_COLUMNS.createdAt}, ${EVENT_COLUMNS.updatedAt}
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        eventId,
        title,
        description || null,
        eventDate,
        eventType,
        capacity ?? maxParticipants ?? null,
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
      .prepare(`SELECT * FROM ${DB_TABLES.events} WHERE ${EVENT_COLUMNS.id} = ?`)
      .bind(eventId)
      .first<Event>();

    // Broadcast single create
    waitUntil(broadcastUpdate(env, {
      entity: 'events',
      action: 'created',
      payload: [newEvent!],
      ids: [eventId],
      excludeUserId: user!.user_id
    }));

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

  handler: async ({ env, user, query, waitUntil }) => {
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
          UPDATE ${DB_TABLES.events} SET ${EVENT_COLUMNS.deletedAt} = ?, ${EVENT_COLUMNS.updatedAt} = ?
          WHERE ${EVENT_COLUMNS.id} IN (${placeholders}) AND ${EVENT_COLUMNS.deletedAt} IS NULL
        `)
        .bind(now, now, ...ids)
        .run();
      affectedCount = result.meta.changes || 0;
    } else if (action === 'archive') {
      const result = await env.DB
        .prepare(`
          UPDATE ${DB_TABLES.events} SET ${EVENT_COLUMNS.isArchived} = 1, ${EVENT_COLUMNS.updatedAt} = ?
          WHERE ${EVENT_COLUMNS.id} IN (${placeholders})
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

    // Broadcast batch delete/archive
    if (affectedCount > 0) {
      waitUntil(broadcastUpdate(env, {
        entity: 'events',
        action: action === 'delete' ? 'deleted' : 'updated',
        ids: ids,
        excludeUserId: user!.user_id
      }));
    }

    return {
      message: `Batch ${action} completed`,
      affectedCount,
      action: action || 'delete',
    };
  },
});
