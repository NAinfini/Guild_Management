/**
 * Audit Log Cleanup Cron Job
 * Runs daily at 2 AM UTC to delete audit logs older than 30 days
 */

import type { Env } from '../core/types';

export async function cleanupAuditLogs(env: Env): Promise<{ deleted: number }> {
  // Delete audit logs older than 30 days
  const result = await env.DB.prepare(
    `DELETE FROM audit_log
     WHERE created_at_utc < datetime('now', '-30 days')`
  ).run();

  const deleted = result.meta?.changes || 0;

  console.log(`[AuditLogCleanup] Deleted ${deleted} audit log entries older than 30 days`);

  return { deleted };
}
