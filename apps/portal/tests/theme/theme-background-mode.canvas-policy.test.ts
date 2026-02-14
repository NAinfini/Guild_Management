import { describe, expect, it } from 'vitest';
import { getThemeOptions, getThemeVisualSpec } from '@/theme/presets';

describe('theme canvas background policy', () => {
  const themeIds = [
    'minimalistic',
    'neo-brutalism',
    'cyberpunk',
    'steampunk',
    'royal',
    'chibi',
    'post-apocalyptic',
  ] as const;

  it('uses canvas background mode for all active themes', () => {
    for (const themeId of themeIds) {
      const spec = getThemeVisualSpec(themeId);
      expect(spec.capabilities.backgroundMode).toBe('canvas');
      expect(spec.capabilities.hasAnimatedBackground).toBe(true);
    }
  });

  it('removes legacy CSS pattern backgrounds from theme specs', () => {
    for (const themeId of themeIds) {
      const spec = getThemeVisualSpec(themeId);
      expect(spec.bgPattern).toBe('none');
      expect(spec.bgSize).toBe('auto');
    }
  });

  it('keeps cyberpunk-only MUI control treatment after canvas migration', () => {
    const cyberpunk = getThemeOptions('cyberpunk');
    const chibi = getThemeOptions('chibi');

    expect((cyberpunk.typography as any)?.button?.textTransform).toBe('uppercase');
    expect((chibi.typography as any)?.button?.textTransform).toBe('none');
  });

  it('keeps minimalistic animated but restrained at low default fx quality', () => {
    const minimalistic = getThemeVisualSpec('minimalistic');
    expect(minimalistic.capabilities.fxQuality).toBe(1);
  });
});

