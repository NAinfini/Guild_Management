import React from 'react';

interface ThemeBackgroundRendererProps {
  theme: string;
  reducedMotion?: boolean;
  motionIntensity?: number;
  cursor?: { x: number; y: number };
  scrollProgress?: number;
  clickPulseSeed?: number;
  forceRenderer?: 'r3f' | 'canvas';
}

/**
 * Compatibility renderer used by tests and phased migration code.
 * R3F mode and canvas mode both resolve to a deterministic placeholder surface.
 */
export function ThemeBackgroundRenderer({
  theme,
  reducedMotion = false,
  motionIntensity = 1,
  cursor = { x: 0, y: 0 },
  scrollProgress = 0,
  clickPulseSeed = 0,
  forceRenderer = 'canvas',
}: ThemeBackgroundRendererProps) {
  const renderer = forceRenderer === 'r3f'
    ? 'theme-background-renderer-r3f'
    : 'theme-background-renderer-static';

  return (
    <canvas
      aria-hidden="true"
      className="theme-ambient__canvas"
      data-renderer={renderer}
      data-theme={theme}
      data-reduced-motion={String(reducedMotion)}
      data-motion-intensity={String(motionIntensity)}
      data-cursor-x={String(cursor.x)}
      data-cursor-y={String(cursor.y)}
      data-scroll-progress={String(scrollProgress)}
      data-click-pulse={String(clickPulseSeed)}
      style={{ display: 'none' }}
    />
  );
}

export default ThemeBackgroundRenderer;
