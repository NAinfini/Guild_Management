/**
 * Middleware for authentication and request context
 */

import type { EventContext, Env, User, Session, RequestContext } from './types';
import { getSession, getUser, getCookieValue, unauthorizedResponse, handleCors } from './utils';

// ============================================================
// Authentication Middleware
// ============================================================

export async function withAuth(
  context: EventContext<Env, any, any>,
  handler: (context: EventContext<Env, any, RequestContext>) => Promise<Response>
): Promise<Response> {
  // Handle CORS preflight
  const corsResponse = handleCors(context.request);
  if (corsResponse) return corsResponse;

  // Get session from cookie
  const sessionId = getCookieValue(context.request, 'session_id');
  
  if (!sessionId) {
    return unauthorizedResponse('No session found');
  }

  // Validate session
  const session = await getSession(context.env.DB, sessionId);
  if (!session) {
    return unauthorizedResponse('Invalid or expired session');
  }

  // Get user
  const user = await getUser(context.env.DB, session.user_id);
  if (!user || !user.is_active) {
    return unauthorizedResponse('User not found or inactive');
  }

  // Update session last_used_at
  await context.env.DB
    .prepare('UPDATE sessions SET last_used_at_utc = datetime(\'now\') WHERE session_id = ?')
    .bind(sessionId)
    .run();

  // Create request context
  const requestContext: RequestContext = {
    user,
    session,
    isAuthenticated: true,
    isAdmin: user.role === 'admin',
    isModerator: user.role === 'moderator' || user.role === 'admin',
  };

  // Call handler with context
  return handler({
    ...context,
    data: requestContext,
  });
}

// ============================================================
// Optional Auth Middleware (for endpoints that work with or without auth)
// ============================================================

export async function withOptionalAuth(
  context: EventContext<Env, any, any>,
  handler: (context: EventContext<Env, any, RequestContext>) => Promise<Response>
): Promise<Response> {
  // Handle CORS preflight
  const corsResponse = handleCors(context.request);
  if (corsResponse) return corsResponse;

  // Get session from cookie
  const sessionId = getCookieValue(context.request, 'session_id');
  
  let user: User | null = null;
  let session: Session | null = null;

  if (sessionId) {
    session = await getSession(context.env.DB, sessionId);
    if (session) {
      user = await getUser(context.env.DB, session.user_id);
      
      // Update session last_used_at
      await context.env.DB
        .prepare('UPDATE sessions SET last_used_at_utc = datetime(\'now\') WHERE session_id = ?')
        .bind(sessionId)
        .run();
    }
  }

  // Create request context
  const requestContext: RequestContext = {
    user,
    session,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isModerator: user?.role === 'moderator' || user?.role === 'admin',
  };

  // Call handler with context
  return handler({
    ...context,
    data: requestContext,
  });
}

// ============================================================
// Admin-Only Middleware
// ============================================================

export async function withAdminAuth(
  context: EventContext<Env, any, any>,
  handler: (context: EventContext<Env, any, RequestContext>) => Promise<Response>
): Promise<Response> {
  return withAuth(context, async (authContext) => {
    const { user } = authContext.data;
    
    if (user?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return handler(authContext);
  });
}

// ============================================================
// Moderator-Only Middleware
// ============================================================

export async function withModeratorAuth(
  context: EventContext<Env, any, any>,
  handler: (context: EventContext<Env, any, RequestContext>) => Promise<Response>
): Promise<Response> {
  return withAuth(context, async (authContext) => {
    const { user } = authContext.data;
    
    if (user?.role !== 'admin' && user?.role !== 'moderator') {
      return new Response(JSON.stringify({ error: 'Moderator access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return handler(authContext);
  });
}

// ============================================================
// Rate Limiting (Simple in-memory, use Durable Objects for production)
// ============================================================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export function getRateLimitKey(request: Request, prefix: string): string {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  return `${prefix}:${ip}`;
}

