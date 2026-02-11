import { describe, expect, it } from 'vitest';
import { getMemberCardAccentColors } from '@/lib/utils';

describe('getMemberCardAccentColors', () => {
  it('returns gray fallback when no classes are selected', () => {
    expect(getMemberCardAccentColors([])).toEqual(['#6b7280']);
    expect(getMemberCardAccentColors(undefined)).toEqual(['#6b7280']);
  });

  it('maps qiansi_lin to green, lieshi_wei to brown-yellow, and all other classes to blue', () => {
    const colors = getMemberCardAccentColors(['lieshi_wei', 'lieshi_jun', 'qiansi_lin', 'mingjin_hong']);

    expect(colors).toEqual(['#a06a2a', '#3b5fc4', '#1f8f67']);
  });

  it('deduplicates and caps accents to three colors', () => {
    const colors = getMemberCardAccentColors([
      'mingjin_hong',
      'mingjin_ying',
      'qiansi_lin',
      'lieshi_wei',
      'pozhu_feng',
    ]);

    expect(colors).toHaveLength(3);
    expect(colors).toEqual(['#3b5fc4', '#1f8f67', '#a06a2a']);
  });
});
