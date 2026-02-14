import { describe, expect, it } from 'vitest';
import { THEME_VISUAL_SPEC_LIST } from '@/theme/tokens';
import {
  FX_EFFECT_GATING_MATRIX,
  FX_QUALITY_LABELS,
  MOTION_POLICY_TABLE,
  getDefaultThemeRuntimeConfig,
  resolveThemeRuntimeConfig,
  type ThemePostEffect,
} from '@/theme/runtimeContracts';

const REQUIRED_EFFECTS: ThemePostEffect[] = [
  'Scanline',
  'Grid',
  'DotScreen',
  'Noise',
  'ChromaticAberration',
  'Glitch',
  'GodRays',
  'Bloom',
];

describe('theme phase 0 runtime contracts', () => {
  it('provides default runtime config for every theme with shared keys', () => {
    for (const spec of THEME_VISUAL_SPEC_LIST) {
      const runtime = getDefaultThemeRuntimeConfig(spec.id);
      expect(runtime.themeId).toBe(spec.id);
      expect([0, 1, 2, 3]).toContain(runtime.fxQuality);
      expect(['full', 'toned-down', 'off']).toContain(runtime.motionMode);
      expect(typeof runtime.reducedMotion).toBe('boolean');
      expect(runtime.interactionIntensity).toBeGreaterThanOrEqual(0);
      expect(runtime.interactionIntensity).toBeLessThanOrEqual(1);
    }
  });

  it('normalizes runtime config into safe bounds', () => {
    const runtime = resolveThemeRuntimeConfig({
      themeId: 'cyberpunk',
      fxQuality: 7,
      motionMode: 'full',
      reducedMotion: true,
      interactionIntensity: 2.4,
    });

    expect(runtime.fxQuality).toBe(3);
    expect(runtime.motionMode).toBe('toned-down');
    expect(runtime.reducedMotion).toBe(true);
    expect(runtime.interactionIntensity).toBeLessThanOrEqual(0.4);
  });

  it('caps interaction intensity when motion mode is toned-down', () => {
    const runtime = resolveThemeRuntimeConfig({
      themeId: 'royal',
      fxQuality: 2,
      motionMode: 'toned-down',
      reducedMotion: false,
      interactionIntensity: 1,
    });

    expect(runtime.motionMode).toBe('toned-down');
    expect(runtime.interactionIntensity).toBeLessThanOrEqual(0.6);
  });

  it('defines an fx gating level for every supported post effect', () => {
    const levels = new Set(FX_QUALITY_LABELS);
    for (const effect of REQUIRED_EFFECTS) {
      expect(FX_EFFECT_GATING_MATRIX[effect]).toBeTruthy();
      expect(levels.has(FX_EFFECT_GATING_MATRIX[effect])).toBe(true);
    }
    expect(FX_EFFECT_GATING_MATRIX.Noise).toBe('off');
    expect(FX_EFFECT_GATING_MATRIX.Glitch).toBe('high');
    expect(FX_EFFECT_GATING_MATRIX.GodRays).toBe('high');
  });

  it('documents reduced-motion behavior for all major animation classes', () => {
    for (const policy of MOTION_POLICY_TABLE) {
      expect(policy.category.length).toBeGreaterThan(0);
      expect(['allow', 'tone-down', 'disable']).toContain(policy.tonedDown);
      expect(['allow', 'tone-down', 'disable']).toContain(policy.reduced);
      if (policy.fancyFx) {
        expect(policy.reduced).toBe('disable');
      }
    }
  });

});
