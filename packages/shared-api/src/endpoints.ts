/**
 * Type-Safe Endpoint Definitions
 * Shared between client and worker for full type safety
 */

// ============================================================
// Endpoint Definition Types
// ============================================================

export interface EndpointDef {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
}

export interface EndpointGroup {
  [key: string]: EndpointDef;
}

// ============================================================
// API Endpoint Definitions
// ============================================================

export const ENDPOINTS = {
  // Authentication
  auth: {
    login: { method: 'POST', path: '/auth/login' },
    logout: { method: 'POST', path: '/auth/logout' },
    session: { method: 'GET', path: '/auth/session' },
    csrf: { method: 'GET', path: '/auth/csrf' },
    signup: { method: 'POST', path: '/auth/signup' },
    changePassword: { method: 'POST', path: '/auth/change-password' },
    getPreferences: { method: 'GET', path: '/auth/preferences' },
    updatePreferences: { method: 'PUT', path: '/auth/preferences' },
    listApiKeys: { method: 'GET', path: '/auth/api-keys' },
    createApiKey: { method: 'POST', path: '/auth/api-keys' },
    revokeApiKey: { method: 'DELETE', path: '/auth/api-keys/:id' },
  },

  // Members
  members: {
    list: { method: 'GET', path: '/members' },
    batchUpdate: { method: 'PATCH', path: '/members' },
    restore: { method: 'POST', path: '/members/restore' },
    get: { method: 'GET', path: '/members/:id' },
    update: { method: 'PUT', path: '/members/:id' },
    updateRole: { method: 'PUT', path: '/members/:id/role' },
    updateClasses: { method: 'PUT', path: '/members/:id/classes' },
    updateAvailability: { method: 'PUT', path: '/members/:id/availability' },
    updateProgression: { method: 'PUT', path: '/members/:id/progression' },
    getProgression: { method: 'GET', path: '/members/:id/progression' },
    getNotes: { method: 'GET', path: '/members/:id/notes' },
    updateNote: { method: 'PUT', path: '/members/:id/notes' },
    toggleActive: { method: 'POST', path: '/members/:id/toggle-active' },
    resetPassword: { method: 'POST', path: '/members/:id/reset-password' },
    updateUsername: { method: 'PUT', path: '/members/:id/username' },
    uploadMedia: { method: 'POST', path: '/members/:id/media' },
    deleteMedia: { method: 'DELETE', path: '/members/:id/media/:mediaId' },
    setAvatar: { method: 'POST', path: '/members/:id/media/:mediaId/set-avatar' },
    reorderMedia: { method: 'PUT', path: '/members/:id/media/reorder' },
    listVideoUrls: { method: 'GET', path: '/members/:id/video-urls' },
    addVideoUrl: { method: 'POST', path: '/members/:id/video-urls' },
    updateVideoUrl: { method: 'PUT', path: '/members/:id/video-urls/:videoId' },
    deleteVideoUrl: { method: 'DELETE', path: '/members/:id/video-urls/:videoId' },
    legacyActionPost: { method: 'POST', path: '/members/:id/:action' },
    legacyActionPut: { method: 'PUT', path: '/members/:id/:action' },
  },

  // Events
  events: {
    list: { method: 'GET', path: '/events' },
    create: { method: 'POST', path: '/events' },
    batchDelete: { method: 'DELETE', path: '/events' },
    restore: { method: 'POST', path: '/events/restore' },
    get: { method: 'GET', path: '/events/:id' },
    update: { method: 'PUT', path: '/events/:id' },
    patch: { method: 'PATCH', path: '/events/:id' },
    delete: { method: 'DELETE', path: '/events/:id' },
    toggleArchive: { method: 'POST', path: '/events/:id/toggle-archive' },
    join: { method: 'POST', path: '/events/:id/join' },
    leave: { method: 'POST', path: '/events/:id/leave' },
    kick: { method: 'POST', path: '/events/:id/kick' },
    toggleLock: { method: 'POST', path: '/events/:id/toggle-lock' },
    togglePin: { method: 'POST', path: '/events/:id/toggle-pin' },
    pin: { method: 'POST', path: '/events/:id/pin' },
    duplicate: { method: 'POST', path: '/events/:id/duplicate' },
    addMember: { method: 'POST', path: '/events/:id/participants' },
    attachMedia: { method: 'POST', path: '/events/:id/attachments' },
    reorderAttachments: { method: 'PUT', path: '/events/:id/attachments' },
    removeAttachment: { method: 'DELETE', path: '/events/:id/attachments/:mediaId' },
    legacyAction: { method: 'POST', path: '/events/:id/:action' },
  },

  // Announcements
  announcements: {
    list: { method: 'GET', path: '/announcements' },
    create: { method: 'POST', path: '/announcements' },
    batchDelete: { method: 'DELETE', path: '/announcements' },
    restore: { method: 'POST', path: '/announcements/restore' },
    get: { method: 'GET', path: '/announcements/:id' },
    update: { method: 'PUT', path: '/announcements/:id' },
    patch: { method: 'PATCH', path: '/announcements/:id' },
    delete: { method: 'DELETE', path: '/announcements/:id' },
    toggleArchive: { method: 'POST', path: '/announcements/:id/toggle-archive' },
    togglePin: { method: 'POST', path: '/announcements/:id/pin' },
    attachMedia: { method: 'POST', path: '/announcements/:id/media' },
    reorderMedia: { method: 'PUT', path: '/announcements/:id/media' },
    removeMedia: { method: 'DELETE', path: '/announcements/:id/media/:mediaId' },
  },

  // Guild Wars
  wars: {
    list: { method: 'GET', path: '/wars' },
    create: { method: 'POST', path: '/wars' },
    latest: { method: 'GET', path: '/wars/latest' },
    get: { method: 'GET', path: '/wars/:id' },
    update: { method: 'PUT', path: '/wars/:id' },
    delete: { method: 'DELETE', path: '/wars/:id' },
    getTeams: { method: 'GET', path: '/wars/:id/teams' },
    createTeam: { method: 'POST', path: '/wars/:id/teams' },
    getTeam: { method: 'GET', path: '/wars/:id/teams/:teamId' },
    updateTeam: { method: 'PUT', path: '/wars/:id/teams/:teamId' },
    deleteTeam: { method: 'DELETE', path: '/wars/:id/teams/:teamId' },
    poolToTeam: { method: 'POST', path: '/wars/:id/pool-to-team' },
    teamToPool: { method: 'POST', path: '/wars/:id/team-to-pool' },
    teamToTeam: { method: 'POST', path: '/wars/:id/team-to-team' },
    kickFromTeam: { method: 'POST', path: '/wars/:id/kick-from-team' },
    kickFromPool: { method: 'POST', path: '/wars/:id/kick-from-pool' },
    legacyAction: { method: 'POST', path: '/wars/:id/:action' },
    historyList: { method: 'GET', path: '/wars/history' },
    historyCreate: { method: 'POST', path: '/wars/history' },
    historyGet: { method: 'GET', path: '/wars/history/:id' },
    historyUpdate: { method: 'PUT', path: '/wars/history/:id' },
    historyMemberStats: { method: 'GET', path: '/wars/history/:id/member-stats' },
    historyMemberStatsUpdate: { method: 'PUT', path: '/wars/history/:id/member-stats' },
    analytics: { method: 'GET', path: '/wars/analytics' },
    analyticsFormulaPresets: { method: 'GET', path: '/wars/analytics-formula-presets' },
    createAnalyticsFormulaPreset: { method: 'POST', path: '/wars/analytics-formula-presets' },
    deleteAnalyticsFormulaPreset: { method: 'DELETE', path: '/wars/analytics-formula-presets' },
  },

  // Uploads
  upload: {
    image: { method: 'POST', path: '/upload/image' },
    audio: { method: 'POST', path: '/upload/audio' },
  },

  // Media
  media: {
    get: { method: 'GET', path: '/media/:key' },
    listConversions: { method: 'GET', path: '/media/conversions' },
    retryConversions: { method: 'POST', path: '/media/conversions' },
    getConversions: { method: 'GET', path: '/media/:id/conversions' },
    retryConversion: { method: 'POST', path: '/media/:id/conversions/retry' },
    checkDuplicate: { method: 'GET', path: '/media/check-duplicate' },
    reorder: { method: 'PUT', path: '/media/reorder' },
  },

  // Gallery
  gallery: {
    list: { method: 'GET', path: '/gallery' },
    create: { method: 'POST', path: '/gallery' },
    batchDelete: { method: 'DELETE', path: '/gallery' },
    get: { method: 'GET', path: '/gallery/:id' },
    update: { method: 'PUT', path: '/gallery/:id' },
    delete: { method: 'DELETE', path: '/gallery/:id' },
    feature: { method: 'POST', path: '/gallery/:id/feature' },
    unfeature: { method: 'POST', path: '/gallery/:id/unfeature' },
  },

  // Admin
  admin: {
    listAuditLogs: { method: 'GET', path: '/admin/audit-logs' },
    addAuditLog: { method: 'POST', path: '/admin/audit-logs' },
    deleteAuditLog: { method: 'DELETE', path: '/admin/audit-logs/:id' },
    getAuditStats: { method: 'GET', path: '/admin/audit-logs/stats' },
    getEntityHistory: { method: 'GET', path: '/admin/audit-logs/entity/:entityId' },
  },

  // Poll
  poll: {
    fetch: { method: 'GET', path: '/poll' },
  },

  // Push (SSE)
  push: {
    connect: { method: 'GET', path: '/push' },
  },

  // Health
  health: {
    check: { method: 'GET', path: '/health' },
    checkService: { method: 'GET', path: '/health/:check' },
  },
} as const;

// ============================================================
// Type Helpers
// ============================================================

/**
 * Extract all endpoint paths
 */
export type EndpointPath = typeof ENDPOINTS[keyof typeof ENDPOINTS][keyof typeof ENDPOINTS[keyof typeof ENDPOINTS]]['path'];

/**
 * Extract all HTTP methods
 */
export type HttpMethod = typeof ENDPOINTS[keyof typeof ENDPOINTS][keyof typeof ENDPOINTS[keyof typeof ENDPOINTS]]['method'];

/**
 * Helper to build path with parameters
 */
export function buildPath(path: string, params?: Record<string, string | number>): string {
  if (!params) return path;
  
  let result = path;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, String(value));
  }
  
  return result;
}

/**
 * Helper to extract path parameters
 */
export function extractPathParams(path: string): string[] {
  const matches = path.match(/:(\w+)/g);
  return matches ? matches.map(m => m.substring(1)) : [];
}
