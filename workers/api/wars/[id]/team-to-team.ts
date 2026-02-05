/**
 * Guild War - Move Member from Team to Team
 * POST /api/wars/[id]/team-to-team
 */

import type { Env } from '../../../lib/types';
import { createEndpoint } from '../../../lib/endpoint-factory';
import { utcNow, createAuditLog, successResponse } from '../../../lib/utils';

interface SingleMove {
  userId: string;
  sourceTeamId: string;
  targetTeamId: string;
}

interface BatchMove {
  moves: SingleMove[];
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

    const moves: SingleMove[] = [];
    if ('moves' in body && Array.isArray(body.moves)) {
      moves.push(...body.moves);
    } else if ('userId' in body) {
      moves.push(body as SingleMove);
    }

    if (moves.length === 0) throw new Error('No moves specified');

    // Get all Team IDs linked to this Event for validation
    const { results: eventTeams } = await env.DB.prepare('SELECT team_id FROM event_teams WHERE event_id = ?').bind(eventId).all<{ team_id: string }>();
    const validTeamIds = new Set(eventTeams.map(et => et.team_id));

    // Validate target teams exist in event
    const targetTeamIds = [...new Set(moves.map(m => m.targetTeamId))];
    for (const tid of targetTeamIds) {
        if (!validTeamIds.has(tid)) throw new Error(`Target team ${tid} is not part of this event`);
    }

    // Prepare sort orders
    const sortOrders = new Map<string, number>();
    for (const tid of targetTeamIds) {
        const max = await env.DB.prepare('SELECT MAX(sort_order) as max_sort FROM team_members WHERE team_id = ?').bind(tid).first<{ max_sort: number }>();
        sortOrders.set(tid, max?.max_sort || 0);
    }

    // Logic: Move from Old Team -> New Team (Update)
    // We update the team_id. We PRESERVE role_tag by not setting it (it stays as is).
    // Note: This relies on the fact that role_tag is in that row.
    const stmtMoveMember = env.DB.prepare(`
        UPDATE team_members 
        SET team_id = ?, sort_order = ?
        WHERE user_id = ? AND team_id = ?
    `);

    const batch: any[] = [];
    let successCount = 0;
    
    for (const move of moves) {
        const currentSort = sortOrders.get(move.targetTeamId)! + 1;
        sortOrders.set(move.targetTeamId, currentSort);
        
        // Update team membership (changing team_id effectively moves them)
        batch.push(stmtMoveMember.bind(move.targetTeamId, currentSort, move.userId, move.sourceTeamId));
        
        successCount++;
    }

    batch.push(env.DB.prepare('UPDATE war_history SET updated_at_utc = ? WHERE war_id = ?').bind(now, warId));

    await env.DB.batch(batch);

    await createAuditLog(
      env.DB, 'war', 'team_to_team_batch', user.user_id, warId,
      `Moved ${successCount} members between teams`,
      JSON.stringify({ count: successCount })
    );

    return successResponse({ message: `Moved ${successCount} members between teams`, count: successCount });
  }
});
