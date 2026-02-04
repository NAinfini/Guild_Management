/**
 * Members Hook
 * Manages member operations with API integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersAPI, type UpdateProfileData, type AvailabilityBlock } from '../lib/api';

export function useMembers(params?: { includeInactive?: boolean; role?: string }) {
  return useQuery({
    queryKey: ['members', params],
    queryFn: () => membersAPI.list(params),
  });
}

export function useMemberProfile(id: string) {
  return useQuery({
    queryKey: ['member', id],
    queryFn: () => membersAPI.getProfile(id),
    enabled: !!id,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProfileData }) =>
      membersAPI.updateProfile(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['member', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useUpdateClasses() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, classes }: { id: string; classes: string[] }) =>
      membersAPI.updateClasses(id, classes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['member', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, blocks }: { id: string; blocks: AvailabilityBlock[] }) =>
      membersAPI.updateAvailability(id, blocks),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['member', variables.id] });
    },
  });
}

export function useMemberProgression(id: string) {
  return useQuery({
    queryKey: ['progression', id],
    queryFn: () => membersAPI.getProgression(id),
    select: (data) => data.progression,
    enabled: !!id,
  });
}

export function useUpdateProgression() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, category, itemId, level }: { 
      id: string; 
      category: 'qishu' | 'xinfa' | 'wuxue'; 
      itemId: string; 
      level: number 
    }) => membersAPI.updateProgression(id, category, itemId, level),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['progression', variables.id] });
    },
  });
}
