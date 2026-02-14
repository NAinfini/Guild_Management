import { describe, expect, it } from 'vitest';
import {
  createAmbientDiagnosticsTracker,
  resolveAmbientFxQuality,
  resolveAmbientTickMs,
} from '@/components/layout/ThemeAmbientCanvas';

describe('ThemeAmbientCanvas phase 2 runtime contracts', () => {
  it('slows ambient tick cadence as motion intensity drops', () => {
    const high = resolveAmbientTickMs(1.2, false);
    const low = resolveAmbientTickMs(0.2, false);
    const reduced = resolveAmbientTickMs(1, true);

    expect(high).toBeLessThan(low);
    expect(reduced).toBeGreaterThan(low);
  });

  it('tracks invalidation frequency and frame timing', () => {
    const tracker = createAmbientDiagnosticsTracker(2000);

    tracker.markInvalidation(0);
    tracker.markInvalidation(200);
    tracker.markInvalidation(400);
    tracker.markFrame(16.2);
    tracker.markFrame(21.7);

    const snapshot = tracker.snapshot(1000);
    expect(snapshot.invalidationsTotal).toBe(3);
    expect(snapshot.invalidationsPerSecond).toBeGreaterThan(1);
    expect(snapshot.averageFrameMs).toBeGreaterThan(10);
    expect(snapshot.maxFrameMs).toBeGreaterThanOrEqual(snapshot.averageFrameMs);
  });

  it('resolves fx quality from save-data and motion intensity', () => {
    expect(resolveAmbientFxQuality(1, false)).toBe('high');
    expect(resolveAmbientFxQuality(0.55, false)).toBe('low');
    expect(resolveAmbientFxQuality(1.2, true)).toBe('low');
  });
});
