/**
 * WebSocket Client Hook
 * Manages WebSocket connection and handles real-time updates
 *
 * ✅ Updated to work with TanStack Query:
 * Instead of updating Zustand state directly, we invalidate TanStack Query caches
 * This triggers automatic refetching of affected data
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '../lib/toast';

interface WebSocketMessage {
  type: string;
  data: any;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'ping':
        // Respond to ping
        wsRef.current?.send(JSON.stringify({ type: 'pong' }));
        break;

      case 'member:updated':
        // ✅ Invalidate members cache → auto-refetch
        queryClient.invalidateQueries({ queryKey: ['members'] });
        break;

      case 'event:updated':
        // ✅ Invalidate events cache → auto-refetch
        queryClient.invalidateQueries({ queryKey: ['events'] });
        toast.info('Event updated', 3000);
        break;

      case 'announcement:created':
        // ✅ Invalidate announcements cache → auto-refetch
        queryClient.invalidateQueries({ queryKey: ['announcements'] });
        const newAnnouncement = message.data;
        toast.info(`New announcement: ${newAnnouncement.title}`, 5000);
        break;

      case 'announcement:updated':
        // ✅ Invalidate announcements cache → auto-refetch
        queryClient.invalidateQueries({ queryKey: ['announcements'] });
        break;

      default:
        console.warn('[WebSocket] Unknown message type:', message.type);
    }
  }, [queryClient]);

  const connectRef = useRef<(() => void) | undefined>();

  const connect = useCallback(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8787/api/ws';

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.info('[WebSocket] Connected');
        setIsConnected(true);
        setReconnectAttempts(0);
        toast.success('Real-time updates connected', 3000);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
      };

      ws.onclose = () => {
        console.info('[WebSocket] Disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Attempt reconnect with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.info(`[WebSocket] Reconnecting in ${delay}ms...`);

        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts((prev) => prev + 1);
          connectRef.current?.();
        }, delay);
      };
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
    }
  }, [reconnectAttempts, handleMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Update connect ref and connect on mount, disconnect on unmount
  useEffect(() => {
    connectRef.current = connect;
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    reconnectAttempts,
  };
}
