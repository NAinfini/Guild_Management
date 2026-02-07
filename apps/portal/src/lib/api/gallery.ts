/**
 * Gallery API Client
 */

import { api } from '../api-client';

export interface GalleryImage {
  gallery_id: string;
  media_id: string;
  title?: string;
  description?: string;
  category?: string;
  is_featured: number;
  uploaded_by?: string;
  created_at_utc: string;
  updated_at_utc: string;
  // Joined fields
  r2_key?: string;
  content_type?: string;
  width?: number;
  height?: number;
  uploader_username?: string;
}

export interface GalleryListResponse {
  images: GalleryImage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateGalleryImageRequest {
  media_id: string;
  title?: string;
  description?: string;
  category?: string;
}

export interface UpdateGalleryImageRequest {
  title?: string;
  description?: string;
  category?: string;
  is_featured?: boolean;
}

export const galleryAPI = {
  /**
   * List gallery images with pagination and filtering
   */
  list: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    featured?: boolean;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    return api.get<GalleryListResponse>('/gallery', params);
  },

  /**
   * Get single gallery image by ID
   */
  get: (id: string) => {
    return api.get<GalleryImage>(`/gallery/${id}`);
  },

  /**
   * Create new gallery image entry
   */
  create: async (data: CreateGalleryImageRequest) => {
    const response = await api.post<{ message: string; item: GalleryImage }>('/gallery', {
      mediaId: data.media_id,
      title: data.title,
      description: data.description,
      category: data.category,
    });
    return response.item;
  },

  /**
   * Update gallery image metadata
   */
  update: (id: string, data: UpdateGalleryImageRequest) => {
    return api.put<GalleryImage>(`/gallery/${id}`, data);
  },

  /**
   * Delete gallery image
   */
  delete: (id: string) => {
    return api.delete(`/gallery/${id}`);
  },
};
