/**
 * Member Admin Notes
 * GET /api/members/[id]/notes - Get admin notes
 * PUT /api/members/[id]/notes - Update admin notes
 * 
 * Migrated to use createEndpoint pattern for consistency with shared endpoint contract
 */

import type { Env } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, etagFromTimestamp, createAuditLog } from '../../../lib/utils';

// ============================================================
// Types
// ============================================================

interface NoteItem {
  slot: number;
  note: string;
}

interface UpdateNotesBody {
  notes: NoteItem[];
}

interface NotesResponse {
  notes: any[];
}

interface UpdateNotesResponse {
  message: string;
  notes: any[];
}

// ============================================================
// GET /api/members/[id]/notes
// ============================================================

export const onRequestGet = createEndpoint<NotesResponse>({
  auth: 'moderator',
  etag: true,
  cacheControl: 'no-store', // Security: detailed notes should not be cached publicly

  handler: async ({ env, params }) => {
    const userId = params.id;

    const notes = await env.DB
      .prepare(`
        SELECT man.*, u.username as updated_by_username
        FROM member_notes man
        LEFT JOIN users u ON man.updated_by = u.user_id
        WHERE man.user_id = ?
        ORDER BY man.slot
      `)
      .bind(userId)
      .all();

    return {
      notes: notes.results || [],
    };
  },
});

// ============================================================
// PUT /api/members/[id]/notes
// ============================================================

export const onRequestPut = createEndpoint<UpdateNotesResponse, any, UpdateNotesBody>({
  auth: 'moderator',
  cacheControl: 'no-store',

  parseBody: (body) => {
    if (!body.notes || !Array.isArray(body.notes)) {
      throw new Error('notes array is required');
    }
    return body as UpdateNotesBody;
  },

  handler: async ({ env, user, params, body }) => {
    if (!body) throw new Error('Body required');
    const userId = params.id;
    const { notes } = body;
    const now = utcNow();

    // Delete existing notes for these slots
    const slots = notes.map(n => n.slot);
    if (slots.length > 0) {
      const placeholders = slots.map(() => '?').join(',');
      await env.DB
        .prepare(`DELETE FROM member_notes WHERE user_id = ? AND slot IN (${placeholders})`)
        .bind(userId, ...slots)
        .run();
    }

    // Insert new notes
    for (const note of notes) {
      if (note.note && note.note.trim()) {
        await env.DB
          .prepare(`
            INSERT INTO member_notes (
              user_id, slot, note, updated_by, updated_at_utc
            ) VALUES (?, ?, ?, ?, ?)
          `)
          .bind(userId, note.slot, note.note.trim(), user!.user_id, now)
          .run();
      }
    }

    await createAuditLog(
      env.DB,
      'member',
      'update_notes',
      user!.user_id,
      userId,
      'Updated admin notes',
      JSON.stringify({ slots })
    );

    // Return updated notes
    const updatedNotes = await env.DB
      .prepare(`
        SELECT man.*, u.username as updated_by_username
        FROM member_notes man
        LEFT JOIN users u ON man.updated_by = u.user_id
        WHERE man.user_id = ?
        ORDER BY man.slot
      `)
      .bind(userId)
      .all();

    return {
      message: 'Notes updated successfully',
      notes: updatedNotes.results || [],
    };
  },
});
