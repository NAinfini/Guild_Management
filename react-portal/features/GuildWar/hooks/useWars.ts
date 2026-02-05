/**
 * Guild War Hook
 * Manages war operations with API integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warsAPI, type WarHistory } from '../../../lib/api';

export function useActiveWars() {
  return useQuery({
    queryKey: ['wars', 'active'],
    queryFn: () => warsAPI.getLatest(),
  });
}

export function useWarTeams(warId: string) {
  return useQuery<{ teams: any[]; pool: any[] }>({
    queryKey: ['war', warId, 'teams'],
    queryFn: () => warsAPI.getActiveTeams(warId),
    enabled: !!warId,
  });
}

export function useCreateWarTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ warId, name, note }: { warId: string; name: string; note?: string }) =>
      warsAPI.createTeam(warId, name, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wars', 'active'] });
    },
  });
}

export function useUpdateWarTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ warId, teamId, data }: { 
      warId: string; 
      teamId: string; 
      data: { name?: string; note?: string; isLocked?: boolean; sortOrder?: number } 
    }) => warsAPI.updateTeam(warId, teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wars', 'active'] });
    },
  });
}

export function useDeleteWarTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ warId, teamId }: { warId: string; teamId: string }) =>
      warsAPI.deleteTeam(warId, teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wars', 'active'] });
    },
  });
}

export function useMovePoolToTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ warId, userId, teamId, roleTag }: { warId: string; userId: string; teamId: string; roleTag?: string }) =>
      warsAPI.movePoolToTeam(warId, { userId, teamId, roleTag }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wars', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['war'] });
    },
  });
}

export function useMoveTeamToPool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ warId, userId }: { warId: string; userId: string }) =>
      warsAPI.moveTeamToPool(warId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wars', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['war'] });
    },
  });
}

export function useMoveTeamToTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ warId, userId, sourceTeamId, targetTeamId }: { warId: string; userId: string; sourceTeamId: string; targetTeamId: string }) =>
      warsAPI.moveTeamToTeam(warId, { userId, sourceTeamId, targetTeamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wars', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['war'] });
    },
  });
}

export function useKickFromTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ warId, userId, teamId }: { warId: string; userId: string; teamId: string }) =>
      warsAPI.kickFromTeam(warId, { userId, teamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wars', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['war'] });
    },
  });
}

export function useKickFromPool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ warId, userId }: { warId: string; userId: string }) =>
      warsAPI.kickFromPool(warId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wars', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['war'] });
    },
  });
}

export function useWarHistory(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['wars', 'history', params],
    queryFn: () => warsAPI.getHistory(params),
  });
}

export function useCreateWarHistory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<WarHistory>) => warsAPI.createHistory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wars', 'history'] });
    },
  });
}

export function useUpdateWarStats() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ warId, data, ifMatch }: { warId: string; data: Partial<WarHistory>; ifMatch?: string }) =>
      warsAPI.updateWarStats(warId, data, ifMatch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wars', 'history'] });
    },
  });
}

export function useWarAnalytics(params?: { userId?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['wars', 'analytics', params],
    queryFn: () => warsAPI.getAnalytics(params),
  });
}

// ============================================================================
// War Analytics - Enhanced hooks for analytics components
// ============================================================================

/**
 * Fetch wars list for analytics filtering
 * Returns minimal war info for date range and war selection
 */
export function useWarsList(params?: { startDate?: string; endDate?: string; limit?: number }) {
  return useQuery({
    queryKey: ['wars', 'list', params],
    queryFn: () => warsAPI.getWarsList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch analytics data for selected wars and members
 * Returns memberStats and perWarStats for charts
 */
export function useAnalyticsData(params?: {
  startDate?: string;
  endDate?: string;
  warIds?: number[];
  userIds?: number[];
}) {
  return useQuery({
    queryKey: ['wars', 'analytics-data', params],
    queryFn: () => warsAPI.getAnalyticsData(params),
    enabled: !!(params?.warIds && params.warIds.length > 0), // Only fetch when wars selected
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
