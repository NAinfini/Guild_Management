import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeControllerProvider } from '@/theme/ThemeController';
import { ThemeFXLayer } from '@/theme/fx/ThemeFXLayer';

describe('ThemeFXLayer phase 2 gates', () => {
  it('publishes resolved post-fx stack metadata on the layer node', () => {
    render(
      <ThemeControllerProvider>
        <div style={{ position: 'relative', minHeight: '120px' }}>
          <ThemeFXLayer />
        </div>
      </ThemeControllerProvider>,
    );

    const layer = document.querySelector('[data-theme-fx-layer="true"]') as HTMLElement | null;
    expect(layer).toBeTruthy();
    expect(layer?.dataset.fxBaseline).toContain('Vignette');
    expect(layer?.dataset.fxBaseline).toContain('Noise');
    expect(layer?.dataset.fxEnabled).toBeDefined();
  });
});
