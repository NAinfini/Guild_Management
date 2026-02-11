import { describe, expect, it } from 'vitest';
import zh from '@/i18n/locales/zh.json';

describe('zh locale structure', () => {
  it('keeps class dictionaries only at the root level', () => {
    expect((zh as any).class_group?.mingjin).toBeTruthy();
    expect((zh as any).class?.mingjin_hong).toBeTruthy();
    expect((zh.common as any).class_group).toBeUndefined();
    expect((zh.common as any).class).toBeUndefined();
  });
});
