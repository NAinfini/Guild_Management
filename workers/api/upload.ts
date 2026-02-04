// Local type definitions for Cloudflare Pages environment
interface R2Bucket {
  put(key: string, value: any, options?: any): Promise<any>;
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
  BUCKET: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const formData = await context.request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response("No file provided", { status: 400 });
    }

    const key = `${crypto.randomUUID()}-${file.name}`;
    await context.env.BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });

    // We return a URL that we will handle via a /api/media proxy endpoint
    return Response.json({ 
      url: `/api/media/${key}`,
      key: key
    });
  } catch (err) {
    return new Response("Upload failed: " + (err as Error).message, { status: 500 });
  }
};