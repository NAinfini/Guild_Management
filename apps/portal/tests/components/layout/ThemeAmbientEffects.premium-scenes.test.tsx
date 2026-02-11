import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeAmbientEffects } from '@/components/layout/ThemeAmbientEffects';

describe('ThemeAmbientEffects premium scene layers', () => {
  it('renders cyberpunk cinematic layers', () => {
    const { container } = render(<ThemeAmbientEffects theme="cyberpunk" />);
    expect(container.querySelector('.theme-ambient__cyber-grid')).toBeTruthy();
    expect(container.querySelector('.theme-ambient__cyber-target')).toBeTruthy();
    expect(container.querySelector('.theme-ambient__scan-beam')).toBeTruthy();
  });

  it('renders steampunk industrial layers', () => {
    const { container } = render(<ThemeAmbientEffects theme="steampunk" />);
    expect(container.querySelector('.theme-ambient__steam-fog')).toBeTruthy();
    expect(container.querySelector('.theme-ambient__gauge')).toBeTruthy();
    expect(container.querySelector('.theme-ambient__pipe')).toBeTruthy();
  });

  it('renders neo-brutalism tracking layers', () => {
    const { container } = render(<ThemeAmbientEffects theme="neo-brutalism" />);
    expect(container.querySelector('.theme-ambient__brutal-grid')).toBeTruthy();
    expect(container.querySelector('.theme-ambient__brutal-hud')).toBeTruthy();
    expect(container.querySelector('.theme-ambient__brutal-target')).toBeTruthy();
  });
});
