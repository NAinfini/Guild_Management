import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeAmbientEffects } from '@/components/layout/ThemeAmbientEffects';

describe('ThemeAmbientEffects chibi toy box scene', () => {
  it('renders jelly sea layers with wobble blobs and rare sparkles', () => {
    const { container } = render(<ThemeAmbientEffects theme="chibi" />);

    expect(container.querySelector('.theme-ambient__chibi-jelly-sea')).toBeTruthy();
    const blobs = container.querySelectorAll('.theme-ambient__chibi-blob');
    expect(blobs.length).toBeGreaterThanOrEqual(3);
    expect(blobs.length).toBeLessThanOrEqual(7);

    const sparkles = container.querySelectorAll('.theme-ambient__chibi-sparkle');
    expect(sparkles.length).toBeGreaterThanOrEqual(4);
  });

  it('keeps playful identity and avoids cyberpunk scene markers', () => {
    const { container } = render(<ThemeAmbientEffects theme="chibi" />);

    expect(container.querySelector('.theme-ambient__cyber-grid')).toBeFalsy();
    expect(container.querySelector('.theme-ambient__scan-beam')).toBeFalsy();
  });
});

