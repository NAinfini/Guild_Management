import type { ThemeMode } from '@/theme/presets';
import {
  FX_EFFECT_GATING_MATRIX,
  type FxQualityLabel,
  type FxQualityLevel,
  type MotionMode,
  type ThemePostEffect,
} from '@/theme/runtimeContracts';

export type BaselinePostFx = 'Vignette' | 'Noise';

export interface ThemePostFxStack {
  baseline: BaselinePostFx[];
  enabled: ThemePostEffect[];
  medium: ThemePostEffect[];
  heavy: ThemePostEffect[];
}

const QUALITY_RANK: Record<FxQualityLabel, FxQualityLevel> = {
  off: 0,
  low: 1,
  medium: 2,
  high: 3,
};

const MEDIUM_EFFECTS = new Set<ThemePostEffect>([
  'Scanline',
  'Grid',
  'DotScreen',
  'ChromaticAberration',
]);

const HEAVY_EFFECTS = new Set<ThemePostEffect>([
  'Glitch',
  'GodRays',
  'Bloom',
]);

const THEME_EFFECT_PROFILES: Record<ThemeMode, ThemePostEffect[]> = {
  'minimalistic': ['Noise'],
  'neo-brutalism': ['Noise', 'DotScreen'],
  'cyberpunk': ['Noise', 'Scanline', 'ChromaticAberration', 'Glitch'],
  'steampunk': ['Noise', 'GodRays'],
  'royal': ['Noise', 'Bloom'],
  'chibi': ['Noise', 'Bloom'],
  'post-apocalyptic': ['Noise'],
};

function uniqueEffects(effects: ThemePostEffect[]): ThemePostEffect[] {
  return Array.from(new Set(effects));
}

export function isEffectAllowedAtQuality(effect: ThemePostEffect, fxQuality: FxQualityLevel): boolean {
  const requiredTier = FX_EFFECT_GATING_MATRIX[effect];
  return fxQuality >= QUALITY_RANK[requiredTier];
}

export function resolveThemePostFxStack(input: {
  themeId: ThemeMode;
  fxQuality: FxQualityLevel;
  reducedMotion: boolean;
  motionMode: MotionMode;
  baselineFxOnly?: boolean;
}): ThemePostFxStack {
  const baseline: BaselinePostFx[] = ['Vignette', 'Noise'];
  const profileEffects = THEME_EFFECT_PROFILES[input.themeId];
  if (input.baselineFxOnly) {
    return {
      baseline,
      enabled: [],
      medium: [],
      heavy: [],
    };
  }

  const qualityFiltered = profileEffects.filter((effect) =>
    isEffectAllowedAtQuality(effect, input.fxQuality),
  );
  const reduced = input.reducedMotion || input.motionMode !== 'full';

  const enabled = uniqueEffects(
    qualityFiltered.filter((effect) => {
      if (!reduced) return true;
      if (HEAVY_EFFECTS.has(effect)) return false;
      if (effect === 'ChromaticAberration') return false;
      return true;
    }),
  );

  return {
    baseline,
    enabled,
    medium: enabled.filter((effect) => MEDIUM_EFFECTS.has(effect)),
    heavy: enabled.filter((effect) => HEAVY_EFFECTS.has(effect)),
  };
}
