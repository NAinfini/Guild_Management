import { useEffect, useRef, useCallback } from 'react';
import { useGuildStore } from '../store';

interface UsePollingOptions {
  /** Polling interval in milliseconds (default: 30000) */
  interval?: number;
  /** Whether to start polling immediately (default: true) */
  enabled?: boolean;
  /** Pause polling when tab is hidden (default: true) */
  pauseOnHidden?: boolean;
}

/**
 * Hook for automatic background polling of guild data.
 * Pauses when tab is hidden and resumes when visible.
 */
export function usePolling(options: UsePollingOptions = {}) {
  const { 
    interval = 30000, 
    enabled = true, 
    pauseOnHidden = true 
  } = options;

  const { pollData, isPolling, startPolling, stopPolling } = useGuildStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);

  // Manual refresh function
  const refresh = useCallback(async () => {
    return await pollData();
  }, [pollData]);

  // Handle visibility change
  useEffect(() => {
    if (!pauseOnHidden) return;

    const handleVisibility = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
      
      if (isVisibleRef.current && enabled) {
        // Tab became visible - do immediate poll and restart interval
        pollData();
        startPolling(interval);
      } else if (!isVisibleRef.current) {
        // Tab hidden - stop polling
        stopPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [enabled, interval, pauseOnHidden, pollData, startPolling, stopPolling]);

  // Start/stop polling based on enabled state
  useEffect(() => {
    if (enabled && isVisibleRef.current) {
      startPolling(interval);
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [enabled, interval, startPolling, stopPolling]);

  return {
    isPolling,
    refresh,
    startPolling: () => startPolling(interval),
    stopPolling
  };
}

export default usePolling;
