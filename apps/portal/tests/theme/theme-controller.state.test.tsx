import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach } from 'vitest';
import { ThemeControllerProvider, useThemeController } from '@/theme/ThemeController';

function ThemeProbe() {
  const { currentTheme, currentColor, fontScale, motionIntensity, setTheme, setColor, setFontScale, setMotionIntensity } = useThemeController();

  return (
    <div>
      <div data-testid="theme">{currentTheme}</div>
      <div data-testid="color">{currentColor}</div>
      <div data-testid="font-scale">{fontScale}</div>
      <div data-testid="motion-intensity">{motionIntensity}</div>
      <button
        onClick={() => {
          setColor('black-gold');
          setTheme('cyberpunk');
        }}
      >
        color-then-theme
      </button>
      <button onClick={() => setFontScale(1.12)}>font-up</button>
      <button onClick={() => setMotionIntensity(0.45)}>motion-down</button>
      <button onClick={() => setMotionIntensity(1.35)}>motion-up</button>
    </div>
  );
}

describe('ThemeController state updates', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-theme-color');
    document.documentElement.style.removeProperty('--theme-font-size');
    document.documentElement.style.removeProperty('--theme-motion-intensity');
  });

  it('keeps color selection when theme changes in the same tick', async () => {
    const user = userEvent.setup();

    render(
      <ThemeControllerProvider>
        <ThemeProbe />
      </ThemeControllerProvider>
    );

    await user.click(screen.getByRole('button', { name: 'color-then-theme' }));

    expect(screen.getByTestId('theme')).toHaveTextContent('cyberpunk');
    expect(screen.getByTestId('color')).toHaveTextContent('black-gold');
  });

  it('updates font scale and motion intensity and applies css vars', async () => {
    const user = userEvent.setup();

    render(
      <ThemeControllerProvider>
        <ThemeProbe />
      </ThemeControllerProvider>
    );

    await user.click(screen.getByRole('button', { name: 'font-up' }));
    await user.click(screen.getByRole('button', { name: 'motion-down' }));

    expect(screen.getByTestId('font-scale')).toHaveTextContent('1.12');
    expect(screen.getByTestId('motion-intensity')).toHaveTextContent('0.45');
    expect(document.documentElement.style.getPropertyValue('--theme-font-size')).toBe('17.92px');
    expect(document.documentElement.style.getPropertyValue('--theme-motion-intensity')).toBe('0.45');
  });

  it('does not slow motion durations when intensity increases', async () => {
    const user = userEvent.setup();

    render(
      <ThemeControllerProvider>
        <ThemeProbe />
      </ThemeControllerProvider>
    );

    const baselineFastMs = Number.parseFloat(
      document.documentElement.style.getPropertyValue('--theme-motion-fast-effective').replace('ms', ''),
    );

    await user.click(screen.getByRole('button', { name: 'motion-up' }));

    const boostedFastMs = Number.parseFloat(
      document.documentElement.style.getPropertyValue('--theme-motion-fast-effective').replace('ms', ''),
    );

    expect(boostedFastMs).toBeLessThanOrEqual(baselineFastMs);
  });
});
