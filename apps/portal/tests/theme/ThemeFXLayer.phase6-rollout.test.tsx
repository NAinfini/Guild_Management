import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeControllerProvider } from '@/theme/ThemeController';
import { ThemeFXLayer } from '@/theme/fx/ThemeFXLayer';

describe('ThemeFXLayer phase 6 rollout runtime fallback', () => {
  it('forces baseline-only FX stack when ops switch is enabled', () => {
    localStorage.setItem('baiye_theme', 'cyberpunk');
    localStorage.setItem('baiye_theme_baseline_fx_only', '1');

    render(
      <ThemeControllerProvider>
        <div style={{ position: 'relative', minHeight: '120px' }}>
          <ThemeFXLayer />
        </div>
      </ThemeControllerProvider>,
    );

    const layer = document.querySelector('[data-theme-fx-layer="true"]') as HTMLElement | null;
    expect(layer).toBeTruthy();
    expect(layer?.dataset.rolloutBaselineFxOnly).toBe('true');
    expect(layer?.dataset.fxEnabled).toBe('');
    expect(layer?.dataset.fxHeavy).toBe('');
  });
});
