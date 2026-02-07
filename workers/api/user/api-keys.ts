/**
 * API Key Management Endpoint
 * Allows users to generate and manage their API keys
 */

import { createEndpoint } from '../../lib/endpoint-factory';
import { generateId, utcNow } from '../../lib/utils';
import { NotFoundError } from '../../lib/errors';

interface ApiKey {
  key_id: string;
  key_prefix: string;
  name: string;
  scopes: string[] | null;
  is_active: boolean;
  last_used_at_utc: string | null;
  expires_at_utc: string | null;
  created_at_utc: string;
}

interface ApiKeyCreateRequest {
  name: string;
  scopes?: string[];
  expiresInDays?: number;
}

interface ApiKeyCreateResponse {
  keyId: string;
  key: string;
  prefix: string;
  message: string;
}

/**
 * GET /api/user/api-keys - List user's API keys
 */
export const onRequestGet = createEndpoint<{ keys: ApiKey[] }>({
  auth: 'required',
  etag: true,
  cacheControl: 'private, max-age=60',

  handler: async ({ env, user }) => {
    const keys = await env.DB.prepare(
      `SELECT key_id, key_prefix, name, scopes, is_active, 
              last_used_at_utc, expires_at_utc, created_at_utc
       FROM api_keys
       WHERE user_id = ?
       ORDER BY created_at_utc DESC`
    ).bind(user!.user_id).all<ApiKey>();
    
    return {
      keys: (keys.results || []).map(row => ({
        ...row,
        scopes: typeof row.scopes === 'string' ? JSON.parse(row.scopes) : row.scopes,
        is_active: Boolean(row.is_active)
      }))
    };
  },
});

/**
 * POST /api/user/api-keys - Create new API key
 */
export const onRequestPost = createEndpoint<ApiKeyCreateResponse, never, ApiKeyCreateRequest>({
  auth: 'required',
  cacheControl: 'no-store',

  parseBody: (body) => {
    if (!body.name || body.name.length < 1 || body.name.length > 100) {
      throw new Error('Name must be 1-100 characters');
    }
    return body;
  },

  handler: async ({ env, user, body }) => {
    // Check key limit (max 10 keys per user)
    const count = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM api_keys WHERE user_id = ? AND is_active = 1'
    ).bind(user!.user_id).first<{ count: number }>();
    
    if (count && count.count >= 10) {
      throw new Error('Maximum 10 active API keys allowed per user');
    }
    
    // Generate secure key part
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const key = `gm_${btoa(String.fromCharCode(...randomBytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')}`;
    const prefix = key.substring(0, 8);
    const keyId = generateId('key');
    const now = utcNow();
    
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    let expiresAt: string | null = null;
    if (body!.expiresInDays) {
      const expiresDate = new Date();
      expiresDate.setDate(expiresDate.getDate() + body!.expiresInDays);
      expiresAt = expiresDate.toISOString();
    }

    await env.DB.prepare(
      `INSERT INTO api_keys (
        key_id, user_id, key_hash, key_prefix, name, scopes,
        is_active, expires_at_utc, created_at_utc
      ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`
    ).bind(
      keyId, 
      user!.user_id, 
      keyHash, 
      prefix, 
      body!.name, 
      body!.scopes ? JSON.stringify(body!.scopes) : null,
      expiresAt,
      now
    ).run();

    return {
      keyId,
      key,
      prefix,
      message: 'API key created. Save it now - it will not be shown again.'
    };
  },
});

interface BatchDeleteQuery {
  keyId?: string;
}

/**
 * DELETE /api/user/api-keys - Deactivate API key
 */
export const onRequestDelete = createEndpoint<{ message: string }, BatchDeleteQuery>({
  auth: 'required',
  cacheControl: 'no-store',

  parseQuery: (searchParams) => ({
    keyId: searchParams.get('keyId') || undefined
  }),

  handler: async ({ env, user, query }) => {
    const { keyId } = query;
    if (!keyId) {
      throw new Error('keyId parameter required');
    }
    
    const result = await env.DB.prepare(
      'UPDATE api_keys SET is_active = 0 WHERE key_id = ? AND user_id = ?'
    ).bind(keyId, user!.user_id).run();
    
    if (result.meta.changes === 0) {
      throw new NotFoundError('API key');
    }
    
    return { message: 'API key deactivated' };
  },
});
