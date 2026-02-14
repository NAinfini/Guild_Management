import { describe, expect, it } from 'vitest';
import { evaluateThemeRolloutMonitoring } from '@/theme/rolloutMonitoring';

describe('phase 6 rollout monitoring checks', () => {
  it('flags accessibility risk when reduced motion still has fancy effects enabled', () => {
    const result = evaluateThemeRolloutMonitoring({
      reducedMotion: true,
      enabledEffects: ['Noise', 'Glitch'],
      ambientDiagnostics: null,
    });

    expect(result.accessibilityRisk).toBe(true);
    expect(result.performanceRisk).toBe(false);
    expect(result.reasons).toContain('reduced-motion-fancy-fx');
  });

  it('flags performance risk when diagnostics exceed frame/invalidation budgets', () => {
    const result = evaluateThemeRolloutMonitoring({
      reducedMotion: false,
      enabledEffects: ['Noise'],
      ambientDiagnostics: {
        invalidationsTotal: 120,
        invalidationsPerSecond: 3.5,
        framesTotal: 80,
        averageFrameMs: 27,
        maxFrameMs: 34,
        lastFrameMs: 22,
      },
    });

    expect(result.accessibilityRisk).toBe(false);
    expect(result.performanceRisk).toBe(true);
    expect(result.reasons).toContain('ambient-frame-budget');
    expect(result.reasons).toContain('ambient-invalidation-budget');
  });
});
