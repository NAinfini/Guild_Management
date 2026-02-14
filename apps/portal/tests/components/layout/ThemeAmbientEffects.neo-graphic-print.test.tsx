import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeAmbientEffects } from '@/components/layout/ThemeAmbientEffects';

describe('ThemeAmbientEffects neo-brutalism graphic print scene', () => {
  it('renders halftone horizon and stepped dot-field layers', () => {
    const { container } = render(<ThemeAmbientEffects theme="neo-brutalism" />);

    expect(container.querySelector('.theme-ambient__neo-halftone-horizon')).toBeTruthy();
    const dots = container.querySelectorAll('.theme-ambient__neo-dot-field');
    expect(dots.length).toBeGreaterThanOrEqual(2);
    expect(container.querySelector('.theme-ambient__brutal-grid')).toBeTruthy();
  });

  it('keeps print identity overlays and excludes cyberpunk scene markers', () => {
    const { container } = render(<ThemeAmbientEffects theme="neo-brutalism" />);

    expect(container.querySelector('.theme-ambient__noise--neo')).toBeTruthy();
    expect(container.querySelector('.theme-ambient__vignette')).toBeTruthy();
    expect(container.querySelector('.theme-ambient__cyber-grid')).toBeFalsy();
    expect(container.querySelector('.theme-ambient__scan-beam')).toBeFalsy();
  });
});

