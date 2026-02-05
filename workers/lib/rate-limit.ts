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

// In-memory rate limit store (would use KV/Durable Objects in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Check rate limit
 * Returns true if request is allowed, false if rate limit exceeded
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  // If maxRequests is 0, block all requests
  if (maxRequests === 0) {
    return false;
  }

  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    // Create new record
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    // Rate limit exceeded
    return false;
  }

  // Increment count
  record.count++;
  return true;
}

/**
 * Get remaining requests for a rate limit key
 */
export function getRateLimitRemaining(
  key: string,
  maxRequests: number
): { remaining: number; resetAt: number } {
  const record = rateLimitStore.get(key);
  if (!record) {
    return { remaining: maxRequests, resetAt: Date.now() };
  }

  return {
    remaining: Math.max(0, maxRequests - record.count),
    resetAt: record.resetAt,
  };
}

/**
 * Clean up expired rate limit records (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// Auto-cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}

