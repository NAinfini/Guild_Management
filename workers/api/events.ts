// Local type definitions for Cloudflare Pages environment
interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: any;
  error?: string;
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  all<T = any>(): Promise<D1Result<T>>;
  first<T = any>(colName?: string): Promise<T | null>;
  run<T = any>(): Promise<D1Result<T>>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface EventContext<Env, P extends string, Data> {
  request: Request;
  functionPath: string;
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
  next(input?: Request | string, init?: RequestInit): Promise<Response>;
  env: Env;
  params: Record<string, string>;
  data: Data;
}

type PagesFunction<
  Env = unknown,
  Params extends string = any,
  Data extends Record<string, unknown> = Record<string, unknown>
> = (context: EventContext<Env, Params, Data>) => Response | Promise<Response>;

interface Env {
  DB: D1Database;
}

import { getMultiQueryParam } from './_utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const ids = getMultiQueryParam(context.request, 'id');
    
    let eventQuery = "SELECT * FROM events WHERE is_archived = 0";
    if (ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      eventQuery += ` AND id IN (${placeholders})`;
    }
    eventQuery += " ORDER BY start_time ASC";

    const stmt = context.env.DB.prepare(eventQuery);
    const { results: events } = await (ids.length > 0 ? stmt.bind(...ids) : stmt).all();

    let participantQuery = "SELECT ep.event_id, m.* FROM event_participants ep JOIN members m ON ep.user_id = m.id";
    if (ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      participantQuery += ` WHERE ep.event_id IN (${placeholders})`;
    }

    const pStmt = context.env.DB.prepare(participantQuery);
    const { results: participants } = await (ids.length > 0 ? pStmt.bind(...ids) : pStmt).all();

    const eventsWithData = events.map((event: any) => {
      const eventParticipants = participants
        .filter((p: any) => p.event_id === event.id)
        .map((p: any) => ({
            ...p,
            classes: p.class ? [p.class] : [],
            active_status: p.status || 'active'
        }));

      return {
        ...event,
        is_locked: !!event.locked,
        is_pinned: !!event.is_pinned,
        is_archived: !!event.is_archived,
        participants: eventParticipants,
        current: eventParticipants.length
      };
    });

    return Response.json(eventsWithData);
  } catch (err) {
    return new Response((err as Error).message, { status: 500 });
  }
}