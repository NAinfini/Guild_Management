import { describe, expect, it } from 'vitest';
import en from '@/i18n/locales/en.json';
import zh from '@/i18n/locales/zh.json';

describe('navigation locale wording', () => {
  it('uses concise account/menu labels in English', () => {
    expect(en.nav.account).toBe('Account');
    expect(en.nav.profile).toBe('Profile');
    expect(en.nav.settings).toBe('Settings');
    expect(en.account.logout).toBe('Sign Out');
    expect(en.nav.identity_dossier).toBeUndefined();
    expect(en.nav.terminal_config).toBeUndefined();
    expect(en.nav.sever_connection).toBeUndefined();
  });

  it('uses concise account/menu labels in Chinese', () => {
    expect(zh.nav.account).toBe('\u8d26\u53f7');
    expect(zh.nav.profile).toBe('\u4e2a\u4eba');
    expect(zh.nav.settings).toBe('\u8bbe\u7f6e');
    expect(zh.account.logout).toBe('\u9000\u51fa\u767b\u5f55');
    expect(zh.nav.identity_dossier).toBeUndefined();
    expect(zh.nav.terminal_config).toBeUndefined();
    expect(zh.nav.sever_connection).toBeUndefined();
  });
});
