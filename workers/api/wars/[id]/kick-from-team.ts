/**
 * Guild War - Kick Member from Team (and Event)
 * POST /api/wars/[id]/kick-from-team
 */

import type { Env } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog, successResponse } from '../../../lib/utils';

interface SingleKick {
  userId: string;
  teamId: string;
}

interface BatchKick {
  kicks: SingleKick[];
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

    const kicks: SingleKick[] = [];
    if ('kicks' in body && Array.isArray(body.kicks)) {
      kicks.push(...body.kicks);
    } else if ('userId' in body && 'teamId' in body) {
      kicks.push(body as SingleKick);
    }

    if (kicks.length === 0) throw new Error('No kicks specified');

    // Batch DB operations
    const batch: any[] = [];
    
    // Remove from team_members
    const stmtDeleteTeam = env.DB.prepare('DELETE FROM team_members WHERE team_id = ? AND user_id = ?');
    
    // Also remove from war_member_stats?
    // If they leave the team, do they lose their role stats? 
    // Usually stats are persistent for the War. If they join back, maybe they keep roles?
    // But if "Kick" implies removal, maybe clean up? 
    // Let's keep stats for now (history), just remove from team.
    
    let successCount = 0;
    for (const kick of kicks) {
        batch.push(stmtDeleteTeam.bind(kick.teamId, kick.userId));
        successCount++;
    }

    // Update war timestamp
    batch.push(env.DB.prepare('UPDATE war_history SET updated_at_utc = ? WHERE war_id = ?').bind(now, warId));

    await env.DB.batch(batch);

    await createAuditLog(
      env.DB, 'war', 'kick_from_team_batch', user.user_id, warId,
      `Kicked ${successCount} members from war teams`,
      JSON.stringify({ count: successCount, kicks })
    );

    return successResponse({ message: `Kicked ${successCount} members from teams`, count: successCount });
  }
});
