import {
  DEFAULT_THEME_MODE,
  THEME_PRESET_LIST,
  isThemeMode,
  type ThemeMode,
} from './presets';
import type { FxQualityLevel } from './runtimeContracts';

const ROLLOUT_THEMES_STORAGE_KEY = 'baiye_theme_rollout_enabled_themes';
const ROLLOUT_MAX_FX_STORAGE_KEY = 'baiye_theme_rollout_max_fx_quality';
const ROLLOUT_BASELINE_FX_STORAGE_KEY = 'baiye_theme_baseline_fx_only';
const ROLLOUT_CHANGE_EVENT = 'theme-rollout-change';

const ALL_THEME_IDS = THEME_PRESET_LIST.map((preset) => preset.id);

export interface ThemeRolloutConfig {
  enabledThemes: ThemeMode[];
  maxFxQuality: FxQualityLevel;
  baselineFxOnly: boolean;
}

export interface ThemeRolloutRuntime {
  themeId: ThemeMode;
  fxQuality: FxQualityLevel;
  maxFxQuality: FxQualityLevel;
  baselineFxOnly: boolean;
  themeBlocked: boolean;
}

interface ResolveThemeRolloutRuntimeInput {
  themeId: ThemeMode;
  fxQuality: number;
  config?: ThemeRolloutConfig;
}

function clampFxQuality(value: number): FxQualityLevel {
  if (!Number.isFinite(value)) return 0;
  return Math.round(Math.min(3, Math.max(0, value))) as FxQualityLevel;
}

function parseBooleanFlag(value: string | null | undefined, fallback = false): boolean {
  if (value == null) return fallback;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return fallback;
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

function parseThemeList(value: string | null | undefined): ThemeMode[] {
  if (value == null) return [...ALL_THEME_IDS];
  const normalized = value.trim();
  if (!normalized) return [DEFAULT_THEME_MODE];

  if (normalized === '*') {
    return [...ALL_THEME_IDS];
  }

  const themes = normalized
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry): entry is ThemeMode => isThemeMode(entry));

  const uniqueThemes = Array.from(new Set(themes));
  if (uniqueThemes.length === 0) return [DEFAULT_THEME_MODE];
  return uniqueThemes;
}

function readStorageValue(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorageValue(key: string, value: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // ignored intentionally
  }
}

function getFallbackTheme(enabledThemes: ThemeMode[]): ThemeMode {
  if (enabledThemes.includes(DEFAULT_THEME_MODE)) return DEFAULT_THEME_MODE;
  if (enabledThemes.length > 0) return enabledThemes[0]!;
  return DEFAULT_THEME_MODE;
}

export function readThemeRolloutConfig(): ThemeRolloutConfig {
  const envThemes = import.meta.env.VITE_THEME_ROLLOUT_ENABLED_THEMES as string | undefined;
  const envMaxFx = import.meta.env.VITE_THEME_ROLLOUT_MAX_FX_QUALITY as string | undefined;
  const envBaseline = import.meta.env.VITE_THEME_BASELINE_FX_ONLY as string | undefined;

  const localThemes = readStorageValue(ROLLOUT_THEMES_STORAGE_KEY);
  const localMaxFx = readStorageValue(ROLLOUT_MAX_FX_STORAGE_KEY);
  const localBaseline = readStorageValue(ROLLOUT_BASELINE_FX_STORAGE_KEY);

  return {
    enabledThemes: parseThemeList(localThemes ?? envThemes),
    maxFxQuality: clampFxQuality(Number(localMaxFx ?? envMaxFx ?? 3)),
    baselineFxOnly: parseBooleanFlag(localBaseline ?? envBaseline, false),
  };
}

export function resolveThemeRolloutRuntime(
  input: ResolveThemeRolloutRuntimeInput,
): ThemeRolloutRuntime {
  const config = input.config ?? readThemeRolloutConfig();
  const allowedThemes = new Set(config.enabledThemes);
  const themeBlocked = !allowedThemes.has(input.themeId);
  const themeId = themeBlocked ? getFallbackTheme(config.enabledThemes) : input.themeId;
  const requestedFxQuality = clampFxQuality(input.fxQuality);

  return {
    themeId,
    fxQuality: Math.min(requestedFxQuality, config.maxFxQuality) as FxQualityLevel,
    maxFxQuality: config.maxFxQuality,
    baselineFxOnly: config.baselineFxOnly,
    themeBlocked,
  };
}

function emitRolloutChangeEvent(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ROLLOUT_CHANGE_EVENT));
}

export function subscribeThemeRolloutChanges(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (!event.key) return;
    if (
      event.key === ROLLOUT_THEMES_STORAGE_KEY
      || event.key === ROLLOUT_MAX_FX_STORAGE_KEY
      || event.key === ROLLOUT_BASELINE_FX_STORAGE_KEY
    ) {
      onChange();
    }
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(ROLLOUT_CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(ROLLOUT_CHANGE_EVENT, onChange);
  };
}

export function setRuntimeBaselineFxOnly(enabled: boolean): void {
  writeStorageValue(ROLLOUT_BASELINE_FX_STORAGE_KEY, enabled ? '1' : '0');
  emitRolloutChangeEvent();
}

export function setRuntimeMaxFxQuality(level: FxQualityLevel): void {
  writeStorageValue(ROLLOUT_MAX_FX_STORAGE_KEY, String(clampFxQuality(level)));
  emitRolloutChangeEvent();
}

export function setRuntimeEnabledThemes(themes: ThemeMode[] | '*'): void {
  const value = themes === '*' ? '*' : themes.join(',');
  writeStorageValue(ROLLOUT_THEMES_STORAGE_KEY, value);
  emitRolloutChangeEvent();
}

export function clearRuntimeRolloutOverrides(): void {
  writeStorageValue(ROLLOUT_THEMES_STORAGE_KEY, null);
  writeStorageValue(ROLLOUT_MAX_FX_STORAGE_KEY, null);
  writeStorageValue(ROLLOUT_BASELINE_FX_STORAGE_KEY, null);
  emitRolloutChangeEvent();
}

export const THEME_ROLLOUT_STORAGE_KEYS = {
  enabledThemes: ROLLOUT_THEMES_STORAGE_KEY,
  maxFxQuality: ROLLOUT_MAX_FX_STORAGE_KEY,
  baselineFxOnly: ROLLOUT_BASELINE_FX_STORAGE_KEY,
} as const;
