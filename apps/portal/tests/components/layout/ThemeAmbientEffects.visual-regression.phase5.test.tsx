import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeAmbientEffects } from '@/components/layout/ThemeAmbientEffects';

const THEMES = [
  'minimalistic',
  'neo-brutalism',
  'cyberpunk',
  'steampunk',
  'royal',
  'chibi',
  'post-apocalyptic',
] as const;

describe('phase 5 visual regression snapshots for theme ambient direction', () => {
  for (const theme of THEMES) {
    it(`${theme} full profile snapshot`, () => {
      const { container } = render(<ThemeAmbientEffects theme={theme} reducedMotion={false} motionIntensity={1} />);
      expect(container.querySelector('.theme-ambient-layer')).toMatchSnapshot();
    });

    it(`${theme} reduced profile snapshot`, () => {
      const { container } = render(<ThemeAmbientEffects theme={theme} reducedMotion motionIntensity={1} />);
      expect(container.querySelector('.theme-ambient-layer')).toMatchSnapshot();
    });
  }
});

