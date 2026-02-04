/**
 * Events Hook
 * Manages event operations with API integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsAPI, type CreateEventData } from '../lib/api';
import type { Event } from '../types';

export function useEvents(params?: { type?: string; includeArchived?: boolean }) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => eventsAPI.list(params),
  });
}

export function useJoinEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventId: string) => eventsAPI.join(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useLeaveEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventId: string) => eventsAPI.leave(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateEventData) => eventsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEventData> }) =>
      eventsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
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

export function usePinEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => eventsAPI.togglePin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useLockEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => eventsAPI.toggleLock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useDuplicateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => eventsAPI.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
