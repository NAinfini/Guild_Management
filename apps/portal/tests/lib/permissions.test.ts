import { describe, expect, it } from 'vitest';
import {
  PERMISSION_CONTROLS,
  canAccessAdminArea,
  canArchiveEvent,
  canArchiveAnnouncement,
  canManageMemberActivation,
  canManageMemberRoles,
  canCreateAnnouncement,
  canCreateEvent,
  canCopyEventSignup,
  canCopyGuildWarAnalytics,
  canDeleteAnnouncement,
  canDeleteGalleryMedia,
  canDeleteEvent,
  canEditAnnouncement,
  canEditEvent,
  canJoinEvents,
  canLockEvent,
  canManageGuildWarActive,
  canViewGuildWarMemberDetail,
  canManageEventParticipants,
  canPinAnnouncement,
  canPinEvent,
  canUploadGalleryMedia,
  canViewGuildWarAnalytics,
  hasPermission,
} from '@/lib/permissions';

describe('permissions', () => {
  it('defines role access per control in one map', () => {
    expect(PERMISSION_CONTROLS.join_events).toEqual(['admin', 'moderator', 'member']);
    expect(PERMISSION_CONTROLS.copy_event_signup).toEqual(['admin', 'moderator', 'member']);
    expect(PERMISSION_CONTROLS.manage_guild_war_active).toEqual(['admin', 'moderator']);
    expect(PERMISSION_CONTROLS.view_guild_war_member_detail).toEqual(['admin', 'moderator']);
    expect(PERMISSION_CONTROLS.view_guild_war_analytics).toEqual([
      'admin',
      'moderator',
      'member',
      'external',
    ]);
    expect(PERMISSION_CONTROLS.copy_guild_war_analytics).toEqual(['admin', 'moderator', 'member']);
    expect(PERMISSION_CONTROLS.access_admin_area).toEqual(['admin', 'moderator']);
    expect(PERMISSION_CONTROLS.manage_member_roles).toEqual(['admin']);
    expect(PERMISSION_CONTROLS.manage_member_activation).toEqual(['admin']);
    expect(PERMISSION_CONTROLS.create_event).toEqual(['admin', 'moderator']);
    expect(PERMISSION_CONTROLS.edit_event).toEqual(['admin', 'moderator']);
    expect(PERMISSION_CONTROLS.delete_event).toEqual(['admin', 'moderator']);
    expect(PERMISSION_CONTROLS.pin_event).toEqual(['admin', 'moderator']);
    expect(PERMISSION_CONTROLS.lock_event).toEqual(['admin', 'moderator']);
    expect(PERMISSION_CONTROLS.archive_event).toEqual(['admin', 'moderator']);
    expect(PERMISSION_CONTROLS.manage_event_participants).toEqual(['admin', 'moderator']);
    expect(PERMISSION_CONTROLS.create_announcement).toEqual(['admin', 'moderator']);
    expect(PERMISSION_CONTROLS.edit_announcement).toEqual(['admin', 'moderator']);
    expect(PERMISSION_CONTROLS.delete_announcement).toEqual(['admin', 'moderator']);
    expect(PERMISSION_CONTROLS.pin_announcement).toEqual(['admin', 'moderator']);
    expect(PERMISSION_CONTROLS.archive_announcement).toEqual(['admin', 'moderator']);
    expect(PERMISSION_CONTROLS.upload_gallery_media).toEqual(['admin', 'moderator']);
    expect(PERMISSION_CONTROLS.delete_gallery_media).toEqual(['admin', 'moderator']);
  });

  it('checks permission by control key', () => {
    expect(hasPermission('admin', 'manage_guild_war_active')).toBe(true);
    expect(hasPermission('member', 'manage_guild_war_active')).toBe(false);
    expect(hasPermission('external', 'view_guild_war_analytics')).toBe(true);
    expect(hasPermission('moderator', 'access_admin_area')).toBe(true);
    expect(hasPermission('moderator', 'manage_member_roles')).toBe(false);
    expect(hasPermission('moderator', 'delete_event')).toBe(true);
    expect(hasPermission('member', 'delete_event')).toBe(false);
    expect(hasPermission('member', 'delete_announcement')).toBe(false);
    expect(hasPermission('moderator', 'upload_gallery_media')).toBe(true);
    expect(hasPermission(undefined, 'join_events')).toBe(false);
  });

  it('keeps helper methods aligned with centralized controls', () => {
    expect(canJoinEvents('member')).toBe(hasPermission('member', 'join_events'));
    expect(canCopyEventSignup('moderator')).toBe(hasPermission('moderator', 'copy_event_signup'));
    expect(canManageGuildWarActive('external')).toBe(hasPermission('external', 'manage_guild_war_active'));
    expect(canViewGuildWarMemberDetail('moderator')).toBe(
      hasPermission('moderator', 'view_guild_war_member_detail'),
    );
    expect(canViewGuildWarAnalytics('external')).toBe(
      hasPermission('external', 'view_guild_war_analytics'),
    );
    expect(canCopyGuildWarAnalytics('member')).toBe(
      hasPermission('member', 'copy_guild_war_analytics'),
    );
    expect(canAccessAdminArea('moderator')).toBe(hasPermission('moderator', 'access_admin_area'));
    expect(canManageMemberRoles('admin')).toBe(hasPermission('admin', 'manage_member_roles'));
    expect(canManageMemberActivation('admin')).toBe(
      hasPermission('admin', 'manage_member_activation'),
    );
    expect(canCreateEvent('moderator')).toBe(hasPermission('moderator', 'create_event'));
    expect(canEditEvent('admin')).toBe(hasPermission('admin', 'edit_event'));
    expect(canDeleteEvent('moderator')).toBe(hasPermission('moderator', 'delete_event'));
    expect(canPinEvent('admin')).toBe(hasPermission('admin', 'pin_event'));
    expect(canLockEvent('admin')).toBe(hasPermission('admin', 'lock_event'));
    expect(canArchiveEvent('admin')).toBe(hasPermission('admin', 'archive_event'));
    expect(canManageEventParticipants('moderator')).toBe(
      hasPermission('moderator', 'manage_event_participants'),
    );
    expect(canCreateAnnouncement('moderator')).toBe(
      hasPermission('moderator', 'create_announcement'),
    );
    expect(canEditAnnouncement('admin')).toBe(hasPermission('admin', 'edit_announcement'));
    expect(canDeleteAnnouncement('admin')).toBe(hasPermission('admin', 'delete_announcement'));
    expect(canPinAnnouncement('moderator')).toBe(hasPermission('moderator', 'pin_announcement'));
    expect(canArchiveAnnouncement('admin')).toBe(hasPermission('admin', 'archive_announcement'));
    expect(canUploadGalleryMedia('moderator')).toBe(
      hasPermission('moderator', 'upload_gallery_media'),
    );
    expect(canDeleteGalleryMedia('admin')).toBe(hasPermission('admin', 'delete_gallery_media'));
  });
});
