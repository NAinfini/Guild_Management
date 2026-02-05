/**
 * Announcements API Service
 * Typed methods for announcement operations with Domain Mapping
 */

import { typedAPI } from './api-builder';
import type { Announcement } from '../../types';

// ============================================================================
// Backend Types
// ============================================================================

interface AnnouncementDTO {
  announcement_id: string;
  title: string;
  body_html: string | null;
  author_id: string;
  is_pinned: number;
  is_archived: number;
  created_at_utc: string;
  updated_at_utc: string;
  media_urls: string[]; // JSON string or array from backend join
  author_username?: string; // Sometimes joined
}

export interface CreateAnnouncementData {
  title: string;
  bodyHtml?: string;
  isPinned?: boolean;
  mediaUrls?: string[];
}

// ============================================================================
// Mappers
// ============================================================================

const mapToDomain = (dto: AnnouncementDTO): Announcement => {
  const media = (dto as any).media_urls;
  return {
    id: dto.announcement_id,
    title: dto.title,
    content_html: dto.body_html || '',
    author_id: dto.author_id,
    created_at: dto.created_at_utc,
    updated_at: dto.updated_at_utc,
    is_pinned: !!dto.is_pinned,
    is_archived: !!dto.is_archived,
    media_urls: Array.isArray(media) ? media : media ? JSON.parse(media) : [],
  };
};

// ============================================================================
// API Service
// ============================================================================

export const announcementsAPI = {
  list: async (): Promise<Announcement[]> => {
    // API client now unwraps { success, data } envelope automatically
    const response = await typedAPI.announcements.list<AnnouncementDTO[] | { items: AnnouncementDTO[], pagination: any }>();

    // Handle both paginated and non-paginated responses
    let items: AnnouncementDTO[];
    if (!response) return [];
    if (Array.isArray(response)) {
      items = response;
    } else if (response && 'items' in response) {
      items = response.items;
    } else {
      return [];
    }

    return items.map(mapToDomain);
  },

  create: async (data: CreateAnnouncementData): Promise<Announcement> => {
    const payload = {
      title: data.title,
      bodyHtml: data.bodyHtml,
      isPinned: data.isPinned ?? false,
      mediaIds: data.mediaUrls,
    };
    const response = await typedAPI.announcements.create<{ announcement: AnnouncementDTO }>({ body: payload });
    return mapToDomain(response.announcement);
  },

  update: async (id: string, data: Partial<CreateAnnouncementData>): Promise<Announcement> => {
    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.bodyHtml !== undefined) payload.bodyHtml = data.bodyHtml;
    if (data.isPinned !== undefined) payload.isPinned = data.isPinned;
    if (data.mediaUrls !== undefined) payload.mediaIds = data.mediaUrls;
    const response = await typedAPI.announcements.update<{ announcement: AnnouncementDTO }>({ params: { id }, body: payload });
    return mapToDomain(response.announcement);
  },

  delete: async (id: string): Promise<void> => {
    await typedAPI.announcements.delete({ params: { id } });
  },

  pin: async (id: string): Promise<Announcement> => {
    const response = await typedAPI.announcements.togglePin<{ announcement: AnnouncementDTO }>({ params: { id }, body: {} });
    return mapToDomain(response.announcement);
  },

  duplicate: async (id: string): Promise<Announcement> => {
    const response = await typedAPI.announcements.create<{ announcement: AnnouncementDTO }>({ body: { duplicateFrom: id } });
    return mapToDomain(response.announcement);
  },

  toggleArchive: async (id: string): Promise<Announcement> => {
     await typedAPI.announcements.toggleArchive<{ isArchived: boolean; message: string }>({ params: { id }, body: {} });
     // Re-fetch to get full object
     const list = await announcementsAPI.list();
     const found = list.find(a => a.id === id);
     if (!found) throw new Error('Announcement not found after toggle');
     return found;
  },


};
