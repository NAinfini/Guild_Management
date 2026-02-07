/**
 * Endpoint Registry Adapter
 * Bridges the shared endpoint contract with the worker-side registry
 * 
 * This module:
 * 1. Imports the shared endpoint definitions from shared/api/endpoints.ts
 * 2. Registers each endpoint in the worker-side registry with metadata
 * 3. Provides poll entity mappings for poll integration
 * 4. Exports initialization function for worker startup
 */

import { ENDPOINTS } from '@guild/shared-api/endpoints';
import {
  registerEndpoint,
  registerPollableEndpoint,
  getRegistrySummary,
} from './endpoint-registry';

// ============================================================
// Poll Entity Mappings
// ============================================================

/**
 * Maps shared endpoint paths to poll entity types
 * Used by the poll endpoint to group and filter entities
 */
const POLL_ENTITY_MAPPINGS: Record<string, string> = {
  '/members': 'members',
  '/events': 'events',
  '/announcements': 'announcements',
  // Wars endpoints are not currently pollable
  // '/wars/active': 'wars',
};

/**
 * Endpoints that should be registered as pollable
 */
const POLLABLE_ENDPOINTS = [
  '/members',
  '/events',
  '/announcements',
];

// ============================================================
// Registry Initialization
// ============================================================

/**
 * Initialize the endpoint registry with all shared endpoint definitions
 * This should be called during worker startup
 */
export function initializeEndpointRegistry(): void {
  console.log('[Registry] Initializing endpoint registry from shared contract...');

  // Iterate through all endpoint groups
  for (const [groupName, group] of Object.entries(ENDPOINTS)) {
    // Iterate through all endpoints in the group
    for (const [endpointName, endpointDef] of Object.entries(group)) {
      const path = endpointDef.path;
      const method = endpointDef.method;

      // Determine auth level based on endpoint group
      const authLevel = determineAuthLevel(groupName, endpointName);

      // Determine if this endpoint is pollable
      const pollable = POLLABLE_ENDPOINTS.includes(path);
      const pollEntity = pollable ? POLL_ENTITY_MAPPINGS[path] : undefined;

      // Register the endpoint
      registerEndpoint(path, [method], {
        authLevel,
        pollable,
        pollEntity,
        cache: {
          etag: method === 'GET', // ETag for GET requests
          maxAge: method === 'GET' ? 60 : undefined, // 60s cache for GET
        },
        description: `${groupName}.${endpointName}`,
      });

    }
  }

  // Log registration summary
  const summary = getRegistrySummary();
  console.log('[Registry] Registration complete:', {
    totalEndpoints: summary.totalEndpoints,
    pollableEndpoints: summary.pollableEndpoints,
    endpointsByAuth: summary.endpointsByAuth,
    endpointsByEntity: summary.endpointsByEntity,
  });
}

/**
 * Determine the auth level for an endpoint based on its group and name
 */
function determineAuthLevel(groupName: string, endpointName: string): 'none' | 'optional' | 'required' | 'moderator' | 'admin' {
  // Auth endpoints
  if (groupName === 'auth') {
    if (endpointName === 'login' || endpointName === 'signup' || endpointName === 'csrf') {
      return 'none';
    }
    return 'required'; // logout, session, changePassword
  }

  // Admin endpoints
  if (groupName === 'admin') {
    return 'admin';
  }

  // Wars endpoints - most require moderator
  if (groupName === 'wars') {
    if (endpointName === 'active' || endpointName === 'get') {
      return 'optional';
    }
    return 'moderator';
  }

  // Media endpoints - uploads require auth
  if (groupName === 'media') {
    if (endpointName === 'get') {
      return 'optional';
    }
    return 'required';
  }

  // Upload endpoints
  if (groupName === 'upload') {
    return 'required';
  }

  // Default: most endpoints require auth
  // Members, Events, Announcements, Gallery, Health
  if (groupName === 'health') {
    return 'none';
  }

  if (groupName === 'gallery') {
    return 'optional';
  }

  return 'required';
}

// ============================================================
// Poll Handler Registration
// ============================================================

/**
 * Register poll handlers for pollable entities
 * These handlers are called by the poll endpoint to fetch data
 * 
 * Note: Handlers are registered separately when endpoints are migrated
 * to use createEndpoint pattern. This is a placeholder for future integration.
 */
export function registerPollHandlers(handlers: Record<string, () => Promise<any>>): void {
  for (const [entity, handler] of Object.entries(handlers)) {
    const path = Object.entries(POLL_ENTITY_MAPPINGS).find(([_, e]) => e === entity)?.[0];
    if (path) {
      registerPollableEndpoint(entity, path, handler);
    }
  }
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Get the canonical path for an endpoint from the shared contract
 */
export function getCanonicalPath(groupName: string, endpointName: string): string | undefined {
  const group = ENDPOINTS[groupName as keyof typeof ENDPOINTS];
  if (!group) return undefined;

  const endpoint = (group as Record<string, { path: string; method: string }>)[endpointName];
  if (!endpoint) return undefined;

  return endpoint.path;
}

/**
 * Get all endpoint paths from the shared contract
 */
export function getAllEndpointPaths(): string[] {
  const paths: string[] = [];
  for (const group of Object.values(ENDPOINTS)) {
    for (const endpoint of Object.values(group)) {
      paths.push(endpoint.path);
    }
  }
  return paths;
}

/**
 * Check if a path exists in the shared contract
 */
export function isValidEndpointPath(path: string): boolean {
  return getAllEndpointPaths().includes(path);
}

// ============================================================
// Export Registry Initialization
// ============================================================

/**
 * Auto-initialize the registry when this module is imported
 * This ensures all endpoints are registered before any requests are handled
 */
if (typeof globalThis !== 'undefined' && !(globalThis as any).__endpointRegistryInitialized__) {
  initializeEndpointRegistry();
  (globalThis as any).__endpointRegistryInitialized__ = true;
}
