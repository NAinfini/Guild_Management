import { describe, expect, it } from 'vitest';
import { createAmbientDiagnosticsTracker, resolveAmbientTickMs } from '@/components/layout/ThemeAmbientCanvas';

describe('phase 5 performance validation budgets', () => {
  it('keeps idle tick cadence conservative and reduced cadence sparse', () => {
    const fullTick = resolveAmbientTickMs(1, false);
    const reducedTick = resolveAmbientTickMs(1, true);

    expect(fullTick).toBeLessThanOrEqual(300);
    expect(reducedTick).toBeGreaterThanOrEqual(1000);
  });

  it('meets synthetic idle and interaction frame-time budgets', () => {
    const tracker = createAmbientDiagnosticsTracker(4000);
    const idleFrames = [8, 9, 10, 11, 9, 10];
    const interactionFrames = [12, 14, 16, 18, 20, 22, 19];

    for (const frame of idleFrames) tracker.markFrame(frame);
    for (const frame of interactionFrames) tracker.markFrame(frame);

    tracker.markInvalidation(0);
    tracker.markInvalidation(600);
    tracker.markInvalidation(1200);
    tracker.markInvalidation(1900);
    tracker.markInvalidation(2600);
    tracker.markInvalidation(3200);

    const snapshot = tracker.snapshot(4000);

    expect(snapshot.averageFrameMs).toBeLessThanOrEqual(20);
    expect(snapshot.maxFrameMs).toBeLessThanOrEqual(24);
    expect(snapshot.invalidationsPerSecond).toBeLessThanOrEqual(2);
  });
});

