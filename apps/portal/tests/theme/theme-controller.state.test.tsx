import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { ThemeControllerProvider, useThemeController } from '@/theme/ThemeController';
import { ThemeFXLayer } from '@/theme/fx/ThemeFXLayer';

function ThemeProbe() {
  const {
    currentTheme,
    currentColor,
    fontScale,
    motionIntensity,
    motionMode,
    effectiveMotionMode,
    reducedMotion,
    highContrast,
    dyslexiaFriendly,
    colorBlindMode,
    setTheme,
    setColor,
    setFontScale,
    setMotionIntensity,
    setMotionMode,
    setHighContrast,
    setDyslexiaFriendly,
    setColorBlindMode,
  } = useThemeController();

  return (
    <div>
      <div data-testid="theme">{currentTheme}</div>
      <div data-testid="color">{currentColor}</div>
      <div data-testid="font-scale">{fontScale}</div>
      <div data-testid="motion-intensity">{motionIntensity}</div>
      <div data-testid="motion-mode">{motionMode}</div>
      <div data-testid="effective-motion-mode">{effectiveMotionMode}</div>
      <div data-testid="reduced-motion">{String(reducedMotion)}</div>
      <div data-testid="high-contrast">{String(highContrast)}</div>
      <div data-testid="dyslexia-friendly">{String(dyslexiaFriendly)}</div>
      <div data-testid="color-blind-mode">{colorBlindMode}</div>
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
      <button onClick={() => setMotionMode('full')}>mode-full</button>
      <button onClick={() => setMotionMode('toned-down')}>mode-toned</button>
      <button onClick={() => setMotionMode('off')}>mode-off</button>
      <button onClick={() => setHighContrast(true)}>high-contrast-on</button>
      <button onClick={() => setDyslexiaFriendly(true)}>dyslexia-on</button>
      <button onClick={() => setColorBlindMode('deuteranopia')}>color-blind-deuteranopia</button>
    </div>
  );
}

describe('ThemeController state updates', () => {
  const originalMatchMedia = window.matchMedia;

  function mockReducedMotionPreference(matches: boolean) {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? matches : false,
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      },
      removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      },
      dispatchEvent: () => false,
    }));
  }

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-theme-color');
    document.documentElement.removeAttribute('data-motion-mode');
    document.documentElement.removeAttribute('data-reduced-motion');
    document.documentElement.style.removeProperty('--theme-font-size');
    document.documentElement.style.removeProperty('--theme-motion-intensity');
    window.matchMedia = originalMatchMedia;
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

  it('does not trigger cross-component state updates while applying theme changes', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ThemeControllerProvider>
        <div style={{ position: 'relative', minHeight: '160px' }}>
          <ThemeProbe />
          <ThemeFXLayer />
        </div>
      </ThemeControllerProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'color-then-theme' }));

    const updateWarnings = consoleErrorSpy.mock.calls.filter(([message]) =>
      typeof message === 'string'
        && message.includes('Cannot update a component (`ThemeFXLayer`) while rendering a different component (`ThemeControllerProvider`)'),
    );

    expect(updateWarnings).toHaveLength(0);
    consoleErrorSpy.mockRestore();
  });

  it('resolves toned-down mode when OS prefers reduced motion', () => {
    localStorage.setItem('baiye_theme_motion_mode', 'full');
    mockReducedMotionPreference(true);

    render(
      <ThemeControllerProvider>
        <ThemeProbe />
      </ThemeControllerProvider>,
    );

    expect(screen.getByTestId('motion-mode')).toHaveTextContent('full');
    expect(screen.getByTestId('effective-motion-mode')).toHaveTextContent('toned-down');
    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');
    expect(document.documentElement.getAttribute('data-motion-mode')).toBe('toned-down');
    expect(document.documentElement.getAttribute('data-reduced-motion')).toBe('true');
  });

  it('persists in-app motion mode override and disables effective intensity when off', async () => {
    mockReducedMotionPreference(false);
    const user = userEvent.setup();

    render(
      <ThemeControllerProvider>
        <ThemeProbe />
      </ThemeControllerProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'mode-off' }));

    expect(screen.getByTestId('motion-mode')).toHaveTextContent('off');
    expect(screen.getByTestId('effective-motion-mode')).toHaveTextContent('off');
    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');
    expect(localStorage.getItem('baiye_theme_motion_mode')).toBe('off');
    expect(document.documentElement.getAttribute('data-motion-mode')).toBe('off');
    expect(document.documentElement.style.getPropertyValue('--theme-motion-intensity')).toBe('0');
  });

  it('applies transition classes and preserves scroll position during theme switches', () => {
    vi.useFakeTimers();
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    Object.defineProperty(window, 'scrollX', { configurable: true, value: 0 });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 420 });

    render(
      <ThemeControllerProvider>
        <ThemeProbe />
      </ThemeControllerProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'color-then-theme' }));

    expect(document.documentElement.classList.contains('theme-transitioning')).toBe(true);
    expect(document.body.classList.contains('theme-transitioning')).toBe(true);
    expect(scrollSpy).toHaveBeenCalledWith(0, 420);

    act(() => {
      vi.advanceTimersByTime(550);
    });

    expect(document.documentElement.classList.contains('theme-transitioning')).toBe(false);
    expect(document.body.classList.contains('theme-transitioning')).toBe(false);
    expect(document.documentElement.hasAttribute('data-theme-switching')).toBe(false);

    scrollSpy.mockRestore();
    vi.useRealTimers();
  });

  it('updates and persists accessibility preference flags on the root element', () => {
    render(
      <ThemeControllerProvider>
        <ThemeProbe />
      </ThemeControllerProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'high-contrast-on' }));
    fireEvent.click(screen.getByRole('button', { name: 'dyslexia-on' }));
    fireEvent.click(screen.getByRole('button', { name: 'color-blind-deuteranopia' }));

    expect(screen.getByTestId('high-contrast')).toHaveTextContent('true');
    expect(screen.getByTestId('dyslexia-friendly')).toHaveTextContent('true');
    expect(screen.getByTestId('color-blind-mode')).toHaveTextContent('deuteranopia');
    expect(document.documentElement.getAttribute('data-high-contrast')).toBe('true');
    expect(document.documentElement.getAttribute('data-dyslexia-friendly')).toBe('true');
    expect(document.documentElement.getAttribute('data-color-blind-mode')).toBe('deuteranopia');
    expect(localStorage.getItem('baiye_theme_high_contrast')).toBe('true');
    expect(localStorage.getItem('baiye_theme_dyslexia_friendly')).toBe('true');
    expect(localStorage.getItem('baiye_theme_color_blind_mode')).toBe('deuteranopia');
  });
});
