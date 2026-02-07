/**
 * API Key Management
 * POST /auth/api-keys - Create new API key
 * GET /auth/api-keys - List user's API keys
 */

import { createEndpoint } from '../../core/endpoint-factory';
import { generateId } from '../../core/utils';
import { utcNow } from '../../core/utils';

interface ApiKeyCreateRequest {
  name: string;
  scopes?: string[];
  expires_at?: string;
}

interface ApiKeyResponse {
  key_id: string;
  key?: string; // Only returned on creation
  key_prefix: string;
  name: string;
  scopes: string[] | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  last_used_at: string | null;
}

/**
 * Generate a secure API key
 * Format: gm_<random_base64>
 */
function generateApiKey(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const base64 = btoa(String.fromCharCode(...randomBytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return `gm_${base64}`;
}

/**
 * Hash API key using SHA-256
 */
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * POST /auth/api-keys - Create new API key
 */
export const onRequestPost = createEndpoint<ApiKeyResponse>({
  auth: 'required',
  handler: async ({ env, user, request }) => {
    const body = (await request.json()) as ApiKeyCreateRequest;

    // Validate request
    if (!body.name || body.name.trim().length === 0) {
      throw new Error('API key name is required');
    }

    if (body.name.length > 100) {
      throw new Error('API key name must be 100 characters or less');
    }

    // Validate scopes (optional)
    const scopes = body.scopes || [];
    const validScopes = [
      'events:read',
      'events:write',
      'members:read',
      'announcements:read',
      'wars:read',
      'gallery:read',
    ];

    for (const scope of scopes) {
      if (!validScopes.includes(scope)) {
        throw new Error(`Invalid scope: ${scope}`);
      }
    }

    // Validate expires_at (optional)
    let expiresAt: string | null = null;
    if (body.expires_at) {
      const expiresDate = new Date(body.expires_at);
      if (isNaN(expiresDate.getTime())) {
        throw new Error('Invalid expires_at date format');
      }
      expiresAt = expiresDate.toISOString();
    }

    // Generate API key
    const apiKey = generateApiKey();
    const keyHash = await hashApiKey(apiKey);
    const keyPrefix = apiKey.substring(0, 8); // First 8 chars for identification
    const keyId = generateId('key');
    const now = utcNow();

    // Insert into database
    await env.DB.prepare(
      `INSERT INTO api_keys (
        key_id, user_id, key_hash, key_prefix, name, scopes,
        is_active, expires_at_utc, created_at_utc, last_used_at_utc
      ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, NULL)`
    )
      .bind(
        keyId,
        user!.user_id,
        keyHash,
        keyPrefix,
        body.name.trim(),
        scopes.length > 0 ? JSON.stringify(scopes) : null,
        expiresAt,
        now,
      )
      .run();

    // Return response with FULL KEY (only shown once)
    return {
      key_id: keyId,
      key: apiKey, // ONLY RETURNED ON CREATION
      key_prefix: keyPrefix,
      name: body.name.trim(),
      scopes: scopes.length > 0 ? scopes : null,
      is_active: true,
      expires_at: expiresAt,
      created_at: now,
      last_used_at: null,
    };
  },
});

/**
 * GET /auth/api-keys - List user's API keys
 */
export const onRequestGet = createEndpoint<ApiKeyResponse[]>({
  auth: 'required',
  etag: true,
  cacheControl: 'private, max-age=60',
  handler: async ({ env, user }) => {
    const result = await env.DB.prepare(
      `SELECT
        key_id, key_prefix, name, scopes, is_active,
        expires_at_utc, created_at_utc, last_used_at_utc
      FROM api_keys
      WHERE user_id = ?
      ORDER BY created_at_utc DESC`
    )
      .bind(user!.user_id)
      .all();

    return (result.results || []).map((row: any) => ({
      key_id: row.key_id,
      key_prefix: row.key_prefix,
      name: row.name,
      scopes: row.scopes ? JSON.parse(row.scopes) : null,
      is_active: row.is_active === 1,
      expires_at: row.expires_at_utc,
      created_at: row.created_at_utc,
      last_used_at: row.last_used_at_utc,
    }));
  },
});
