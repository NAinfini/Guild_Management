/**
 * Poll API Service
 * Efficient batch fetching of multiple entities in a single request
 */

import { api } from '../api-client';
import type { User, Event, Announcement } from '../../types';

// ============================================================================
// Types
// ============================================================================

export interface PollResponse {
  version: string;
  timestamp: string;
  members: User[];
  events: Event[];
  announcements: Announcement[];
  hasChanges: boolean;
}

export interface PollParams {
  since?: string;
  entities?: Array<'members' | 'events' | 'announcements'>;
}

// ============================================================================
// API Service
// ============================================================================

export const pollAPI = {
  /**
   * Fetch all or specific entities in a single request
   * @param params Optional parameters for incremental polling and selective fetching
   */
  fetch: async (params?: PollParams): Promise<PollResponse> => {
    const queryParams: Record<string, string> = {};
    
    if (params?.since) {
      queryParams.since = params.since;
    }
    
    if (params?.entities && params.entities.length > 0) {
      queryParams.entities = params.entities.join(',');
    }
    
    const response = await api.get<PollResponse>('/poll', queryParams);
    return response;
  },
};
