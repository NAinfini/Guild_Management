import React from 'react';

export type AmbientFxQuality = 'high' | 'low';

export function resolveAmbientFxQuality(motionIntensity: number, saveData: boolean): AmbientFxQuality {
  if (saveData) return 'low';
  return motionIntensity >= 0.75 ? 'high' : 'low';
}

export function resolveAmbientTickMs(motionIntensity: number, reducedMotion: boolean): number {
  if (reducedMotion) return 1200;
  const normalized = Math.max(0, Math.min(1.5, motionIntensity));
  const base = 300 - normalized * 100;
  return Math.round(Math.max(140, Math.min(300, base)));
}

export interface AmbientDiagnosticsSnapshot {
  invalidationsTotal: number;
  invalidationsPerSecond: number;
  averageFrameMs: number;
  maxFrameMs: number;
}

export interface AmbientDiagnosticsTracker {
  markInvalidation: (timestampMs: number) => void;
  markFrame: (frameMs: number) => void;
  snapshot: (nowMs: number) => AmbientDiagnosticsSnapshot;
}

export function createAmbientDiagnosticsTracker(windowMs: number): AmbientDiagnosticsTracker {
  const invalidations: number[] = [];
  const frameTimes: number[] = [];

  const trimInvalidations = (nowMs: number) => {
    const floor = nowMs - windowMs;
    while (invalidations.length > 0 && invalidations[0] < floor) {
      invalidations.shift();
    }
  };

  return {
    markInvalidation(timestampMs) {
      invalidations.push(timestampMs);
    },
    markFrame(frameMs) {
      frameTimes.push(frameMs);
    },
    snapshot(nowMs) {
      trimInvalidations(nowMs);
      const safeWindow = Math.max(1, Math.min(windowMs, nowMs || windowMs));
      const invalidationsPerSecond = invalidations.length / (safeWindow / 1000);
      const averageFrameMs =
        frameTimes.length > 0 ? frameTimes.reduce((sum, v) => sum + v, 0) / frameTimes.length : 0;
      const maxFrameMs = frameTimes.length > 0 ? Math.max(...frameTimes) : 0;

      return {
        invalidationsTotal: invalidations.length,
        invalidationsPerSecond,
        averageFrameMs,
        maxFrameMs,
      };
    },
  };
}

interface ThemeAmbientCanvasProps {
  theme: string;
  reducedMotion?: boolean;
  motionIntensity?: number;
}

/**
 * Lightweight ambient canvas placeholder to preserve import compatibility.
 * The project currently runs ambient backgrounds in a disabled/static mode.
 */
export function ThemeAmbientCanvas({
  theme,
  reducedMotion = false,
  motionIntensity = 1,
}: ThemeAmbientCanvasProps) {
  return (
    <canvas
      aria-hidden="true"
      className="theme-ambient__canvas"
      data-renderer="theme-ambient-canvas-static"
      data-theme={theme}
      data-reduced-motion={String(reducedMotion)}
      data-motion-intensity={String(motionIntensity)}
      style={{ display: 'none' }}
    />
  );
}

export default ThemeAmbientCanvas;
