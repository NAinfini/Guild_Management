/**
 * Announcements Hook
 * Manages announcement operations with API integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementsAPI, type CreateAnnouncementData } from '../lib/api';
import type { Announcement } from '../types';

export function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementsAPI.list(),
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAnnouncementData) => announcementsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAnnouncementData> }) =>
      announcementsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => announcementsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function usePinAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => announcementsAPI.pin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useDuplicateAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => announcementsAPI.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}
