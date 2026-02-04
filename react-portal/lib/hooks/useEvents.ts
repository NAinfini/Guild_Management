/**
 * TanStack Query Hooks for Events
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsAPI } from '../api';
import type { Event } from '../../types';

// ============================================================================
// Queries
// ============================================================================

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => eventsAPI.list(),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => eventsAPI.get(id),
    enabled: !!id,
  });
}

// ============================================================================
// Mutations
// ============================================================================

export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => eventsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      eventsAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => eventsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useJoinEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => eventsAPI.join(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', id] });
    },
  });
}

export function useLeaveEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => eventsAPI.leave(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', id] });
    },
  });
}

// ============================================================================
// Batch Mutations
// ============================================================================

export function useBatchDeleteEvents() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: string[]) => eventsAPI.batchDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useBatchArchiveEvents() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ids, archived }: { ids: string[]; archived: boolean }) =>
      eventsAPI.batchArchive(ids, archived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
