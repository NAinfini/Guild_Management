/**
 * Members API Service
 * Typed methods for member operations with Domain Mapping
 */

import { typedAPI } from './api-builder';
import type { User, ClassType } from '../../types';

// ============================================================================
// Backend Types
// ============================================================================

export interface MemberDTO {
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

export const mapToDomain = (dto: MemberDTO): User => {
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
  list: async (params?: { includeInactive?: boolean; role?: string; since?: string }): Promise<User[]> => {
    const queryParams: any = {};
    if (params?.includeInactive) queryParams.includeInactive = 'true';
    if (params?.role) queryParams.role = params.role;
    if (params?.since) queryParams.since = params.since;

    // API always returns paginated format: { items: [...], pagination: {...} }
    const response = await typedAPI.members.list<{ items: MemberDTO[], pagination: any }>({ query: queryParams });



    if (!response || !response.items) {
      console.warn('[membersAPI.list] No items in response, returning empty array');
      return [];
    }

    const mapped = response.items.map(mapToDomain);

    return mapped;
  },

  getProfile: async (id: string): Promise<User> => {
    const response = await typedAPI.members.get<any>({ params: { id } });

    if (response?.member) {
      return mapToDomain(response.member as MemberDTO);
    }

    if (response?.user) {
      const classes = Array.isArray(response.classes)
        ? response.classes.map((c: any) => c.class_code).filter(Boolean)
        : [];
      const detailDto: MemberDTO = {
        ...response.user,
        classes,
        title_html: response.profile?.title_html ?? null,
        bio_text: response.profile?.bio_text,
        vacation_start_at_utc: response.profile?.vacation_start_at_utc,
        vacation_end_at_utc: response.profile?.vacation_end_at_utc,
        media_counts: { images: 0, videos: 0, audio: 0 } as any,
      };
      return mapToDomain(detailDto);
    }

    throw new Error('Failed to load member profile');
  },

  updateProfile: async (id: string, data: UpdateProfileData): Promise<User> => {
    const input = data as UpdateProfileData & Record<string, any>;
    const payload: any = {};
    if (input.titleHtml !== undefined) payload.title_html = input.titleHtml;
    if (input.title_html !== undefined) payload.title_html = input.title_html;

    if (input.bioText !== undefined) payload.bio_text = input.bioText;
    if (input.bio_text !== undefined) payload.bio_text = input.bio_text;
    if (input.bio !== undefined) payload.bio_text = input.bio;

    if (input.power !== undefined) payload.power = input.power;

    if (input.vacationStart !== undefined) payload.vacation_start = input.vacationStart;
    if (input.vacation_start !== undefined) payload.vacation_start = input.vacation_start;
    if (input.vacationStartAtUtc !== undefined) payload.vacation_start = input.vacationStartAtUtc;

    if (input.vacationEnd !== undefined) payload.vacation_end = input.vacationEnd;
    if (input.vacation_end !== undefined) payload.vacation_end = input.vacation_end;
    if (input.vacationEndAtUtc !== undefined) payload.vacation_end = input.vacationEndAtUtc;

    if (input.wechatName !== undefined) payload.wechat_name = input.wechatName;
    if (input.wechat_name !== undefined) payload.wechat_name = input.wechat_name;

    await typedAPI.members.update<any>({ params: { id }, body: payload });
    return membersAPI.getProfile(id);
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
