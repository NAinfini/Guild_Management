/**
 * Rate Limiting Middleware
 * Prevents API abuse by limiting request frequency per user/IP
 */

import type { PagesFunction, Env } from './_types';
import { errorResponse } from './_utils';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store (development) - In production, use Cloudflare KV or DO
const rateLimitStore = new Map<string, RateLimitRecord>();

// Rate limit configurations by endpoint type
export const RATE_LIMITS = {
  // Authentication endpoints - stricter limits
  auth: { requests: 5, windowMs: 60000 }, // 5 req/min
  
  // Batch operations - moderate limits
  batch: { requests: 10, windowMs: 60000 }, // 10 req/min
  
  // Poll endpoint - high frequency allowed
  poll: { requests: 120, windowMs: 60000 }, // 2 req/sec
  
  // Standard API calls
  standard: { requests: 60, windowMs: 60000 }, // 1 req/sec
  
  // Push connections
  push: { requests: 3, windowMs: 60000 }, // 3 connections/min
};

/**
 * Check if request is within rate limit
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  // No record or window expired - create new
  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  // Limit exceeded
  if (record.count >= limit) {
    return false;
  }
  
  // Increment count
  record.count++;
  return true;
}

/**
 * Get retry-after seconds
 */
export function getRetryAfter(key: string): number {
  const record = rateLimitStore.get(key);
  if (!record) return 0;
  
  const now = Date.now();
  if (now > record.resetAt) return 0;
  
  return Math.ceil((record.resetAt - now) / 1000);
}

/**
 * Cleanup expired records (call periodically)
 */
export function cleanupExpiredRecords(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit(limitType: keyof typeof RATE_LIMITS) {
  return async (context: any, next: Function) => {
    const { request } = context;
    const config = RATE_LIMITS[limitType];
    
    // Generate key: user ID if authenticated, otherwise IP
    const userId = context.data?.user?.user_id;
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const key = userId ? `user:${userId}:${limitType}` : `ip:${ip}:${limitType}`;
    
    // Check rate limit
    if (!checkRateLimit(key, config.requests, config.windowMs)) {
      const retryAfter = getRetryAfter(key);
      
      const response = errorResponse(
        'RATE_LIMIT_EXCEEDED',
        `Too many requests. Try again in ${retryAfter} seconds.`,
        429
      );
      
      response.headers.set('Retry-After', retryAfter.toString());
      response.headers.set('X-RateLimit-Limit', config.requests.toString());
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', (Date.now() + retryAfter * 1000).toString());
      
      return response;
    }
    
    // Add rate limit headers
    const record = rateLimitStore.get(key)!;
    const remaining = config.requests - record.count;
    
    const response = await next(context);
    response.headers.set('X-RateLimit-Limit', config.requests.toString());
    response.headers.set('X-RateLimit-Remaining', Math.max(0, remaining).toString());
    response.headers.set('X-RateLimit-Reset', record.resetAt.toString());
    
    return response;
  };
}

// Cleanup expired records every 5 minutes
setInterval(cleanupExpiredRecords, 5 * 60 * 1000);
