/**
 * TanStack Query Hooks for Announcements
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementsAPI } from '../api';
import type { Announcement } from '../../types';

// ============================================================================
// Queries
// ============================================================================

export function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementsAPI.list(),
  });
}

// ============================================================================
// Mutations
// ============================================================================

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { title: string; bodyHtml: string; isPinned?: boolean }) =>
      announcementsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; bodyHtml?: string; isPinned?: boolean }) =>
      announcementsAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements', variables.id] });
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

export function useArchiveAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      announcementsAPI.archive(id, archived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

// ============================================================================
// Batch Mutations
// ============================================================================

export function useBatchDeleteAnnouncements() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: string[]) => announcementsAPI.batchDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useBatchArchiveAnnouncements() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ids, archived }: { ids: string[]; archived: boolean }) =>
      announcementsAPI.batchArchive(ids, archived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useBatchPinAnnouncements() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ids, pinned }: { ids: string[]; pinned: boolean }) =>
      announcementsAPI.batchPin(ids, pinned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}
