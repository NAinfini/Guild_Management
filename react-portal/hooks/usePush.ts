import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys';
import { mapToDomain as mapMember } from '../lib/api/members';
import { mapToDomain as mapEvent } from '../lib/api/events';
import { mapToDomain as mapAnnouncement } from '../lib/api/announcements';
import { mapHistoryToDomain as mapWar } from '../lib/api/wars';

/**
 * Subscribe to server push (SSE) for entity updates.
 * Updates the TanStack Query cache directly with the pushed delta, avoiding refetches.
 */
export function usePush(entities: string[] = ['wars', 'events', 'announcements', 'members']) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only subscribe in browser environment
    if (typeof window === 'undefined') return;

    const qs = new URLSearchParams({ entities: entities.join(',') });
    const es = new EventSource(`/api/push?${qs.toString()}`);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { entity, action, payload, ids } = data;

        // Helper to update a list in the cache
        const updateList = (baseKey: readonly any[], items: any[], idField: string = 'id') => {
            queryClient.setQueriesData({ queryKey: baseKey }, (oldData: any) => {
                if (!oldData) return oldData;
                
                // Handle different list shapes (Array vs Paginated Object)
                let list = Array.isArray(oldData) ? oldData : (oldData.items || []);
                const isArray = Array.isArray(oldData);

                if (action === 'deleted') {
                    list = list.filter((item: any) => !ids.includes(item[idField]));
                } else if (payload && payload.length > 0) {
                    // Upsert items
                    const newItemsMap = new Map(items.map((i: any) => [i[idField], i]));
                    list = list.map((item: any) => newItemsMap.has(item[idField]) ? newItemsMap.get(item[idField]) : item);
                    
                    // Add new items to top (simple approach, sorting might be needed but good enough for live)
                    // Only add if not exists
                    items.forEach((newItem: any) => {
                        if (!list.find((existing: any) => existing[idField] === newItem[idField])) {
                            list.unshift(newItem);
                        }
                    });
                }

                return isArray ? list : { ...oldData, items: list };
            });
        };

        // Helper to update individual item details
        const updateDetails = (baseKeyFn: (id: string) => readonly any[], items: any[], idField: string = 'id') => {
             if (action === 'deleted') {
                 ids?.forEach((id: string) => queryClient.removeQueries({ queryKey: baseKeyFn(id) }));
             } else {
                 items.forEach((item: any) => {
                     queryClient.setQueryData(baseKeyFn(item[idField]), item);
                 });
             }
        };


        if (entity === 'members') {
            const mapped = payload?.map(mapMember) || [];
            updateList(queryKeys.members.all, mapped);
            updateDetails(queryKeys.members.detail, mapped);
        }

        if (entity === 'events') {
            const mapped = payload?.map(mapEvent) || [];
            updateList(queryKeys.events.all, mapped);
            updateDetails(queryKeys.events.detail, mapped);
        }

        if (entity === 'announcements') {
            const mapped = payload?.map(mapAnnouncement) || [];
            updateList(queryKeys.announcements.all, mapped);
            updateDetails(queryKeys.announcements.detail, mapped);
        }

        if (entity === 'wars') {
            const mapped = payload?.map(mapWar) || [];
            // Wars have multiple list types (active, history). 
            // We'll try to update history. Active might be different DTO.
            // Assuming payload is history DTO as per worker change.
            updateList(queryKeys.wars.history(), mapped);
            // We don't have a direct 'get war detail' query usually, usually list derived? 
            // But if we did:
            // updateDetails(queryKeys.wars.detail, mapped); 
        }

      } catch (e) {
        console.warn('Push parse error', e);
      }
    };

    es.onerror = (err) => {
      // console.debug('SSE connection closed/error', err);
      es.close();
      // Optional: Retry logic could go here, but EventSource auto-retries usually. 
      // Manual reconnect might be needed if complexauth.
    };

    return () => es.close();
  }, [entities, queryClient]);
}
