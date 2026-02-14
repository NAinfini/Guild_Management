import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeAmbientEffects } from '@/components/layout/ThemeAmbientEffects';

describe('ThemeAmbientEffects royal atelier scene', () => {
  it('renders silk-wave layers with rare glints and light sweep accents', () => {
    const { container } = render(<ThemeAmbientEffects theme="royal" />);

    expect(container.querySelector('.theme-ambient__royal-silk-plane')).toBeTruthy();
    const waves = container.querySelectorAll('.theme-ambient__royal-silk-wave');
    expect(waves.length).toBeGreaterThanOrEqual(2);
    expect(container.querySelector('.theme-ambient__royal-glint')).toBeTruthy();
    expect(container.querySelector('.theme-ambient__royal-caustic-sweep')).toBeTruthy();
  });

  it('keeps premium restraint and excludes cyberpunk scene markers', () => {
    const { container } = render(<ThemeAmbientEffects theme="royal" />);

    expect(container.querySelector('.theme-ambient__vignette')).toBeTruthy();
    expect(container.querySelector('.theme-ambient__cyber-grid')).toBeFalsy();
    expect(container.querySelector('.theme-ambient__scan-beam')).toBeFalsy();
  });
});

