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

export const mediaAPI = {
  uploadImage: async (file: File, kind: 'avatar' | 'gallery') => {
    return api.upload<{ media: MediaObject }>('/upload/image', file, { kind });
  },

  uploadAudio: async (file: File) => {
    return api.upload<{ media: MediaObject }>('/upload/audio', file);
  },

  addVideoUrl: async (url: string) => {
    return api.post<{ media: MediaObject }>('/media/video-url', { url });
  },

  delete: async (key: string) => {
    return api.delete(`/media/${key}`);
  },

  getSignedUrl: async (key: string) => {
    return api.get<{ url: string }>(`/media/${key}/signed-url`);
  },

  reorder: async (mediaIds: string[]) => {
    return api.put('/media/reorder', { mediaIds });
  },
};
