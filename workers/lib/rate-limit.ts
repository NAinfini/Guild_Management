/**
 * Rate Limiting System
 * Provides tiered rate limiting based on user authentication level
 */

export interface RateLimitConfig {
  anonymous: { requests: number; window: number };
  authenticated: { requests: number; window: number };
  moderator: { requests: number; window: number };
}

/**
 * Rate limit configurations per endpoint
 * Format: 'METHOD:PATH' -> config
 */
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Read endpoints - moderate limits
  'GET:/members': {
    anonymous: { requests: 10, window: 60000 },       // 10/min
    authenticated: { requests: 60, window: 60000 },   // 60/min
    moderator: { requests: 300, window: 60000 },      // 300/min
  },
  'GET:/events': {
    anonymous: { requests: 10, window: 60000 },
    authenticated: { requests: 60, window: 60000 },
    moderator: { requests: 300, window: 60000 },
  },
  'GET:/announcements': {
    anonymous: { requests: 10, window: 60000 },
    authenticated: { requests: 60, window: 60000 },
    moderator: { requests: 300, window: 60000 },
  },
  'GET:/wars/active': {
    anonymous: { requests: 10, window: 60000 },
    authenticated: { requests: 60, window: 60000 },
    moderator: { requests: 300, window: 60000 },
  },
  'GET:/wars/history': {
    anonymous: { requests: 10, window: 60000 },
    authenticated: { requests: 60, window: 60000 },
    moderator: { requests: 300, window: 60000 },
  },

  // Write endpoints - strict limits
  'POST:/events': {
    anonymous: { requests: 0, window: 0 },             // Blocked
    authenticated: { requests: 10, window: 3600000 },  // 10/hour
    moderator: { requests: 100, window: 3600000 },     // 100/hour
  },
  'POST:/announcements': {
    anonymous: { requests: 0, window: 0 },
    authenticated: { requests: 5, window: 3600000 },   // 5/hour
    moderator: { requests: 50, window: 3600000 },      // 50/hour
  },
  'POST:/members': {
    anonymous: { requests: 0, window: 0 },
    authenticated: { requests: 0, window: 0 },          // Only moderators
    moderator: { requests: 20, window: 3600000 },      // 20/hour
  },

  // Update endpoints - moderate limits
  'PUT:/members/:id': {
    anonymous: { requests: 0, window: 0 },
    authenticated: { requests: 30, window: 3600000 },  // 30/hour (own profile)
    moderator: { requests: 100, window: 3600000 },     // 100/hour
  },
  'PUT:/events/:id': {
    anonymous: { requests: 0, window: 0 },
    authenticated: { requests: 20, window: 3600000 },
    moderator: { requests: 100, window: 3600000 },
  },
  'PUT:/announcements/:id': {
    anonymous: { requests: 0, window: 0 },
    authenticated: { requests: 0, window: 0 },
    moderator: { requests: 50, window: 3600000 },
  },

  // Delete endpoints - strict limits
  'DELETE:/events/:id': {
    anonymous: { requests: 0, window: 0 },
    authenticated: { requests: 5, window: 3600000 },   // 5/hour
    moderator: { requests: 50, window: 3600000 },      // 50/hour
  },
  'DELETE:/announcements/:id': {
    anonymous: { requests: 0, window: 0 },
    authenticated: { requests: 0, window: 0 },
    moderator: { requests: 20, window: 3600000 },
  },
};

/**
 * Get rate limit configuration for an endpoint
 * Returns null if no rate limit configured
 */
export function getRateLimitConfig(
  method: string,
  path: string
): RateLimitConfig | null {
  // Try exact match first
  const key = `${method}:${path}`;
  if (RATE_LIMITS[key]) {
    return RATE_LIMITS[key];
  }

  // Try pattern match (remove IDs from path)
  const patternPath = path.replace(/\/[a-z]{3,}_[a-zA-Z0-9_-]+/g, '/:id');
  const patternKey = `${method}:${patternPath}`;
  if (RATE_LIMITS[patternKey]) {
    return RATE_LIMITS[patternKey];
  }

  return null;
}

/**
 * Determine user tier for rate limiting
 */
export function getUserTier(
  user: any | null,
  isModerator: boolean
): keyof RateLimitConfig {
  if (!user) return 'anonymous';
  if (isModerator) return 'moderator';
  return 'authenticated';
}

/**
 * Generate rate limit key for tracking
 */
export function getRateLimitKey(
  request: Request,
  endpoint: string,
  userId?: string
): string {
  // Use IP for anonymous, userId for authenticated
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const identifier = userId || ip;
  return `ratelimit:${endpoint}:${identifier}`;
}

/**
 * Rate limit result from Durable Object
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit via ConnectionManager Durable Object
 * Uses DO SQLite for distributed, persistent counters
 */
export async function checkRateLimitDO(
  env: { CONNECTIONS: DurableObjectNamespace },
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (maxRequests === 0) {
    return { allowed: false, remaining: 0, resetAt: Date.now() };
  }

  try {
    const id = env.CONNECTIONS.idFromName('rate-limiter');
    const stub = env.CONNECTIONS.get(id);
    const response = await stub.fetch('https://internal/rate-limit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, maxRequests, windowMs }),
    });
    return await response.json() as RateLimitResult;
  } catch (error) {
    console.error('[RateLimit] DO call failed, failing open:', error);
    // Fail open if DO is unavailable
    return { allowed: true, remaining: maxRequests, resetAt: Date.now() };
  }
}

