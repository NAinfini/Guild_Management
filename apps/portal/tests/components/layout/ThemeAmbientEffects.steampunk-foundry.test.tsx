import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeAmbientEffects } from '@/components/layout/ThemeAmbientEffects';

describe('ThemeAmbientEffects steampunk foundry scene', () => {
  it('renders foundry haze layers, soot particles, and a distant heavy gear silhouette', () => {
    const { container } = render(<ThemeAmbientEffects theme="steampunk" />);

    expect(container.querySelector('.theme-ambient__steam-fog')).toBeTruthy();
    expect(container.querySelector('.theme-ambient__foundry-gear--distant')).toBeTruthy();

    const soot = container.querySelectorAll('.theme-ambient__foundry-soot');
    expect(soot.length).toBeGreaterThanOrEqual(5);

    const steamBands = container.querySelectorAll('.theme-ambient__foundry-steam-band');
    expect(steamBands.length).toBeGreaterThanOrEqual(2);
  });

  it('keeps warm industrial baseline overlays and avoids cyber signature layers', () => {
    const { container } = render(<ThemeAmbientEffects theme="steampunk" />);

    expect(container.querySelector('.theme-ambient__noise--steampunk')).toBeTruthy();
    expect(container.querySelector('.theme-ambient__vignette')).toBeTruthy();
    expect(container.querySelector('.theme-ambient__cyber-grid')).toBeFalsy();
    expect(container.querySelector('.theme-ambient__scan-beam')).toBeFalsy();
  });
});

