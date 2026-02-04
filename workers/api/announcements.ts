
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
    
    let query = "SELECT * FROM announcements";
    if (ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      query += ` WHERE announcement_id IN (${placeholders})`;
    }
    query += " ORDER BY is_pinned DESC, created_at DESC";
    
    const stmt = context.env.DB.prepare(query);
    const { results } = await (ids.length > 0 ? stmt.bind(...ids) : stmt).all();
    
    const transformed = results.map((a: any) => ({
        ...a,
        is_pinned: !!a.is_pinned,
        is_archived: !!a.is_archived,
        media_urls: JSON.parse(a.media_urls || '[]')
    }));

    return Response.json(transformed);
  } catch (err) {
    return new Response("Error fetching announcements", { status: 500 });
  }
}
