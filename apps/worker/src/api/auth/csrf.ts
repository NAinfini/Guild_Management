/**
 * CSRF token endpoint
 * GET /api/auth/csrf
 */

import { createEndpoint } from '../../core/endpoint-factory';

interface CsrfResponse {
  csrfToken: string | null;
}

export const onRequestGet = createEndpoint<CsrfResponse>({
  auth: 'optional',
  cacheControl: 'no-store',

  handler: async ({ session }) => {
    return {
      csrfToken: session?.csrf_token || null,
    };
  },
});
