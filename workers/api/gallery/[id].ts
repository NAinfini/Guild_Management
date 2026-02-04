/**
 * Gallery API Endpoint - Single Image Operations
 */

import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../_types';
import { utcNow } from '../../_utils';

interface Session {
  user_id: string;
  userId: string;
  role: string;
}

async function requireRole(request: Request, env: Env, minRole: 'member' | 'moderator' | 'admin'): Promise<Session> {
  const sessionId = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!sessionId) {
    throw new Response(JSON.stringify({ error: 'UNAUTHORIZED' }), { status: 401 });
  }
  return { user_id: 'temp', userId: 'temp', role: minRole };
}

// GET /api/gallery/[id] - Get single gallery image
export const onRequestGet = async ({ params, env }: { params: any; env: Env }) => {
  const galleryId = params.id as string;

  const image = await env.DB.prepare(`
    SELECT 
      g.*,
      m.r2_key,
      m.content_type,
      m.width,
      m.height,
      u.username as uploader_username
    FROM gallery_images g
    JOIN media_objects m ON g.media_id = m.media_id
    LEFT JOIN users u ON g.uploaded_by = u.user_id
    WHERE g.gallery_id = ?
  `).bind(galleryId).first();

  if (!image) {
    return new Response(
      JSON.stringify({ error: 'NOT_FOUND', message: 'Gallery image not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify(image),
    { headers: { 'Content-Type': 'application/json' } }
  );
};

// PATCH /api/gallery/[id] - Update gallery entry
export const onRequestPatch = async ({ request, params, env }: { request: Request; params: any; env: Env }) => {
  const session = await requireRole(request, env, 'member');
  const galleryId = params.id as string;

  // Check if image exists
  const existing = await env.DB.prepare(
    `SELECT gallery_id, uploaded_by FROM gallery_images WHERE gallery_id = ?`
  ).bind(galleryId).first() as any;

  if (!existing) {
    return new Response(
      JSON.stringify({ error: 'NOT_FOUND', message: 'Gallery image not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check permissions: uploader or moderator/admin can edit
  const isModerator = ['moderator', 'admin'].includes(session.role);
  if (existing.uploaded_by !== session.userId && !isModerator) {
    return new Response(
      JSON.stringify({ error: 'FORBIDDEN', message: 'You can only edit your own uploads' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const body = await request.json() as {
    title?: string;
    description?: string;
    category?: string;
    is_featured?: boolean;
  };

  const updates: string[] = [];
  const bindParams: any[] = [];

  if (body.title !== undefined) {
    updates.push('title = ?');
    bindParams.push(body.title || null);
  }

  if (body.description !== undefined) {
    updates.push('description = ?');
    bindParams.push(body.description || null);
  }

  if (body.category !== undefined) {
    updates.push('category = ?');
    bindParams.push(body.category);
  }

  // Only moderator/admin can feature images
  if (body.is_featured !== undefined && isModerator) {
    updates.push('is_featured = ?');
    bindParams.push(body.is_featured ? 1 : 0);
  }

  if (updates.length === 0) {
    return new Response(
      JSON.stringify({ error: 'NO_UPDATES', message: 'No valid fields to update' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  updates.push('updated_at_utc = ?');
  bindParams.push(utcNow());
  bindParams.push(galleryId);

  await env.DB.prepare(`
    UPDATE gallery_images 
    SET ${updates.join(', ')}
    WHERE gallery_id = ?
  `).bind(...bindParams).run();

  // Fetch updated image
  const updated = await env.DB.prepare(`
    SELECT 
      g.*,
      m.r2_key,
      m.content_type,
      m.width,
      m.height,
      u.username as uploader_username
    FROM gallery_images g
    JOIN media_objects m ON g.media_id = m.media_id
    LEFT JOIN users u ON g.uploaded_by = u.user_id
    WHERE g.gallery_id = ?
  `).bind(galleryId).first();

  return new Response(
    JSON.stringify(updated),
    { headers: { 'Content-Type': 'application/json' } }
  );
};

// DELETE /api/gallery/[id] - Remove from gallery
export const onRequestDelete = async ({ request, params, env }: { request: Request; params: any; env: Env }) => {
  const session = await requireRole(request, env, 'member');
  const galleryId = params.id as string;

  // Check if image exists
  const existing = await env.DB.prepare(
    `SELECT gallery_id, uploaded_by, media_id FROM gallery_images WHERE gallery_id = ?`
  ).bind(galleryId).first() as any;

  if (!existing) {
    return new Response(
      JSON.stringify({ error: 'NOT_FOUND', message: 'Gallery image not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check permissions: uploader or moderator/admin can delete
  const isModerator = ['moderator', 'admin'].includes(session.role);
  if (existing.uploaded_by !== session.userId && !isModerator) {
    return new Response(
      JSON.stringify({ error: 'FORBIDDEN', message: 'You can only delete your own uploads' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Delete gallery entry (media_object remains for potential other uses)
  await env.DB.prepare(`DELETE FROM gallery_images WHERE gallery_id = ?`)
    .bind(galleryId)
    .run();

  return new Response(null, { status: 204 });
};
