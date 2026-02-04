// Local type definitions for Cloudflare Pages environment
interface D1Database {
  prepare(query: string): any;
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const eventId = context.params.id;
  
  try {
    const { userId } = await context.request.json() as { userId: string };

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    await context.env.DB.prepare(
      "DELETE FROM event_participants WHERE event_id = ? AND user_id = ?"
    ).bind(eventId, userId).run();

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response((err as Error).message, { status: 500 });
  }
}