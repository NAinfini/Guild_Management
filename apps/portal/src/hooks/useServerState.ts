/**
 * Server State Management with TanStack Query
 *
 * This file replaces Zustand's useGuildStore for ALL server state.
 * Zustand now only handles UI/client state (sidebar, audio, etc.)
 *
 * Benefits:
 * - Automatic caching and deduplication
 * - Background refetching (no manual polling needed)
 * - Optimistic updates
 * - Automatic error handling
 * - Shared state across components
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersAPI, eventsAPI, announcementsAPI, adminAPI } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';
import { User } from '../types';
import { useAuthStore } from '../store';

// ============================================================================
// MEMBERS
// ============================================================================

export function useMembers(options?: { includeInactive?: boolean }) {
  return useQuery({
    queryKey: queryKeys.members.list(options),
    queryFn: () => membersAPI.list(options),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useMember(id: string) {
  return useQuery({
    queryKey: queryKeys.members.detail(id),
    queryFn: () => membersAPI.get(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useUpdateMember() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => membersAPI.updateProfile(id, data),
  });
}

// ============================================================================
// EVENTS
// ============================================================================

export function useEvents(options?: { type?: string; includeArchived?: boolean; search?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: queryKeys.events.list(options),
    queryFn: () => eventsAPI.list(options),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: queryKeys.events.detail(id),
    queryFn: () => eventsAPI.get(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useCreateEvent() {
  return useMutation({
    mutationFn: (data: any) => eventsAPI.create(data),
  });
}

export function useUpdateEvent() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => eventsAPI.update(id, data),
  });
}

export function useDeleteEvent() {
  return useMutation({
    mutationFn: (id: string) => eventsAPI.delete(id),
  });
}

export function useTogglePinEvent() {
  return useMutation({
    mutationFn: (id: string) => eventsAPI.togglePin(id),
  });
}

export function useToggleLockEvent() {
  return useMutation({
    mutationFn: (id: string) => eventsAPI.toggleLock(id),
  });
}

export function useArchiveEvent() {
  return useMutation({
    mutationFn: ({ id }: { id: string; isArchived: boolean }) =>
      eventsAPI.toggleArchive(id),
  });
}

export function useJoinEvent() {
  return useMutation({
    mutationFn: async ({ eventId, userId }: { eventId: string; userId: string }) => {
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.id === userId) {
        await eventsAPI.join(eventId);
      } else {
        await eventsAPI.addMember(eventId, userId);
      }
    },
    onSuccess: async () => {
      // Push will update query cache; no manual refetch needed.
    },
  });
}

export function useLeaveEvent() {
  return useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) => {
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.id === userId) {
        return eventsAPI.leave(eventId);
      }
      return eventsAPI.kick(eventId, userId);
    },
    onSuccess: async () => {
      // Push will update query cache; no manual refetch needed.
    },
  });
}

// ============================================================================
// ANNOUNCEMENTS
// ============================================================================

export function useAnnouncements(options?: { includeArchived?: boolean; search?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: queryKeys.announcements.list(options),
    queryFn: () => announcementsAPI.list(options),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useAnnouncement(id: string) {
  return useQuery({
    queryKey: queryKeys.announcements.detail(id),
    queryFn: () => announcementsAPI.get(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useCreateAnnouncement() {
  return useMutation({
    mutationFn: (data: any) => announcementsAPI.create(data),
  });
}

export function useUpdateAnnouncement() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      announcementsAPI.update(id, data),
  });
}

export function useDeleteAnnouncement() {
  return useMutation({
    mutationFn: (id: string) => announcementsAPI.delete(id),
  });
}

export function useTogglePinAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) => announcementsAPI.pin(id, isPinned),
    onMutate: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.announcements.all });

      const previousAnnouncements = queryClient.getQueriesData({ queryKey: queryKeys.announcements.all });

      queryClient.setQueriesData({ queryKey: queryKeys.announcements.all }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((announcement: any) =>
          announcement?.id === id ? { ...announcement, is_pinned: isPinned } : announcement
        );
      });

      return { previousAnnouncements };
    },
    onError: (_error, _variables, context) => {
      context?.previousAnnouncements?.forEach(([key, data]: any) => {
        queryClient.setQueryData(key, data);
      });
    },
    // Do not force a refetch after pin/unpin; realtime push updates the canonical list.
  });
}

export function useArchiveAnnouncement() {
  return useMutation({
    mutationFn: ({ id }: { id: string; isArchived: boolean }) =>
      announcementsAPI.toggleArchive(id),
  });
}

// ============================================================================
// AUDIT LOGS (Admin)
// ============================================================================

export function useAuditLogs(params?: { limit?: number; offset?: number; userId?: string }) {
  return useQuery({
    queryKey: queryKeys.admin.auditLogs(params),
    queryFn: () => adminAPI.getAuditLogs(params),
    staleTime: 60 * 1000,
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Prefetch data on hover for instant navigation
 */
export function usePrefetchMember() {
  const queryClient = useQueryClient();
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.members.detail(id),
      queryFn: () => membersAPI.get(id),
    });
  };
}

export function usePrefetchEvent() {
  const queryClient = useQueryClient();
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.events.detail(id),
      queryFn: () => eventsAPI.get(id),
    });
  };
}

export function usePrefetchAnnouncement() {
  const queryClient = useQueryClient();
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.announcements.detail(id),
      queryFn: () => announcementsAPI.get(id),
    });
  };
}
