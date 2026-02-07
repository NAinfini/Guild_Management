/// <reference types="@cloudflare/workers-types" />

/**
 * WebSocket Connection Manager - Cloudflare Durable Object
 * Manages persistent WebSocket connections for real-time updates
 *
 * Features:
 * - Per-entity sequence numbers for gap detection
 * - Per-client entity filtering (subscribe to specific entities)
 * - Distributed rate limiting via SQLite storage
 */

interface ClientSession {
  ws: WebSocket;
  entities: Set<string>; // empty = subscribed to ALL (backwards compat)
}

export class ConnectionManager {
  state: DurableObjectState;
  env: any;
  sessions: Map<string, ClientSession>;
  sql: any;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
    this.sql = state.storage.sql;

    // Initialize tables
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        key TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0,
        reset_at INTEGER NOT NULL
      )
    `);

    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS seq_counters (
        entity TEXT PRIMARY KEY,
        seq INTEGER NOT NULL DEFAULT 0
      )
    `);
  }

  /**
   * Atomically increment and return the next sequence number for an entity.
   * Single-threaded DO guarantees no races.
   */
  private nextSeq(entity: string): number {
    this.sql.exec(
      `INSERT INTO seq_counters (entity, seq) VALUES (?, 1)
       ON CONFLICT(entity) DO UPDATE SET seq = seq + 1`,
      entity
    );
    const rows = [...this.sql.exec(`SELECT seq FROM seq_counters WHERE entity = ?`, entity)];
    return (rows[0] as { seq: number })?.seq ?? 1;
  }

  /**
   * Get current sequence numbers for all entities.
   */
  private getCurrentSeqs(): Record<string, number> {
    const rows = [...this.sql.exec(`SELECT entity, seq FROM seq_counters`)];
    const result: Record<string, number> = {};
    for (const row of rows as { entity: string; seq: number }[]) {
      result[row.entity] = row.seq;
    }
    return result;
  }

  async fetch(request: Request) {
    const url = new URL(request.url);

    // Handle rate limit checks (internal only)
    if (url.pathname === '/rate-limit' && request.method === 'POST') {
      return this.handleRateLimit(request);
    }

    // Handle sequence number queries
    if (url.pathname === '/seq' && request.method === 'GET') {
      return Response.json(this.getCurrentSeqs());
    }

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

    // Store the connection with default subscription (all entities)
    this.sessions.set(userId, {
      ws: server as any,
      entities: new Set(), // empty = subscribed to ALL
    });
    console.log(`[WebSocket] User ${userId} connected. Total connections: ${this.sessions.size}`);

    // Send current sequence numbers on connect (for gap detection on reconnect)
    const seqs = this.getCurrentSeqs();
    (server as any).send(JSON.stringify({
      type: 'welcome',
      data: { seqs },
    }));

    // Handle messages
    (server as any).addEventListener('message', (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);

        // Handle subscribe messages for entity filtering
        if (message.type === 'subscribe' && Array.isArray(message.entities)) {
          const session = this.sessions.get(userId);
          if (session) {
            session.entities = new Set(message.entities);
          }
          return;
        }

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

    // Return the client WebSocket
    return new Response(null, {
      status: 101,
      webSocket: client as any,
    });
  }

  /**
   * Broadcast message to connected clients with entity filtering + sequence numbers
   */
  broadcast(message: any, excludeUserId?: string) {
    // Attach sequence number if entity is present
    if (message.entity) {
      message.seq = this.nextSeq(message.entity);
    }

    const messageStr = JSON.stringify(message);
    let sent = 0;
    const entity = message.entity;

    this.sessions.forEach((session, userId) => {
      if (userId !== excludeUserId) {
        // Check entity subscription: empty set = subscribed to ALL
        if (entity && session.entities.size > 0 && !session.entities.has(entity)) {
          return; // Client not subscribed to this entity
        }

        try {
          session.ws.send(messageStr);
          sent++;
        } catch (error) {
          console.error(`[WebSocket] Failed to send to ${userId}:`, error);
          this.sessions.delete(userId);
        }
      }
    });

    return sent;
  }

  /**
   * Send message to specific user
   */
  sendToUser(userId: string, message: any) {
    const session = this.sessions.get(userId);
    if (session) {
      try {
        session.ws.send(JSON.stringify(message));
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
   * Handle rate limit check + increment (atomic via DO single-threaded model)
   */
  async handleRateLimit(request: Request): Promise<Response> {
    try {
      const { key, maxRequests, windowMs } = await request.json() as {
        key: string;
        maxRequests: number;
        windowMs: number;
      };

      if (maxRequests === 0) {
        return Response.json({ allowed: false, remaining: 0, resetAt: Date.now() });
      }

      const now = Date.now();

      // Get or create record
      const rows = [...this.sql.exec(`SELECT count, reset_at FROM rate_limits WHERE key = ?`, key)];
      const record = rows[0] as { count: number; reset_at: number } | undefined;

      if (!record || now > record.reset_at) {
        // Window expired or new key — reset counter
        this.sql.exec(
          `INSERT OR REPLACE INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)`,
          key, now + windowMs
        );
        return Response.json({ allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs });
      }

      if (record.count >= maxRequests) {
        return Response.json({
          allowed: false,
          remaining: 0,
          resetAt: record.reset_at,
        });
      }

      // Increment
      this.sql.exec(`UPDATE rate_limits SET count = count + 1 WHERE key = ?`, key);
      return Response.json({
        allowed: true,
        remaining: maxRequests - record.count - 1,
        resetAt: record.reset_at,
      });
    } catch (error) {
      console.error('[RateLimit] Error:', error);
      // Fail open — allow the request if rate limiting errors
      return Response.json({ allowed: true, remaining: 999, resetAt: Date.now() });
    }
  }

  /**
   * Cleanup alarm - runs periodically
   */
  async alarm() {
    console.log('[WebSocket] Running cleanup alarm');

    // Cleanup expired rate limit records
    const now = Date.now();
    this.sql.exec(`DELETE FROM rate_limits WHERE reset_at < ?`, now);

    // Close stale WebSocket connections
    this.sessions.forEach((session, userId) => {
      try {
        session.ws.send(JSON.stringify({ type: 'ping', timestamp: now }));
      } catch (error) {
        console.log(`[WebSocket] Removing stale connection: ${userId}`);
        this.sessions.delete(userId);
      }
    });

    // Schedule next alarm
    await this.state.storage.setAlarm(Date.now() + 10 * 60 * 1000);
  }
}
