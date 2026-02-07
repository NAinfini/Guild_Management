/**
 * Route Registrar
 * Automatically discovers and registers all endpoint handlers
 * Bridges the endpoint registry with the route loader
 */

import { registerRouteHandler, type RouteHandler } from './route-loader';

// Import all endpoint modules
// Auth endpoints
import * as authLogin from '../api/auth/login';
import * as authLogout from '../api/auth/logout';
import * as authSignup from '../api/auth/signup';
import * as authSession from '../api/auth/session';
import * as authCsrf from '../api/auth/csrf';
import * as authChangePassword from '../api/auth/change-password';
import * as authApiKeys from '../api/auth/api-keys';
import * as authApiKeysById from '../api/auth/api-keys/[id]';

// Member endpoints
import * as membersIndex from '../api/members/index';
import * as membersById from '../api/members/[id]';
import * as membersRestore from '../api/members/restore';
import * as membersByIdAction from '../api/members/[id]/[action]';
import * as membersByIdClasses from '../api/members/[id]/classes';
import * as membersByIdAvailability from '../api/members/[id]/availability';
import * as membersByIdNotes from '../api/members/[id]/notes';
import * as membersByIdProgression from '../api/members/[id]/progression';
import * as membersByIdRole from '../api/members/[id]/role';
import * as membersByIdUsername from '../api/members/[id]/username';
import * as membersByIdToggleActive from '../api/members/[id]/toggle-active';
import * as membersByIdResetPassword from '../api/members/[id]/reset-password';
import * as membersByIdMedia from '../api/members/[id]/media';
import * as membersByIdMediaSetAvatar from '../api/members/[id]/media/[mediaId]/set-avatar';
import * as membersByIdMediaReorder from '../api/members/[id]/media/reorder';
import * as membersByIdVideoUrls from '../api/members/[id]/video-urls';
import * as membersByIdVideoUrlsById from '../api/members/[id]/video-urls/[videoId]';

// Event endpoints
import * as eventsIndex from '../api/events/index';
import * as eventsById from '../api/events/[id]';
import * as eventsRestore from '../api/events/restore';
import * as eventsByIdAction from '../api/events/[id]/[action]';
import * as eventsByIdJoin from '../api/events/[id]/join';
import * as eventsByIdLeave from '../api/events/[id]/leave';
import * as eventsByIdKick from '../api/events/[id]/kick';
import * as eventsByIdPin from '../api/events/[id]/pin';
import * as eventsByIdToggleLock from '../api/events/[id]/toggle-lock';
import * as eventsByIdToggleArchive from '../api/events/[id]/toggle-archive';
import * as eventsByIdTogglePin from '../api/events/[id]/toggle-pin';
import * as eventsByIdDuplicate from '../api/events/[id]/duplicate';
import * as eventsByIdParticipants from '../api/events/[id]/participants';
import * as eventsByIdAttachments from '../api/events/[id]/attachments';
import * as eventsByIdAttachmentsMediaId from '../api/events/[id]/attachments/[mediaId]';

// Announcement endpoints
import * as announcementsIndex from '../api/announcements/index';
import * as announcementsById from '../api/announcements/[id]';
import * as announcementsRestore from '../api/announcements/restore';
import * as announcementsByIdPin from '../api/announcements/[id]/pin';
import * as announcementsByIdToggleArchive from '../api/announcements/[id]/toggle-archive';
import * as announcementsByIdMedia from '../api/announcements/[id]/media';
import * as announcementsByIdMediaMediaId from '../api/announcements/[id]/media/[mediaId]';

// War endpoints
import * as warsIndex from '../api/wars/index';
import * as warsById from '../api/wars/[id]';
import * as warsLatest from '../api/wars/latest';
import * as warsHistory from '../api/wars/history';
import * as warsAnalytics from '../api/wars/analytics';
import * as warsHistoryById from '../api/wars/history/[id]';
import * as warsHistoryByIdMemberStats from '../api/wars/history/[id]/member-stats';
import * as warsByIdTeamsIndex from '../api/wars/[id]/teams/index';
import * as warsByIdTeamsById from '../api/wars/[id]/teams/[teamId]';
import * as warsByIdAction from '../api/wars/[id]/[action]';
import * as warsByIdPoolToTeam from '../api/wars/[id]/pool-to-team';
import * as warsByIdTeamToPool from '../api/wars/[id]/team-to-pool';
import * as warsByIdTeamToTeam from '../api/wars/[id]/team-to-team';
import * as warsByIdKickFromTeam from '../api/wars/[id]/kick-from-team';
import * as warsByIdKickFromPool from '../api/wars/[id]/kick-from-pool';

// Gallery endpoints
import * as galleryIndex from '../api/gallery/index';
import * as galleryById from '../api/gallery/[id]';
import * as galleryByIdFeature from '../api/gallery/[id]/feature';
import * as galleryByIdUnfeature from '../api/gallery/[id]/unfeature';

// Upload endpoints
import * as uploadImage from '../api/upload/image';
import * as uploadAudio from '../api/upload/audio';

// Media endpoints
import * as mediaByKey from '../api/media/[key]';
import * as mediaReorder from '../api/media/reorder';
import * as mediaConversions from '../api/media/conversions';
import * as mediaCheckDuplicate from '../api/media/check-duplicate';
import * as mediaByIdConversions from '../api/media/[id]/conversions';
import * as mediaByIdConversionsRetry from '../api/media/[id]/conversions/retry';

// Admin endpoints
import * as adminAuditLogs from '../api/admin/audit-logs';
import * as adminAuditLogsById from '../api/admin/audit-logs/[id]';
import * as adminAuditLogsStats from '../api/admin/audit-logs/stats';
import * as adminAuditLogsEntityById from '../api/admin/audit-logs/entity/[entityId]';

// Health endpoints
import * as healthCheck from '../api/health/[[check]]';

// Poll endpoint
import * as pollIndex from '../api/poll/index';

// Push endpoint
import * as push from '../api/push';

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
  '/auth/api-keys/:id': authApiKeysById,
  '/auth/api-keys': authApiKeys,
  '/auth/login': authLogin,
  '/auth/logout': authLogout,
  '/auth/signup': authSignup,
  '/auth/session': authSession,
  '/auth/csrf': authCsrf,
  '/auth/change-password': authChangePassword,

  // Members (specific routes first, then general)
  '/members/restore': membersRestore,
  '/members/:id/video-urls/:videoId': membersByIdVideoUrlsById,
  '/members/:id/video-urls': membersByIdVideoUrls,
  '/members/:id/media/:mediaId/set-avatar': membersByIdMediaSetAvatar,
  '/members/:id/media/reorder': membersByIdMediaReorder,
  '/members/:id/classes': membersByIdClasses,
  '/members/:id/availability': membersByIdAvailability,
  '/members/:id/notes': membersByIdNotes,
  '/members/:id/progression': membersByIdProgression,
  '/members/:id/role': membersByIdRole,
  '/members/:id/username': membersByIdUsername,
  '/members/:id/toggle-active': membersByIdToggleActive,
  '/members/:id/reset-password': membersByIdResetPassword,
  '/members/:id/media': membersByIdMedia,
  '/members/:id/:action': membersByIdAction,
  '/members/:id': membersById,
  '/members': membersIndex,

  // Events (specific routes first, then general)
  '/events/restore': eventsRestore,
  '/events/:id/join': eventsByIdJoin,
  '/events/:id/leave': eventsByIdLeave,
  '/events/:id/kick': eventsByIdKick,
  '/events/:id/pin': eventsByIdPin, // Keeping for backward compatibility or strict pin? No, refactoring to toggle.
  '/events/:id/toggle-pin': eventsByIdTogglePin,
  '/events/:id/toggle-lock': eventsByIdToggleLock,
  '/events/:id/toggle-archive': eventsByIdToggleArchive,
  '/events/:id/duplicate': eventsByIdDuplicate,
  '/events/:id/participants': eventsByIdParticipants,
  '/events/:id/attachments/:mediaId': eventsByIdAttachmentsMediaId,
  '/events/:id/attachments': eventsByIdAttachments,
  '/events/:id/:action': eventsByIdAction,
  '/events/:id': eventsById,
  '/events': eventsIndex,

  // Announcements (specific routes first, then general)
  '/announcements/restore': announcementsRestore,
  '/announcements/:id/media/:mediaId': announcementsByIdMediaMediaId,
  '/announcements/:id/media': announcementsByIdMedia,
  '/announcements/:id/pin': announcementsByIdPin,
  '/announcements/:id/toggle-archive': announcementsByIdToggleArchive,
  '/announcements/:id': announcementsById,
  '/announcements': announcementsIndex,

  // Wars (specific routes first, then general)
  '/wars/latest': warsLatest,
  '/wars/history': warsHistory,
  '/wars/analytics': warsAnalytics,
  '/wars/history/:id/member-stats': warsHistoryByIdMemberStats,
  '/wars/history/:id': warsHistoryById,
  '/wars/:id/teams/:teamId': warsByIdTeamsById,
  '/wars/:id/teams': warsByIdTeamsIndex,
  '/wars/:id/pool-to-team': warsByIdPoolToTeam,
  '/wars/:id/team-to-pool': warsByIdTeamToPool,
  '/wars/:id/team-to-team': warsByIdTeamToTeam,
  '/wars/:id/kick-from-team': warsByIdKickFromTeam,
  '/wars/:id/kick-from-pool': warsByIdKickFromPool,
  '/wars/:id/:action': warsByIdAction,
  '/wars/:id': warsById,
  '/wars': warsIndex,

  // Gallery
  '/gallery/:id/feature': galleryByIdFeature,
  '/gallery/:id/unfeature': galleryByIdUnfeature,
  '/gallery/:id': galleryById,
  '/gallery': galleryIndex,

  // Upload
  '/upload/image': uploadImage,
  '/upload/audio': uploadAudio,

  // Media
  '/media/check-duplicate': mediaCheckDuplicate,
  '/media/conversions': mediaConversions,
  '/media/:id/conversions/retry': mediaByIdConversionsRetry,
  '/media/:id/conversions': mediaByIdConversions,
  '/media/reorder': mediaReorder,
  '/media/:key': mediaByKey,

  // Admin
  '/admin/audit-logs/stats': adminAuditLogsStats,
  '/admin/audit-logs/entity/:entityId': adminAuditLogsEntityById,
  '/admin/audit-logs/:id': adminAuditLogsById,
  '/admin/audit-logs': adminAuditLogs,

  // Health (optional parameter)
  '/health': healthCheck,
  '/health/:check': healthCheck,

  // Poll
  '/poll': pollIndex,

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
