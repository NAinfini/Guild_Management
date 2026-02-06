/**
 * API Key Authentication Support
 * Allows users to generate API keys for programmatic access
 */

import type { Env } from './types';
import { unauthorizedResponse, errorResponse } from './utils';

const API_KEY_PREFIX_LENGTH = 8;
const API_KEY_SECRET_LENGTH = 32;

function randomHex(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate new API key
 * Returns: { keyId, key, prefix }
 */
export async function generateAPIKey(
  env: Env,
  userId: string,
  name: string,
  scopes: string[] = [],
  expiresInDays?: number
): Promise<{ keyId: string; key: string; prefix: string }> {
  const keyId = crypto.randomUUID();
  // Generate random bytes for secret
  const secret = randomHex(API_KEY_SECRET_LENGTH);
  const prefix = secret.substring(0, API_KEY_PREFIX_LENGTH);
  const fullKey = `gm_${prefix}_${secret}`;
  
  // Hash the secret for storage
  const keyHash = await hashAPIKey(secret);
  
  // Calculate expiration
  const expiresAt = expiresInDays 
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null;
  
  // Store in database
  await env.DB.prepare(
    `INSERT INTO api_keys 
     (key_id, user_id, key_hash, key_prefix, name, scopes, expires_at_utc)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    keyId,
    userId,
    keyHash,
    prefix,
    name,
    JSON.stringify(scopes),
    expiresAt
  ).run();
  
  return { keyId, key: fullKey, prefix };
}

/**
 * Hash API key for secure storage
 */
async function hashAPIKey(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface ApiKeyRecord {
  key_id: string;
  user_id: string;
  scopes: string;
  expires_at_utc: string | null;
  is_active: number;
}

/**
 * Validate API key and return user
 */
export async function validateAPIKey(
  env: Env,
  apiKey: string
): Promise<{ userId: string; scopes: string[] } | null> {
  // Parse key format: gm_{prefix}_{secret}
  const parts = apiKey.split('_');
  if (parts.length !== 3 || parts[0] !== 'gm') {
    return null;
  }
  
  const [, prefix, secret] = parts;
  const keyHash = await hashAPIKey(secret);
  
  // Find key in database
  const result = await env.DB.prepare(
    `SELECT key_id, user_id, scopes, expires_at_utc, is_active
     FROM api_keys
     WHERE key_prefix = ? AND key_hash = ?`
  ).bind(prefix, keyHash).first<ApiKeyRecord>();
  
  if (!result) return null;
  
  // Check if active
  if (result.is_active !== 1) return null;
  
  // Check if expired
  if (result.expires_at_utc) {
    const expiresAt = new Date(result.expires_at_utc as string);
    if (expiresAt < new Date()) return null;
  }
  
  // Update last used timestamp
  await env.DB.prepare(
    'UPDATE api_keys SET last_used_at_utc = ? WHERE key_id = ?'
  ).bind(new Date().toISOString(), result.key_id).run();
  
  // Parse scopes
  const scopes = result.scopes ? JSON.parse(result.scopes as string) : [];
  
  return {
    userId: result.user_id as string,
    scopes,
  };
}

/**
 * API Key authentication middleware
 * Checks for API key in Authorization header
 */
export async function withAPIKeyAuth(context: any, next: Function) {
  const { request, env } = context;
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(context);
  }
  
  const token = authHeader.substring(7);
  
  // Check if it's an API key (starts with gm_)
  if (!token.startsWith('gm_')) {
    return next(context);
  }
  
  const keyData = await validateAPIKey(env, token);
  
  if (!keyData) {
    return unauthorizedResponse('Invalid or expired API key');
  }
  
  // Load user from database
  const user = await env.DB.prepare(
    'SELECT * FROM users WHERE user_id = ?'
  ).bind(keyData.userId).first();
  
  if (!user || user.is_active !== 1) {
    return unauthorizedResponse('User not found or inactive');
  }
  
  // Attach user and API key info to context
  context.data = context.data || {};
  context.data.user = user;
  context.data.apiKey = { scopes: keyData.scopes };
  
  return next(context);
}

/**
 * Check if user has required scope
 */
export function requireScope(scope: string) {
  return (context: any, next: Function) => {
    const scopes = context.data?.apiKey?.scopes || [];
    
    if (!scopes.includes(scope) && !scopes.includes('*')) {
      return errorResponse(
        'INSUFFICIENT_SCOPE',
        `This action requires the '${scope}' scope`,
        403
      );
    }
    
    return next(context);
  };
}

