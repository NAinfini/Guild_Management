/**
 * Events API Service
 * Typed methods for event operations with Domain Mapping
 */

import { typedAPI } from './api-builder';
import type { Event, User } from '../../types';

// ============================================================================
// Backend Types (Mirroring D1/Python/Worker response shape)
// ============================================================================

interface EventListItemDTO {
  event_id: string;
  type: 'weekly_mission' | 'guild_war' | 'other';
  title: string;
  description: string | null;
  start_at_utc: string;
  end_at_utc: string | null;
  capacity: number | null;
  is_pinned: number; // 0 or 1
  is_archived: number; // 0 or 1
  signup_locked: number; // 0 or 1
  participantCount: number;
  isUserParticipating: boolean;
  updated_at_utc: string;
}

interface EventDetailDTO extends EventListItemDTO {
  participants?: Array<{
    user_id: string;
    username: string;
    wechat_name: string | null;
    power: number;
    class_code: string | null;
  }>;
}

export interface CreateEventData {
  type: 'weekly_mission' | 'guild_war' | 'other';
  title: string;
  description?: string;
  startAt: string; // ISO 8601
  endAt?: string;
  capacity?: number;
}

export interface JoinEventResponse {
  message: string;
  conflicts?: Array<{
    event_id: string;
    title: string;
  }>;
}

// ============================================================================
// Mappers
// ============================================================================

const mapToDomain = (dto: EventListItemDTO | EventDetailDTO): Event => {
  // Map participants if present
  let participants: User[] = [];
  if ('participants' in dto && dto.participants) {
    participants = dto.participants.map(p => ({
      id: p.user_id,
      username: p.username,
      wechat_name: p.wechat_name || undefined,
      power: p.power,
      classes: p.class_code ? [p.class_code as any] : [],
      role: 'member', // Default, as this info might be limited in event view
      active_status: 'active'
    }));
  }

  return {
    id: dto.event_id,
    type: dto.type,
    title: dto.title,
    description: dto.description || '',
    start_time: dto.start_at_utc,
    end_time: dto.end_at_utc || undefined,
    capacity: dto.capacity || undefined,
    is_pinned: !!dto.is_pinned,
    is_archived: !!dto.is_archived,
    is_locked: !!dto.signup_locked,
    updated_at: dto.updated_at_utc,
    participants: participants
  };
};

// ============================================================================
// API Service
// ============================================================================

export const eventsAPI = {
  /**
   * List events with optional filters
   */
  list: async (params?: { type?: string; includeArchived?: boolean }): Promise<Event[]> => {
    const queryParams: Record<string, string> = {};
    if (params?.type) queryParams.type = params.type;
    if (params?.includeArchived) queryParams.includeArchived = 'true';

    // API client now unwraps { success, data } envelope automatically
    const response = await typedAPI.events.list<EventListItemDTO[]>({ query: queryParams });
    if (!response || !Array.isArray(response)) return [];

    return response.map(mapToDomain);
  },

  /**
   * Get single event details
   */
  get: async (id: string): Promise<Event> => {
    const response = await typedAPI.events.get<{ event: EventDetailDTO }>({ params: { id } });
    return mapToDomain(response.event);
  },

  /**
   * Create new event (Admin/Mod only)
   */
  create: async (data: CreateEventData) => {
    const response = await typedAPI.events.create<{ event: EventListItemDTO }>({ body: data });
    return mapToDomain(response.event);
  },

  /**
   * Update event (Admin/Mod only)
   */
  update: async (id: string, data: Partial<CreateEventData>) => {
    const response = await typedAPI.events.update<{ event: EventListItemDTO }>({ params: { id }, body: data });
    return mapToDomain(response.event);
  },

  /**
   * Delete/Archive event (Admin/Mod only)
   */
  delete: async (id: string): Promise<void> => {
    await typedAPI.events.delete({ params: { id } });
  },

  /**
   * Join event
   */
  join: async (id: string): Promise<JoinEventResponse> => {
    return typedAPI.events.join<JoinEventResponse>({ params: { id }, body: {} });
  },

  /**
   * Leave event
   */
  leave: async (id: string): Promise<{ message: string }> => {
    return typedAPI.events.leave<{ message: string }>({ params: { id }, body: {} });
  },

  /**
   * Duplicate event (Admin/Mod only)
   */
  duplicate: async (id: string): Promise<Event> => {
    const original = await eventsAPI.get(id);
    const newData: CreateEventData = {
        title: `${original.title} (Copy)`,
        type: original.type,
        description: original.description,
        startAt: original.start_time,
        endAt: original.end_time,
        capacity: original.capacity
    };
    return eventsAPI.create(newData);
  },

  /**
   * Toggle Pin
   */
  togglePin: async (id: string): Promise<Event> => {
      // In a real app, this might be a PATCH endpoint or a toggle action
      // For now, assume it returns the updated event
      const response = await typedAPI.events.pin<{ event: EventListItemDTO }>({ params: { id }, body: {} });
      return mapToDomain(response.event);
  },

  /**
   * Toggle Lock
   */
    toggleLock: async (id: string): Promise<Event> => {
        const response = await typedAPI.events.lock<{ event: EventListItemDTO }>({ params: { id }, body: {} });
        return mapToDomain(response.event);
    },

  // ============================================================================
  // Batch Operations
  // ============================================================================

  batchDelete: async (ids: string[]): Promise<{ affectedCount: number }> => {
    return typedAPI.events.batch({ body: {
      action: 'delete',
      eventIds: ids,
    }});
  },

  batchArchive: async (ids: string[], archived: boolean): Promise<{ affectedCount: number }> => {
    return typedAPI.events.batch({ body: {
      action: archived ? 'archive' : 'unarchive',
      eventIds: ids,
    }});
  },

  batchGet: async (ids: string[]): Promise<Event[]> => {
    const res = await typedAPI.events.batch<{ events: EventListItemDTO[] }>({
      query: { ids: ids.join(',') }
    });
    return res.events.map(mapToDomain);
  },

  restore: async (ids: string[]): Promise<{ affectedCount: number }> => {
    return typedAPI.events.restoreBatch({ body: {
      eventIds: ids,
    }});
  },
};
