/**
 * WebSocket Connection Endpoint
 * Handles WebSocket upgrade requests and delegates to Durable Object
 */

export const onRequest: PagesFunction = async (context) => {
  const { request, env, data } = context;
  const { session, user } = data as { session?: any; user?: any };

  // Require authentication for WebSocket connections
  if (!session || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Get or create Durable Object instance
    // Use a single instance for the entire guild
    const id = (env as any).CONNECTIONS.idFromName('guild-main');
    const stub = (env as any).CONNECTIONS.get(id);

    // Add user ID to URL for identification
    const url = new URL(request.url);
    url.searchParams.set('userId', user.id);

    // Forward request to Durable Object
    const newRequest = new Request(url.toString(), request);
    return await stub.fetch(newRequest);
  } catch (error) {
    console.error('[WebSocket] Connection error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
