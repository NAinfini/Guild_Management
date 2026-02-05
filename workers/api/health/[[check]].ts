/**
 * Health Check API
 * GET /api/health - Enhanced health check with service breakdown
 * GET /api/health/d1 - D1 database health check
 * GET /api/health/r2 - R2 storage health check
 *
 * Enhanced with detailed service status and latency monitoring
 */

import type { Env } from '../../lib/types';
import { createEndpoint } from '../../lib/endpoint-factory';
import { utcNow } from '../../lib/utils';

interface ServiceHealth {
  status: 'ok' | 'degraded' | 'down';
  latency_ms?: number;
  error?: string;
}

interface EnhancedHealthResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  services: {
    worker: ServiceHealth;
    d1: ServiceHealth;
    r2: ServiceHealth;
  };
  environment?: {
    project_name: string;
    worker_url?: string;
    d1_binding: string;
    r2_binding: string;
  };
}

/**
 * Check D1 database health
 */
async function checkD1Health(env: Env): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    const result = await env.DB.prepare('SELECT 1 as test').first();
    const latency = Date.now() - start;

    if (result && (result as any).test === 1) {
      return {
        status: 'ok',
        latency_ms: latency,
      };
    }

    return {
      status: 'down',
      latency_ms: latency,
      error: 'Invalid response from D1',
    };
  } catch (e: any) {
    return {
      status: 'down',
      latency_ms: Date.now() - start,
      error: e.message,
    };
  }
}

/**
 * Check R2 storage health
 */
async function checkR2Health(env: Env): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    await env.BUCKET.list({ limit: 1 });
    const latency = Date.now() - start;

    return {
      status: 'ok',
      latency_ms: latency,
    };
  } catch (e: any) {
    return {
      status: 'down',
      latency_ms: Date.now() - start,
      error: e.message,
    };
  }
}

/**
 * GET /api/health - Enhanced health check
 */
export const onRequestGet = createEndpoint<EnhancedHealthResponse | any>({
  auth: 'none',
  cacheControl: 'no-store',

  handler: async ({ env, params }) => {
    const check = params.check;

    // Legacy individual service checks (backward compatibility)
    if (check === 'd1') {
      const d1Health = await checkD1Health(env);
      if (d1Health.status !== 'ok') {
        throw new Error(d1Health.error || 'D1 health check failed');
      }
      return {
        status: 'ok',
        service: 'd1',
        timestamp: utcNow(),
        latency_ms: d1Health.latency_ms,
      };
    }

    if (check === 'r2') {
      const r2Health = await checkR2Health(env);
      if (r2Health.status !== 'ok') {
        throw new Error(r2Health.error || 'R2 health check failed');
      }
      return {
        status: 'ok',
        service: 'r2',
        timestamp: utcNow(),
        latency_ms: r2Health.latency_ms,
      };
    }

    if (check) {
      throw new Error('Invalid health check');
    }

    // Enhanced health check with all services
    const [d1Health, r2Health] = await Promise.all([
      checkD1Health(env),
      checkR2Health(env),
    ]);

    // Determine overall status
    let overallStatus: 'ok' | 'degraded' | 'down' = 'ok';

    if (d1Health.status === 'down' || r2Health.status === 'down') {
      overallStatus = 'down';
    } else if (d1Health.status === 'degraded' || r2Health.status === 'degraded') {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      timestamp: utcNow(),
      services: {
        worker: {
          status: 'ok',
        },
        d1: d1Health,
        r2: r2Health,
      },
      environment: {
        project_name: 'guild-management',
        d1_binding: 'DB',
        r2_binding: 'BUCKET',
      },
    };
  },
});
