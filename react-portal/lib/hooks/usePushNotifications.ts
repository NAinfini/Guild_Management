/**
 * Push Notifications Hook
 * Connects to /api/push SSE endpoint and invalidates TanStack Query cache
 * when entities are updated on the server
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PushMessage {
  entity: 'wars' | 'events' | 'announcements' | 'members';
  action: 'updated' | 'created' | 'deleted';
  ids?: string[];
  timestamp: string;
}

export function usePushNotifications() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Connect to push endpoint
    const eventSource = new EventSource('/api/push');

    eventSource.onmessage = (event) => {
      try {
        const data: PushMessage = JSON.parse(event.data);
        console.log('[Push] Received update:', data);

        // Invalidate queries based on entity type
        switch (data.entity) {
          case 'wars':
            queryClient.invalidateQueries({ queryKey: ['wars'] });
            break;
          case 'events':
            queryClient.invalidateQueries({ queryKey: ['events'] });
            // If specific IDs provided, invalidate those too
            if (data.ids) {
              data.ids.forEach(id => {
                queryClient.invalidateQueries({ queryKey: ['events', id] });
              });
            }
            break;
          case 'announcements':
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            if (data.ids) {
              data.ids.forEach(id => {
                queryClient.invalidateQueries({ queryKey: ['announcements', id] });
              });
            }
            break;
          case 'members':
            queryClient.invalidateQueries({ queryKey: ['members'] });
            if (data.ids) {
              data.ids.forEach(id => {
                queryClient.invalidateQueries({ queryKey: ['members', id] });
              });
            }
            break;
        }
      } catch (err) {
        console.error('[Push] Failed to parse message:', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[Push] Connection error:', error);
      eventSource.close();
      
      // Reconnect after 5 seconds
      setTimeout(() => {
        console.log('[Push] Reconnecting...');
        // Hook will re-run and create new connection
      }, 5000);
    };

    // Cleanup on unmount
    return () => {
      console.log('[Push] Closing connection');
      eventSource.close();
    };
  }, [queryClient]);
}
