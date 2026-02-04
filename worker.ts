/**
 * Cloudflare Worker - Main Entry Point
 * Handles API routes from workers/api/ and serves static assets
 */

import type { Env } from './workers/api/_types';
import { corsHeaders } from './workers/_utils';

// Auth endpoints
import * as authLogin from './workers/api/auth/login';
import * as authLogout from './workers/api/auth/logout';
import * as authSignup from './workers/api/auth/signup';
import * as authSession from './workers/api/auth/session';
import * as authChangePassword from './workers/api/auth/change-password';

// Member endpoints
import * as members from './workers/api/members';
import * as membersIndex from './workers/api/members/index';
import * as membersBatch from './workers/api/members/batch';

// Event endpoints
import * as events from './workers/api/events';
import * as eventsIndex from './workers/api/events/index';
import * as eventsList from './workers/api/events/list';
import * as eventsBatch from './workers/api/events/batch';

// Announcement endpoints
import * as announcementsIndex from './workers/api/announcements/index';
import * as announcementsBatch from './workers/api/announcements/batch';

// War endpoints
import * as warsActive from './workers/api/wars/active';
import * as warsHistory from './workers/api/wars/history';
import * as warsHistoryDetail from './workers/api/wars/history/[id]';
import * as warsMemberStats from './workers/api/wars/history/[id]/member-stats';
import * as warsTeamsGet from './workers/api/wars/[id]/teams/index';
import * as warsTeamActions from './workers/api/wars/[id]/teams/[teamId]';
import * as warsAssignActions from './workers/api/wars/[id]/[action]';
import * as warsAnalytics from './workers/api/wars/analytics';

// Gallery endpoints
import * as galleryIndex from './workers/api/gallery/index';
import * as galleryById from './workers/api/gallery/[id]';

// Upload endpoints
import * as upload from './workers/api/upload';
import * as uploadImage from './workers/api/upload/image';
import * as uploadAudio from './workers/api/upload/audio';

// Media endpoints
import * as mediaReorder from './workers/api/media/reorder';

// Admin endpoints
import * as adminAuditLogs from './workers/api/admin/audit-logs';

// Health endpoints
import * as healthCheck from './workers/api/health/[[check]]';

// Poll endpoint
import * as poll from './workers/api/poll';
import * as push from './workers/api/push';

// Dynamic route handlers that require IDs
import * as eventsById from './workers/api/events/[id]';
import * as eventsByIdAction from './workers/api/events/[id]/[action]';
import * as eventsByIdJoin from './workers/api/events/[id]/join';
import * as eventsByIdLeave from './workers/api/events/[id]/leave';

import * as announcementsById from './workers/api/announcements/[id]';

import * as membersById from './workers/api/members/[id]';
import * as membersByIdAction from './workers/api/members/[id]/[action]';
import * as membersByIdClasses from './workers/api/members/[id]/classes';
import * as membersByIdAvailability from './workers/api/members/[id]/availability';
import * as membersByIdNotes from './workers/api/members/[id]/notes';
import * as membersByIdProgression from './workers/api/members/[id]/progression';

import * as warsByIdAction from './workers/api/wars/[id]/[action]';
import * as warsByIdTeams from './workers/api/wars/[id]/teams/[teamId]';

import * as warsHistoryById from './workers/api/wars/history/[id]';
import * as warsHistoryByIdMemberStats from './workers/api/wars/history/[id]/member-stats';

import * as mediaByKey from './workers/api/media/[key]';

type RouteHandler = {
  onRequestGet?: any;
  onRequestPost?: any;
  onRequestPut?: any;
  onRequestPatch?: any;
  onRequestDelete?: any;
};

interface RouteMatch {
  handler: RouteHandler;
  params: Record<string, string>;
}

function matchRoute(pathname: string): RouteMatch | null {
  // Static routes - exact matches first
  const staticRoutes: Record<string, RouteHandler> = {
    '/api/auth/login': authLogin,
    '/api/auth/logout': authLogout,
    '/api/auth/signup': authSignup,
    '/api/auth/session': authSession,
    '/api/auth/change-password': authChangePassword,
    '/api/members': membersIndex,
    '/api/members/batch': membersBatch,
    '/api/events': eventsIndex,
    '/api/events/list': eventsList,
    '/api/events/batch': eventsBatch,
    '/api/announcements': announcementsIndex,
    '/api/announcements/batch': announcementsBatch,
  '/api/wars/active': warsActive,
  '/api/wars/history': warsHistory,
  '/api/wars/history/:id': warsHistoryDetail,
  '/api/wars/history/:id/member-stats': warsMemberStats,
  '/api/wars/:id/teams': warsTeamsGet,
  '/api/wars/:id/teams/:teamId': warsTeamActions,
  '/api/wars/:id/:action': warsAssignActions,
  '/api/wars/analytics': warsAnalytics,
    '/api/upload': upload,
    '/api/upload/image': uploadImage,
    '/api/upload/audio': uploadAudio,
    '/api/media/reorder': mediaReorder,
    '/api/gallery': galleryIndex,
    '/api/admin/audit-logs': adminAuditLogs,
    '/api/poll': poll,
    '/api/push': push,
  };

  // Check static routes first
  if (staticRoutes[pathname]) {
    return { handler: staticRoutes[pathname], params: {} };
  }

  // Health check - optional parameter
  const healthMatch = pathname.match(/^\/api\/health(?:\/(.+))?$/);
  if (healthMatch) {
    return {
      handler: healthCheck,
      params: { check: healthMatch[1] || '' },
    };
  }

  // Dynamic routes with parameters
  // Events
  const eventsJoinMatch = pathname.match(/^\/api\/events\/([^/]+)\/join$/);
  if (eventsJoinMatch) {
    return {
      handler: eventsByIdJoin,
      params: { id: eventsJoinMatch[1] },
    };
  }

  const eventsLeaveMatch = pathname.match(/^\/api\/events\/([^/]+)\/leave$/);
  if (eventsLeaveMatch) {
    return {
      handler: eventsByIdLeave,
      params: { id: eventsLeaveMatch[1] },
    };
  }

  const eventsActionMatch = pathname.match(/^\/api\/events\/([^/]+)\/([^/]+)$/);
  if (eventsActionMatch) {
    return {
      handler: eventsByIdAction,
      params: { id: eventsActionMatch[1], action: eventsActionMatch[2] },
    };
  }

  const eventsByIdMatch = pathname.match(/^\/api\/events\/([^/]+)$/);
  if (eventsByIdMatch) {
    return {
      handler: eventsById,
      params: { id: eventsByIdMatch[1] },
    };
  }

  // Announcements
  const announcementsActionMatch = pathname.match(/^\/api\/announcements\/([^/]+)\/([^/]+)$/);
  if (announcementsActionMatch) {
    return {
      handler: announcementsById,
      params: { id: announcementsActionMatch[1], action: announcementsActionMatch[2] },
    };
  }

  const announcementsByIdMatch = pathname.match(/^\/api\/announcements\/([^/]+)$/);
  if (announcementsByIdMatch) {
    return {
      handler: announcementsById,
      params: { id: announcementsByIdMatch[1] },
    };
  }

  // Members
  const membersClassesMatch = pathname.match(/^\/api\/members\/([^/]+)\/classes$/);
  if (membersClassesMatch) {
    return {
      handler: membersByIdClasses,
      params: { id: membersClassesMatch[1] },
    };
  }

  const membersAvailabilityMatch = pathname.match(/^\/api\/members\/([^/]+)\/availability$/);
  if (membersAvailabilityMatch) {
    return {
      handler: membersByIdAvailability,
      params: { id: membersAvailabilityMatch[1] },
    };
  }

  const membersNotesMatch = pathname.match(/^\/api\/members\/([^/]+)\/notes$/);
  if (membersNotesMatch) {
    return {
      handler: membersByIdNotes,
      params: { id: membersNotesMatch[1] },
    };
  }

  const membersProgressionMatch = pathname.match(/^\/api\/members\/([^/]+)\/progression$/);
  if (membersProgressionMatch) {
    return {
      handler: membersByIdProgression,
      params: { id: membersProgressionMatch[1] },
    };
  }

  const membersActionMatch = pathname.match(/^\/api\/members\/([^/]+)\/([^/]+)$/);
  if (membersActionMatch) {
    return {
      handler: membersByIdAction,
      params: { id: membersActionMatch[1], action: membersActionMatch[2] },
    };
  }

  const membersByIdMatch = pathname.match(/^\/api\/members\/([^/]+)$/);
  if (membersByIdMatch) {
    return {
      handler: membersById,
      params: { id: membersByIdMatch[1] },
    };
  }

  // Wars
  const warsTeamsMatch = pathname.match(/^\/api\/wars\/([^/]+)\/teams\/([^/]+)$/);
  if (warsTeamsMatch) {
    return {
      handler: warsByIdTeams,
      params: { id: warsTeamsMatch[1], teamId: warsTeamsMatch[2] },
    };
  }

  const warsHistoryMemberStatsMatch = pathname.match(/^\/api\/wars\/history\/([^/]+)\/member-stats$/);
  if (warsHistoryMemberStatsMatch) {
    return {
      handler: warsHistoryByIdMemberStats,
      params: { id: warsHistoryMemberStatsMatch[1] },
    };
  }

  const warsHistoryByIdMatch = pathname.match(/^\/api\/wars\/history\/([^/]+)$/);
  if (warsHistoryByIdMatch) {
    return {
      handler: warsHistoryById,
      params: { id: warsHistoryByIdMatch[1] },
    };
  }

  const warsActionMatch = pathname.match(/^\/api\/wars\/([^/]+)\/([^/]+)$/);
  if (warsActionMatch) {
    return {
      handler: warsByIdAction,
      params: { id: warsActionMatch[1], action: warsActionMatch[2] },
    };
  }

  // Gallery
  const galleryByIdMatch = pathname.match(/^\/api\/gallery\/([^/]+)$/);
  if (galleryByIdMatch) {
    return {
      handler: galleryById,
      params: { id: galleryByIdMatch[1] },
    };
  }

  // Media
  const mediaByKeyMatch = pathname.match(/^\/api\/media\/([^/]+)$/);
  if (mediaByKeyMatch) {
    return {
      handler: mediaByKey,
      params: { key: mediaByKeyMatch[1] },
    };
  }

  return null;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      const origin = request.headers.get('Origin');
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    // Handle API routes
    if (pathname.startsWith('/api/')) {
      const routeMatch = matchRoute(pathname);

      if (!routeMatch) {
        return new Response(
          JSON.stringify({
            error: 'NOT_FOUND',
            message: 'API endpoint not found',
            path: pathname,
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const { handler, params } = routeMatch;
      const method = request.method.toUpperCase();

      // Map HTTP methods to handler functions
      let handlerFn;
      switch (method) {
        case 'GET':
          handlerFn = handler.onRequestGet;
          break;
        case 'POST':
          handlerFn = handler.onRequestPost;
          break;
        case 'PUT':
          handlerFn = handler.onRequestPut;
          break;
        case 'PATCH':
          handlerFn = handler.onRequestPatch;
          break;
        case 'DELETE':
          handlerFn = handler.onRequestDelete;
          break;
      }

      if (!handlerFn) {
        return new Response(
          JSON.stringify({
            error: 'METHOD_NOT_ALLOWED',
            message: `Method ${method} not allowed for this endpoint`,
          }),
          {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Create context object matching Pages Functions signature
      const context = {
        request,
        env,
        params,
        waitUntil: ctx.waitUntil.bind(ctx),
        passThroughOnException: () => {},
        next: async () => new Response(null, { status: 404 }),
        functionPath: pathname,
        data: {},
      };

      try {
        const origin = request.headers.get('Origin');
        const rawResponse = await handlerFn(context);
        const response = new Response(rawResponse.body, rawResponse);
        const cors = corsHeaders(origin);
        Object.entries(cors).forEach(([k, v]) => response.headers.set(k, v));
        return response;
      } catch (error) {
        console.error('API handler error:', error);
        const origin = request.headers.get('Origin');
        return new Response(
          JSON.stringify({
            error: 'INTERNAL_ERROR',
            message: 'An internal error occurred',
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders(origin),
            },
          }
        );
      }
    }

    // For non-API routes, serve static assets
    // The "single-page-application" mode in wrangler.toml automatically
    // serves index.html for non-asset routes, so we just pass through
    return env.ASSETS.fetch(request);
  },
};
