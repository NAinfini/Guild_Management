import { describe, expect, it } from 'vitest';
import { resolveThemePostFxStack } from '@/theme/fx/postFxGates';

describe('theme phase 4 post-apocalyptic wasteland contracts', () => {
  it('keeps grit-first stack with noise only and without heavy cinematic effects', () => {
    const stack = resolveThemePostFxStack({
      themeId: 'post-apocalyptic',
      fxQuality: 3,
      reducedMotion: false,
      motionMode: 'full',
    });

    expect(stack.enabled).toContain('Noise');
    expect(stack.enabled).not.toContain('Grid');
    expect(stack.enabled).not.toContain('Glitch');
    expect(stack.enabled).not.toContain('GodRays');
    expect(stack.enabled).not.toContain('Bloom');
  });

  it('preserves static grit identity in reduced or toned-down mode', () => {
    const stack = resolveThemePostFxStack({
      themeId: 'post-apocalyptic',
      fxQuality: 3,
      reducedMotion: true,
      motionMode: 'toned-down',
    });

    expect(stack.enabled).toContain('Noise');
    expect(stack.enabled).not.toContain('Grid');
    expect(stack.enabled).not.toContain('Glitch');
  });
});
