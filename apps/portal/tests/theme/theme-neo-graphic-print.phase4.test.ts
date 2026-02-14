import { describe, expect, it } from 'vitest';
import { resolveThemePostFxStack } from '@/theme/fx/postFxGates';

describe('theme phase 4 neo-brutalism graphic print contracts', () => {
  it('keeps a print-identity stack with DotScreen and no legacy grid overlay, without heavy FX', () => {
    const stack = resolveThemePostFxStack({
      themeId: 'neo-brutalism',
      fxQuality: 3,
      reducedMotion: false,
      motionMode: 'full',
    });

    expect(stack.enabled).toContain('Noise');
    expect(stack.enabled).toContain('DotScreen');
    expect(stack.enabled).not.toContain('Grid');
    expect(stack.heavy).toHaveLength(0);
  });

  it('retains print identity in reduced mode with no heavy/flicker effects', () => {
    const stack = resolveThemePostFxStack({
      themeId: 'neo-brutalism',
      fxQuality: 3,
      reducedMotion: true,
      motionMode: 'toned-down',
    });

    expect(stack.enabled).toContain('DotScreen');
    expect(stack.enabled).not.toContain('Grid');
    expect(stack.enabled).not.toContain('Glitch');
    expect(stack.enabled).not.toContain('Bloom');
  });
});
