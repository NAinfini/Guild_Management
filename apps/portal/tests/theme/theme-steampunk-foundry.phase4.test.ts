import { describe, expect, it } from 'vitest';
import { resolveThemePostFxStack } from '@/theme/fx/postFxGates';

describe('theme phase 4 steampunk foundry contracts', () => {
  it('enables only noise and god rays at high quality without bloom/glitch', () => {
    const stack = resolveThemePostFxStack({
      themeId: 'steampunk',
      fxQuality: 3,
      reducedMotion: false,
      motionMode: 'full',
    });

    expect(stack.enabled).toContain('Noise');
    expect(stack.enabled).toContain('GodRays');
    expect(stack.enabled).not.toContain('Bloom');
    expect(stack.enabled).not.toContain('Glitch');
  });

  it('suppresses god rays in reduced or toned-down motion modes', () => {
    const reduced = resolveThemePostFxStack({
      themeId: 'steampunk',
      fxQuality: 3,
      reducedMotion: true,
      motionMode: 'toned-down',
    });

    expect(reduced.enabled).toContain('Noise');
    expect(reduced.enabled).not.toContain('GodRays');
  });
});

