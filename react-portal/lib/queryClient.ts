/**
 * TanStack Query Client Configuration
 * Provides caching, refetching, and state management for API calls
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Queries are considered fresh for 30 seconds
      staleTime: 30000,
      
      // Cache data for 5 minutes
      gcTime: 5 * 60 * 1000,
      
      // Retry failed requests twice
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Don't refetch on window focus (we have push notifications)
      refetchOnWindowFocus: false,
      
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
      
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
