/**
 * Dynamic Route Loader
 * Loads endpoint handlers dynamically based on registry
 * Eliminates need for manual route configuration
 */

import type { PagesFunction, Env } from './types';

// ============================================================
// Types
// ============================================================

export interface RouteHandler {
  onRequestGet?: PagesFunction<any>;
  onRequestPost?: PagesFunction<any>;
  onRequestPut?: PagesFunction<any>;
  onRequestPatch?: PagesFunction<any>;
  onRequestDelete?: PagesFunction<any>;
}

export interface RouteMatch {
  handler: RouteHandler;
  params: Record<string, string>;
  path: string; // The matched path pattern
}

// ============================================================
// Route Loading Registry
// ============================================================

// Cache for loaded route handlers (lazy loading)
const handlerCache = new Map<string, RouteHandler>();

/**
 * Register a route handler
 * Called by endpoint files during initialization
 */
export function registerRouteHandler(path: string, handler: RouteHandler): void {
  handlerCache.set(path, handler);
}

/**
 * Get a registered route handler
 */
export function getRouteHandler(path: string): RouteHandler | undefined {
  return handlerCache.get(path);
}

/**
 * Clear the handler cache (useful for testing)
 */
export function clearHandlerCache(): void {
  handlerCache.clear();
}

// ============================================================
// Path Pattern Matching
// ============================================================

/**
 * Convert path pattern to regex
 * Example: '/members/:id' -> /^\/members\/([^/]+)$/
 */
function pathPatternToRegex(pattern: string): {
  regex: RegExp;
  paramNames: string[];
} {
  // Extract parameter names
  const paramNames: string[] = [];
  const regexPattern = pattern.replace(/:(\w+)/g, (_, paramName) => {
    paramNames.push(paramName);
    return '([^/]+)';
  });

  return {
    regex: new RegExp(`^${regexPattern}$`),
    paramNames,
  };
}

/**
 * Match a pathname against a path pattern
 * Returns extracted parameters if matched
 */
function matchPathPattern(
  pathname: string,
  pattern: string
): Record<string, string> | null {
  const { regex, paramNames } = pathPatternToRegex(pattern);
  const match = pathname.match(regex);

  if (!match) {
    return null;
  }

  // Extract parameters from regex capture groups
  const params: Record<string, string> = {};
  for (let i = 0; i < paramNames.length; i++) {
    params[paramNames[i]] = match[i + 1];
  }

  return params;
}

// ============================================================
// Route Matcher
// ============================================================

/**
 * Match a request pathname to a registered route handler
 * Uses cached handlers and dynamic pattern matching
 */
export function matchRoute(pathname: string): RouteMatch | null {
  // Remove /api prefix if present
  const normalizedPath = pathname.startsWith('/api')
    ? pathname.substring(4)
    : pathname;

  // Try exact match first (most common case, fastest)
  const exactHandler = handlerCache.get(normalizedPath);
  if (exactHandler) {
    return {
      handler: exactHandler,
      params: {},
      path: normalizedPath,
    };
  }

  // Try pattern matching for dynamic routes
  // Sort by specificity (longer paths first, then by parameter count)
  const patterns = Array.from(handlerCache.keys()).sort((a, b) => {
    const aParams = (a.match(/:/g) || []).length;
    const bParams = (b.match(/:/g) || []).length;
    if (aParams !== bParams) return aParams - bParams; // Fewer params first
    return b.length - a.length; // Longer paths first
  });

  for (const pattern of patterns) {
    const params = matchPathPattern(normalizedPath, pattern);
    if (params !== null) {
      const handler = handlerCache.get(pattern);
      if (handler) {
        return {
          handler,
          params,
          path: pattern,
        };
      }
    }
  }

  return null;
}

// ============================================================
// Bulk Registration
// ============================================================

/**
 * Register multiple route handlers at once
 * Useful for initial setup
 */
export function registerRouteHandlers(
  routes: Record<string, RouteHandler>
): void {
  for (const [path, handler] of Object.entries(routes)) {
    registerRouteHandler(path, handler);
  }
}

/**
 * Get all registered routes (for debugging)
 */
export function getAllRoutes(): string[] {
  return Array.from(handlerCache.keys());
}

/**
 * Get route statistics
 */
export function getRouteStats(): {
  totalRoutes: number;
  staticRoutes: number;
  dynamicRoutes: number;
} {
  const routes = Array.from(handlerCache.keys());
  const dynamicRoutes = routes.filter(r => r.includes(':')).length;

  return {
    totalRoutes: routes.length,
    staticRoutes: routes.length - dynamicRoutes,
    dynamicRoutes,
  };
}

