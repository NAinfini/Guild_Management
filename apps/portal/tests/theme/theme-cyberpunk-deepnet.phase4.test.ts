import { describe, expect, it } from 'vitest';
import { resolveThemePostFxStack } from '@/theme/fx/postFxGates';

describe('theme phase 4 cyberpunk deep net contracts', () => {
  it('enables scanline + noise + chromatic stack at high quality', () => {
    const stack = resolveThemePostFxStack({
      themeId: 'cyberpunk',
      fxQuality: 3,
      reducedMotion: false,
      motionMode: 'full',
    });

    expect(stack.enabled).toContain('Noise');
    expect(stack.enabled).toContain('Scanline');
    expect(stack.enabled).toContain('ChromaticAberration');
    expect(stack.enabled).toContain('Glitch');
  });

  it('disables glitch and chromatic drift stack under reduced mode', () => {
    const stack = resolveThemePostFxStack({
      themeId: 'cyberpunk',
      fxQuality: 3,
      reducedMotion: true,
      motionMode: 'toned-down',
    });

    expect(stack.enabled).not.toContain('Glitch');
    expect(stack.enabled).not.toContain('ChromaticAberration');
    expect(stack.enabled).toContain('Noise');
  });
});
