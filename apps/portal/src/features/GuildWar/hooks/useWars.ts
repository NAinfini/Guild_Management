/**
 * Guild War Hook
 * Manages war operations with API integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warsAPI, type WarHistory } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryKeys';

export function useActiveWars() {
  return useQuery({
    queryKey: queryKeys.wars.active(),
    queryFn: () => warsAPI.getLatest(),
  });
}

export function useWarTeams(warId: string) {
  return useQuery<{ teams: any[]; pool: any[] }>({
    queryKey: queryKeys.war.teams(warId),
    queryFn: () => warsAPI.getActiveTeams(warId),
    enabled: !!warId,
  });
}

export function useCreateWarTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ warId, name, note }: { warId: string; name: string; note?: string }) =>
      warsAPI.createTeam(warId, name, note),
    onSuccess: (_, { warId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wars.active() });
      queryClient.invalidateQueries({ queryKey: queryKeys.war.teams(warId) });
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
    onSuccess: (_, { warId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wars.active() });
      queryClient.invalidateQueries({ queryKey: queryKeys.war.teams(warId) });
    },
  });
}

export function useDeleteWarTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ warId, teamId }: { warId: string; teamId: string }) =>
      warsAPI.deleteTeam(warId, teamId),
    onSuccess: (_, { warId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wars.active() });
      queryClient.invalidateQueries({ queryKey: queryKeys.war.teams(warId) });
    },
  });
}

export function useMovePoolToTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { warId: string; userId?: string; teamId?: string; roleTag?: string; moves?: any[] }) =>
      warsAPI.movePoolToTeam(params.warId, params.moves || { userId: params.userId, teamId: params.teamId, roleTag: params.roleTag }),
    onMutate: async ({ warId, userId, teamId, roleTag, moves }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.war.teams(warId) });
      const previous = queryClient.getQueryData(queryKeys.war.teams(warId));
      
      if (!userId && !moves) return { previous };

      queryClient.setQueryData(queryKeys.war.teams(warId), (old: any) => {
        if (!old) return old;
        const nextPool = [...old.pool];
        const nextTeams = [...old.teams];
        
        const movesToProcess = moves || [{ userId, teamId, roleTag }];
        
        movesToProcess.forEach((move: any) => {
            const uId = move.userId || move.user_id;
            const tId = move.teamId || move.team_id;
            const rTag = move.roleTag || move.role_tag;
            
            const userIndex = nextPool.findIndex((p: any) => p.user_id === uId || p.id === uId);
            if (userIndex !== -1) {
                const user = nextPool.splice(userIndex, 1)[0];
                const teamIndex = nextTeams.findIndex((t: any) => t.id === tId);
                if (teamIndex !== -1) {
                    nextTeams[teamIndex] = {
                        ...nextTeams[teamIndex],
                        members: [...nextTeams[teamIndex].members, { user_id: uId, role_tag: rTag, ...user }]
                    };
                }
            }
        });

        return { ...old, pool: nextPool, teams: nextTeams };
      });

      return { previous };
    },
    onError: (err, { warId }, context: any) => {
      queryClient.setQueryData(queryKeys.war.teams(warId), context.previous);
    },
    onSettled: (_, __, { warId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.war.teams(warId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.wars.active() });
    },
  });
}

export function useMoveTeamToPool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { warId: string; userId?: string; userIds?: string[] }) =>
      warsAPI.moveTeamToPool(params.warId, params.userIds || params.userId!),
    onMutate: async ({ warId, userId, userIds }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.war.teams(warId) });
      const previous = queryClient.getQueryData(queryKeys.war.teams(warId));
      
      if (!userId && !userIds) return { previous };

      queryClient.setQueryData(queryKeys.war.teams(warId), (old: any) => {
        if (!old) return old;
        const nextPool = [...old.pool];
        let nextTeams = [...old.teams];
        
        const idsToProcess = userIds || [userId!];
        
        idsToProcess.forEach(uId => {
            nextTeams = nextTeams.map((t: any) => {
                const member = t.members.find((m: any) => m.user_id === uId);
                if (member) {
                    nextPool.push(member);
                    return { ...t, members: t.members.filter((m: any) => m.user_id !== uId) };
                }
                return t;
            });
        });

        return { ...old, pool: nextPool, teams: nextTeams };
      });

      return { previous };
    },
    onError: (err, { warId }, context: any) => {
      queryClient.setQueryData(queryKeys.war.teams(warId), context.previous);
    },
    onSettled: (_, __, { warId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.war.teams(warId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.wars.active() });
    },
  });
}

export function useMoveTeamToTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { warId: string; userId?: string; sourceTeamId?: string; targetTeamId?: string; moves?: any[] }) =>
      warsAPI.moveTeamToTeam(params.warId, params.moves || { userId: params.userId, sourceTeamId: params.sourceTeamId, targetTeamId: params.targetTeamId }),
    onMutate: async ({ warId, userId, sourceTeamId, targetTeamId, moves }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.war.teams(warId) });
      const previous = queryClient.getQueryData(queryKeys.war.teams(warId));

      if (!userId && !moves) return { previous };

      queryClient.setQueryData(queryKeys.war.teams(warId), (old: any) => {
        if (!old) return old;
        let nextTeams = [...old.teams];
        
        const movesToProcess = moves || [{ userId, sourceTeamId, targetTeamId }];
        
        movesToProcess.forEach((move: any) => {
            const uId = move.userId || move.user_id;
            const sId = move.sourceTeamId || move.source_team_id;
            const tId = move.targetTeamId || move.target_team_id;
            
            let userData: any = null;
            // Remove from source
            nextTeams = nextTeams.map((t: any) => {
                if (t.id === sId) {
                    userData = t.members.find((m: any) => m.user_id === uId);
                    return { ...t, members: t.members.filter((m: any) => m.user_id !== uId) };
                }
                return t;
            });

            if (userData) {
                // Add to target
                nextTeams = nextTeams.map((t: any) => {
                    if (t.id === tId) {
                        return { ...t, members: [...t.members, userData] };
                    }
                    return t;
                });
            }
        });

        return { ...old, teams: nextTeams };
      });

      return { previous };
    },
    onError: (err, { warId }, context: any) => {
      queryClient.setQueryData(queryKeys.war.teams(warId), context.previous);
    },
    onSettled: (_, __, { warId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.war.teams(warId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.wars.active() });
    },
  });
}

export function useKickFromTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ warId, userId, teamId }: { warId: string; userId: string; teamId: string }) =>
      warsAPI.kickFromTeam(warId, { userId, teamId }),
    onMutate: async ({ warId, userId, teamId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.war.teams(warId) });
      const previous = queryClient.getQueryData(queryKeys.war.teams(warId));

      queryClient.setQueryData(queryKeys.war.teams(warId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          teams: old.teams.map((t: any) => 
            t.id === teamId 
              ? { ...t, members: t.members.filter((m: any) => m.user_id !== userId) }
              : t
          )
        };
      });

      return { previous };
    },
    onError: (err, { warId }, context: any) => {
      queryClient.setQueryData(queryKeys.war.teams(warId), context.previous);
    },
    onSettled: (_, __, { warId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.war.teams(warId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.wars.active() });
    },
  });
}

export function useKickFromPool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ warId, userId }: { warId: string; userId: string }) =>
      warsAPI.kickFromPool(warId, userId),
    onMutate: async ({ warId, userId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.war.teams(warId) });
      const previous = queryClient.getQueryData(queryKeys.war.teams(warId));

      queryClient.setQueryData(queryKeys.war.teams(warId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pool: old.pool.filter((p: any) => p.user_id !== userId && p.id !== userId)
        };
      });

      return { previous };
    },
    onError: (err, { warId }, context: any) => {
      queryClient.setQueryData(queryKeys.war.teams(warId), context.previous);
    },
    onSettled: (_, __, { warId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.war.teams(warId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.wars.active() });
    },
  });
}

export function useWarHistory(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: queryKeys.wars.history(params),
    queryFn: () => warsAPI.getHistory(params),
  });
}

export function useCreateWarHistory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<WarHistory>) => warsAPI.createHistory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wars.history() });
    },
  });
}

export function useUpdateWarStats() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ warId, data, ifMatch }: { warId: string; data: Partial<WarHistory>; ifMatch?: string }) =>
      warsAPI.updateWarStats(warId, data, ifMatch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wars.history() });
    },
  });
}

export function useWarAnalytics(params?: { userId?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: queryKeys.wars.analytics(params),
    queryFn: () => warsAPI.getAnalytics(params),
  });
}

/**
 * Fetch member stats for a specific war with optional polling
 * @param warId - War/Event ID
 * @param options - Configuration options
 * @param options.pollInterval - Polling interval in ms (0 = no polling)
 * @param options.enabled - Whether query should run
 */
export function useWarMemberStats(
  warId: string,
  options?: {
    pollInterval?: number;
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: queryKeys.war.memberStats(warId),
    queryFn: () => warsAPI.getMemberStats(warId),
    enabled: options?.enabled !== false && !!warId,
    // Poll if interval provided (0 or false = no polling)
    refetchInterval: options?.pollInterval || false,
    // Don't poll in background to save resources
    refetchIntervalInBackground: false,
    // Cache for 30 seconds
    staleTime: 30000,
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
    queryKey: queryKeys.wars.list(params),
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
  teamIds?: number[];
  mode?: 'compare' | 'rankings' | 'teams';
  metric?: string;
  aggregation?: 'total' | 'average' | 'best' | 'median';
  limit?: number;
  cursor?: string;
  includePerWar?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.wars.analyticsData(params),
    queryFn: () =>
      warsAPI.getAnalyticsData({
        includePerWar: true,
        limit: 200,
        ...params,
      }),
    enabled: !!(params?.warIds && params.warIds.length > 0), // Only fetch when wars selected
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
