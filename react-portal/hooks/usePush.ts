import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Subscribe to server push (SSE) for wars/events and invalidate caches on change.
 */
export function usePush(entities: string[] = ['wars', 'events']) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const qs = new URLSearchParams({ entities: entities.join(',') });
    const es = new EventSource(`/api/push?${qs.toString()}`);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.entity === 'wars') {
          queryClient.invalidateQueries({ queryKey: ['wars', 'active'] });
          queryClient.invalidateQueries({ queryKey: ['wars', 'history'] });
        }
        if (data.entity === 'events') {
          queryClient.invalidateQueries({ queryKey: ['events'] });
        }
      } catch (e) {
        console.warn('Push parse error', e);
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => es.close();
  }, [entities, queryClient]);
}
