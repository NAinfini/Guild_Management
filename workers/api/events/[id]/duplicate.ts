/**
 * Event Actions - Duplicate
 * POST /api/events/[id]/duplicate
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env, Event } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog, generateId, canEditEntity } from '../../../lib/utils';
import { NotFoundError } from '../../../lib/errors';
import { DB_TABLES, EVENT_COLUMNS } from '../../../lib/db-schema';

// ============================================================
// Types
// ============================================================

interface DuplicateEventResponse {
  message: string;
  event: Event;
}

// ============================================================
// POST /api/events/[id]/duplicate
// ============================================================

export const onRequestPost = createEndpoint<DuplicateEventResponse, any, any>({
  auth: 'required',
  cacheControl: 'no-store',

  handler: async ({ env, user, params }) => {
    const eventId = params.id;

    // Get event
    const event = await env.DB
      .prepare(`SELECT * FROM ${DB_TABLES.events} WHERE ${EVENT_COLUMNS.id} = ?`)
      .bind(eventId)
      .first<Event>();

    if (!event) {
      throw new NotFoundError('Event');
    }

    if (!canEditEntity(user!, event.created_by)) {
      throw new Error('You do not have permission to duplicate this event');
    }

    const newEventId = generateId('evt');
    const now = utcNow();
    
    // Duplicate event + 7 days
    const startDate = new Date(event.start_at_utc);
    startDate.setDate(startDate.getDate() + 7);
    const newStartAt = startDate.toISOString(); // Assuming format

    await env.DB
      .prepare(`
        INSERT INTO ${DB_TABLES.events} (
          ${EVENT_COLUMNS.id}, ${EVENT_COLUMNS.title}, ${EVENT_COLUMNS.description}, ${EVENT_COLUMNS.startAt}, ${EVENT_COLUMNS.type},
          ${EVENT_COLUMNS.capacity}, ${EVENT_COLUMNS.createdBy}, ${EVENT_COLUMNS.createdAt}, ${EVENT_COLUMNS.updatedAt}
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        newEventId,
        `${event.title} (Copy)`,
        event.description,
        newStartAt,
        event.type,
        event.capacity ?? null,
        user!.user_id,
        now,
        now
      )
      .run();

    await createAuditLog(
      env.DB,
      'event',
      'duplicate',
      user!.user_id,
      newEventId,
      `Duplicated event: ${event.title}`,
      JSON.stringify({ originalEventId: eventId })
    );

    const newEvent = await env.DB
      .prepare(`SELECT * FROM ${DB_TABLES.events} WHERE ${EVENT_COLUMNS.id} = ?`)
      .bind(newEventId)
      .first<Event>();

    return {
      message: 'Event duplicated successfully',
      event: newEvent!,
    };
  },
});
