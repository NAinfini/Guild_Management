/**
 * Media API Service
 * Typed methods for media upload and management
 */

import { api } from '../api-client';
import { typedAPI, ENDPOINTS } from './api-builder';

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
    return api.upload<UploadedMediaResponse>(ENDPOINTS.upload.image.path, file, { kind });
  },

  uploadAudio: async (file: File) => {
    return api.upload<UploadedMediaResponse>(ENDPOINTS.upload.audio.path, file);
  },

  uploadMemberMedia: async (
    memberId: string,
    file: File,
    kind: 'image' | 'audio' = 'image',
    isAvatar: boolean = false
  ) => {
    return api.upload<{
      media_id: string;
      user_id: string;
      kind: 'image' | 'audio' | 'video_url';
      is_avatar: boolean;
      sort_order: number;
      url: string;
    }>(ENDPOINTS.members.uploadMedia.path.replace(':id', memberId), file, {
      kind,
      is_avatar: String(isAvatar),
    });
  },

  uploadMemberAudio: async (memberId: string, file: File) => {
    return mediaAPI.uploadMemberMedia(memberId, file, 'audio');
  },

  addVideoUrl: async (memberId: string, url: string, title?: string) => {
    return typedAPI.members.addVideoUrl<VideoUrlResponse>({ params: { id: memberId }, body: { url, title } });
  },

  listVideoUrls: async (memberId: string) => {
    return typedAPI.members.listVideoUrls<VideoUrlResponse[]>({ params: { id: memberId } });
  },

  updateVideoUrl: async (memberId: string, videoId: string, data: { url?: string; title?: string }) => {
    return typedAPI.members.updateVideoUrl<VideoUrlResponse>({
      params: { id: memberId, videoId },
      body: data,
    });
  },

  deleteVideoUrl: async (memberId: string, videoId: string) => {
    return typedAPI.members.deleteVideoUrl<{ success: true; message: string }>({
      params: { id: memberId, videoId },
    });
  },

  delete: async (params: DeleteMediaRequest | string) => {
    if (typeof params === 'string') {
      throw new Error(
        'Legacy delete(key) is no longer supported. Use delete with { scope, entityId, mediaId }.'
      );
    }

    const { scope, entityId, mediaId } = params;

    if (scope === 'event') {
      return typedAPI.events.removeAttachment({ params: { id: entityId, mediaId } });
    }

    if (scope === 'announcement') {
      return typedAPI.announcements.removeMedia({ params: { id: entityId, mediaId } });
    }

    return typedAPI.members.deleteVideoUrl<{ success: true; message: string }>({
      params: { id: entityId, videoId: mediaId },
    });
  },

  getSignedUrl: async (key: string) => {
    return { url: `/api/media/${encodeURIComponent(key)}` };
  },

  reorder: async (request: ReorderMediaRequest) => {
    return typedAPI.media.reorder<{ message: string }>({ body: request });
  },

  reorderMemberMedia: async (
    memberId: string,
    mediaIds: string[],
    kind?: 'image' | 'audio' | 'video_url'
  ) => {
    return typedAPI.members.reorderMedia<{ message: string; media: Array<{ media_id: string; kind: string; sort_order: number }> }>({
      params: { id: memberId },
      body: { media_ids: mediaIds, kind },
    });
  },
};
