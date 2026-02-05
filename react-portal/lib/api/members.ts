/**
 * Members API Service
 * Typed methods for member operations with Domain Mapping
 */

import { typedAPI } from './api-builder';
import type { User, ClassType } from '../../types';

// ============================================================================
// Backend Types
// ============================================================================

interface MemberDTO {
  user_id: string;
  username: string;
  wechat_name: string | null;
  role: 'member' | 'moderator' | 'admin';
  power: number;
  is_active: number; // 0 or 1
  title_html: string | null;
  classes: string | null; // Comma separated or JSON? assuming JSON or array from API wrapper
  media_counts: { images: number; video: number; audio: number } | string;
  created_at_utc: string;
  updated_at_utc: string;
  last_seen_utc?: string;
  bio_text?: string;
  vacation_start_at_utc?: string;
  vacation_end_at_utc?: string;
}

export interface UpdateProfileData {
  titleHtml?: string;
  bioText?: string;
  power?: number;
  vacationStart?: string;
  vacationEnd?: string;
  wechatName?: string;
}

export interface AvailabilityBlock {
  weekday: number;
  startMin: number;
  endMin: number;
}

export interface ProgressionItem {
  itemId: string;
  level: number;
}

// ============================================================================
// Mappers
// ============================================================================

const mapToDomain = (dto: MemberDTO): User => {
  // Parse classes
  let classList: ClassType[] = [];
  if (Array.isArray(dto.classes)) {
    classList = dto.classes;
  } else if (typeof dto.classes === 'string') {
     try {
         classList = JSON.parse(dto.classes);
     } catch (e) {
         // distinct fix if it's comma separated
         classList = (dto.classes as string).split(',') as ClassType[];
     }
  }

  // Parse media counts
  let counts = { images: 0, videos: 0, audio: 0 };
  if (typeof dto.media_counts === 'object' && dto.media_counts !== null) {
      counts = { ...counts, ...dto.media_counts } as any;
  } else if (typeof dto.media_counts === 'string') {
      try {
          counts = JSON.parse(dto.media_counts);
      } catch (e) {}
  }

  return {
    id: dto.user_id,
    username: dto.username,
    wechat_name: dto.wechat_name || undefined,
    role: dto.role,
    power: dto.power,
    classes: classList,
    title_html: dto.title_html || undefined,
    active_status: dto.is_active ? 'active' : 'inactive', // 'vacation' calculation handled by UI/Store logic based on dates?
    bio: dto.bio_text || undefined,
    vacation_start: dto.vacation_start_at_utc || undefined,
    vacation_end: dto.vacation_end_at_utc || undefined,
    created_at: dto.created_at_utc,
    updated_at: dto.updated_at_utc,
    last_seen: dto.last_seen_utc,
    media_counts: counts
  };
};

// ============================================================================
// API Service
// ============================================================================

export const membersAPI = {
  list: async (params?: { includeInactive?: boolean; role?: string }): Promise<User[]> => {
    const queryParams: any = {};
    if (params?.includeInactive) queryParams.includeInactive = 'true';
    if (params?.role) queryParams.role = params.role;

    // API always returns paginated format: { items: [...], pagination: {...} }
    const response = await typedAPI.members.list<{ items: MemberDTO[], pagination: any }>({ query: queryParams });

    if (!response || !response.items) return [];
    return response.items.map(mapToDomain);
  },

  getProfile: async (id: string): Promise<User> => {
    const response = await typedAPI.members.get<{ member: MemberDTO }>({ params: { id } });
    return mapToDomain(response.member);
  },

  updateProfile: async (id: string, data: UpdateProfileData): Promise<User> => {
    const payload: any = {};
    if (data.titleHtml !== undefined) payload.title_html = data.titleHtml;
    if (data.bioText !== undefined) payload.bio_text = data.bioText;
    if (data.power !== undefined) payload.power = data.power;
    if (data.vacationStart !== undefined) payload.vacation_start = data.vacationStart;
    if (data.vacationEnd !== undefined) payload.vacation_end = data.vacationEnd;
    if (data.wechatName !== undefined) payload.wechat_name = data.wechatName;

    const response = await typedAPI.members.update<{ member: MemberDTO }>({ params: { id }, body: payload });
    return mapToDomain(response.member);
  },

  updateRole: async (id: string, role: 'member' | 'moderator' | 'admin'): Promise<void> => {
    await typedAPI.members.updateRole({ params: { id }, body: { role } });
  },

  updateClasses: async (id: string, classes: string[]): Promise<void> => {
    await typedAPI.members.updateClasses({ params: { id }, body: { classes } });
  },

  updateAvailability: async (id: string, blocks: AvailabilityBlock[]): Promise<void> => {
    await typedAPI.members.updateAvailability({ params: { id }, body: { blocks } });
  },

  updateProgression: async (id: string, category: 'qishu' | 'xinfa' | 'wuxue', itemId: string, level: number): Promise<void> => {
    await typedAPI.members.updateProgression({ params: { id }, body: { category, itemId, level } });
  },

  getProgression: async (id: string): Promise<Record<string, ProgressionItem[]>> => {
    const response = await typedAPI.members.getProgression<{ progression: Record<string, ProgressionItem[]> }>({ params: { id } });
    return response.progression;
  },

  getNotes: async (id: string): Promise<any[]> => {
    const response = await typedAPI.members.getNotes<{ notes: any[] }>({ params: { id } });
    return response.notes;
  },

  updateNote: async (id: string, slot: number, noteText: string): Promise<void> => {
    await typedAPI.members.updateNote({ params: { id }, body: { slot, noteText } });
  },

  toggleActive: async (id: string): Promise<User> => {
    await typedAPI.members.toggleActive<{ isActive: boolean; message: string }>({ params: { id }, body: {} });
    return membersAPI.get(id);
  },

  resetPassword: async (id: string): Promise<{ tempPassword: string }> => {
    return typedAPI.members.resetPassword<{ tempPassword: string }>({ params: { id }, body: {} });
  },



  get: async (id: string): Promise<User> => {
    return membersAPI.getProfile(id);
  },
};
