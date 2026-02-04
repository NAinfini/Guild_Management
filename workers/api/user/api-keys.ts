/**
 * API Key Management Endpoint
 * Allows users to generate and manage their API keys
 */

import { withAuth } from './_middleware';
import { successResponse, errorResponse } from './_utils';
import { generateAPIKey, validateAPIKey } from './_apiKeys';
import type { PagesFunction, Env } from './_types';

export const onRequestGet: PagesFunction<Env> = withAuth(async (context) => {
  const { env } = context;
  const user = context.data.user;
  
  // List user's API keys
  const keys = await env.DB.prepare(
    `SELECT key_id, key_prefix, name, scopes, is_active, 
            last_used_at_utc, expires_at_utc, created_at_utc
     FROM api_keys
     WHERE user_id = ?
     ORDER BY created_at_utc DESC`
  ).bind(user.user_id).all();
  
  return successResponse({
    keys: keys.results || []
  });
});

export const onRequestPost: PagesFunction<Env> = withAuth(async (context) => {
  const { request, env } = context;
  const user = context.data.user;
  
  const body = await request.json() as {
    name: string;
    scopes?: string[];
    expiresInDays?: number;
  };
  
  // Validate input
  if (!body.name || body.name.length < 1 || body.name.length > 100) {
    return errorResponse('INVALID_INPUT', 'Name must be 1-100 characters');
  }
  
  // Check key limit (max 10 keys per user)
  const count = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM api_keys WHERE user_id = ? AND is_active = 1'
  ).bind(user.user_id).first();
  
  if ((count?.count as number) >= 10) {
    return errorResponse(
      'KEY_LIMIT_EXCEEDED',
      'Maximum 10 active API keys allowed per user'
    );
  }
  
  // Generate key
  const { keyId, key, prefix } = await generateAPIKey(
    env,
    user.user_id,
    body.name,
    body.scopes || [],
    body.expiresInDays
  );
  
  return successResponse({
    keyId,
    key, // Only returned once!
    prefix,
    message: 'API key created. Save it now - it will not be shown again.'
  });
});

export const onRequestDelete: PagesFunction<Env> = withAuth(async (context) => {
  const { request, env } = context;
  const user = context.data.user;
  const url = new URL(request.url);
  const keyId = url.searchParams.get('keyId');
  
  if (!keyId) {
    return errorResponse('INVALID_INPUT', 'keyId parameter required');
  }
  
  // Verify ownership and deactivate
  const result = await env.DB.prepare(
    'UPDATE api_keys SET is_active = 0 WHERE key_id = ? AND user_id = ?'
  ).bind(keyId, user.user_id).run();
  
  if (result.meta.changes === 0) {
    return errorResponse('NOT_FOUND', 'API key not found');
  }
  
  return successResponse({ message: 'API key deactivated' });
});
