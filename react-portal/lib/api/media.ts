/**
 * Media API Service
 * Typed methods for media upload and management
 */

import { api } from '../api-client';

export interface MediaObject {
  mediaId: string;
  storageType: 'r2' | 'external_url';
  r2Key?: string;
  externalUrl?: string;
  mimeType?: string;
  sizeBytes?: number;
  sortOrder: number;
  createdAt: string;
}

export interface UploadedMediaResponse {
  mediaId: string;
  r2Key: string;
  message: string;
}

export interface VideoUrlResponse {
  media_id: string;
  user_id: string;
  url: string;
  title: string | null;
  sort_order: number;
  created_at_utc?: string;
  updated_at_utc?: string;
}

export interface ReorderMediaRequest {
  entityType: 'event' | 'announcement' | 'member';
  entityId: string;
  mediaIds: string[];
}

export interface DeleteMediaRequest {
  scope: 'event' | 'announcement' | 'memberVideo';
  entityId: string;
  mediaId: string;
}

export const mediaAPI = {
  uploadImage: async (file: File, kind: 'avatar' | 'gallery') => {
    return api.upload<UploadedMediaResponse>('/upload/image', file, { kind });
  },

  uploadAudio: async (file: File) => {
    return api.upload<UploadedMediaResponse>('/upload/audio', file);
  },

  addVideoUrl: async (memberId: string, url: string, title?: string) => {
    return api.post<VideoUrlResponse>(`/members/${memberId}/video-urls`, { url, title });
  },

  listVideoUrls: async (memberId: string) => {
    return api.get<VideoUrlResponse[]>(`/members/${memberId}/video-urls`);
  },

  updateVideoUrl: async (memberId: string, videoId: string, data: { url?: string; title?: string }) => {
    return api.put<VideoUrlResponse>(`/members/${memberId}/video-urls/${videoId}`, data);
  },

  deleteVideoUrl: async (memberId: string, videoId: string) => {
    return api.delete<{ success: true; message: string }>(`/members/${memberId}/video-urls/${videoId}`);
  },

  delete: async (params: DeleteMediaRequest | string) => {
    if (typeof params === 'string') {
      throw new Error(
        'Legacy delete(key) is no longer supported. Use delete with { scope, entityId, mediaId }.'
      );
    }

    const { scope, entityId, mediaId } = params;

    if (scope === 'event') {
      return api.delete(`/events/${entityId}/attachments/${mediaId}`);
    }

    if (scope === 'announcement') {
      return api.delete(`/announcements/${entityId}/media/${mediaId}`);
    }

    return api.delete<{ success: true; message: string }>(`/members/${entityId}/video-urls/${mediaId}`);
  },

  getSignedUrl: async (key: string) => {
    return { url: `/api/media/${encodeURIComponent(key)}` };
  },

  reorder: async (request: ReorderMediaRequest) => {
    return api.put<{ message: string }>('/media/reorder', request);
  },

  reorderMemberMedia: async (
    memberId: string,
    mediaIds: string[],
    kind?: 'image' | 'audio' | 'video_url'
  ) => {
    return api.put<{ message: string; media: Array<{ media_id: string; kind: string; sort_order: number }> }>(
      `/members/${memberId}/media/reorder`,
      { media_ids: mediaIds, kind }
    );
  },
};
