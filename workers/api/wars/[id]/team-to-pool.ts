/**
 * Guild War - Move Member from Team to Pool
 * POST /api/wars/[id]/team-to-pool
 */

import type { Env } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog, successResponse } from '../../../lib/utils';

interface SingleMove {
  userId: string;
}

interface BatchMove {
  userIds: string[];
}

export const onRequestPost = createEndpoint<{ message: string; count: number }, SingleMove | BatchMove>({
  auth: 'moderator',
  
  handler: async ({ env, user, params, body }) => {
    if (!user) throw new Error('User not authenticated');

    const eventId = params.id;
    const now = utcNow();

    // Get War Details
    const warHistory = await env.DB.prepare('SELECT war_id FROM war_history WHERE event_id = ?').bind(eventId).first<{ war_id: string }>();
    if (!warHistory) throw new Error('War not found');
    const warId = warHistory.war_id;

    // Get Event Type to determine Pool Name
    const event = await env.DB.prepare('SELECT type FROM events WHERE event_id = ?').bind(eventId).first<{ type: string }>();
    if (!event) throw new Error('Event not found');

    const poolName = event.type === 'guild_war' ? 'Pool' : 'Participants';

    // Find the Pool Team ID
    const poolTeam = await env.DB.prepare(`
        SELECT t.team_id 
        FROM teams t
        JOIN event_teams et ON t.team_id = et.team_id
        WHERE et.event_id = ? AND t.name = ?
    `).bind(eventId, poolName).first<{ team_id: string }>();

    if (!poolTeam) throw new Error('Pool team not found for this event');
    const poolTeamId = poolTeam.team_id;

    const userIds: string[] = [];
    if ('userIds' in body && Array.isArray(body.userIds)) {
      userIds.push(...body.userIds);
    } else if ('userId' in body) {
      userIds.push((body as SingleMove).userId);
    }

    if (userIds.length === 0) throw new Error('No users specified');

    // Logic: Move from Current Team -> Pool Team (Update)
    // Update team_id to Pool ID, clear role_tag, reset sort_order
    const stmtMoveToPool = env.DB.prepare(`
        UPDATE team_members 
        SET team_id = ?, sort_order = 0, role_tag = NULL
        WHERE user_id = ? AND team_id IN (SELECT team_id FROM event_teams WHERE event_id = ?)
    `);

    const batch: any[] = [];
    for (const uid of userIds) {
        batch.push(stmtMoveToPool.bind(poolTeamId, uid, eventId));
    }
    
    // Update timestamp
    batch.push(env.DB.prepare('UPDATE war_history SET updated_at_utc = ? WHERE war_id = ?').bind(now, warId));

    await env.DB.batch(batch);

    const count = userIds.length;

    await createAuditLog(
      env.DB, 'war', 'team_to_pool_batch', user.user_id, warId,
      `Moved ${count} members from team to pool`,
      JSON.stringify({ count, userIds })
    );

    return successResponse({ message: `Moved ${count} members to pool`, count });
  }
});
