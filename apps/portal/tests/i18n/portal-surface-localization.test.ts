import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import en from '@/i18n/locales/en.json';
import zh from '@/i18n/locales/zh.json';

function getByKey(obj: Record<string, any>, key: string) {
  return key.split('.').reduce<any>((acc, part) => (acc ? acc[part] : undefined), obj);
}

describe('portal surface localization coverage', () => {
  it('contains required keys for settings/login/dashboard/tools/gallery in both locales', () => {
    const requiredKeys = [
      'login.subtitle',
      'login.username',
      'login.password',
      'login.forgot_password',
      'login.status_authenticating',
      'login.no_account',
      'login.contact_admin',
      'settings.font_size',
      'settings.font_size_small',
      'settings.font_size_default',
      'settings.font_size_large',
      'settings.motion_intensity',
      'settings.language_native_english',
      'settings.language_native_chinese',
      'dashboard.intel.title',
      'dashboard.recent_wars.title',
      'dashboard.my_signups.title',
      'dashboard.next_7_days',
      'dashboard.no_upcoming_events',
      'tools.nexus_controls_title',
      'tools.nexus_controls_subtitle',
      'tools.nexus_studio.title',
      'tools.nexus_studio.subtitle',
      'gallery.upload',
      'gallery.search_placeholder',
      'gallery.alt_image',
      'gallery.untitled',
      'gallery.unknown_uploader',
    ];

    for (const key of requiredKeys) {
      expect(getByKey(en as any, key), `missing en key: ${key}`).toBeDefined();
      expect(getByKey(zh as any, key), `missing zh key: ${key}`).toBeDefined();
    }
  });

  it('uses localized Chinese strings (not English fallbacks) for key surface labels', () => {
    const keys = [
      'login.username',
      'settings.font_size',
      'dashboard.intel.title',
      'tools.nexus_studio.title',
      'gallery.upload',
    ];

    for (const key of keys) {
      const enValue = String(getByKey(en as any, key));
      const zhValue = String(getByKey(zh as any, key));
      expect(zhValue).not.toBe(enValue);
    }
  });

  it('avoids hardcoded login placeholders in source', () => {
    const loginFile = fs.readFileSync(
      path.resolve(__dirname, '../../src/features/Auth/Login.tsx'),
      'utf8',
    );
    expect(loginFile).not.toContain('ENTER USERNAME');
    expect(loginFile).toContain("t('login.placeholder_username')");
    expect(loginFile).toContain("t('login.placeholder_password')");
  });
});
