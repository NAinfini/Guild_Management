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

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersAPI, eventsAPI, announcementsAPI, adminAPI } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';
import { User } from '../types';
import { useAuthStore, useUIStore } from '../store';

type PollingOptions = {
  enabled?: boolean;
  intervalMs?: number | false;
  fallbackOnly?: boolean;
  visibleOnly?: boolean;
};

type PollingRuntimeState = {
  pushConnected: boolean;
  isVisible: boolean;
  random?: () => number;
};

const MEMBERS_DEFAULT_POLLING: PollingOptions = {
  enabled: true,
  intervalMs: 10 * 60 * 1000,
  fallbackOnly: false,
  visibleOnly: true,
};

const EVENTS_DEFAULT_POLLING: PollingOptions = {
  enabled: true,
  intervalMs: 90 * 1000,
  fallbackOnly: true,
  visibleOnly: true,
};

const ANNOUNCEMENTS_DEFAULT_POLLING: PollingOptions = {
  enabled: true,
  intervalMs: 10 * 60 * 1000,
  fallbackOnly: false,
  visibleOnly: true,
};

function usePageVisible(): boolean {
  const [isVisible, setIsVisible] = useState(() =>
    typeof document === 'undefined' ? true : document.visibilityState !== 'hidden'
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onVisibilityChange = () => setIsVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  return isVisible;
}

export function computePollingInterval(options: PollingOptions, runtime: PollingRuntimeState): number | false {
  const enabled = options.enabled !== false;
  const intervalMs = options.intervalMs;
  const fallbackOnly = options.fallbackOnly === true;
  const visibleOnly = options.visibleOnly !== false;

  if (!enabled) return false;
  if (!intervalMs) return false;
  if (visibleOnly && !runtime.isVisible) return false;
  if (fallbackOnly && runtime.pushConnected) return false;

  const randomFn = runtime.random ?? Math.random;
  const min = intervalMs * 0.9;
  const max = intervalMs * 1.1;
  return Math.floor(min + randomFn() * (max - min));
}

function usePollingInterval(options: PollingOptions): number | false {
  const pushConnected = useUIStore(state => state.pushConnected);
  const isVisible = usePageVisible();
  const enabled = options.enabled !== false;
  const intervalMs = options.intervalMs;
  const fallbackOnly = options.fallbackOnly === true;
  const visibleOnly = options.visibleOnly !== false;

  return useMemo(() => {
    return computePollingInterval(
      { enabled, intervalMs, fallbackOnly, visibleOnly },
      { pushConnected, isVisible }
    );
  }, [enabled, intervalMs, fallbackOnly, visibleOnly, isVisible, pushConnected]);
}

// ============================================================================
// MEMBERS
// ============================================================================

export function useMembers(options?: { includeInactive?: boolean; polling?: PollingOptions }) {
  const polling = options?.polling ?? MEMBERS_DEFAULT_POLLING;
  const queryOptions = { includeInactive: options?.includeInactive };
  const refetchInterval = usePollingInterval(polling);

  return useQuery({
    queryKey: queryKeys.members.list(queryOptions),
    queryFn: () => membersAPI.list(queryOptions),
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData,
    refetchInterval,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
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
    onSuccess: (updatedMember, variables) => {
      queryClient.setQueryData(queryKeys.members.detail(variables.id), updatedMember);
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
    },
  });
}

// ============================================================================
// EVENTS
// ============================================================================

export function useEvents(options?: { type?: string; includeArchived?: boolean; search?: string; startDate?: string; endDate?: string; polling?: PollingOptions }) {
  const polling = options?.polling ?? EVENTS_DEFAULT_POLLING;
  const queryOptions = {
    type: options?.type,
    includeArchived: options?.includeArchived,
    search: options?.search,
    startDate: options?.startDate,
    endDate: options?.endDate,
  };
  const refetchInterval = usePollingInterval(polling);

  return useQuery({
    queryKey: queryKeys.events.list(queryOptions),
    queryFn: () => eventsAPI.list(queryOptions),
    staleTime: 30 * 1000,
    refetchInterval,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
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
    onSuccess: (_updated, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsAPI.delete(id),
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.events.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

export function useTogglePinEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsAPI.togglePin(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

export function useToggleLockEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsAPI.toggleLock(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

export function useArchiveEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; isArchived: boolean }) =>
      eventsAPI.toggleArchive(id),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(variables.id) });
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
    onSuccess: async (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
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
    onSuccess: async (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

// ============================================================================
// ANNOUNCEMENTS
// ============================================================================

export function useAnnouncements(options?: { includeArchived?: boolean; search?: string; startDate?: string; endDate?: string; polling?: PollingOptions }) {
  const polling = options?.polling ?? ANNOUNCEMENTS_DEFAULT_POLLING;
  const queryOptions = {
    includeArchived: options?.includeArchived,
    search: options?.search,
    startDate: options?.startDate,
    endDate: options?.endDate,
  };
  const refetchInterval = usePollingInterval(polling);

  return useQuery({
    queryKey: queryKeys.announcements.list(queryOptions),
    queryFn: () => announcementsAPI.list(queryOptions),
    staleTime: 30 * 1000,
    refetchInterval,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
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
    onSuccess: (_updated, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsAPI.delete(id),
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.announcements.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
    },
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; isArchived: boolean }) =>
      announcementsAPI.toggleArchive(id),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.detail(variables.id) });
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
