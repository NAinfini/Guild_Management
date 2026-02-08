import { describe, expect, it } from 'vitest';
import {
  canCopyGuildWarAnalytics,
  canManageGuildWarActive,
  canViewGuildWarMemberDetail,
  canViewGuildWarAnalytics,
  getEffectiveRole,
} from '@/lib/permissions';

describe('Guild War permissions', () => {
  it('keeps external users read-only in active tab', () => {
    const role = getEffectiveRole('member', 'external');
    expect(canManageGuildWarActive(role)).toBe(false);
  });

  it('allows analytics visibility for external users', () => {
    expect(canViewGuildWarAnalytics('external')).toBe(true);
    expect(canCopyGuildWarAnalytics('external')).toBe(false);
  });

  it('allows active management for admin and moderator only', () => {
    expect(canManageGuildWarActive('admin')).toBe(true);
    expect(canManageGuildWarActive('moderator')).toBe(true);
    expect(canManageGuildWarActive('member')).toBe(false);
  });

  it('restricts double-click member detail to admin and moderator', () => {
    expect(canViewGuildWarMemberDetail('admin')).toBe(true);
    expect(canViewGuildWarMemberDetail('moderator')).toBe(true);
    expect(canViewGuildWarMemberDetail('member')).toBe(false);
    expect(canViewGuildWarMemberDetail('external')).toBe(false);
  });
});
