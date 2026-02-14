import { getThemeVisualSpec, type ThemeMode } from './presets';
import { THEME_VISUAL_SPEC_LIST } from './tokens';

export type FxQualityLevel = 0 | 1 | 2 | 3;
export const FX_QUALITY_LABELS = ['off', 'low', 'medium', 'high'] as const;
export type FxQualityLabel = (typeof FX_QUALITY_LABELS)[number];

export type MotionMode = 'full' | 'toned-down' | 'off';

export interface ThemeRuntimeConfig {
  themeId: ThemeMode;
  fxQuality: FxQualityLevel;
  motionMode: MotionMode;
  reducedMotion: boolean;
  interactionIntensity: number;
}

export type ThemeRuntimeConfigInput = Omit<ThemeRuntimeConfig, 'fxQuality' | 'interactionIntensity'> & {
  fxQuality: number;
  interactionIntensity: number;
};

export type ThemePostEffect =
  | 'Scanline'
  | 'Grid'
  | 'DotScreen'
  | 'Noise'
  | 'ChromaticAberration'
  | 'Glitch'
  | 'GodRays'
  | 'Bloom';

export const FX_EFFECT_GATING_MATRIX: Record<ThemePostEffect, FxQualityLabel> = {
  Scanline: 'medium',
  Grid: 'medium',
  DotScreen: 'medium',
  Noise: 'off',
  ChromaticAberration: 'medium',
  Glitch: 'high',
  GodRays: 'high',
  Bloom: 'high',
};

export type MotionPolicyAction = 'allow' | 'tone-down' | 'disable';

export interface MotionPolicyRule {
  category: string;
  full: MotionPolicyAction;
  tonedDown: MotionPolicyAction;
  reduced: MotionPolicyAction;
  fancyFx: boolean;
  notes: string;
}

export const MOTION_POLICY_TABLE: MotionPolicyRule[] = [
  {
    category: 'background-large-drift',
    full: 'allow',
    tonedDown: 'tone-down',
    reduced: 'disable',
    fancyFx: true,
    notes: 'Large scene drift and parallax should be disabled in reduced mode.',
  },
  {
    category: 'camera-shake-impact',
    full: 'allow',
    tonedDown: 'disable',
    reduced: 'disable',
    fancyFx: true,
    notes: 'Replace screen shake with localized component feedback.',
  },
  {
    category: 'high-frequency-flicker',
    full: 'allow',
    tonedDown: 'disable',
    reduced: 'disable',
    fancyFx: true,
    notes: 'Frequent flicker is always blocked outside full mode.',
  },
  {
    category: 'event-glitch-burst',
    full: 'allow',
    tonedDown: 'tone-down',
    reduced: 'disable',
    fancyFx: true,
    notes: 'Glitch remains event-based and is disabled under reduced motion.',
  },
  {
    category: 'rare-lightning-flash',
    full: 'allow',
    tonedDown: 'tone-down',
    reduced: 'disable',
    fancyFx: true,
    notes: 'Any flash effect must be off for reduced motion.',
  },
  {
    category: 'ambient-particles',
    full: 'allow',
    tonedDown: 'tone-down',
    reduced: 'disable',
    fancyFx: true,
    notes: 'Particle systems stay sparse and are disabled in reduced mode.',
  },
  {
    category: 'control-hover-micro',
    full: 'allow',
    tonedDown: 'tone-down',
    reduced: 'tone-down',
    fancyFx: false,
    notes: 'Micro hover feedback may remain but with reduced amplitude.',
  },
  {
    category: 'control-press-feedback',
    full: 'allow',
    tonedDown: 'allow',
    reduced: 'tone-down',
    fancyFx: false,
    notes: 'Press confirmation remains available for usability.',
  },
];

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function normalizeFxQuality(value: number): FxQualityLevel {
  return Math.round(clampNumber(value, 0, 3)) as FxQualityLevel;
}

function resolveMotionMode(motionMode: MotionMode, reducedMotion: boolean): MotionMode {
  if (motionMode === 'off') return 'off';
  if (reducedMotion && motionMode === 'full') return 'toned-down';
  return motionMode;
}

function resolveInteractionIntensity(motionMode: MotionMode, reducedMotion: boolean, rawIntensity: number): number {
  const clamped = clampNumber(rawIntensity, 0, 1);
  if (motionMode === 'off') return 0;
  if (reducedMotion) return Math.min(clamped, 0.4);
  if (motionMode === 'toned-down') return Math.min(clamped, 0.6);
  return clamped;
}

export function resolveThemeRuntimeConfig(input: ThemeRuntimeConfigInput): ThemeRuntimeConfig {
  const motionMode = resolveMotionMode(input.motionMode, input.reducedMotion);
  return {
    themeId: input.themeId,
    fxQuality: normalizeFxQuality(input.fxQuality),
    motionMode,
    reducedMotion: input.reducedMotion,
    interactionIntensity: resolveInteractionIntensity(motionMode, input.reducedMotion, input.interactionIntensity),
  };
}

export function getDefaultThemeRuntimeConfig(themeId: ThemeMode): ThemeRuntimeConfig {
  const spec = getThemeVisualSpec(themeId);
  return resolveThemeRuntimeConfig({
    themeId,
    fxQuality: spec.capabilities.fxQuality,
    motionMode: spec.capabilities.hasAnimatedBackground ? 'full' : 'toned-down',
    reducedMotion: false,
    interactionIntensity: spec.capabilities.hasAnimatedBackground ? 0.85 : 0.35,
  });
}

export const THEME_RUNTIME_DEFAULTS: Record<ThemeMode, ThemeRuntimeConfig> =
  THEME_VISUAL_SPEC_LIST.reduce<Record<ThemeMode, ThemeRuntimeConfig>>((accumulator, spec) => {
    accumulator[spec.id] = getDefaultThemeRuntimeConfig(spec.id);
    return accumulator;
  }, {} as Record<ThemeMode, ThemeRuntimeConfig>);
