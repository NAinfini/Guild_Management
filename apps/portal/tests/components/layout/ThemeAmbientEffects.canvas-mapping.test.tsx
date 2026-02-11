import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeAmbientEffects } from '@/components/layout/ThemeAmbientEffects';

describe('ThemeAmbientEffects canvas scheme mapping', () => {
  it('uses pipeline scheme for cyberpunk theme', () => {
    const { container } = render(<ThemeAmbientEffects theme="cyberpunk" />);
    const canvas = container.querySelector('.theme-ambient__canvas');
    expect(canvas).toBeTruthy();
    expect(canvas?.getAttribute('data-scheme')).toBe('pipeline');
  });

  it('maps other themes to fitting schemes', () => {
    const steampunk = render(<ThemeAmbientEffects theme="steampunk" />);
    expect(
      steampunk.container
        .querySelector('.theme-ambient__canvas')
        ?.getAttribute('data-scheme'),
    ).toBe('coalesce');

    const minimalistic = render(<ThemeAmbientEffects theme="minimalistic" />);
    expect(
      minimalistic.container
        .querySelector('.theme-ambient__canvas')
        ?.getAttribute('data-scheme'),
    ).toBe('swirl');

    const royal = render(<ThemeAmbientEffects theme="royal" />);
    expect(
      royal.container
        .querySelector('.theme-ambient__canvas')
        ?.getAttribute('data-scheme'),
    ).toBe('floaters');
  });
});

