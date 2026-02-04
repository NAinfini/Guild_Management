/**
 * WebSocket Client Hook
 * Manages WebSocket connection and handles real-time updates
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useGuildStore } from '../store';
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
          connect();
        }, delay);
      };
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
    }
  }, [reconnectAttempts]);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    const store = useGuildStore.getState();

    switch (message.type) {
      case 'ping':
        // Respond to ping
        wsRef.current?.send(JSON.stringify({ type: 'pong' }));
        break;

      case 'member:updated':
        // Update member in store
        const updatedMember = message.data;
        const memberIndex = store.members.findIndex(m => m.id === updatedMember.id);
        
        if (memberIndex >= 0) {
          const newMembers = [...store.members];
          newMembers[memberIndex] = updatedMember;
          useGuildStore.setState({ members: newMembers });
        } else {
          useGuildStore.setState({ members: [...store.members, updatedMember] });
        }
        break;

      case 'event:updated':
        // Update event in store
        const updatedEvent = message.data;
        const eventIndex = store.events.findIndex(e => e.id === updatedEvent.id);
        
        if (eventIndex >= 0) {
          const newEvents = [...store.events];
          newEvents[eventIndex] = updatedEvent;
          useGuildStore.setState({ events: newEvents });
        } else {
          useGuildStore.setState({ events: [...store.events, updatedEvent] });
        }
        toast.info('Event updated', 3000);
        break;

      case 'announcement:created':
        // Add new announcement
        const newAnnouncement = message.data;
        useGuildStore.setState({ 
          announcements: [newAnnouncement, ...store.announcements] 
        });
        toast.info(`New announcement: ${newAnnouncement.title}`, 5000);
        break;

      case 'announcement:updated':
        // Update announcement
        const updatedAnnouncement = message.data;
        const announcementIndex = store.announcements.findIndex(a => a.id === updatedAnnouncement.id);
        
        if (announcementIndex >= 0) {
          const newAnnouncements = [...store.announcements];
          newAnnouncements[announcementIndex] = updatedAnnouncement;
          useGuildStore.setState({ announcements: newAnnouncements });
        }
        break;

      default:
        console.warn('[WebSocket] Unknown message type:', message.type);
    }
  }, []);

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

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    reconnectAttempts,
  };
}
