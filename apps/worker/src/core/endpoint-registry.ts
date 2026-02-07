/**
 * Endpoint Registry
 * Central registry for all API endpoints with metadata
 * Enables auto-discovery for poll integration and future tooling
 */

import type { EndpointConfig } from './endpoint-factory';

// ============================================================
// Registry Types
// ============================================================

export interface EndpointMetadata {
  /** Endpoint path pattern (e.g., '/members', '/members/:id') */
  path: string;
  
  /** HTTP methods supported */
  methods: Array<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>;
  
  /** Authentication level required */
  authLevel: 'none' | 'optional' | 'required' | 'moderator' | 'admin';
  
  /** Whether this endpoint is pollable */
  pollable: boolean;
  
  /** Poll entity type (for grouping in poll responses) */
  pollEntity?: string;
  
  /** Cache configuration */
  cache?: {
    maxAge?: number;
    etag: boolean;
  };
  
  /** Rate limit configuration */
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  
  /** Description for documentation */
  description?: string;
}

export interface PollableEndpointInfo {
  path: string;
  entity: string;
  handler: () => Promise<any>;
}

// ============================================================
// Registry Storage
// ============================================================

const endpointRegistry = new Map<string, EndpointMetadata>();
const pollableEndpoints = new Map<string, PollableEndpointInfo>();

// ============================================================
// Registry Functions
// ============================================================

/**
 * Register an endpoint with metadata
 */
export function registerEndpoint(
  path: string,
  methods: EndpointMetadata['methods'],
  config: Partial<EndpointMetadata> = {}
): void {
  const metadata: EndpointMetadata = {
    path,
    methods,
    authLevel: config.authLevel ?? 'none',
    pollable: config.pollable ?? false,
    pollEntity: config.pollEntity,
    cache: config.cache,
    rateLimit: config.rateLimit,
    description: config.description,
  };

  endpointRegistry.set(path, metadata);

  // Register for poll if pollable
  if (metadata.pollable && metadata.pollEntity) {
    // Note: Handler will be registered separately when endpoint is created
    console.log(`[Registry] Registered pollable endpoint: ${path} (${metadata.pollEntity})`);
  }
}

/**
 * Register a pollable endpoint handler
 */
export function registerPollableEndpoint(
  entity: string,
  path: string,
  handler: () => Promise<any>
): void {
  pollableEndpoints.set(entity, { path, entity, handler });
  console.log(`[Registry] Registered poll handler for entity: ${entity}`);
}

/**
 * Get all registered endpoints
 */
export function getAllEndpoints(): Map<string, EndpointMetadata> {
  return new Map(endpointRegistry);
}

/**
 * Get endpoint metadata by path
 */
export function getEndpoint(path: string): EndpointMetadata | undefined {
  return endpointRegistry.get(path);
}

/**
 * Get all pollable endpoints
 */
export function getPollableEndpoints(): Map<string, PollableEndpointInfo> {
  return new Map(pollableEndpoints);
}

/**
 * Get pollable endpoint by entity type
 */
export function getPollableEndpoint(entity: string): PollableEndpointInfo | undefined {
  return pollableEndpoints.get(entity);
}

/**
 * Check if an endpoint exists
 */
export function hasEndpoint(path: string): boolean {
  return endpointRegistry.has(path);
}

/**
 * Get all endpoints for a specific entity type
 */
export function getEndpointsByEntity(entity: string): EndpointMetadata[] {
  const endpoints: EndpointMetadata[] = [];
  
  for (const [path, metadata] of endpointRegistry.entries()) {
    if (metadata.pollEntity === entity) {
      endpoints.push(metadata);
    }
  }
  
  return endpoints;
}

/**
 * Get all pollable entity types
 */
export function getPollableEntities(): string[] {
  return Array.from(pollableEndpoints.keys());
}

/**
 * Clear the registry (useful for testing)
 */
export function clearRegistry(): void {
  endpointRegistry.clear();
  pollableEndpoints.clear();
}

// ============================================================
// Auto-Registration Helper
// ============================================================

/**
 * Helper to create and register an endpoint in one call
 * This is used internally by the endpoint factory
 */
export function createRegisteredEndpoint(
  path: string,
  methods: EndpointMetadata['methods'],
  config: EndpointConfig & { description?: string }
) {
  // Register metadata
  registerEndpoint(path, methods, {
    authLevel: config.auth,
    pollable: config.pollable,
    pollEntity: config.pollEntity,
    cache: config.etag ? { etag: true } : undefined,
    rateLimit: config.rateLimit,
    description: config.description,
  });

  return config;
}

// ============================================================
// Registry Introspection (for debugging/documentation)
// ============================================================

/**
 * Get a summary of all registered endpoints
 */
export function getRegistrySummary(): {
  totalEndpoints: number;
  pollableEndpoints: number;
  endpointsByAuth: Record<string, number>;
  endpointsByEntity: Record<string, number>;
} {
  const endpointsByAuth: Record<string, number> = {};
  const endpointsByEntity: Record<string, number> = {};

  for (const metadata of endpointRegistry.values()) {
    // Count by auth level
    endpointsByAuth[metadata.authLevel] = (endpointsByAuth[metadata.authLevel] ?? 0) + 1;

    // Count by entity
    if (metadata.pollEntity) {
      endpointsByEntity[metadata.pollEntity] = (endpointsByEntity[metadata.pollEntity] ?? 0) + 1;
    }
  }

  return {
    totalEndpoints: endpointRegistry.size,
    pollableEndpoints: pollableEndpoints.size,
    endpointsByAuth,
    endpointsByEntity,
  };
}

/**
 * Export registry as JSON (for documentation generation)
 */
export function exportRegistry(): Record<string, EndpointMetadata> {
  const exported: Record<string, EndpointMetadata> = {};
  
  for (const [path, metadata] of endpointRegistry.entries()) {
    exported[path] = metadata;
  }
  
  return exported;
}
