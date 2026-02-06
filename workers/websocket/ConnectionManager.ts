/// <reference types="@cloudflare/workers-types" />

/**
 * WebSocket Connection Manager - Cloudflare Durable Object
 * Manages persistent WebSocket connections for real-time updates
 */

export class ConnectionManager {
  state: DurableObjectState;
  env: any;
  sessions: Map<string, WebSocket>;
  
  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
  }

  async fetch(request: Request) {
    const url = new URL(request.url);

    // Handle internal broadcast requests
    if (url.pathname === '/broadcast' && request.method === 'POST') {
      try {
        const body = await request.json() as any;
        if (!body.timestamp) body.timestamp = new Date().toISOString();
        const sent = this.broadcast(body, body.excludeUserId);
        return new Response(JSON.stringify({ sent }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response('Invalid broadcast request', { status: 400 });
      }
    }

    // Handle WebSocket upgrade
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }

    // Create WebSocket pair
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Accept the WebSocket connection
    (server as any).accept();

    // Extract user ID from query params or session
    const userId = url.searchParams.get('userId') || 'anonymous';

    // Store the connection
    this.sessions.set(userId, server as any);
    console.log(`[WebSocket] User ${userId} connected. Total connections: ${this.sessions.size}`);

    // Handle messages
    (server as any).addEventListener('message', (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        console.log('[WebSocket] Received message:', message);
        
        // Echo back for testing
        (server as any).send(JSON.stringify({
          type: 'echo',
          data: message,
        }));
      } catch (error) {
        console.error('[WebSocket] Message parse error:', error);
      }
    });

    // Handle close
    (server as any).addEventListener('close', () => {
      console.log(`[WebSocket] User ${userId} disconnected`);
      this.sessions.delete(userId);
    });

    // Handle errors
    (server as any).addEventListener('error', (error: any) => {
      console.error('[WebSocket] Error:', error);
      this.sessions.delete(userId);
    });

    // Set up alarm for cleanup (every 10 minutes)
    await this.state.storage.setAlarm(Date.now() + 10 * 60 * 1000);

    console.log(`[WebSocket] Upgrading for user: ${userId}`);
    // Return the client WebSocket
    return new Response(null, {
      status: 101,
      webSocket: client as any,
    });
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message: any, excludeUserId?: string) {
    const messageStr = JSON.stringify(message);
    let sent = 0;

    this.sessions.forEach((ws, userId) => {
      if (userId !== excludeUserId) {
        try {
          ws.send(messageStr);
          sent++;
        } catch (error) {
          console.error(`[WebSocket] Failed to send to ${userId}:`, error);
          this.sessions.delete(userId);
        }
      }
    });

    console.log(`[WebSocket] Broadcast sent to ${sent} clients`);
    return sent;
  }

  /**
   * Send message to specific user
   */
  sendToUser(userId: string, message: any) {
    const ws = this.sessions.get(userId);
    if (ws) {
      try {
        ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error(`[WebSocket] Failed to send to ${userId}:`, error);
        this.sessions.delete(userId);
        return false;
      }
    }
    return false;
  }

  /**
   * Cleanup alarm - runs periodically
   */
  async alarm() {
    console.log('[WebSocket] Running cleanup alarm');
    
    // Close stale connections
    const now = Date.now();
    this.sessions.forEach((ws, userId) => {
      try {
        // Ping test
        ws.send(JSON.stringify({ type: 'ping', timestamp: now }));
      } catch (error) {
        console.log(`[WebSocket] Removing stale connection: ${userId}`);
        this.sessions.delete(userId);
      }
    });

    // Schedule next alarm
    await this.state.storage.setAlarm(Date.now() + 10 * 60 * 1000);
  }
}
