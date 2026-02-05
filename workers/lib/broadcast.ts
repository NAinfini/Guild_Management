/**
 * Broadcast Helper - Sends WebSocket messages via Durable Object
 */

interface BroadcastOptions {
  type: string;
  data: any;
  excludeUserId?: string;
}

export async function broadcastUpdate(env: any, options: BroadcastOptions): Promise<void> {
  try {
    // Get Durable Object stub
    const id = env.CONNECTIONS?.idFromName('guild-main');
    if (!id) {
      console.warn('[Broadcast] CONNECTIONS binding not found, skipping broadcast');
      return;
    }

    const stub = env.CONNECTIONS.get(id);
    
    // Send broadcast request
    const response = await stub.fetch(new Request('http://internal/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    }));

    if (!response.ok) {
      console.error('[Broadcast] Failed:', await response.text());
    } else {
      const result = await response.json();
      console.info(`[Broadcast] Sent ${options.type} to ${result.sent || 0} clients`);
    }
  } catch (error) {
    console.error('[Broadcast] Error:', error);
    // Don't throw - broadcasting is optional, shouldn't break mutations
  }
}

