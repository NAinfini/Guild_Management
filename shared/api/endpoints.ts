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
  },

  // Members
  members: {
    list: { method: 'GET', path: '/members' },
    get: { method: 'GET', path: '/members/:id' },
    update: { method: 'PUT', path: '/members/:id' },
    updateRole: { method: 'PUT', path: '/members/:id/role' },
    updateClasses: { method: 'PUT', path: '/members/:id/classes' },
    updateAvailability: { method: 'PUT', path: '/members/:id/availability' },
    updateProgression: { method: 'PUT', path: '/members/:id/progression' },
    getProgression: { method: 'GET', path: '/members/:id/progression' },
    getNotes: { method: 'GET', path: '/members/:id/notes' },
    updateNote: { method: 'PUT', path: '/members/:id/notes' },
    deactivate: { method: 'POST', path: '/members/:id/deactivate' },
    activate: { method: 'POST', path: '/members/:id/activate' },
    resetPassword: { method: 'POST', path: '/members/:id/reset-password' },
    batch: { method: 'POST', path: '/members/batch' },
    batchGet: { method: 'GET', path: '/members/batch' },
  },

  // Events
  events: {
    list: { method: 'GET', path: '/events' },
    get: { method: 'GET', path: '/events/:id' },
    create: { method: 'POST', path: '/events' },
    update: { method: 'PUT', path: '/events/:id' },
    delete: { method: 'DELETE', path: '/events/:id' },
    archive: { method: 'POST', path: '/events/:id/archive' },
    restore: { method: 'POST', path: '/events/:id/restore' },
    join: { method: 'POST', path: '/events/:id/join' },
    leave: { method: 'POST', path: '/events/:id/leave' },
    kick: { method: 'POST', path: '/events/:id/kick' },
    toggleLock: { method: 'POST', path: '/events/:id/toggle-lock' },
    batch: { method: 'POST', path: '/events/batch' },
    batchGet: { method: 'GET', path: '/events/batch' },
    restoreBatch: { method: 'POST', path: '/events/restore' },
    pin: { method: 'POST', path: '/events/:id/pin' },
    lock: { method: 'POST', path: '/events/:id/lock' },
  },

  // Announcements
  announcements: {
    list: { method: 'GET', path: '/announcements' },
    get: { method: 'GET', path: '/announcements/:id' },
    create: { method: 'POST', path: '/announcements' },
    update: { method: 'PUT', path: '/announcements/:id' },
    delete: { method: 'DELETE', path: '/announcements/:id' },
    archive: { method: 'POST', path: '/announcements/:id/archive' },
    restore: { method: 'POST', path: '/announcements/:id/restore' },
    togglePin: { method: 'POST', path: '/announcements/:id/toggle-pin' },
    batch: { method: 'POST', path: '/announcements/batch' },
    batchGet: { method: 'GET', path: '/announcements/batch' },
    restoreBatch: { method: 'POST', path: '/announcements/restore' },
  },

  // Guild Wars
  wars: {
    active: { method: 'GET', path: '/wars/active' },
    get: { method: 'GET', path: '/wars/:id' },
    createTeam: { method: 'POST', path: '/wars/:id/teams' },
    updateTeam: { method: 'PUT', path: '/wars/:id/teams/:teamId' },
    deleteTeam: { method: 'DELETE', path: '/wars/:id/teams/:teamId' },
    assign: { method: 'POST', path: '/wars/:id/assign' },
    unassign: { method: 'POST', path: '/wars/:id/unassign' },
    updateResult: { method: 'PUT', path: '/wars/:id/result' },
    reorderTeams: { method: 'POST', path: '/wars/:id/teams/reorder' },
    reorderMembers: { method: 'POST', path: '/wars/:id/teams/:teamId/reorder' },
  },

  // Media
  media: {
    upload: { method: 'POST', path: '/upload' },
    get: { method: 'GET', path: '/media/:id' },
    delete: { method: 'DELETE', path: '/media/:id' },
  },

  // Gallery
  gallery: {
    list: { method: 'GET', path: '/gallery' },
  },

  // Admin
  admin: {
    auditLogs: { method: 'GET', path: '/admin/audit-logs' },
  },

  // Poll
  poll: {
    fetch: { method: 'GET', path: '/poll' },
  },

  // Health
  health: {
    check: { method: 'GET', path: '/health' },
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
