import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeAmbientEffects } from '@/components/layout/ThemeAmbientEffects';

describe('ThemeAmbientEffects post-apocalyptic wasteland scene', () => {
  it('renders dust-storm volume, ruins silhouette, cracks overlay, and heavy vignette', () => {
    const { container } = render(<ThemeAmbientEffects theme="post-apocalyptic" />);

    expect(container.querySelector('.theme-ambient__wasteland-dust-volume')).toBeTruthy();
    expect(container.querySelector('.theme-ambient__wasteland-ruins')).toBeTruthy();
    expect(container.querySelector('.theme-ambient__wasteland-cracks-overlay')).toBeTruthy();
    expect(container.querySelector('.theme-ambient__vignette--wasteland')).toBeTruthy();

    const dust = container.querySelectorAll('.theme-ambient__wasteland-dust');
    expect(dust.length).toBeGreaterThanOrEqual(6);

    const lightning = container.querySelectorAll('.theme-ambient__wasteland-lightning');
    expect(lightning.length).toBeGreaterThanOrEqual(1);
  });

  it('suppresses lightning under reduced mode and avoids unrelated cyber layers', () => {
    const { container } = render(<ThemeAmbientEffects theme="post-apocalyptic" reducedMotion />);

    expect(container.querySelector('.theme-ambient__wasteland-lightning')).toBeFalsy();
    expect(container.querySelector('.theme-ambient__cyber-grid')).toBeFalsy();
    expect(container.querySelector('.theme-ambient__scan-beam')).toBeFalsy();
  });
});

