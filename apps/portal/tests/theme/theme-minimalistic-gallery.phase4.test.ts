import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveThemePostFxStack } from '@/theme/fx/postFxGates';

const minimalisticPresetPath = path.resolve(
  __dirname,
  '../../src/theme/presets/minimalistic.css',
);

describe('theme phase 4 minimalistic gallery contracts', () => {
  it('keeps minimalistic post-fx restrained at all quality tiers', () => {
    const low = resolveThemePostFxStack({
      themeId: 'minimalistic',
      fxQuality: 1,
      reducedMotion: false,
      motionMode: 'full',
    });
    const high = resolveThemePostFxStack({
      themeId: 'minimalistic',
      fxQuality: 3,
      reducedMotion: false,
      motionMode: 'full',
    });

    expect(low.heavy).toHaveLength(0);
    expect(high.heavy).toHaveLength(0);
    expect(high.enabled).not.toContain('Bloom');
    expect(high.enabled).not.toContain('Glitch');
    expect(high.enabled).toEqual(['Noise']);
  });

  it('defines typography hover expansion token hooks for gallery controls', () => {
    const css = fs.readFileSync(minimalisticPresetPath, 'utf8');

    expect(css).toContain('--minimal-gallery-letter-spacing-hover');
    expect(css).toContain('--minimal-gallery-letter-spacing-base');
  });
});
