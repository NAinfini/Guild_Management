import type { ThemePostEffect } from './runtimeContracts';

export interface RolloutAmbientDiagnostics {
  invalidationsTotal: number;
  invalidationsPerSecond: number;
  framesTotal: number;
  averageFrameMs: number;
  maxFrameMs: number;
  lastFrameMs: number;
}

export interface ThemeRolloutMonitoringInput {
  reducedMotion: boolean;
  enabledEffects: ThemePostEffect[];
  ambientDiagnostics: RolloutAmbientDiagnostics | null;
}

export interface ThemeRolloutMonitoringResult {
  accessibilityRisk: boolean;
  performanceRisk: boolean;
  reasons: string[];
}

const FANCY_EFFECTS = new Set<ThemePostEffect>([
  'Glitch',
  'GodRays',
  'Bloom',
  'ChromaticAberration',
]);

const MAX_INVALIDATIONS_PER_SECOND = 2.5;
const MAX_AVERAGE_FRAME_MS = 24;
const MAX_PEAK_FRAME_MS = 32;

export function evaluateThemeRolloutMonitoring(
  input: ThemeRolloutMonitoringInput,
): ThemeRolloutMonitoringResult {
  const reasons: string[] = [];

  if (input.reducedMotion && input.enabledEffects.some((effect) => FANCY_EFFECTS.has(effect))) {
    reasons.push('reduced-motion-fancy-fx');
  }

  if (input.ambientDiagnostics) {
    if (input.ambientDiagnostics.averageFrameMs > MAX_AVERAGE_FRAME_MS) {
      reasons.push('ambient-frame-budget');
    }
    if (input.ambientDiagnostics.maxFrameMs > MAX_PEAK_FRAME_MS) {
      reasons.push('ambient-peak-frame');
    }
    if (input.ambientDiagnostics.invalidationsPerSecond > MAX_INVALIDATIONS_PER_SECOND) {
      reasons.push('ambient-invalidation-budget');
    }
  }

  return {
    accessibilityRisk: reasons.includes('reduced-motion-fancy-fx'),
    performanceRisk: reasons.some((reason) => reason.startsWith('ambient-')),
    reasons,
  };
}
