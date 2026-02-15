/**
 * TanStack Query Client Configuration
 * Provides caching, refetching, and state management for API calls
 */

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from './toast';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Don't show global error if query explicitly handles it or silenced
      if (query.meta?.errorMessage === false) return;
      toast.apiError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      // Don't show global error if mutation explicitly handles it or silenced
      if (mutation.meta?.errorMessage === false) return;
      toast.apiError(error);
    },
  }),
  defaultOptions: {
    queries: {
      // Day 11 rework baseline: event-facing queries stay fresh for 2 minutes by default.
      staleTime: 1000 * 60 * 2,
      
      // Cache data for 5 minutes
      gcTime: 5 * 60 * 1000,
      
      // Retry failed requests twice
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Don't refetch on window focus (we have push notifications)
      refetchOnWindowFocus: false,
      // Re-render only when consumed query fields change.
      // The runtime supports "tracked" but local typings lag behind; keep behavior with a safe cast.
      notifyOnChangeProps: 'tracked' as any,
      
      // Don't refetch on mount if data is fresh

      
      // Do refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      retryDelay: 1000,
    },
  },
});
