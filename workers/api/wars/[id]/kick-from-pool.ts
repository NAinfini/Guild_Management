/**
 * Guild War - Kick Member from Pool (and Event)
 * POST /api/wars/[id]/kick-from-pool
 */

import type { Env } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog, successResponse } from '../../../lib/utils';

interface SingleKick {
  userId: string;
}

interface BatchKick {
  userIds: string[];
}

export const onRequestPost = createEndpoint<{ message: string; count: number }, SingleKick | BatchKick>({
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
      userIds.push((body as SingleKick).userId);
    }

    if (userIds.length === 0) throw new Error('No users specified');

    // Batch DB operations
    const batch: any[] = [];
    
    // Remove from team_members where team_id = Pool ID
    const stmtDeleteTeam = env.DB.prepare('DELETE FROM team_members WHERE team_id = ? AND user_id = ?');
    
    const count = userIds.length;
    for (const uid of userIds) {
        batch.push(stmtDeleteTeam.bind(poolTeamId, uid));
    }

    // Update war timestamp
    batch.push(env.DB.prepare('UPDATE war_history SET updated_at_utc = ? WHERE war_id = ?').bind(now, warId));

    await env.DB.batch(batch);

    await createAuditLog(
      env.DB, 'war', 'kick_from_pool_batch', user.user_id, warId,
      `Kicked ${count} members from war pool`,
      JSON.stringify({ count, userIds })
    );

    return successResponse({ message: `Kicked ${count} members from war pool`, count });
  }
});
