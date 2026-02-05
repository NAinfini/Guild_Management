/**
 * Type-Safe API Client Builder
 * Creates a fully typed API client from endpoint definitions
 */

import { api } from '../api-client';
import { ENDPOINTS, buildPath, type EndpointDef } from '@shared/api/endpoints';

// ============================================================
// Types
// ============================================================

type PathParams<T extends string> = T extends `${infer _Start}:${infer Param}/${infer Rest}`
  ? { [K in Param | keyof PathParams<Rest>]: string | number }
  : T extends `${infer _Start}:${infer Param}`
  ? { [K in Param]: string | number }
  : never;

type HasPathParams<T extends string> = T extends `${string}:${string}` ? true : false;

interface RequestOptions<TPath extends string> {
  params?: HasPathParams<TPath> extends true ? PathParams<TPath> : never;
  query?: Record<string, any>;
  body?: any;
}

// ============================================================
// API Client Builder
// ============================================================

/**
 * Create a type-safe API method from an endpoint definition
 */
function createEndpointMethod<TPath extends string>(
  endpoint: EndpointDef & { path: TPath }
) {
  return async <TResponse = any>(
    options?: RequestOptions<TPath>
  ): Promise<TResponse> => {
    const { params, query, body } = options || {};
    
    // Build path with parameters
    const path = buildPath(endpoint.path, params as any);
    
    // Call appropriate HTTP method
    switch (endpoint.method) {
      case 'GET':
        return api.get<TResponse>(path, query);
      case 'POST':
        return api.post<TResponse>(path, body, query);
      case 'PUT':
        return api.put<TResponse>(path, body, query);
      case 'DELETE':
        return api.delete<TResponse>(path, query);
      case 'PATCH':
        return api.patch<TResponse>(path, body, query);
      default:
        throw new Error(`Unsupported HTTP method: ${endpoint.method}`);
    }
  };
}

/**
 * Create API client from endpoint definitions
 */
function createAPIClient<T extends Record<string, Record<string, EndpointDef>>>(
  endpoints: T
) {
  const client: any = {};
  
  for (const [group, groupEndpoints] of Object.entries(endpoints)) {
    client[group] = {};
    
    for (const [name, endpoint] of Object.entries(groupEndpoints)) {
      client[group][name] = createEndpointMethod(endpoint as any);
    }
  }
  
  return client as {
    [G in keyof T]: {
      [E in keyof T[G]]: <TResponse = any>(
        options?: RequestOptions<T[G][E] extends { path: infer P extends string } ? P : never>
      ) => Promise<TResponse>;
    };
  };
}

// ============================================================
// Typed API Client
// ============================================================

/**
 * Fully typed API client
 * 
 * Usage:
 * ```typescript
 * // Simple GET
 * const members = await typedAPI.members.list();
 * 
 * // GET with query params
 * const members = await typedAPI.members.list({ 
 *   query: { includeInactive: true } 
 * });
 * 
 * // GET with path params
 * const member = await typedAPI.members.get({ 
 *   params: { id: 'user_123' } 
 * });
 * 
 * // POST with body
 * await typedAPI.events.create({ 
 *   body: { title: 'New Event', type: 'guild_war' } 
 * });
 * 
 * // PUT with path params and body
 * await typedAPI.members.update({
 *   params: { id: 'user_123' },
 *   body: { power: 1000 }
 * });
 * ```
 */
export const typedAPI = createAPIClient(ENDPOINTS);

// ============================================================
// Re-export for convenience
// ============================================================

export { ENDPOINTS, buildPath } from '@shared/api/endpoints';
export type { EndpointDef, EndpointPath, HttpMethod } from '@shared/api/endpoints';
