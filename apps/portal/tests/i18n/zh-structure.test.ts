import { describe, expect, it } from 'vitest';
import zh from '@/i18n/locales/zh.json';

describe('zh locale structure', () => {
  it('keeps class dictionaries only at the root level', () => {
    expect(zh.class_group?.mingjin).toBeTruthy();
    expect(zh.class?.mingjin_hong).toBeTruthy();
    expect(zh.common.class_group).toBeUndefined();
    expect(zh.common.class).toBeUndefined();
  });
});
