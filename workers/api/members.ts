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
    
    let query = "SELECT id, username, wechat_name, role, power, class, status, avatar_url, title_html, bio, media_counts, audio_url, vacation_start, vacation_end FROM members";
    
    if (ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      query += ` WHERE id IN (${placeholders})`;
    }
    
    query += " ORDER BY role = 'admin' DESC, role = 'moderator' DESC, power DESC";
    
    const stmt = context.env.DB.prepare(query);
    const { results } = await (ids.length > 0 ? stmt.bind(...ids) : stmt).all();
    
    return Response.json(results);
  } catch (err) {
    console.error('Fetch members error:', err);
    return new Response("Error fetching members", { status: 500 });
  }
}