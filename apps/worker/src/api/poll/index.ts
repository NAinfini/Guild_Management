/**
 * Enhanced Poll API with Endpoint Registry Integration
 * GET /api/poll - Fetch updates for multiple entities
 *
 * Integrates with endpoint registry to auto-discover pollable endpoints
 */

import type { PagesFunction, Env } from '../../core/types';
import { createEndpoint } from '../../core/endpoint-factory';
import { getPollableEntities, registerPollableEndpoint } from '../../core/endpoint-registry';

// Import registry adapter to ensure endpoints are registered
import '../../core/endpoint-registry-adapter';

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
  members: any[];
  events: any[];
  announcements: any[];
  [entity: string]: any;
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
      members: [],
      events: [],
      announcements: [],
    };

    // Get requested entities or all pollable entities
    const requestedEntities = query.entities || getPollableEntities();

    // Fetch data for each requested entity
    for (const entity of requestedEntities) {
      const handler = POLL_HANDLERS[entity];

      if (!handler) {
        console.warn(`[Poll] No poll handler found for entity: ${entity}`);
        continue;
      }

      try {
        const data = await handler(env, query.since);
        response[entity] = Array.isArray(data) ? data : [];
        if ((response[entity] as any[]).length > 0) {
          response.hasChanges = true;
        }
      } catch (error) {
        console.error(`[Poll] Error fetching ${entity}:`, error);
        response[entity] = [];
      }
    }

    return response;
  },

  etag: true, // Auto-generate ETag from response
  cacheControl: 'no-cache', // Poll should always check for updates
});
