/**
 * Broadcast Helper - Sends WebSocket messages via Durable Object
 */

import type { WebSocketMessage } from '@guild/shared-api/contracts';
import type { Env } from './types';

interface BroadcastOptions extends WebSocketMessage {
  excludeUserId?: string;
}

interface BroadcastResult {
  sent?: number;
}

export async function broadcastUpdate(env: Partial<Pick<Env, 'CONNECTIONS'>>, options: BroadcastOptions): Promise<void> {
  try {
    // Get Durable Object stub
    const connections = env.CONNECTIONS;
    if (!connections) {
      console.warn('[Broadcast] CONNECTIONS binding not found, skipping broadcast');
      return;
    }

    const id = connections.idFromName('guild-main');
    const stub = connections.get(id);
    
    // Send broadcast request
    const response = await stub.fetch(new Request('http://internal/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Always include initiator so self-updates rely on push, not refetch.
      body: JSON.stringify({ ...options, excludeUserId: undefined }),
    }));

    if (!response.ok) {
      console.error('[Broadcast] Failed:', await response.text());
    } else {
      const result = await response.json() as BroadcastResult;
      console.info(`[Broadcast] Sent ${options.entity}:${options.action} to ${result.sent || 0} clients`);
    }
  } catch (error) {
    console.error('[Broadcast] Error:', error);
    // Don't throw - broadcasting is optional, shouldn't break mutations
  }
}
