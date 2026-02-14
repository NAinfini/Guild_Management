import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeAmbientEffects } from '@/components/layout/ThemeAmbientEffects';

describe('ThemeAmbientEffects minimalistic gallery scene', () => {
  it('renders frosted plane depth layers with restrained primitive count', () => {
    const { container } = render(<ThemeAmbientEffects theme="minimalistic" />);

    expect(container.querySelector('.theme-ambient__frosted-plane')).toBeTruthy();
    const primitives = container.querySelectorAll('.theme-ambient__gallery-primitive');
    expect(primitives.length).toBeGreaterThanOrEqual(3);
    expect(primitives.length).toBeLessThanOrEqual(7);
  });

  it('includes cheap baseline effects and avoids heavy signatures', () => {
    const { container } = render(<ThemeAmbientEffects theme="minimalistic" />);

    expect(container.querySelector('.theme-ambient__vignette')).toBeTruthy();
    expect(container.querySelector('.theme-ambient__noise--minimalistic')).toBeTruthy();
    expect(container.querySelector('.theme-ambient__scan-beam')).toBeFalsy();
    expect(container.querySelector('.theme-ambient__cyber-grid')).toBeFalsy();
  });
});
