/**
 * TanStack Query Hooks for Members
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersAPI } from '../api';
import type { User } from '../../types';

// ============================================================================
// Queries
// ============================================================================

export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: () => membersAPI.list(),
  });
}

export function useMember(id: string) {
  return useQuery({
    queryKey: ['members', id],
    queryFn: () => membersAPI.get(id),
    enabled: !!id,
  });
}

// ============================================================================
// Mutations
// ============================================================================

export function useUpdateMemberProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      membersAPI.updateProfile(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['members', variables.id] });
    },
  });
}

export function useUpdateMemberClasses() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, classes }: { id: string; classes: string[] }) =>
      membersAPI.updateClasses(id, classes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['members', variables.id] });
    },
  });
}

// ============================================================================
// Batch Mutations
// ============================================================================

export function useBatchSetRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userIds, role }: { userIds: string[]; role: string }) =>
      membersAPI.batchSetRole(userIds, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useBatchDeactivateMembers() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userIds: string[]) => membersAPI.batchDeactivate(userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useBatchReactivateMembers() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userIds: string[]) => membersAPI.batchReactivate(userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}
