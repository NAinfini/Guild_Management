/**
 * Canonical D1 schema contract for handler SQL construction.
 * Keep table and column names centralized to avoid drift.
 */

export const DB_TABLES = {
  users: 'users',
  userAuthPassword: 'user_auth_password',
  sessions: 'sessions',
  apiKeys: 'api_keys',
  userPreferences: 'user_preferences',
  memberProfiles: 'member_profiles',
  memberClasses: 'member_classes',
  memberMedia: 'member_media',
  memberProgression: 'member_progression',
  memberQishu: 'member_qishu',
  memberXinfa: 'member_xinfa',
  memberWuxue: 'member_wuxue',
  memberNotes: 'member_notes',
  memberAvailabilityBlocks: 'member_availability_blocks',
  mediaObjects: 'media_objects',
  mediaConversions: 'media_conversions',
  galleryImages: 'gallery_images',
  announcements: 'announcements',
  announcementMedia: 'announcement_media',
  events: 'events',
  eventTeams: 'event_teams',
  eventAttachments: 'event_attachments',
  teams: 'teams',
  teamMembers: 'team_members',
  warHistory: 'war_history',
  warMemberStats: 'war_member_stats',
  auditLog: 'audit_log',
} as const;

export const EVENT_COLUMNS = {
  id: 'event_id',
  type: 'type',
  title: 'title',
  description: 'description',
  startAt: 'start_at_utc',
  endAt: 'end_at_utc',
  capacity: 'capacity',
  isPinned: 'is_pinned',
  isArchived: 'is_archived',
  signupLocked: 'signup_locked',
  deletedAt: 'deleted_at_utc',
  createdBy: 'created_by',
  updatedBy: 'updated_by',
  createdAt: 'created_at_utc',
  updatedAt: 'updated_at_utc',
  archivedAt: 'archived_at_utc',
} as const;

export const EVENT_SELECT_FIELDS = [
  EVENT_COLUMNS.id,
  EVENT_COLUMNS.type,
  EVENT_COLUMNS.title,
  EVENT_COLUMNS.description,
  EVENT_COLUMNS.startAt,
  EVENT_COLUMNS.endAt,
  EVENT_COLUMNS.capacity,
  EVENT_COLUMNS.isPinned,
  EVENT_COLUMNS.isArchived,
  EVENT_COLUMNS.signupLocked,
  EVENT_COLUMNS.deletedAt,
  EVENT_COLUMNS.createdBy,
  EVENT_COLUMNS.updatedBy,
  EVENT_COLUMNS.createdAt,
  EVENT_COLUMNS.updatedAt,
  EVENT_COLUMNS.archivedAt,
] as const;

export const MEMBER_USER_SELECT_FIELDS = [
  'user_id',
  'username',
  'wechat_name',
  'role',
  'power',
  'is_active',
  'created_at_utc',
  'updated_at_utc',
] as const;

export function pickAllowedFields(
  requested: string[] | undefined,
  allowed: readonly string[],
  fallback: readonly string[]
): string[] {
  if (!requested || requested.length === 0) return [...fallback];
  const allow = new Set(allowed);
  const picked = requested.filter((f) => allow.has(f));
  return picked.length > 0 ? picked : [...fallback];
}
