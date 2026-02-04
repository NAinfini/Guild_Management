import type { PagesFunction, Env } from '../../_types';
import { errorResponse, successResponse, unauthorizedResponse } from '../../_utils';
import { withAuth } from '../../_middleware';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  return withAuth(context, async (authContext) => {
    const { env, params } = authContext;
    const { user } = authContext.data;

    if (!user) {
      return unauthorizedResponse();
    }

    const eventId = params.id;

    try {
      // Logic: User leaves the event. 
      // Admin/Mod kicking capability could be here, but "leave" usually means self.
      // If the body provided a userId, an Admin *could* arguably kick them.
      // But let's restrict to self-leave for safety first.
      
      const targetUserId = user.user_id;

      await env.DB.prepare(
        "DELETE FROM event_participants WHERE event_id = ? AND user_id = ?"
      ).bind(eventId, targetUserId).run();

      // Update event timestamp for cache invalidation
      await env.DB.prepare(
        "UPDATE events SET updated_at_utc = datetime('now') WHERE event_id = ?"
      ).bind(eventId).run();

      return successResponse({ message: 'Left event successfully' });

    } catch (err) {
      console.error('Leave event error:', err);
      return errorResponse('INTERNAL_ERROR', 'An error occurred while leaving event', 500);
    }
  });
};