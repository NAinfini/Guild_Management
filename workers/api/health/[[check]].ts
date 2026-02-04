/**
 * Health Check API
 * GET /api/health - Worker health
 * GET /api/health/d1 - D1 database health
 * GET /api/health/r2 - R2 bucket health
 */

import type { PagesFunction, Env } from '../_types';
import { successResponse, errorResponse } from '../_utils';

// ============================================================
// GET /api/health - Worker Health
// ============================================================

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { params } = context;
  const check = params.check;

  if (!check) {
    return checkWorker();
  } else if (check === 'd1') {
    return checkD1(context);
  } else if (check === 'r2') {
    return checkR2(context);
  }

  return errorResponse('INVALID_CHECK', 'Invalid health check', 400);
};

function checkWorker(): Response {
  return successResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'guild-management-worker',
  });
}

async function checkD1(context: any): Promise<Response> {
  try {
    const result = await context.env.DB.prepare('SELECT 1 as test').first<{ test: number }>();

    if (result && result.test === 1) {
      return successResponse({
        status: 'ok',
        service: 'd1',
        timestamp: new Date().toISOString(),
      });
    }

    return errorResponse('D1_ERROR', 'D1 health check failed', 500);
  } catch (error) {
    console.error('D1 health check error:', error);
    return errorResponse('D1_ERROR', 'D1 health check failed', 500);
  }
}

async function checkR2(context: any): Promise<Response> {
  try {
    const result = await context.env.BUCKET.list({ limit: 1 });

    return successResponse({
      status: 'ok',
      service: 'r2',
      timestamp: new Date().toISOString(),
      objectCount: result.objects.length,
    });
  } catch (error) {
    console.error('R2 health check error:', error);
    return errorResponse('R2_ERROR', 'R2 health check failed', 500);
  }
}
