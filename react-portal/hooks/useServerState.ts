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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => membersAPI.updateProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
    },
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => eventsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => eventsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

export function useTogglePinEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsAPI.togglePin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

export function useToggleLockEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsAPI.toggleLock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

export function useArchiveEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; isArchived: boolean }) =>
      eventsAPI.toggleArchive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

export function useJoinEvent() {
  const queryClient = useQueryClient();
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
      // Ensure event lists/details refresh immediately after join.
      await queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      await queryClient.refetchQueries({ queryKey: queryKeys.events.all, type: 'active' });
    },
  });
}

export function useLeaveEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) => {
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.id === userId) {
        return eventsAPI.leave(eventId);
      }
      return eventsAPI.kick(eventId, userId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      await queryClient.refetchQueries({ queryKey: queryKeys.events.all, type: 'active' });
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => announcementsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      announcementsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
    },
  });
}

export function useTogglePinAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsAPI.pin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
    },
  });
}

export function useArchiveAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; isArchived: boolean }) =>
      announcementsAPI.toggleArchive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
    },
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
