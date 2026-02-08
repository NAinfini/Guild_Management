import type { Role } from '../types';

export const PERMISSION_CONTROLS = {
  join_events: ['admin', 'moderator', 'member'],
  copy_event_signup: ['admin', 'moderator', 'member'],
  manage_guild_war_active: ['admin', 'moderator'],
  view_guild_war_member_detail: ['admin', 'moderator'],
  view_guild_war_analytics: ['admin', 'moderator', 'member', 'external'],
  copy_guild_war_analytics: ['admin', 'moderator', 'member'],
  access_admin_area: ['admin', 'moderator'],
  manage_member_roles: ['admin'],
  manage_member_activation: ['admin'],
  create_event: ['admin', 'moderator'],
  edit_event: ['admin', 'moderator'],
  delete_event: ['admin', 'moderator'],
  pin_event: ['admin', 'moderator'],
  lock_event: ['admin', 'moderator'],
  archive_event: ['admin', 'moderator'],
  manage_event_participants: ['admin', 'moderator'],
  create_announcement: ['admin', 'moderator'],
  edit_announcement: ['admin', 'moderator'],
  delete_announcement: ['admin', 'moderator'],
  pin_announcement: ['admin', 'moderator'],
  archive_announcement: ['admin', 'moderator'],
  upload_gallery_media: ['admin', 'moderator'],
  delete_gallery_media: ['admin', 'moderator'],
} as const satisfies Record<string, readonly Role[]>;

export type PermissionControl = keyof typeof PERMISSION_CONTROLS;

export function getEffectiveRole(userRole?: Role | null, viewRole?: Role | null): Role {
  return (viewRole || userRole || 'external') as Role;
}

export function hasPermission(role: Role | null | undefined, control: PermissionControl): boolean {
  const effectiveRole = role || 'external';
  return PERMISSION_CONTROLS[control].includes(effectiveRole);
}

export function canJoinEvents(role?: Role | null): boolean {
  return hasPermission(role, 'join_events');
}

export function canCopyEventSignup(role?: Role | null): boolean {
  return hasPermission(role, 'copy_event_signup');
}

export function canManageGuildWarActive(role?: Role | null): boolean {
  return hasPermission(role, 'manage_guild_war_active');
}

export function canViewGuildWarMemberDetail(role?: Role | null): boolean {
  return hasPermission(role, 'view_guild_war_member_detail');
}

export function canViewGuildWarAnalytics(role?: Role | null): boolean {
  return hasPermission(role, 'view_guild_war_analytics');
}

export function canCopyGuildWarAnalytics(role?: Role | null): boolean {
  return hasPermission(role, 'copy_guild_war_analytics');
}

export function canAccessAdminArea(role?: Role | null): boolean {
  return hasPermission(role, 'access_admin_area');
}

export function canManageMemberRoles(role?: Role | null): boolean {
  return hasPermission(role, 'manage_member_roles');
}

export function canManageMemberActivation(role?: Role | null): boolean {
  return hasPermission(role, 'manage_member_activation');
}

export function canCreateEvent(role?: Role | null): boolean {
  return hasPermission(role, 'create_event');
}

export function canEditEvent(role?: Role | null): boolean {
  return hasPermission(role, 'edit_event');
}

export function canDeleteEvent(role?: Role | null): boolean {
  return hasPermission(role, 'delete_event');
}

export function canPinEvent(role?: Role | null): boolean {
  return hasPermission(role, 'pin_event');
}

export function canLockEvent(role?: Role | null): boolean {
  return hasPermission(role, 'lock_event');
}

export function canArchiveEvent(role?: Role | null): boolean {
  return hasPermission(role, 'archive_event');
}

export function canManageEventParticipants(role?: Role | null): boolean {
  return hasPermission(role, 'manage_event_participants');
}

export function canCreateAnnouncement(role?: Role | null): boolean {
  return hasPermission(role, 'create_announcement');
}

export function canEditAnnouncement(role?: Role | null): boolean {
  return hasPermission(role, 'edit_announcement');
}

export function canDeleteAnnouncement(role?: Role | null): boolean {
  return hasPermission(role, 'delete_announcement');
}

export function canPinAnnouncement(role?: Role | null): boolean {
  return hasPermission(role, 'pin_announcement');
}

export function canArchiveAnnouncement(role?: Role | null): boolean {
  return hasPermission(role, 'archive_announcement');
}

export function canUploadGalleryMedia(role?: Role | null): boolean {
  return hasPermission(role, 'upload_gallery_media');
}

export function canDeleteGalleryMedia(role?: Role | null): boolean {
  return hasPermission(role, 'delete_gallery_media');
}
