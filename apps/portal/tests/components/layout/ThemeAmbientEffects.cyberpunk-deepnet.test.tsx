import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeAmbientEffects } from '@/components/layout/ThemeAmbientEffects';

describe('ThemeAmbientEffects cyberpunk deep net scene', () => {
  it('renders glitch-grid dead zones and sparse data streams', () => {
    const { container } = render(<ThemeAmbientEffects theme="cyberpunk" />);

    const deadZones = container.querySelectorAll('.theme-ambient__cyber-dead-zone');
    const streams = container.querySelectorAll('.theme-ambient__cyber-data-stream');

    expect(deadZones.length).toBeGreaterThanOrEqual(3);
    expect(streams.length).toBeGreaterThanOrEqual(2);
    expect(streams.length).toBeLessThanOrEqual(6);
  });
});
