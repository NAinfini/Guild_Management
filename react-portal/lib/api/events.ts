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

export interface EventDetailDTO extends EventListItemDTO {
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

export const mapToDomain = (dto: EventListItemDTO | EventDetailDTO): Event => {
  // Map participants if present
  let participants: User[] = [];
  if ('participants' in dto && dto.participants) {
    participants = dto.participants.map(p => ({
      id: (p as any).user_id || (p as any).id || '',
      username: p.username || (p as any).name || '',
      wechat_name: (p as any).wechat_name || undefined,
      power: (p as any).power || 0,
      classes: (p as any).class_code ? [(p as any).class_code as any] : [],
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
  list: async (params?: { type?: string; includeArchived?: boolean; search?: string; startDate?: string; endDate?: string; since?: string }): Promise<Event[]> => {
    const queryParams: Record<string, string> = {};
    if (params?.type) queryParams.type = params.type;
    if (params?.includeArchived) queryParams.includeArchived = 'true';
    if (params?.search) queryParams.search = params.search;
    if (params?.startDate) queryParams.startDate = params.startDate;
    if (params?.endDate) queryParams.endDate = params.endDate;
    if (params?.since) queryParams.since = params.since;

    // API always returns paginated format: { items: [...], pagination: {...} }
    const response = await typedAPI.events.list<{ items: EventListItemDTO[], pagination: any }>({ query: queryParams });

    if (!response || !response.items) return [];
    return response.items.map(mapToDomain);
  },

  /**
   * Get single event details
   */
  get: async (id: string): Promise<Event> => {
    const response = await typedAPI.events.get<{ event: EventDetailDTO; attendees?: any[] }>({ params: { id } });
    // Merge attendees into event DTO so mapToDomain can find them
    const eventDto = response.event;
    if (!eventDto.participants && response.attendees) {
      eventDto.participants = response.attendees.map((a: any) => ({
        user_id: a.user_id || a.id,
        username: a.username || a.name,
        wechat_name: a.wechat_name || null,
        power: a.power || 0,
        class_code: a.class_code || null,
      }));
    }
    return mapToDomain(eventDto);
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
   * Join event (for self)
   */
  join: async (id: string): Promise<JoinEventResponse> => {
    return typedAPI.events.join<JoinEventResponse>({ params: { id }, body: {} });
  },

  /**
   * Leave event (for self)
   */
  leave: async (id: string): Promise<{ message: string }> => {
    return typedAPI.events.leave<{ message: string }>({ params: { id }, body: {} });
  },

  /**
   * Kick member from event (Admin/Mod only)
   */
  kick: async (id: string, userId: string): Promise<{ message: string }> => {
    // Use leave endpoint with batch mode to remove another user (kick)
    return typedAPI.events.leave<{ message: string }>({ params: { id }, body: { userIds: [userId] } });
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
      const response = await typedAPI.events.togglePin<{ isPinned: boolean; message: string }>({ params: { id }, body: {} });
      return eventsAPI.get(id);
  },

  addMember: async (id: string, userId: string): Promise<void> => {
     await typedAPI.events.addMember({ params: { id }, body: { userId } });
  },

  /**
   * Toggle Lock
   */
    toggleLock: async (id: string): Promise<Event> => {
        const response = await typedAPI.events.toggleLock<{ isLocked: boolean; message: string }>({ params: { id }, body: {} });
        // Since toggleLock returns { isLocked, message }, but we want Event, 
        // we might need to re-fetch OR the backend should return the event?
        // Wait, backend toggle-lock returns { message, isLocked }.
        // The frontend expects Event? 
        // My previous code in events.ts (lines 185-188) expected EventListItemDTO from typedAPI.events.lock
        // But my NEW endpoint returns ToggleLockResponse.
        // So I must fetch the event again OR update local state.
        // For now, let's fetch the updated event to satisfy the Return Type Promise<Event>
        return eventsAPI.get(id);
    },

    toggleArchive: async (id: string): Promise<Event> => {
        await typedAPI.events.toggleArchive<{ isArchived: boolean; message: string }>({ params: { id }, body: {} });
        return eventsAPI.get(id);
    },


};
