/**
 * Announcements API Service
 * Typed methods for announcement operations with Domain Mapping
 */

import { api } from '../api-client';
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
  media_urls: string[]; // Mocked or joined
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
    const response = await api.get<{ announcements: AnnouncementDTO[] }>('/announcements');
    if (!response || !response.announcements) return [];
    return response.announcements.map(mapToDomain);
  },

  create: async (data: CreateAnnouncementData): Promise<Announcement> => {
    const payload = {
      title: data.title,
      bodyHtml: data.bodyHtml,
      isPinned: data.isPinned ?? false,
      mediaUrls: data.mediaUrls,
    };
    const response = await api.post<{ announcement: AnnouncementDTO }>('/announcements', payload);
    return mapToDomain(response.announcement);
  },

  update: async (id: string, data: Partial<CreateAnnouncementData>): Promise<Announcement> => {
    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.bodyHtml !== undefined) payload.bodyHtml = data.bodyHtml;
    if (data.isPinned !== undefined) payload.isPinned = data.isPinned;
    if (data.mediaUrls !== undefined) payload.mediaUrls = data.mediaUrls;
    const response = await api.put<{ announcement: AnnouncementDTO }>(`/announcements/${id}`, payload);
    return mapToDomain(response.announcement);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/announcements/${id}`);
  },

  pin: async (id: string): Promise<Announcement> => {
    const response = await api.post<{ announcement: AnnouncementDTO }>(`/announcements/${id}/pin`);
    return mapToDomain(response.announcement);
  },

  duplicate: async (id: string): Promise<Announcement> => {
    const response = await api.post<{ announcement: AnnouncementDTO }>(`/announcements/${id}/duplicate`);
    return mapToDomain(response.announcement);
  },
  
  archive: async (id: string, isArchived: boolean): Promise<Announcement> => {
     const action = isArchived ? 'archive' : 'unarchive';
     const response = await api.post<{ announcement: AnnouncementDTO }>(`/announcements/${id}/${action}`);
     return mapToDomain(response.announcement);
  },

  // ============================================================================
  // Batch Operations
  // ============================================================================

  batchDelete: async (ids: string[]): Promise<{ affectedCount: number }> => {
    return api.post('/announcements/batch', {
      action: 'delete',
      announcementIds: ids,
    });
  },

  batchArchive: async (ids: string[], archived: boolean): Promise<{ affectedCount: number }> => {
    return api.post('/announcements/batch', {
      action: archived ? 'archive' : 'unarchive',
      announcementIds: ids,
    });
  },

  batchPin: async (ids: string[], pinned: boolean): Promise<{ affectedCount: number }> => {
    return api.post('/announcements/batch', {
      action: pinned ? 'pin' : 'unpin',
      announcementIds: ids,
    });
  },

  batchGet: async (ids: string[]): Promise<Announcement[]> => {
    const res = await api.get<{ announcements: AnnouncementDTO[] }>(
      `/announcements/batch?ids=${ids.join(',')}`
    );
    return res.announcements.map(mapToDomain);
  },

  restore: async (ids: string[]): Promise<{ affectedCount: number }> => {
    return api.post('/announcements/restore', {
      announcementIds: ids,
    });
  },
};
