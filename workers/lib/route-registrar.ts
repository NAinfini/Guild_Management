/**
 * Route Registrar
 * Automatically discovers and registers all endpoint handlers
 * Bridges the endpoint registry with the route loader
 */

import { registerRouteHandler, type RouteHandler } from './route-loader';

// Import all endpoint modules
// Auth endpoints
import * as authLogin from './auth/login';
import * as authLogout from './auth/logout';
import * as authSignup from './auth/signup';
import * as authSession from './auth/session';
import * as authChangePassword from './auth/change-password';

// Member endpoints
import * as membersIndex from './members/index';
import * as membersById from './members/[id]';
import * as membersRestore from './members/restore';
import * as membersByIdAction from './members/[id]/[action]';
import * as membersByIdClasses from './members/[id]/classes';
import * as membersByIdAvailability from './members/[id]/availability';
import * as membersByIdNotes from './members/[id]/notes';
import * as membersByIdProgression from './members/[id]/progression';
import * as membersByIdRole from './members/[id]/role';
import * as membersByIdUsername from './members/[id]/username';
import * as membersByIdDeactivate from './members/[id]/deactivate';
import * as membersByIdActivate from './members/[id]/activate';
import * as membersByIdResetPassword from './members/[id]/reset-password';

// Event endpoints
import * as eventsIndex from './events/index';
import * as eventsById from './events/[id]';
import * as eventsRestore from './events/restore';
import * as eventsByIdAction from './events/[id]/[action]';
import * as eventsByIdJoin from './events/[id]/join';
import * as eventsByIdLeave from './events/[id]/leave';
import * as eventsByIdPin from './events/[id]/pin';
import * as eventsByIdLock from './events/[id]/lock';
import * as eventsByIdDuplicate from './events/[id]/duplicate';

// Announcement endpoints
import * as announcementsIndex from './announcements/index';
import * as announcementsById from './announcements/[id]';
import * as announcementsRestore from './announcements/restore';
import * as announcementsByIdPin from './announcements/[id]/pin';

// War endpoints
import * as warsIndex from './wars/index';
import * as warsById from './wars/[id]';
import * as warsActive from './wars/active';
import * as warsHistory from './wars/history';
import * as warsAnalytics from './wars/analytics';
import * as warsHistoryById from './wars/history/[id]';
import * as warsHistoryByIdMemberStats from './wars/history/[id]/member-stats';
import * as warsByIdTeamsIndex from './wars/[id]/teams/index';
import * as warsByIdTeamsById from './wars/[id]/teams/[teamId]';
import * as warsByIdAction from './wars/[id]/[action]';
import * as warsByIdAssign from './wars/[id]/assign';
import * as warsByIdUnassign from './wars/[id]/unassign';

// Gallery endpoints
import * as galleryIndex from './gallery/index';
import * as galleryById from './gallery/[id]';

// Upload endpoints
import * as uploadImage from './upload/image';
import * as uploadAudio from './upload/audio';

// Media endpoints
import * as mediaByKey from './media/[key]';
import * as mediaReorder from './media/reorder';

// Admin endpoints
import * as adminAuditLogs from './admin/audit-logs';

// Health endpoints
import * as healthCheck from './health/[[check]]';

// Poll endpoint
import * as poll from './poll';
import * as pollIndex from './poll/index';

// Push endpoint
import * as push from './push';

// ============================================================
// Route Registration Map
// ============================================================

/**
 * Map of path patterns to their handler modules
 * This is the only place that needs to be updated when adding new endpoints
 *
 * NOTE: Batch operations are now handled natively by main endpoints:
 * - GET /members?ids=id1,id2,id3 - Batch fetch members by IDs
 * - GET /events?ids=id1,id2,id3 - Batch fetch events by IDs
 * - GET /announcements?ids=id1,id2,id3 - Batch fetch announcements by IDs
 * - GET /wars?ids=id1,id2,id3 - Batch fetch wars by IDs
 * - DELETE /events?action=delete&eventIds=id1,id2 - Batch delete/archive
 * - DELETE /announcements?action=delete&announcementIds=id1,id2 - Batch delete/archive
 */
const ROUTE_MAP: Record<string, RouteHandler> = {
  // Auth
  '/auth/login': authLogin,
  '/auth/logout': authLogout,
  '/auth/signup': authSignup,
  '/auth/session': authSession,
  '/auth/change-password': authChangePassword,

  // Members (specific routes first, then general)
  '/members/restore': membersRestore,
  '/members/:id/classes': membersByIdClasses,
  '/members/:id/availability': membersByIdAvailability,
  '/members/:id/notes': membersByIdNotes,
  '/members/:id/progression': membersByIdProgression,
  '/members/:id/role': membersByIdRole,
  '/members/:id/username': membersByIdUsername,
  '/members/:id/deactivate': membersByIdDeactivate,
  '/members/:id/activate': membersByIdActivate,
  '/members/:id/reset-password': membersByIdResetPassword,
  '/members/:id/:action': membersByIdAction,
  '/members/:id': membersById,
  '/members': membersIndex,

  // Events (specific routes first, then general)
  '/events/restore': eventsRestore,
  '/events/:id/join': eventsByIdJoin,
  '/events/:id/leave': eventsByIdLeave,
  '/events/:id/pin': eventsByIdPin,
  '/events/:id/lock': eventsByIdLock,
  '/events/:id/duplicate': eventsByIdDuplicate,
  '/events/:id/:action': eventsByIdAction,
  '/events/:id': eventsById,
  '/events': eventsIndex,

  // Announcements (specific routes first, then general)
  '/announcements/restore': announcementsRestore,
  '/announcements/:id/pin': announcementsByIdPin,
  '/announcements/:id': announcementsById,
  '/announcements': announcementsIndex,

  // Wars (specific routes first, then general)
  '/wars/active': warsActive,
  '/wars/history': warsHistory,
  '/wars/analytics': warsAnalytics,
  '/wars/history/:id/member-stats': warsHistoryByIdMemberStats,
  '/wars/history/:id': warsHistoryById,
  '/wars/:id/teams/:teamId': warsByIdTeamsById,
  '/wars/:id/teams': warsByIdTeamsIndex,
  '/wars/:id/assign': warsByIdAssign,
  '/wars/:id/unassign': warsByIdUnassign,
  '/wars/:id/:action': warsByIdAction,
  '/wars/:id': warsById,
  '/wars': warsIndex,

  // Gallery
  '/gallery/:id': galleryById,
  '/gallery': galleryIndex,

  // Upload
  '/upload/image': uploadImage,
  '/upload/audio': uploadAudio,

  // Media
  '/media/reorder': mediaReorder,
  '/media/:key': mediaByKey,

  // Admin
  '/admin/audit-logs': adminAuditLogs,

  // Health (optional parameter)
  '/health': healthCheck,
  '/health/:check': healthCheck,

  // Poll
  '/poll': pollIndex.onRequestGet ? pollIndex : poll,

  // Push
  '/push': push,
};

// ============================================================
// Auto-Registration
// ============================================================

/**
 * Initialize the route registrar
 * Registers all routes from ROUTE_MAP
 */
export function initializeRouteRegistrar(): void {
  console.log('[RouteRegistrar] Initializing route registration...');

  let registeredCount = 0;
  let skippedCount = 0;

  for (const [path, handler] of Object.entries(ROUTE_MAP)) {
    // Check if handler has at least one HTTP method
    const hasMethod =
      handler.onRequestGet ||
      handler.onRequestPost ||
      handler.onRequestPut ||
      handler.onRequestPatch ||
      handler.onRequestDelete;

    if (hasMethod) {
      registerRouteHandler(path, handler);
      registeredCount++;
    } else {
      console.warn(`[RouteRegistrar] Skipping ${path}: no HTTP methods found`);
      skippedCount++;
    }
  }

  console.log('[RouteRegistrar] Registration complete:', {
    registered: registeredCount,
    skipped: skippedCount,
    total: Object.keys(ROUTE_MAP).length,
  });
}

/**
 * Auto-initialize when this module is imported
 */
if (typeof globalThis !== 'undefined' && !(globalThis as any).__routeRegistrarInitialized__) {
  initializeRouteRegistrar();
  (globalThis as any).__routeRegistrarInitialized__ = true;
}

