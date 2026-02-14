import { describe, expect, it } from 'vitest';
import { resolveThemePostFxStack, isEffectAllowedAtQuality } from '@/theme/fx/postFxGates';

describe('theme phase 2 post-fx gates', () => {
  it('keeps cheap baseline effects available regardless of quality tier', () => {
    const low = resolveThemePostFxStack({
      themeId: 'minimalistic',
      fxQuality: 0,
      reducedMotion: false,
      motionMode: 'full',
    });

    expect(low.baseline).toEqual(['Vignette', 'Noise']);
  });

  it('gates heavy effects at high quality', () => {
    expect(isEffectAllowedAtQuality('GodRays', 2)).toBe(false);
    expect(isEffectAllowedAtQuality('GodRays', 3)).toBe(true);
    expect(isEffectAllowedAtQuality('Glitch', 2)).toBe(false);
    expect(isEffectAllowedAtQuality('Glitch', 3)).toBe(true);
  });

  it('suppresses heavy and chromatic effects under reduced motion', () => {
    const stack = resolveThemePostFxStack({
      themeId: 'cyberpunk',
      fxQuality: 3,
      reducedMotion: true,
      motionMode: 'toned-down',
    });

    expect(stack.heavy).toHaveLength(0);
    expect(stack.enabled).not.toContain('Glitch');
    expect(stack.enabled).not.toContain('ChromaticAberration');
    expect(stack.enabled).toContain('Noise');
  });
});
