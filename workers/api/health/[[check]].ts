/**
 * Health Check API
 * GET /api/health
 * GET /api/health/d1
 * GET /api/health/r2
 * 
 * Migrated to use createEndpoint pattern
 */

import type { Env } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow } from '../../../lib/utils';

export const onRequestGet = createEndpoint<any>({
  auth: 'none',
  cacheControl: 'no-store',
  
  handler: async ({ env, params }) => {
    const check = params.check;

    if (!check) {
      return {
        status: 'ok',
        timestamp: utcNow(),
        service: 'guild-management-worker',
      };
    }

    if (check === 'd1') {
      try {
        const result = await env.DB.prepare('SELECT 1 as test').first();
        if (result && (result as any).test === 1) {
          return {
            status: 'ok',
            service: 'd1',
            timestamp: utcNow(),
          };
        }
      } catch (e: any) {
        throw new Error(`D1 health check failed: ${e.message}`);
      }
    }

    if (check === 'r2') {
      try {
        const result = await env.BUCKET.list({ limit: 1 });
        return {
          status: 'ok',
          service: 'r2',
          timestamp: utcNow(),
          objectCount: result.objects.length,
        };
      } catch (e: any) {
        throw new Error(`R2 health check failed: ${e.message}`);
      }
    }

    throw new Error('Invalid health check');
  },
});
