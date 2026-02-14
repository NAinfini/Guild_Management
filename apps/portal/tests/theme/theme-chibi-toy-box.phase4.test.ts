import { describe, expect, it } from 'vitest';
import { resolveThemePostFxStack } from '@/theme/fx/postFxGates';

describe('theme phase 4 chibi toy box contracts', () => {
  it('keeps playful post-fx restrained to soft bloom profile at high quality', () => {
    const stack = resolveThemePostFxStack({
      themeId: 'chibi',
      fxQuality: 3,
      reducedMotion: false,
      motionMode: 'full',
    });

    expect(stack.enabled).toContain('Noise');
    expect(stack.enabled).toContain('Bloom');
    expect(stack.enabled).not.toContain('Glitch');
    expect(stack.enabled).not.toContain('GodRays');
  });

  it('suppresses bloom under reduced/toned-down motion', () => {
    const stack = resolveThemePostFxStack({
      themeId: 'chibi',
      fxQuality: 3,
      reducedMotion: true,
      motionMode: 'toned-down',
    });

    expect(stack.enabled).toContain('Noise');
    expect(stack.enabled).not.toContain('Bloom');
  });
});

