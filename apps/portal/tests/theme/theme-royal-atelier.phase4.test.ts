import { describe, expect, it } from 'vitest';
import { resolveThemePostFxStack } from '@/theme/fx/postFxGates';

describe('theme phase 4 royal atelier contracts', () => {
  it('enables restrained highlight bloom stack at high quality', () => {
    const stack = resolveThemePostFxStack({
      themeId: 'royal',
      fxQuality: 3,
      reducedMotion: false,
      motionMode: 'full',
    });

    expect(stack.enabled).toContain('Noise');
    expect(stack.enabled).toContain('Bloom');
    expect(stack.enabled).not.toContain('Glitch');
    expect(stack.enabled).not.toContain('GodRays');
  });

  it('suppresses bloom in reduced/toned-down mode', () => {
    const stack = resolveThemePostFxStack({
      themeId: 'royal',
      fxQuality: 3,
      reducedMotion: true,
      motionMode: 'toned-down',
    });

    expect(stack.enabled).toContain('Noise');
    expect(stack.enabled).not.toContain('Bloom');
  });
});

