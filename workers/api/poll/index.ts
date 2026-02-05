/**
 * Enhanced Poll API with Endpoint Registry Integration
 * GET /api/poll - Fetch updates for multiple entities
 *
 * Integrates with endpoint registry to auto-discover pollable endpoints
 */

import type { PagesFunction, Env } from '../../lib/types';
import { createEndpoint } from '../../lib/endpoint-factory';
import { getPollableEndpoints, getPollableEntities, registerPollableEndpoint } from '../../lib/endpoint-registry';
import { successResponse, errorResponse } from '../../lib/utils';

// Import registry adapter to ensure endpoints are registered
import '../../lib/endpoint-registry-adapter';

// Import poll handlers
import { POLL_HANDLERS } from './handlers';

// ============================================================
// Types
// ============================================================

interface PollQuery {
  since?: string;
  entities?: string[];
}

interface PollResponse {
  version: string;
  timestamp: string;
  hasChanges: boolean;
  [entity: string]: any; // Dynamic entity data
}

// ============================================================
// Register Poll Handlers
// ============================================================

// Register poll handlers with the registry
// Note: We need to store env reference since handlers are called without arguments
let envRef: Env | null = null;

registerPollableEndpoint('members', '/members', async () => {
  if (!envRef) throw new Error('Environment not initialized');
  return POLL_HANDLERS.members(envRef);
});
registerPollableEndpoint('events', '/events', async () => {
  if (!envRef) throw new Error('Environment not initialized');
  return POLL_HANDLERS.events(envRef);
});
registerPollableEndpoint('announcements', '/announcements', async () => {
  if (!envRef) throw new Error('Environment not initialized');
  return POLL_HANDLERS.announcements(envRef);
});

// ============================================================
// Query Parser
// ============================================================

function parseQuery(searchParams: URLSearchParams): PollQuery {
  const since = searchParams.get('since') || undefined;
  const entitiesParam = searchParams.get('entities');
  const entities = entitiesParam ? entitiesParam.split(',') : undefined;

  return { since, entities };
}

// ============================================================
// Poll Handler
// ============================================================

export const onRequestGet = createEndpoint<PollResponse, PollQuery>({
  auth: 'optional',
  parseQuery,

  handler: async ({ env, query }) => {
    // Store env reference for poll handlers
    envRef = env;

    const now = new Date().toISOString();
    const response: PollResponse = {
      version: now,
      timestamp: now,
      hasChanges: false,
    };

    // Get requested entities or all pollable entities
    const requestedEntities = query.entities || getPollableEntities();
    const pollableEndpoints = getPollableEndpoints();

    // Fetch data for each requested entity
    for (const entity of requestedEntities) {
      const endpointInfo = pollableEndpoints.get(entity);

      if (!endpointInfo) {
        console.warn(`[Poll] No pollable endpoint found for entity: ${entity}`);
        continue;
      }

      try {
        // Call the registered handler (no arguments, uses envRef)
        const data = await endpointInfo.handler();

        if (data && data.length > 0) {
          response[entity] = { updated: data, deleted: [] };
          response.hasChanges = true;
        } else {
          response[entity] = { updated: [], deleted: [] };
        }
      } catch (error) {
        console.error(`[Poll] Error fetching ${entity}:`, error);
        response[entity] = { updated: [], deleted: [] };
      }
    }

    return response;
  },

  etag: true, // Auto-generate ETag from response
  cacheControl: 'no-cache', // Poll should always check for updates
});
