import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeBackgroundRenderer } from '@/components/layout/ThemeBackgroundRenderer';

vi.mock('@react-three/fiber', () => ({
  Canvas: ({
    children: _children,
    onCreated: _onCreated,
    ...props
  }: React.ComponentProps<'canvas'> & { onCreated?: () => void }) => (
    <canvas {...props} data-testid="r3f-canvas" />
  ),
  useFrame: () => undefined,
  useThree: () => ({
    invalidate: () => undefined,
    gl: {
      domElement: {
        dataset: {},
      },
    },
  }),
}));

describe('ThemeBackgroundRenderer R3F integration', () => {
  const baseProps = {
    theme: 'cyberpunk',
    reducedMotion: false,
    motionIntensity: 1,
    cursor: { x: 50, y: 50 },
    scrollProgress: 0,
    clickPulseSeed: 1,
  } as const;

  it('renders R3F-backed canvas when forced to R3F mode', () => {
    const { container } = render(
      <ThemeBackgroundRenderer
        {...baseProps}
        forceRenderer="r3f"
      />,
    );

    const canvas = container.querySelector('.theme-ambient__canvas');
    expect(canvas).toBeTruthy();
    expect(canvas?.getAttribute('data-renderer')).toBe('theme-background-renderer-r3f');
  });

  it('renders static fallback layer when forced to canvas mode', () => {
    const { container } = render(
      <ThemeBackgroundRenderer
        {...baseProps}
        forceRenderer="canvas"
      />,
    );

    const canvas = container.querySelector('.theme-ambient__canvas');
    expect(canvas).toBeTruthy();
    expect(canvas?.getAttribute('data-renderer')).toBe('theme-background-renderer-static');
  });
});
