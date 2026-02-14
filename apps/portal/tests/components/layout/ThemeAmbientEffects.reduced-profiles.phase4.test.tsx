import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeAmbientEffects } from '@/components/layout/ThemeAmbientEffects';

const THEME_REDUCED_PROFILES = [
  { theme: 'minimalistic', profile: 'minimalistic' },
  { theme: 'neo-brutalism', profile: 'neo-brutalism' },
  { theme: 'cyberpunk', profile: 'cyberpunk' },
  { theme: 'steampunk', profile: 'steampunk' },
  { theme: 'royal', profile: 'royal' },
  { theme: 'chibi', profile: 'chibi' },
  { theme: 'post-apocalyptic', profile: 'post-apocalyptic' },
] as const;

describe('ThemeAmbientEffects reduced fallback profiles', () => {
  it('emits a deterministic reduced profile marker for every theme', () => {
    for (const entry of THEME_REDUCED_PROFILES) {
      const { container, unmount } = render(
        <ThemeAmbientEffects theme={entry.theme} reducedMotion motionIntensity={1} />,
      );
      const layer = container.querySelector('.theme-ambient-layer');
      expect(layer?.getAttribute('data-ambient-reduced-profile')).toBe(entry.profile);
      expect(container.querySelector(`[data-ambient-reduced-profile-theme="${entry.profile}"]`)).toBeTruthy();
      unmount();
    }
  });

  it('does not render reduced profile marker when motion is not reduced', () => {
    const { container } = render(<ThemeAmbientEffects theme="cyberpunk" reducedMotion={false} motionIntensity={1} />);
    const layer = container.querySelector('.theme-ambient-layer');

    expect(layer?.getAttribute('data-ambient-reduced-profile')).toBeNull();
    expect(container.querySelector('[data-ambient-reduced-profile-theme]')).toBeFalsy();
  });
});

