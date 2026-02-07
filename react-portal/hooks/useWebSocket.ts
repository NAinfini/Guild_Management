/**
 * WebSocket Client Hook (Refactored)
 * Manages WebSocket connection and handles real-time updates with Delta Cache Updates.
 *
 * Features:
 * - Sequence number tracking for gap detection
 * - Entity subscription filtering
 * - Exponential backoff reconnection
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '../lib/toast';
import { queryKeys } from '../lib/queryKeys';
import { mapToDomain as mapMember } from '../lib/api/members';
import { mapToDomain as mapEvent } from '../lib/api/events';
import { mapToDomain as mapAnnouncement } from '../lib/api/announcements';
import { mapHistoryToDomain as mapWar } from '../lib/api/wars';
import type { WebSocketMessage } from '../../shared/api/contracts';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSeqRef = useRef<Record<string, number>>({});
  const queryClient = useQueryClient();

  const handleMessage = useCallback((message: WebSocketMessage) => {
    // Handle welcome message with initial seqs (sent on connect)
    if (message.type === 'welcome' && message.data?.seqs) {
      const serverSeqs = message.data.seqs as Record<string, number>;
      const clientSeqs = lastSeqRef.current;

      // Check each entity for gaps (reconnect scenario)
      for (const [entity, serverSeq] of Object.entries(serverSeqs)) {
        const clientSeq = clientSeqs[entity] || 0;
        if (clientSeq > 0 && serverSeq > clientSeq) {
          queryClient.invalidateQueries({ queryKey: [entity] });
        }
      }

      lastSeqRef.current = serverSeqs;
      return;
    }

    // Handle legacy message format if any
    if (message.type && !message.entity) {
        if (message.type === 'ping') {
            wsRef.current?.send(JSON.stringify({ type: 'pong' }));
            return;
        }
    }

    const { entity, action, payload, ids, seq } = message;
    if (!entity || !action) return;

    // Sequence gap detection
    if (seq !== undefined && entity) {
      const lastSeen = lastSeqRef.current[entity] || 0;
      if (seq > lastSeen + 1 && lastSeen > 0) {
        // Gap detected: missed messages. Invalidate cache for full refetch.
        console.warn(`[WebSocket] Seq gap for ${entity}: expected ${lastSeen + 1}, got ${seq}. Invalidating.`);
        queryClient.invalidateQueries({ queryKey: [entity] });
        lastSeqRef.current[entity] = seq;
        return;
      }
      lastSeqRef.current[entity] = seq;
    }

    // Helper to update a list in the cache
    const updateList = (baseKey: readonly any[], items: any[], idField: string) => {
        queryClient.setQueriesData({ queryKey: baseKey }, (oldData: any) => {
            if (!oldData) return oldData;

            let list = Array.isArray(oldData) ? oldData : (oldData.items || []);
            const isArray = Array.isArray(oldData);

            if (action === 'deleted') {
                list = list.filter((item: any) => !ids?.includes(item[idField]));
            } else if (payload && payload.length > 0) {
                const newItemsMap = new Map(items.map((i: any) => [i[idField], i]));
                list = list.map((item: any) => newItemsMap.has(item[idField]) ? newItemsMap.get(item[idField]) : item);

                items.forEach((newItem: any) => {
                    if (!list.find((existing: any) => existing[idField] === newItem[idField])) {
                        list.unshift(newItem);
                    }
                });
            }

            return isArray ? [...list] : { ...oldData, items: [...list] };
        });
    };

    // Helper to update individual item details
    const updateDetails = (baseKeyFn: (id: string) => readonly any[], items: any[], idField: string) => {
         if (action === 'deleted') {
             ids?.forEach((id: string) => queryClient.removeQueries({ queryKey: baseKeyFn(id) }));
         } else {
             items.forEach((item: any) => {
                 queryClient.setQueryData(baseKeyFn(item[idField]), item);
             });
         }
    };

    // Entity-specific mapping and updates
    try {
        if (entity === 'members') {
            const mapped = payload?.map(mapMember) || [];
            updateList(queryKeys.members.all, mapped, 'id');
            updateDetails(queryKeys.members.detail, mapped, 'id');
            if (action === 'updated') toast.info('Member profile updated');
        }

        if (entity === 'events') {
            const mapped = payload?.map(mapEvent) || [];
            updateList(queryKeys.events.all, mapped, 'id');
            updateDetails(queryKeys.events.detail, mapped, 'id');
            if (action === 'created') toast.success(`New Event: ${mapped[0]?.title}`);
            if (action === 'deleted') toast.info('Event cancelled');
        }

        if (entity === 'announcements') {
            const mapped = payload?.map(mapAnnouncement) || [];
            updateList(queryKeys.announcements.all, mapped, 'id');
            updateDetails(queryKeys.announcements.detail, mapped, 'id');
            if (action === 'created') toast.success(`New Announcement: ${mapped[0]?.title}`, 5000);
        }

        if (entity === 'wars') {
            const mapped = payload?.map(mapWar) || [];
            updateList(queryKeys.wars.history(), mapped, 'id');
            if (action === 'updated') toast.info('War results updated');
        }
    } catch (err) {
        console.error('[WebSocket] Error processing update:', err);
        // Fallback: invalidate everything if delta update fails
        queryClient.invalidateQueries({ queryKey: [entity] });
    }
  }, [queryClient]);

  const connect = useCallback(() => {
    const getWsUrl = () => {
        if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.host}/api/ws`;
    };
    const wsUrl = getWsUrl();

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setReconnectAttempts(0);

        // Subscribe to all entities by default
        ws.send(JSON.stringify({
          type: 'subscribe',
          entities: ['members', 'events', 'announcements', 'wars'],
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts((prev) => prev + 1);
        }, delay);
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
      };
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
    }
  }, [reconnectAttempts, handleMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    if (wsRef.current) wsRef.current.close();
    setIsConnected(false);
  }, []);

  /**
   * Update entity subscription. Sends subscribe message to DO.
   * Pages can call this to filter broadcasts to relevant entities only.
   */
  const subscribe = useCallback((entities: string[]) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        entities,
      }));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { isConnected, reconnectAttempts, subscribe };
}
