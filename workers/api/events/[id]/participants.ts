/**
 * Event Actions - Add Participant (Admin/Mod action)
 * POST /api/events/[id]/participants
 * Body: { userId: string }
 */

import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog, successResponse, notFoundResponse, conflictResponse, forbiddenResponse } from '../../../lib/utils';
import type { Event } from '../../../lib/types';
import { z } from 'zod';

const AddParticipantBody = z.object({
  userId: z.string().uuid(),
});

export const onRequestPost = createEndpoint<void, typeof AddParticipantBody>({
  auth: 'moderator', // Only mods/admins can add others
  cacheControl: 'no-store',
  parseBody: (body) => AddParticipantBody.parse(body),

  handler: async ({ env, user, params, body }) => {
    const eventId = params.id;
    const targetUserId = body!.userId; // Body is non-null if parseBody succeeds (mostly)

    // 1. Fetch event
    const event = await env.DB
      .prepare('SELECT * FROM events WHERE event_id = ? AND is_archived = 0')
      .bind(eventId)
      .first<Event>();

    if (!event) {
      return notFoundResponse('Event');
    }

    if (event.signup_locked === 1) {
        // Admins might override locks? Let's enforce lock for now or check requirements.
        // Usually admins can override, but let's stick to standard logic: if locked, warn or error?
        // Let's assume admins can bypass lock for manual add.
        // Commenting out lock check for admin action.
        // if (event.signup_locked) return forbiddenResponse('Event is locked'); 
    }

    // 2. Check if user exists
     const targetUser = await env.DB
      .prepare('SELECT user_id, username FROM users WHERE user_id = ?')
      .bind(targetUserId)
      .first<{ user_id: string; username: string }>();
    
    if (!targetUser) {
        return notFoundResponse('User');
    }

    // 3. Check if already joined
    const existing = await env.DB
      .prepare('SELECT * FROM event_participants WHERE event_id = ? AND user_id = ?')
      .bind(eventId, targetUserId)
      .first();

    if (existing) {
      return conflictResponse('User already joined this event');
    }

    // 4. Check capacity (Admins might override? Let's enforce for safety)
    if (event.capacity) {
      const count = await env.DB
        .prepare('SELECT COUNT(*) as count FROM event_participants WHERE event_id = ?')
        .bind(eventId)
        .first<{ count: number }>();

      if (count && count.count >= event.capacity) {
        return conflictResponse('Event is full');
      }
    }

    // 5. Add participant
    const now = utcNow();
    await env.DB
      .prepare(`
        INSERT INTO event_participants (event_id, user_id, joined_at_utc, joined_by, created_at_utc, updated_at_utc)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(eventId, targetUserId, now, user!.user_id, now, now) // joined_by = admin
      .run();

    // 6. Audit Log
    await createAuditLog(
      env.DB,
      'event',
      'join_other', // Custom action for admin adding someone
      user!.user_id,
      eventId,
      `Added member ${targetUser.username} to event: ${event.title}`,
      JSON.stringify({ addedUserId: targetUserId })
    );

    return successResponse({ message: 'Member added to event successfully' }, 201);
  },
});
