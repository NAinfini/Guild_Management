/**
 * Members API Service
 * Typed methods for member operations with Domain Mapping
 */

import { typedAPI } from './api-builder';
import { normalizeUtcDateTime } from './date';
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
  classes: string[] | string | null;
  media_counts: { images?: number; videos?: number; video?: number; audio?: number } | string;
  media_count?: number;
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
    classList = dto.classes as ClassType[];
  } else if (typeof dto.classes === 'string') {
     try {
         classList = JSON.parse(dto.classes);
     } catch (e) {
         // distinct fix if it's comma separated
         classList = (dto.classes as string).split(',') as ClassType[];
     }
  }

  // Parse media counts
  const counts = { images: 0, videos: 0, audio: 0 };
  if (typeof dto.media_counts === 'object' && dto.media_counts !== null) {
    const mediaCounts = dto.media_counts as { images?: number; videos?: number; video?: number; audio?: number };
    counts.images = mediaCounts.images ?? counts.images;
    counts.videos = mediaCounts.videos ?? mediaCounts.video ?? counts.videos;
    counts.audio = mediaCounts.audio ?? counts.audio;
  } else if (typeof dto.media_counts === 'string') {
    try {
      const parsed = JSON.parse(dto.media_counts) as { images?: number; videos?: number; video?: number; audio?: number };
      counts.images = parsed.images ?? counts.images;
      counts.videos = parsed.videos ?? parsed.video ?? counts.videos;
      counts.audio = parsed.audio ?? counts.audio;
    } catch {
      // Ignore invalid serialized counts.
    }
  } else if (typeof dto.media_count === 'number') {
    counts.images = dto.media_count;
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
    vacation_start: normalizeUtcDateTime(dto.vacation_start_at_utc) || dto.vacation_start_at_utc || undefined,
    vacation_end: normalizeUtcDateTime(dto.vacation_end_at_utc) || dto.vacation_end_at_utc || undefined,
    created_at: normalizeUtcDateTime(dto.created_at_utc) || dto.created_at_utc,
    updated_at: normalizeUtcDateTime(dto.updated_at_utc) || dto.updated_at_utc,
    last_seen: normalizeUtcDateTime(dto.last_seen_utc) || dto.last_seen_utc,
    media_counts: counts,
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

    // Primary shape: paginated response { items, pagination }.
    // Fallback shapes are supported for legacy routes.
    const response = await typedAPI.members.list<any>({ query: queryParams });
    const listItems: MemberDTO[] = Array.isArray(response?.items)
      ? response.items
      : Array.isArray(response?.members)
      ? response.members
      : Array.isArray(response)
      ? response
      : [];

    if (!Array.isArray(listItems)) {
      throw new Error('[membersAPI.list] Invalid response shape');
    }

    // Fail closed on malformed payloads so Query keeps previous data instead of wiping to [].
    if (!response || (listItems.length === 0 && !Array.isArray(response?.items) && !Array.isArray(response?.members) && !Array.isArray(response))) {
      throw new Error('[membersAPI.list] Missing members payload');
    }

    const mapped = listItems.map(mapToDomain);

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
      const mediaRows = Array.isArray(response.media) ? response.media : [];
      const media = mediaRows.map((item: any) => {
        const kind = item.kind as 'image' | 'audio' | 'video_url' | undefined;
        const isVideo = kind === 'video_url';
        const isAudio = kind === 'audio';
        const resolvedUrl = item.r2_key
          ? `/api/media/${encodeURIComponent(item.r2_key)}`
          : item.url || '';

        return {
          id: item.media_id,
          url: resolvedUrl,
          type: isVideo ? ('video' as const) : isAudio ? ('audio' as const) : ('image' as const),
          thumbnail: isVideo ? item.url : undefined,
          hash: item.media_id,
        };
      });

      const mediaCounts = media.reduce(
        (acc: { images: number; videos: number; audio: number }, item: { type: 'image' | 'video' | 'audio' }) => {
          if (item.type === 'image') acc.images += 1;
          if (item.type === 'video') acc.videos += 1;
          if (item.type === 'audio') acc.audio += 1;
          return acc;
        },
        { images: 0, videos: 0, audio: 0 }
      );
      const firstAudio = media.find((item: { type: 'image' | 'video' | 'audio'; url: string }) => item.type === 'audio');

      const detailDto: MemberDTO = {
        ...response.user,
        classes,
        title_html: response.profile?.title_html ?? null,
        bio_text: response.profile?.bio_text,
        vacation_start_at_utc: response.profile?.vacation_start_at_utc,
        vacation_end_at_utc: response.profile?.vacation_end_at_utc,
        media_counts: mediaCounts,
      };
      const mapped = mapToDomain(detailDto);
      return {
        ...mapped,
        media,
        audio_url: firstAudio?.url,
      };
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
