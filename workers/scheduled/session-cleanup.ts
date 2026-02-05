
import type { Env } from '../lib/types';

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log('[Cron] Starting session cleanup...');

    try {
      const result = await env.DB.prepare(`
        DELETE FROM sessions 
        WHERE expires_at_utc < datetime('now') 
           OR revoked_at_utc < datetime('now', '-7 days')
      `).run();

      console.log(`[Cron] Session cleanup complete. Deleted ${result.meta.rows_written} expired/revoked sessions.`);
    } catch (error) {
      console.error('[Cron] Session cleanup failed:', error);
    }
  },
};
