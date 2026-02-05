/**
 * Server-Sent Events push endpoint
 * GET /api/push?entities=wars,events,announcements,members
 * Polls DB every 2s for updated_at changes and emits JSON lines with granular deltas.
 */

import type { PagesFunction, Env } from '../../lib/types';

type Entity = 'wars' | 'events' | 'announcements' | 'members';

const DEFAULT_ENTITIES: Entity[] = ['wars', 'events', 'announcements', 'members'];
const INTERVAL_MS = 2000;
const HEARTBEAT_MS = 15000;
const MAX_DURATION_MS = 30000;

interface PushMessage {
  entity: Entity;
  action: 'updated' | 'created' | 'deleted';
  ids?: string[];  // Affected entity IDs
  timestamp: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const entitiesParam = url.searchParams.get('entities');
  const entities = (entitiesParam ? entitiesParam.split(',') : DEFAULT_ENTITIES).filter((e): e is Entity =>
    ['wars', 'events', 'announcements', 'members'].includes(e)
  );

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let lastBeat = Date.now();
      let lastWars = '';
      let lastEvents = '';
      let lastAnnouncements = '';
      let lastMembers = '';
      const abort = setTimeout(() => controller.close(), MAX_DURATION_MS);

      const send = (obj: PushMessage) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      const heartbeat = () => controller.enqueue(encoder.encode(': keep-alive\n\n'));

      const loop = async () => {
        try {
          // Wars updates
          if (entities.includes('wars')) {
            const res = await env.DB.prepare(
              'SELECT war_id, updated_at_utc FROM war_history WHERE updated_at_utc > ? ORDER BY updated_at_utc DESC LIMIT 50'
            ).bind(lastWars || '1970-01-01T00:00:00Z').all();
            
            if (res.results && res.results.length > 0) {
              const maxTs = res.results[0].updated_at_utc as string;
              lastWars = maxTs;
              send({
                entity: 'wars',
                action: 'updated',
                ids: res.results.map((r: any) => r.war_id),
                timestamp: maxTs
              });
            }
          }

          // Events updates
          if (entities.includes('events')) {
            const res = await env.DB.prepare(
              'SELECT event_id, updated_at_utc FROM events WHERE updated_at_utc > ? AND deleted_at IS NULL ORDER BY updated_at_utc DESC LIMIT 50'
            ).bind(lastEvents || '1970-01-01T00:00:00Z').all();
            
            if (res.results && res.results.length > 0) {
              const maxTs = res.results[0].updated_at_utc as string;
              lastEvents = maxTs;
              send({
                entity: 'events',
                action: 'updated',
                ids: res.results.map((r: any) => r.event_id),
                timestamp: maxTs
              });
            }
          }

          // Announcements updates
          if (entities.includes('announcements')) {
            const res = await env.DB.prepare(
              'SELECT announcement_id, updated_at_utc FROM announcements WHERE updated_at_utc > ? AND deleted_at IS NULL ORDER BY updated_at_utc DESC LIMIT 50'
            ).bind(lastAnnouncements || '1970-01-01T00:00:00Z').all();
            
            if (res.results && res.results.length > 0) {
              const maxTs = res.results[0].updated_at_utc as string;
              lastAnnouncements = maxTs;
              send({
                entity: 'announcements',
                action: 'updated',
                ids: res.results.map((r: any) => r.announcement_id),
                timestamp: maxTs
              });
            }
          }

          // Members updates
          if (entities.includes('members')) {
            const res = await env.DB.prepare(
              'SELECT user_id, updated_at_utc FROM users WHERE updated_at_utc > ? AND deleted_at IS NULL ORDER BY updated_at_utc DESC LIMIT 50'
            ).bind(lastMembers || '1970-01-01T00:00:00Z').all();
            
            if (res.results && res.results.length > 0) {
              const maxTs = res.results[0].updated_at_utc as string;
              lastMembers = maxTs;
              send({
                entity: 'members',
                action: 'updated',
                ids: res.results.map((r: any) => r.user_id),
                timestamp: maxTs
              });
            }
          }

          const now = Date.now();
          if (now - lastBeat >= HEARTBEAT_MS) {
            heartbeat();
            lastBeat = now;
          }
        } catch (err) {
          console.error('push loop error', err);
        } finally {
          setTimeout(loop, INTERVAL_MS);
        }
      };

      loop();

      const close = () => {
        clearTimeout(abort);
        controller.close();
      };

      request.signal.addEventListener('abort', close);
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
};
