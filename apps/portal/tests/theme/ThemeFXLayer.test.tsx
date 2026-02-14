import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { ThemeControllerProvider } from '@/theme/ThemeController';
import { ThemeFXLayer } from '@/theme/fx/ThemeFXLayer';

describe('ThemeFXLayer', () => {
  beforeEach(() => {
    localStorage.removeItem('baiye_fx_off');
    localStorage.removeItem('baiye_theme_motion_intensity');
    localStorage.removeItem('baiye_theme_motion_mode');
  });

  it('mounts exactly once and keeps non-interactive fixed stacking semantics', () => {
    const { rerender } = render(
      <ThemeControllerProvider>
        <div style={{ position: 'relative', minHeight: '160px' }}>
          <ThemeFXLayer />
        </div>
      </ThemeControllerProvider>,
    );

    const getLayers = () => Array.from(document.querySelectorAll('[data-theme-fx-layer="true"]'));

    expect(getLayers()).toHaveLength(1);

    const layer = getLayers()[0] as HTMLElement;
    expect(layer).toBeTruthy();
    expect(layer.style.pointerEvents).toBe('none');
    expect(layer.style.position).toBe('absolute');
    expect(layer.style.zIndex).toBe('0');
    expect(layer.style.contain).toContain('paint');

    rerender(
      <ThemeControllerProvider>
        <div style={{ position: 'relative', minHeight: '160px' }}>
          <ThemeFXLayer />
        </div>
      </ThemeControllerProvider>,
    );

    expect(getLayers()).toHaveLength(1);
  });

  it('renders active fx content when heavy behavior is enabled', () => {
    render(
      <ThemeControllerProvider>
        <div style={{ position: 'relative', minHeight: '160px' }}>
          <ThemeFXLayer />
        </div>
      </ThemeControllerProvider>,
    );

    expect(document.querySelectorAll('[data-theme-fx-content="active"]')).toHaveLength(1);
  });

  it('disables heavy fx content when kill switch is enabled', () => {
    localStorage.setItem('baiye_fx_off', '1');

    render(
      <ThemeControllerProvider>
        <div style={{ position: 'relative', minHeight: '160px' }}>
          <ThemeFXLayer />
        </div>
      </ThemeControllerProvider>,
    );

    expect(document.querySelectorAll('[data-theme-fx-content="active"]')).toHaveLength(0);
    const layer = document.querySelector('[data-theme-fx-layer="true"]') as HTMLElement | null;
    expect(layer?.dataset.heavy).toBe('false');
  });

  it('disables heavy fx content when motion mode is off', () => {
    localStorage.setItem('baiye_theme_motion_mode', 'off');

    render(
      <ThemeControllerProvider>
        <div style={{ position: 'relative', minHeight: '160px' }}>
          <ThemeFXLayer />
        </div>
      </ThemeControllerProvider>,
    );

    expect(document.querySelectorAll('[data-theme-fx-content="active"]')).toHaveLength(0);
    const layer = document.querySelector('[data-theme-fx-layer="true"]') as HTMLElement | null;
    expect(layer?.dataset.reducedMotion).toBe('true');
    expect(layer?.dataset.motionMode).toBe('off');
  });
});
