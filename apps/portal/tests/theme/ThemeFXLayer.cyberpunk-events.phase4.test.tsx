import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeControllerProvider } from '@/theme/ThemeController';
import { ThemeFXLayer } from '@/theme/fx/ThemeFXLayer';

describe('ThemeFXLayer cyberpunk interaction events', () => {
  beforeEach(() => {
    localStorage.setItem('baiye_theme', 'cyberpunk');
    localStorage.removeItem('baiye_theme_motion_mode');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('raises chromatic drift and glitch event only during heavy interaction', () => {
    vi.useFakeTimers();
    render(
      <ThemeControllerProvider>
        <div style={{ position: 'relative', minHeight: '120px' }}>
          <ThemeFXLayer />
        </div>
      </ThemeControllerProvider>,
    );

    const layer = document.querySelector('[data-theme-fx-layer="true"]') as HTMLElement | null;
    expect(layer).toBeTruthy();
    expect(layer?.dataset.fxChromaticDrift).toBe('0');
    expect(layer?.dataset.fxGlitchEvent).toBe('false');

    fireEvent.pointerDown(window, { clientX: 220, clientY: 140 });
    expect(layer?.dataset.fxChromaticDrift).not.toBe('0');
    expect(layer?.dataset.fxGlitchEvent).toBe('true');

    act(() => {
      vi.advanceTimersByTime(320);
    });

    expect(layer?.dataset.fxGlitchEvent).toBe('false');
  });

  it('keeps chromatic drift/glitch events disabled when motion mode is off', () => {
    localStorage.setItem('baiye_theme_motion_mode', 'off');
    render(
      <ThemeControllerProvider>
        <div style={{ position: 'relative', minHeight: '120px' }}>
          <ThemeFXLayer />
        </div>
      </ThemeControllerProvider>,
    );

    const layer = document.querySelector('[data-theme-fx-layer="true"]') as HTMLElement | null;
    fireEvent.pointerDown(window, { clientX: 220, clientY: 140 });
    expect(layer?.dataset.fxChromaticDrift).toBe('0');
    expect(layer?.dataset.fxGlitchEvent).toBe('false');
  });
});
