/**
 * Server-Sent Events push endpoint (Refactored)
 * GET /api/push?entities=wars,events,announcements,members
 * 
 * Instead of polling the DB every 2s, this endpoint now:
 * 1. Connects to the ConnectionManager Durable Object via WebSocket
 * 2. Forwards any broadcast updates to the SSE stream
 * 3. Handles heartbeats to keep the connection alive
 */

import type { PagesFunction, Env } from '../../core/types';

type Entity = 'wars' | 'events' | 'announcements' | 'members';
const DEFAULT_ENTITIES: Entity[] = ['wars', 'events', 'announcements', 'members'];
const HEARTBEAT_MS = 15000;
const MAX_DURATION_MS = 600000; // 10 minutes (browser will reconnect anyway)

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const entitiesParam = url.searchParams.get('entities');
  const requestedEntities = (entitiesParam ? entitiesParam.split(',') : DEFAULT_ENTITIES).filter((e): e is Entity =>
    ['wars', 'events', 'announcements', 'members'].includes(e)
  );

  // Get Durable Object stub
  const id = env.CONNECTIONS.idFromName('guild-main');
  const stub = env.CONNECTIONS.get(id);

  // Setup WebSocket pair for internal pub/sub
  const [client, server] = Object.values(new WebSocketPair());

  // Connect the internal "server" end to the DO
  // we pass a special userId prefix to identify SSE proxy connections if needed
  const doResponse = await stub.fetch(new Request('http://internal/ws?userId=sse-proxy-' + Math.random().toString(36).slice(2)), {
    headers: { Upgrade: 'websocket' },
  });

  if (doResponse.status !== 101) {
    return new Response('Failed to establish real-time connection', { status: 500 });
  }

  const doWs = doResponse.webSocket;
  if (!doWs) {
    return new Response('Failed to get WebSocket from DO', { status: 500 });
  }
  doWs.accept();

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (obj: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
        } catch (e) {
          // Stream might be closed
          doWs.close();
        }
      };

      const heartbeat = () => {
        try {
          controller.enqueue(encoder.encode(': keep-alive\n\n'));
        } catch (e) {
          doWs.close();
        }
      };

      // Listen for messages from DO
      doWs.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(event.data as string);
          
          // Filter by requested entities
          if (message.entity && requestedEntities.includes(message.entity as Entity)) {
            send(message);
          }
        } catch (err) {
          console.error('[SSE Proxy] Parse error:', err);
        }
      });

      // Heartbeat interval
      const heartbeatInterval = setInterval(heartbeat, HEARTBEAT_MS);

      // Cleanup on stream close
      const abortTimeout = setTimeout(() => {
          clearInterval(heartbeatInterval);
          doWs.close();
          controller.close();
      }, MAX_DURATION_MS);

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        clearTimeout(abortTimeout);
        doWs.close();
        try {
            controller.close();
        } catch (e) {}
      });
      
      doWs.addEventListener('close', () => {
        clearInterval(heartbeatInterval);
        clearTimeout(abortTimeout);
        try {
            controller.close();
        } catch (e) {}
      });
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for Nginx/Proxies
    },
  });
};
