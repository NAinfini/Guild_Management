/**
 * Gallery API Endpoint - List and Create Gallery Images
 */

import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../_types';
import { generateId, utcNow } from '../../_utils';

interface Session {
 user_id: string;
  userId: string;
  role: string;
}

// Simplified auth check - in production, use proper middleware
async function requireRole(request: Request, env: Env, minRole: 'member' | 'moderator' | 'admin'): Promise<Session> {
  // For now, we'll just check authorization header or cookie
  // This should match your existing auth pattern
  const sessionId = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!sessionId) {
    throw new Response(JSON.stringify({ error: 'UNAUTHORIZED' }), { status: 401 });
  }
  
  // Mock session for now - replace with actual session validation
 return { user_id: 'temp', userId: 'temp', role: 'member' };
}

interface GalleryImage {
  gallery_id: string;
  media_id: string;
  title?: string;
  description?: string;
  category?: string;
  is_featured: number;
  uploaded_by?: string;
  created_at_utc: string;
  updated_at_utc: string;
  // Joined from media_objects
  r2_key?: string;
  url?: string;
  content_type?: string;
  width?: number;
  height?: number;
}

// GET /api/gallery - List gallery images with pagination
export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '24');
  const category = url.searchParams.get('category') || undefined;
  const featured = url.searchParams.get('featured') === 'true';

  const offset = (page - 1) * limit;

  let query = `
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
    WHERE 1=1
  `;
  const params: any[] = [];

  if (category) {
    query += ` AND g.category = ?`;
    params.push(category);
  }

  if (featured) {
    query += ` AND g.is_featured = 1`;
  }

  query += ` ORDER BY g.is_featured DESC, g.created_at_utc DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const { results } = await env.DB.prepare(query).bind(...params).all();

  // Get total count for pagination
  let countQuery = `SELECT COUNT(*) as total FROM gallery_images WHERE 1=1`;
  const countParams: any[] = [];
  
  if (category) {
    countQuery += ` AND category = ?`;
    countParams.push(category);
  }
  
  if (featured) {
    countQuery += ` AND is_featured = 1`;
  }

  const { total } = await env.DB.prepare(countQuery).bind(...countParams).first() as any;

  return new Response(
    JSON.stringify({
      images: results,
      pagination: {
        page,
        limit,
        total: total || 0,
        pages: Math.ceil((total || 0) / limit),
      },
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};

// POST /api/gallery - Create new gallery entry
export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const session = await requireRole(request, env, 'member');
  
  const body = await request.json() as {
    media_id: string;
    title?: string;
    description?: string;
    category?: string;
  };

  if (!body.media_id) {
    return new Response(
      JSON.stringify({ error: 'MISSING_MEDIA_ID', message: 'media_id is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Verify media exists and is R2 type
  const media = await env.DB.prepare(
    `SELECT media_id, storage_type FROM media_objects WHERE media_id = ?`
  ).bind(body.media_id).first();

  if (!media) {
    return new Response(
      JSON.stringify({ error: 'MEDIA_NOT_FOUND', message: 'Media object not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (media.storage_type !== 'r2') {
    return new Response(
      JSON.stringify({ error: 'INVALID_STORAGE_TYPE', message: 'Gallery images must be stored in R2' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const now = utcNow();
  const galleryId = generateId('gal');

  await env.DB.prepare(`
    INSERT INTO gallery_images (
      gallery_id,
      media_id,
      title,
      description,
      category,
      is_featured,
      uploaded_by,
      created_at_utc,
      updated_at_utc
    ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
  `).bind(
    galleryId,
    body.media_id,
    body.title || null,
    body.description || null,
    body.category || 'other',
    session.userId,
    now,
    now
  ).run();

  // Fetch the created gallery image with media info
  const created = await env.DB.prepare(`
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
    JSON.stringify(created),
    { status: 201, headers: { 'Content-Type': 'application/json' } }
  );
};
