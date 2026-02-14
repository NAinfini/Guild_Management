import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CssBaseline,
  FormControlLabel,
  GlobalStyles,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  StyledEngineProvider,
  ThemeProvider as MuiThemeProvider,
  Typography,
} from '@mui/material';
import { alpha, createTheme, ThemeOptions } from '@mui/material/styles';
import {
  Architecture,
  HorizontalRule,
  LocalFireDepartment,
  Memory,
  Mood,
  Palette,
  PrecisionManufacturing,
  WorkspacePremium,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store';
import { themePreferencesAPI } from '@/lib/api/themePreferences';
import {
  getThemeColorPalette,
  getThemeColorTokens,
  THEME_COLOR_PRESET_LIST,
  GAME_CLASS_COLORS,
  DEFAULT_THEME_COLOR,
  isThemeColor,
  type ThemeColor,
} from './colors';
import {
  getThemeOptions,
  getThemeVisualSpec,
  THEME_PRESET_LIST,
  DEFAULT_THEME_MODE,
  isThemeMode,
  type ThemeMode,
} from './presets';
import {
  resolveThemeRuntimeConfig,
  type MotionMode,
} from './runtimeContracts';
import {
  resolveThemeRolloutRuntime,
  subscribeThemeRolloutChanges,
} from './rollout';
import './theme.css';
import './colors/color-tokens.css';
import './presets/index.css';
import './accessibility-enhancements.css';

export type { ThemeMode, ThemeColor };

// ============================================================================
// Theme Preferences Type
// ============================================================================

export interface ThemePreferences {
  theme: ThemeMode;
  color: ThemeColor;
  fontScale: number;
  motionIntensity: number;
}

export type ColorBlindMode = 'off' | 'protanopia' | 'deuteranopia' | 'tritanopia';

interface ThemeAccessibilityPreferences {
  highContrast: boolean;
  dyslexiaFriendly: boolean;
  colorBlindMode: ColorBlindMode;
}

// ============================================================================
// Theme Engine - Pure Utility Functions (No React Dependencies)
// ============================================================================

const STORAGE_KEY_THEME = 'baiye_theme';
const STORAGE_KEY_COLOR = 'baiye_theme_color';
const STORAGE_KEY_FONT_SCALE = 'baiye_theme_font_scale';
const STORAGE_KEY_MOTION_INTENSITY = 'baiye_theme_motion_intensity';
const STORAGE_KEY_MOTION_MODE = 'baiye_theme_motion_mode';
const STORAGE_KEY_HIGH_CONTRAST = 'baiye_theme_high_contrast';
const STORAGE_KEY_DYSLEXIA_FRIENDLY = 'baiye_theme_dyslexia_friendly';
const STORAGE_KEY_COLOR_BLIND_MODE = 'baiye_theme_color_blind_mode';
const DEFAULT_FONT_SCALE = 1;
const DEFAULT_MOTION_INTENSITY = 1;
const DEFAULT_MOTION_MODE: MotionMode = 'full';
const DEFAULT_COLOR_BLIND_MODE: ColorBlindMode = 'off';
const MIN_FONT_SCALE = 0.9;
const MAX_FONT_SCALE = 1.25;
const MIN_MOTION_INTENSITY = 0;
const MAX_MOTION_INTENSITY = 1.5;
const MOTION_MODE_VALUES: MotionMode[] = ['full', 'toned-down', 'off'];
const COLOR_BLIND_MODE_VALUES: ColorBlindMode[] = ['off', 'protanopia', 'deuteranopia', 'tritanopia'];
const THEME_TRANSITION_DURATION_MS = 520;

function isHttpNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const status = (error as { status?: unknown }).status;
  return status === 404;
}

function resolveTheme(theme: string | null): ThemeMode {
  const candidate = (() => {
    if (!theme) return DEFAULT_THEME_MODE;
    return isThemeMode(theme) ? theme : DEFAULT_THEME_MODE;
  })();

  return resolveThemeRolloutRuntime({
    themeId: candidate,
    fxQuality: getThemeVisualSpec(candidate).capabilities.fxQuality,
  }).themeId;
}

function resolveColor(color: string | null, theme: ThemeMode): ThemeColor {
  if (color && isThemeColor(color)) return color;
  return getThemeVisualSpec(theme).defaultColor ?? DEFAULT_THEME_COLOR;
}

function isMotionMode(value: string | null): value is MotionMode {
  return typeof value === 'string' && MOTION_MODE_VALUES.includes(value as MotionMode);
}

function resolveMotionMode(value: string | null): MotionMode {
  if (!value) return DEFAULT_MOTION_MODE;
  return isMotionMode(value) ? value : DEFAULT_MOTION_MODE;
}

function isColorBlindMode(value: string | null): value is ColorBlindMode {
  return typeof value === 'string' && COLOR_BLIND_MODE_VALUES.includes(value as ColorBlindMode);
}

function resolveColorBlindMode(value: string | null): ColorBlindMode {
  if (!value) return DEFAULT_COLOR_BLIND_MODE;
  return isColorBlindMode(value) ? value : DEFAULT_COLOR_BLIND_MODE;
}

function prefersReducedMotionByMediaQuery(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function resolveBooleanPreference(rawValue: string | null, fallback = false): boolean {
  if (rawValue === null) return fallback;
  return rawValue === 'true';
}

function serializePreferences(preferences: ThemePreferences): string {
  return [
    preferences.theme,
    preferences.color,
    preferences.fontScale.toFixed(3),
    preferences.motionIntensity.toFixed(3),
  ].join('|');
}

interface ResolvedMotionRuntime {
  effectiveMotionMode: MotionMode;
  reducedMotion: boolean;
  interactionIntensity: number;
}

function resolveMotionRuntime(
  theme: ThemeMode,
  motionMode: MotionMode,
  motionIntensity: number,
  systemReducedMotion: boolean,
): ResolvedMotionRuntime {
  const themeFxQuality = getThemeVisualSpec(theme).capabilities.fxQuality;
  const runtime = resolveThemeRuntimeConfig({
    themeId: theme,
    fxQuality: themeFxQuality,
    motionMode,
    reducedMotion: systemReducedMotion,
    interactionIntensity: motionIntensity,
  });

  return {
    effectiveMotionMode: runtime.motionMode,
    reducedMotion: systemReducedMotion || runtime.motionMode !== 'full',
    interactionIntensity: runtime.interactionIntensity,
  };
}

function resolveNumericPreference(
  rawValue: string | null,
  fallback: number,
  min: number,
  max: number,
): number {
  if (rawValue === null) return fallback;
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) return fallback;
  return clamp(parsed, min, max);
}

function toRgbChannels(color: string): string {
  const normalized = color.trim();

  const rgbMatch = normalized.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbMatch?.[1]) {
    const [r = '99', g = '102', b = '241'] = rgbMatch[1]
      .split(',')
      .slice(0, 3)
      .map((value) => value.trim());
    return `${r}, ${g}, ${b}`;
  }

  let hex = normalized.replace('#', '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => `${char}${char}`)
      .join('');
  }

  if (hex.length === 8) {
    hex = hex.slice(0, 6);
  }

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return '99, 102, 241';
  }

  const value = parseInt(hex, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `${r}, ${g}, ${b}`;
}

function parseTimeToMs(value: string, fallback: number): number {
  const normalized = value.trim();
  if (!normalized) return fallback;
  if (normalized.endsWith('ms')) {
    const parsed = Number(normalized.replace('ms', '').trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  if (normalized.endsWith('s')) {
    const parsed = Number(normalized.replace('s', '').trim());
    return Number.isFinite(parsed) ? parsed * 1000 : fallback;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseLengthPx(value: string, fallback: number): number {
  const normalized = value.trim();
  if (!normalized) return fallback;
  if (normalized.endsWith('px')) {
    const parsed = Number(normalized.replace('px', '').trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveDurationScale(intensity: number): number {
  if (intensity <= 0) return 0;
  if (intensity > 1) {
    return Math.max(0.75, 1 - (intensity - 1) * 0.5);
  }
  return Math.min(1.2, 1 + (1 - intensity) * 0.2);
}

function applyMotionScaleTokens(root: HTMLElement, intensity: number): void {
  const computed = window.getComputedStyle(root);
  const fastMs = parseTimeToMs(computed.getPropertyValue('--theme-motion-fast'), 150);
  const mediumMs = parseTimeToMs(computed.getPropertyValue('--theme-motion-medium'), 220);
  const slowMs = parseTimeToMs(computed.getPropertyValue('--theme-motion-slow'), 300);
  const hoverLift = parseLengthPx(computed.getPropertyValue('--theme-motion-hover-lift'), -1);
  const cardLift = parseLengthPx(computed.getPropertyValue('--theme-motion-card-lift'), -1);
  const inputLift = parseLengthPx(computed.getPropertyValue('--theme-motion-input-lift'), -0.5);
  const pressY = parseLengthPx(computed.getPropertyValue('--theme-motion-press-y'), 1);
  const pressScaleRaw = Number(computed.getPropertyValue('--theme-motion-press-scale').trim());
  const basePressScale = Number.isFinite(pressScaleRaw) ? pressScaleRaw : 0.985;
  const durationScale = resolveDurationScale(intensity);

  root.style.setProperty('--theme-motion-fast-effective', `${Math.max(0, fastMs * durationScale).toFixed(0)}ms`);
  root.style.setProperty('--theme-motion-medium-effective', `${Math.max(0, mediumMs * durationScale).toFixed(0)}ms`);
  root.style.setProperty('--theme-motion-slow-effective', `${Math.max(0, slowMs * durationScale).toFixed(0)}ms`);
  root.style.setProperty('--theme-motion-hover-lift-effective', `${(hoverLift * intensity).toFixed(3)}px`);
  root.style.setProperty('--theme-motion-card-lift-effective', `${(cardLift * intensity).toFixed(3)}px`);
  root.style.setProperty('--theme-motion-input-lift-effective', `${(inputLift * intensity).toFixed(3)}px`);
  root.style.setProperty('--theme-motion-press-y-effective', `${(pressY * intensity).toFixed(3)}px`);

  const pressDelta = 1 - basePressScale;
  const effectivePressScale = 1 - pressDelta * intensity;
  root.style.setProperty('--theme-motion-press-scale-effective', `${effectivePressScale.toFixed(4)}`);
}

function applyThemeToDom({ theme, color }: ThemePreferences): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themeMode = isLightColorTheme(color) ? 'light' : 'dark';
  document.documentElement.dataset.themeColor = color;
}

function applyMotionStateToDom(
  motionMode: MotionMode,
  effectiveMotionMode: MotionMode,
  reducedMotion: boolean,
): void {
  const root = document.documentElement;
  root.setAttribute('data-motion-preference', motionMode);
  root.setAttribute('data-motion-mode', effectiveMotionMode);
  root.setAttribute('data-reduced-motion', String(reducedMotion));
}

function applyAccessibilityStateToDom(preferences: ThemeAccessibilityPreferences): void {
  const root = document.documentElement;
  root.setAttribute('data-high-contrast', String(preferences.highContrast));
  root.setAttribute('data-dyslexia-friendly', String(preferences.dyslexiaFriendly));
  root.setAttribute('data-color-blind-mode', preferences.colorBlindMode);
}

function persistThemePreferences({ theme, color, fontScale, motionIntensity }: ThemePreferences): void {
  localStorage.setItem(STORAGE_KEY_THEME, theme);
  localStorage.setItem(STORAGE_KEY_COLOR, color);
  localStorage.setItem(STORAGE_KEY_FONT_SCALE, String(fontScale));
  localStorage.setItem(STORAGE_KEY_MOTION_INTENSITY, String(motionIntensity));
}

function persistMotionMode(mode: MotionMode): void {
  localStorage.setItem(STORAGE_KEY_MOTION_MODE, mode);
}

function readAccessibilityPreferences(): ThemeAccessibilityPreferences {
  return {
    highContrast: resolveBooleanPreference(localStorage.getItem(STORAGE_KEY_HIGH_CONTRAST)),
    dyslexiaFriendly: resolveBooleanPreference(localStorage.getItem(STORAGE_KEY_DYSLEXIA_FRIENDLY)),
    colorBlindMode: resolveColorBlindMode(localStorage.getItem(STORAGE_KEY_COLOR_BLIND_MODE)),
  };
}

function persistAccessibilityPreferences(preferences: ThemeAccessibilityPreferences): void {
  localStorage.setItem(STORAGE_KEY_HIGH_CONTRAST, String(preferences.highContrast));
  localStorage.setItem(STORAGE_KEY_DYSLEXIA_FRIENDLY, String(preferences.dyslexiaFriendly));
  localStorage.setItem(STORAGE_KEY_COLOR_BLIND_MODE, preferences.colorBlindMode);
}

function resolveColorBlindTokenOverrides(mode: ColorBlindMode): {
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
} | null {
  switch (mode) {
    case 'protanopia':
      return {
        accent: '#0072B2',
        success: '#0072B2',
        warning: '#E69F00',
        error: '#D55E00',
        info: '#56B4E9',
      };
    case 'deuteranopia':
      return {
        accent: '#1F77B4',
        success: '#1F77B4',
        warning: '#F28E2B',
        error: '#E15759',
        info: '#4E79A7',
      };
    case 'tritanopia':
      return {
        accent: '#8E44AD',
        success: '#2E86AB',
        warning: '#FF9F1C',
        error: '#D7263D',
        info: '#3A86FF',
      };
    case 'off':
    default:
      return null;
  }
}

function readThemePreferences(): ThemePreferences {
  const theme = resolveTheme(localStorage.getItem(STORAGE_KEY_THEME));
  const color = resolveColor(localStorage.getItem(STORAGE_KEY_COLOR), theme);
  const fontScale = resolveNumericPreference(
    localStorage.getItem(STORAGE_KEY_FONT_SCALE),
    DEFAULT_FONT_SCALE,
    MIN_FONT_SCALE,
    MAX_FONT_SCALE,
  );
  const motionIntensity = resolveNumericPreference(
    localStorage.getItem(STORAGE_KEY_MOTION_INTENSITY),
    DEFAULT_MOTION_INTENSITY,
    MIN_MOTION_INTENSITY,
    MAX_MOTION_INTENSITY,
  );

  return { theme, color, fontScale, motionIntensity };
}

function readStoredMotionMode(): MotionMode {
  return resolveMotionMode(localStorage.getItem(STORAGE_KEY_MOTION_MODE));
}

/**
 * Initialize theme preferences from localStorage or defaults.
 * Call this once on app boot
 */
export function initTheme(): ThemeMode {
  return initThemePreferences().theme;
}

export function initThemePreferences(): ThemePreferences {
  try {
    const preferences = readThemePreferences();
    const motionMode = readStoredMotionMode();
    const accessibilityPreferences = readAccessibilityPreferences();
    const motionRuntime = resolveMotionRuntime(
      preferences.theme,
      motionMode,
      preferences.motionIntensity,
      prefersReducedMotionByMediaQuery(),
    );
    persistThemePreferences(preferences);
    persistMotionMode(motionMode);
    persistAccessibilityPreferences(accessibilityPreferences);
    applyThemeToDom(preferences);
    applyMotionStateToDom(
      motionMode,
      motionRuntime.effectiveMotionMode,
      motionRuntime.reducedMotion,
    );
    applyAccessibilityStateToDom(accessibilityPreferences);
    return preferences;
  } catch (error) {
    console.error('Failed to init theme:', error);
    const fallback = {
      theme: DEFAULT_THEME_MODE,
      color: DEFAULT_THEME_COLOR,
      fontScale: DEFAULT_FONT_SCALE,
      motionIntensity: DEFAULT_MOTION_INTENSITY,
    } satisfies ThemePreferences;
    const motionRuntime = resolveMotionRuntime(
      fallback.theme,
      DEFAULT_MOTION_MODE,
      fallback.motionIntensity,
      prefersReducedMotionByMediaQuery(),
    );
    applyThemeToDom(fallback);
    applyMotionStateToDom(
      DEFAULT_MOTION_MODE,
      motionRuntime.effectiveMotionMode,
      motionRuntime.reducedMotion,
    );
    applyAccessibilityStateToDom({
      highContrast: false,
      dyslexiaFriendly: false,
      colorBlindMode: DEFAULT_COLOR_BLIND_MODE,
    });
    return fallback;
  }
}

/**
 * Change theme and persist to localStorage
 */
export function setTheme(theme: ThemeMode): void {
  const current = getThemePreferences();
  setThemePreferences({
    theme,
    color: current.color,
    fontScale: current.fontScale,
    motionIntensity: current.motionIntensity,
  });
}

export function setThemeColor(color: ThemeColor): void {
  const current = getThemePreferences();
  setThemePreferences({
    theme: current.theme,
    color,
    fontScale: current.fontScale,
    motionIntensity: current.motionIntensity,
  });
}

export function setThemePreferences(preferences: Pick<ThemePreferences, 'theme' | 'color'> & Partial<Pick<ThemePreferences, 'fontScale' | 'motionIntensity'>>): void {
  try {
    const resolvedTheme = resolveTheme(preferences.theme);
    const resolvedColor = resolveColor(preferences.color, resolvedTheme);
    const current = readThemePreferences();
    const resolved = {
      theme: resolvedTheme,
      color: resolvedColor,
      fontScale: clamp(preferences.fontScale ?? current.fontScale, MIN_FONT_SCALE, MAX_FONT_SCALE),
      motionIntensity: clamp(preferences.motionIntensity ?? current.motionIntensity, MIN_MOTION_INTENSITY, MAX_MOTION_INTENSITY),
    } satisfies ThemePreferences;
    applyThemeToDom(resolved);
    persistThemePreferences(resolved);

    window.dispatchEvent(
      new CustomEvent('theme-change', { detail: resolved })
    );
  } catch (error) {
    console.error('Failed to set theme:', error);
  }
}

/**
 * Get current theme preferences
 */
export function getTheme(): ThemeMode {
  return getThemePreferences().theme;
}

export function getThemeColor(): ThemeColor {
  return getThemePreferences().color;
}

export function getThemePreferences(): ThemePreferences {
  try {
    const currentTheme = resolveTheme(
      document.documentElement.dataset.theme ?? localStorage.getItem(STORAGE_KEY_THEME)
    );
    const currentColor = resolveColor(
      document.documentElement.dataset.themeColor ?? localStorage.getItem(STORAGE_KEY_COLOR),
      currentTheme
    );
    const currentFontScale = resolveNumericPreference(
      localStorage.getItem(STORAGE_KEY_FONT_SCALE),
      DEFAULT_FONT_SCALE,
      MIN_FONT_SCALE,
      MAX_FONT_SCALE,
    );
    const currentMotionIntensity = resolveNumericPreference(
      localStorage.getItem(STORAGE_KEY_MOTION_INTENSITY),
      DEFAULT_MOTION_INTENSITY,
      MIN_MOTION_INTENSITY,
      MAX_MOTION_INTENSITY,
    );

    return {
      theme: currentTheme,
      color: currentColor,
      fontScale: currentFontScale,
      motionIntensity: currentMotionIntensity,
    };
  } catch (error) {
    console.error('Failed to get theme:', error);
    return {
      theme: DEFAULT_THEME_MODE,
      color: DEFAULT_THEME_COLOR,
      fontScale: DEFAULT_FONT_SCALE,
      motionIntensity: DEFAULT_MOTION_INTENSITY,
    };
  }
}

/**
 * Listen to theme changes
 */
export function onThemeChange(callback: (preferences: ThemePreferences) => void): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<ThemePreferences>;
    callback(customEvent.detail);
  };

  window.addEventListener('theme-change', handler);

  return () => {
    window.removeEventListener('theme-change', handler);
  };
}

// ============================================================================
// React Components & Theme Provider
// ============================================================================

interface ThemeContextType {
  currentTheme: ThemeMode;
  currentColor: ThemeColor;
  fontScale: number;
  motionIntensity: number;
  motionMode: MotionMode;
  effectiveMotionMode: MotionMode;
  reducedMotion: boolean;
  highContrast: boolean;
  dyslexiaFriendly: boolean;
  colorBlindMode: ColorBlindMode;
  setTheme: (theme: ThemeMode) => void;
  setColor: (color: ThemeColor) => void;
  setFontScale: (scale: number) => void;
  setMotionIntensity: (intensity: number) => void;
  setMotionMode: (mode: MotionMode) => void;
  setHighContrast: (enabled: boolean) => void;
  setDyslexiaFriendly: (enabled: boolean) => void;
  setColorBlindMode: (mode: ColorBlindMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LIGHT_COLOR_THEMES = new Set<ThemeColor>([
  'default-violet',
  'chinese-ink',
  'soft-pink',
]);

function isLightColorTheme(color: ThemeColor): boolean {
  return LIGHT_COLOR_THEMES.has(color);
}

export const useThemeController = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeController must be used within a ThemeControllerProvider');
  }
  return context;
};

interface ThemeControllerProps {
  children: React.ReactNode;
}

const GlobalScrollbar = () => (
  <GlobalStyles
    styles={(theme) => ({
      body: {
        backgroundColor: 'var(--color-bg-primary) !important',
        color: 'var(--color-text-primary)',
        backgroundImage: 'var(--theme-bg-pattern)',
        backgroundSize: 'var(--theme-bg-size)',
        backgroundAttachment: 'fixed',
      },
      '*::-webkit-scrollbar': {
        width: '6px',
        height: '6px',
      },
      '*::-webkit-scrollbar-track': {
        background: theme.palette.mode === 'dark' ? '#0a0a0a' : '#f5f5f5',
      },
      '*::-webkit-scrollbar-thumb': {
        backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
        borderRadius: '3px',
        '&:hover': {
          backgroundColor: theme.palette.primary.main,
        },
      },
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: `${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'} transparent`,
      },
      '.MuiButtonBase-root, .MuiChip-root, .MuiToggleButton-root': {
        position: 'relative',
      },
      '.MuiButtonBase-root:hover, .MuiChip-root:hover, .MuiToggleButton-root:hover': {
        zIndex: 2,
      },
      '.MuiMenu-paper, .MuiPopover-paper, .MuiAutocomplete-paper': {
        backgroundColor: theme.palette.background.paper,
        backgroundImage: 'none',
        backdropFilter: 'none',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[8],
      },
      '.MuiMenuItem-root.Mui-selected': {
        backgroundColor: alpha(theme.palette.primary.main, 0.16),
        color: theme.palette.text.primary,
      },
      '.MuiMenuItem-root.Mui-selected:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.22),
      },
      '.MuiMenuItem-root .MuiListItemText-secondary': {
        color: theme.palette.text.secondary,
        opacity: 0.9,
      },
      '.MuiButton-root:focus-visible, .MuiIconButton-root:focus-visible, .MuiMenuItem-root:focus-visible, .MuiListItemButton-root:focus-visible': {
        outline: 'var(--interaction-focus-ring-width, 2px) solid var(--interaction-focus-ring-color, var(--sys-interactive-focus-ring))',
        outlineOffset: '2px',
        boxShadow: 'var(--interaction-focus-ring-glow, none)',
      },
    })}
  />
);

function applyColorPalette(themeOptions: ThemeOptions, color: ThemeColor): ThemeOptions {
  const paletteSpec = getThemeColorPalette(color);
  const mode = isLightColorTheme(color) ? 'light' : 'dark';
  const focusRing = alpha(paletteSpec.primary.main, mode === 'dark' ? 0.72 : 0.64);
  const interactiveHover = alpha(paletteSpec.primary.main, mode === 'dark' ? 0.22 : 0.16);
  const interactiveActive = alpha(paletteSpec.primary.main, mode === 'dark' ? 0.3 : 0.22);
  const cardShadow = mode === 'dark'
    ? '0 16px 36px rgba(0, 0, 0, 0.45)'
    : '0 10px 26px rgba(15, 23, 42, 0.12)';
  const dialogShadow = mode === 'dark'
    ? '0 28px 70px rgba(0, 0, 0, 0.62)'
    : '0 20px 52px rgba(15, 23, 42, 0.2)';
  const scrim = alpha(mode === 'dark' ? paletteSpec.background.default : paletteSpec.text.primary, mode === 'dark' ? 0.66 : 0.5);
  const overlay = alpha(mode === 'dark' ? paletteSpec.background.default : paletteSpec.text.primary, mode === 'dark' ? 0.58 : 0.42);
  const overlayHover = alpha(mode === 'dark' ? paletteSpec.background.default : paletteSpec.text.primary, mode === 'dark' ? 0.7 : 0.54);
  const segmentedBg = alpha(paletteSpec.background.paper, mode === 'dark' ? 0.74 : 0.9);
  const segmentedBorder = alpha(paletteSpec.divider, mode === 'dark' ? 0.84 : 0.68);
  const segmentedText = paletteSpec.text.secondary;
  const segmentedSelectedBg = alpha(paletteSpec.primary.main, mode === 'dark' ? 0.3 : 0.2);
  const segmentedSelectedText = paletteSpec.text.primary;
  const panelBg = alpha(paletteSpec.background.paper, mode === 'dark' ? 0.72 : 0.94);
  const panelHeaderBg = alpha(paletteSpec.background.secondary, mode === 'dark' ? 0.7 : 0.9);
  const panelBorder = alpha(paletteSpec.divider, mode === 'dark' ? 0.88 : 0.7);
  const panelDropTargetBg = alpha(paletteSpec.primary.main, mode === 'dark' ? 0.22 : 0.12);
  const panelDropTargetBorder = alpha(paletteSpec.primary.main, mode === 'dark' ? 0.84 : 0.68);
  const panelControlBg = alpha(paletteSpec.background.default, mode === 'dark' ? 0.66 : 0.82);
  const components = themeOptions.components ?? {};
  const muiButton = (components as any).MuiButton ?? {};
  const muiButtonStyleOverrides = muiButton.styleOverrides ?? {};
  const muiIconButton = (components as any).MuiIconButton ?? {};
  const muiIconButtonStyleOverrides = muiIconButton.styleOverrides ?? {};
  const muiInputBase = (components as any).MuiInputBase ?? {};
  const muiInputBaseStyleOverrides = muiInputBase.styleOverrides ?? {};
  const muiOutlinedInput = (components as any).MuiOutlinedInput ?? {};
  const muiOutlinedInputStyleOverrides = muiOutlinedInput.styleOverrides ?? {};
  const muiFilledInput = (components as any).MuiFilledInput ?? {};
  const muiFilledInputStyleOverrides = muiFilledInput.styleOverrides ?? {};
  const muiInputLabel = (components as any).MuiInputLabel ?? {};
  const muiInputLabelStyleOverrides = muiInputLabel.styleOverrides ?? {};
  const muiFormHelperText = (components as any).MuiFormHelperText ?? {};
  const muiFormHelperTextStyleOverrides = muiFormHelperText.styleOverrides ?? {};

  return {
    ...themeOptions,
    palette: {
      ...themeOptions.palette,
      mode,
      primary: {
        ...paletteSpec.primary,
      },
      secondary: {
        ...paletteSpec.secondary,
      },
      success: {
        main: paletteSpec.status.success,
      },
      warning: {
        main: paletteSpec.status.warning,
      },
      error: {
        main: paletteSpec.status.error,
      },
      info: {
        main: paletteSpec.status.info,
      },
      background: {
        default: paletteSpec.background.default,
        paper: paletteSpec.background.paper,
      },
      text: {
        primary: paletteSpec.text.primary,
        secondary: paletteSpec.text.secondary,
        disabled: paletteSpec.text.disabled,
      },
      action: {
        ...themeOptions.palette?.action,
        hover: alpha(paletteSpec.primary.main, 0.12),
        selected: alpha(paletteSpec.primary.main, 0.2),
      },
      divider: paletteSpec.divider,
    },
    components: {
      ...components,
      MuiButton: {
        ...muiButton,
        styleOverrides: {
          ...muiButtonStyleOverrides,
          root: {
            ...(muiButtonStyleOverrides.root ?? {}),
            borderRadius: 'var(--cmp-button-radius)',
            textTransform: 'none',
            fontWeight: 700,
            boxShadow: 'none',
            transition: 'background-color var(--motionFast) var(--ease), border-color var(--motionFast) var(--ease), color var(--motionFast) var(--ease), box-shadow var(--motionFast) var(--ease)',
          },
          containedPrimary: {
            ...(muiButtonStyleOverrides.containedPrimary ?? {}),
            backgroundColor: 'var(--cmp-button-bg)',
            color: 'var(--cmp-button-text)',
            border: '1px solid var(--cmp-button-border)',
            '&:hover': {
              backgroundColor: 'var(--cmp-button-hover-bg)',
              borderColor: 'var(--cmp-button-border)',
              boxShadow: 'none',
            },
            '&:active': {
              backgroundColor: 'var(--cmp-button-active-bg)',
            },
            '&.Mui-disabled': {
              backgroundColor: 'color-mix(in srgb, var(--cmp-button-bg) 35%, transparent)',
              color: 'color-mix(in srgb, var(--cmp-button-text) 55%, transparent)',
              borderColor: 'color-mix(in srgb, var(--cmp-button-border) 45%, transparent)',
            },
          },
          outlinedPrimary: {
            ...(muiButtonStyleOverrides.outlinedPrimary ?? {}),
            borderColor: 'var(--cmp-button-border)',
            color: 'var(--color-accent-primary)',
            '&:hover': {
              borderColor: 'var(--cmp-button-border)',
              backgroundColor: 'var(--sys-interactive-hover)',
            },
          },
          textPrimary: {
            ...(muiButtonStyleOverrides.textPrimary ?? {}),
            color: 'var(--color-accent-primary)',
            '&:hover': {
              backgroundColor: 'var(--sys-interactive-hover)',
            },
          },
        },
      },
      MuiIconButton: {
        ...muiIconButton,
        styleOverrides: {
          ...muiIconButtonStyleOverrides,
          root: {
            ...(muiIconButtonStyleOverrides.root ?? {}),
            borderRadius: 'var(--cmp-button-radius)',
            transition: 'background-color var(--motionFast) var(--ease), color var(--motionFast) var(--ease), box-shadow var(--motionFast) var(--ease)',
            '&:hover': {
              backgroundColor: 'var(--sys-interactive-hover)',
            },
          },
        },
      },
      MuiInputBase: {
        ...muiInputBase,
        styleOverrides: {
          ...muiInputBaseStyleOverrides,
          root: {
            ...(muiInputBaseStyleOverrides.root ?? {}),
            color: 'var(--cmp-input-text)',
          },
          input: {
            ...(muiInputBaseStyleOverrides.input ?? {}),
            color: 'inherit',
            '&::placeholder': {
              color: 'var(--cmp-input-placeholder)',
              opacity: 1,
            },
          },
        },
      },
      MuiOutlinedInput: {
        ...muiOutlinedInput,
        styleOverrides: {
          ...muiOutlinedInputStyleOverrides,
          root: {
            ...(muiOutlinedInputStyleOverrides.root ?? {}),
            borderRadius: 'var(--cmp-input-radius)',
            backgroundColor: 'var(--cmp-input-bg)',
            color: 'var(--cmp-input-text)',
            transition: 'background-color var(--motionFast) var(--ease), border-color var(--motionFast) var(--ease), box-shadow var(--motionFast) var(--ease)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--cmp-input-border)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--sys-border-strong)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--cmp-input-focus-border)',
              borderWidth: '1px',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 2px var(--sys-interactive-focus-ring)',
            },
            '&.Mui-disabled': {
              color: 'var(--sys-text-tertiary)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'color-mix(in srgb, var(--cmp-input-border) 50%, transparent)',
              },
            },
          },
        },
      },
      MuiFilledInput: {
        ...muiFilledInput,
        styleOverrides: {
          ...muiFilledInputStyleOverrides,
          root: {
            ...(muiFilledInputStyleOverrides.root ?? {}),
            borderRadius: 'var(--cmp-input-radius)',
            backgroundColor: 'var(--cmp-input-bg)',
            color: 'var(--cmp-input-text)',
            '&:before': {
              borderBottomColor: 'var(--cmp-input-border)',
            },
            '&:after': {
              borderBottomColor: 'var(--cmp-input-focus-border)',
            },
            '&:hover:not(.Mui-disabled, .Mui-error):before': {
              borderBottomColor: 'var(--sys-border-strong)',
            },
          },
        },
      },
      MuiInputLabel: {
        ...muiInputLabel,
        styleOverrides: {
          ...muiInputLabelStyleOverrides,
          root: {
            ...(muiInputLabelStyleOverrides.root ?? {}),
            color: 'var(--sys-text-secondary)',
            '&.Mui-focused': {
              color: 'var(--cmp-input-focus-border)',
            },
            '&.Mui-disabled': {
              color: 'var(--sys-text-tertiary)',
            },
          },
        },
      },
      MuiFormHelperText: {
        ...muiFormHelperText,
        styleOverrides: {
          ...muiFormHelperTextStyleOverrides,
          root: {
            ...(muiFormHelperTextStyleOverrides.root ?? {}),
            color: 'var(--sys-text-tertiary)',
            '&.Mui-error': {
              color: 'var(--color-status-error)',
            },
          },
        },
      },
    },
    custom: {
      ...themeOptions.custom,
      semantic: {
        surface: {
          page: paletteSpec.background.default,
          panel: paletteSpec.background.paper,
          elevated: paletteSpec.background.secondary,
          sunken: alpha(paletteSpec.background.default, mode === 'dark' ? 0.95 : 0.9),
          scrim,
          overlay,
          overlayHover,
        },
        text: {
          primary: paletteSpec.text.primary,
          secondary: paletteSpec.text.secondary,
          tertiary: paletteSpec.text.disabled,
          inverse: paletteSpec.primary.contrastText,
          link: paletteSpec.primary.main,
        },
        border: {
          default: paletteSpec.divider,
          strong: alpha(paletteSpec.text.primary, mode === 'dark' ? 0.58 : 0.44),
          subtle: alpha(paletteSpec.divider, mode === 'dark' ? 0.72 : 0.62),
        },
        interactive: {
          accent: paletteSpec.primary.main,
          hover: interactiveHover,
          active: interactiveActive,
          focusRing,
        },
      },
      components: {
        button: {
          bg: paletteSpec.primary.main,
          text: paletteSpec.primary.contrastText,
          border: alpha(paletteSpec.primary.main, mode === 'dark' ? 0.62 : 0.4),
          hoverBg: alpha(paletteSpec.primary.main, mode === 'dark' ? 0.86 : 0.92),
          activeBg: alpha(paletteSpec.primary.main, mode === 'dark' ? 0.74 : 0.9),
        },
        card: {
          bg: alpha(paletteSpec.background.paper, mode === 'dark' ? 0.84 : 0.9),
          border: alpha(paletteSpec.divider, mode === 'dark' ? 0.82 : 0.62),
          shadow: cardShadow,
        },
        input: {
          bg: alpha(paletteSpec.background.paper, mode === 'dark' ? 0.62 : 0.94),
          text: paletteSpec.text.primary,
          border: alpha(paletteSpec.divider, mode === 'dark' ? 0.84 : 0.72),
          focusBorder: paletteSpec.primary.main,
          placeholder: alpha(paletteSpec.text.secondary, 0.88),
        },
        table: {
          headerBg: alpha(paletteSpec.background.paper, mode === 'dark' ? 0.9 : 0.97),
          rowBg: alpha(paletteSpec.background.paper, mode === 'dark' ? 0.56 : 0.86),
          rowHoverBg: alpha(paletteSpec.primary.main, mode === 'dark' ? 0.16 : 0.08),
          border: alpha(paletteSpec.divider, mode === 'dark' ? 0.74 : 0.62),
        },
        chip: {
          bg: alpha(paletteSpec.primary.main, mode === 'dark' ? 0.22 : 0.12),
          text: paletteSpec.primary.main,
          border: alpha(paletteSpec.primary.main, mode === 'dark' ? 0.36 : 0.24),
        },
        nav: {
          bg: alpha(paletteSpec.background.default, mode === 'dark' ? 0.9 : 0.94),
          itemBg: alpha(paletteSpec.background.paper, mode === 'dark' ? 0.62 : 0.9),
          itemHoverBg: alpha(paletteSpec.primary.main, mode === 'dark' ? 0.18 : 0.1),
          itemActiveBg: alpha(paletteSpec.primary.main, mode === 'dark' ? 0.24 : 0.15),
          border: alpha(paletteSpec.divider, mode === 'dark' ? 0.72 : 0.56),
        },
        dialog: {
          bg: alpha(paletteSpec.background.paper, mode === 'dark' ? 0.92 : 0.98),
          border: alpha(paletteSpec.divider, mode === 'dark' ? 0.86 : 0.66),
          shadow: dialogShadow,
        },
        iconButton: {
          bg: overlay,
          text: paletteSpec.primary.contrastText,
          hoverBg: overlayHover,
          overlayBg: overlay,
          overlayHoverBg: overlayHover,
          dangerText: paletteSpec.statusFg.error,
        },
        segmentedControl: {
          bg: segmentedBg,
          border: segmentedBorder,
          text: segmentedText,
          selectedBg: segmentedSelectedBg,
          selectedText: segmentedSelectedText,
        },
        sortArrows: {
          active: paletteSpec.primary.main,
          inactive: alpha(paletteSpec.text.secondary, mode === 'dark' ? 0.9 : 0.84),
        },
        panel: {
          bg: panelBg,
          headerBg: panelHeaderBg,
          border: panelBorder,
          dropTargetBg: panelDropTargetBg,
          dropTargetBorder: panelDropTargetBorder,
          controlBg: panelControlBg,
        },
      },
      surface: {
        base: paletteSpec.background.default,
        raised: paletteSpec.background.paper,
        overlay: alpha(paletteSpec.background.default, 0.9),
      },
      borderStrong: `1px solid ${paletteSpec.text.primary}`,
      mutedText: paletteSpec.text.secondary,
      glow: `0 0 20px ${alpha(paletteSpec.primary.main, 0.45)}`,
      border: `1px solid ${paletteSpec.divider}`,
      cardBorder: `1px solid ${paletteSpec.divider}`,
      customShadow: mode === 'dark' ? '0 12px 40px 0 rgba(0,0,0,0.6)' : '0 12px 40px 0 rgba(15,23,42,0.16)',
      gradient: `linear-gradient(135deg, ${alpha(paletteSpec.primary.main, 0.2)} 0%, ${alpha(paletteSpec.secondary.main, 0.16)} 100%)`,
      shimmer: `linear-gradient(90deg, transparent, ${alpha(paletteSpec.text.primary, 0.16)}, transparent)`,
      status: {
        active: {
          main: paletteSpec.status.success,
          bg: paletteSpec.statusBg.success,
          text: paletteSpec.statusFg.success,
        },
        inactive: {
          main: paletteSpec.text.secondary,
          bg: alpha(paletteSpec.text.secondary, 0.14),
          text: paletteSpec.text.secondary,
        },
        vacation: {
          main: paletteSpec.status.info,
          bg: paletteSpec.statusBg.info,
          text: paletteSpec.statusFg.info,
        },
        unknown: {
          main: paletteSpec.text.disabled,
          bg: alpha(paletteSpec.text.disabled, 0.14),
          text: paletteSpec.text.disabled,
        },
      },
      result: {
        win: {
          main: paletteSpec.status.success,
          bg: paletteSpec.statusBg.success,
          text: paletteSpec.statusFg.success,
        },
        loss: {
          main: paletteSpec.status.error,
          bg: paletteSpec.statusBg.error,
          text: paletteSpec.statusFg.error,
        },
        draw: {
          main: paletteSpec.status.warning,
          bg: paletteSpec.statusBg.warning,
          text: paletteSpec.statusFg.warning,
        },
        unknown: {
          main: paletteSpec.text.disabled,
          bg: alpha(paletteSpec.text.disabled, 0.14),
          text: paletteSpec.text.disabled,
        },
      },
      classes: GAME_CLASS_COLORS,
      roles: {
        admin: { main: paletteSpec.status.error, bg: paletteSpec.statusBg.error, text: paletteSpec.statusFg.error },
        moderator: { main: paletteSpec.status.warning, bg: paletteSpec.statusBg.warning, text: paletteSpec.statusFg.warning },
        member: { main: paletteSpec.primary.main, bg: alpha(paletteSpec.primary.main, 0.14), text: paletteSpec.primary.main },
        external: { main: paletteSpec.text.secondary, bg: alpha(paletteSpec.text.secondary, 0.12), text: paletteSpec.text.secondary },
      },
      warRoles: {
        dps: { main: paletteSpec.status.error, bg: paletteSpec.statusBg.error, text: paletteSpec.statusFg.error },
        heal: { main: paletteSpec.status.success, bg: paletteSpec.statusBg.success, text: paletteSpec.statusFg.success },
        tank: { main: paletteSpec.primary.main, bg: alpha(paletteSpec.primary.main, 0.14), text: paletteSpec.primary.main },
        lead: { main: paletteSpec.status.warning, bg: paletteSpec.statusBg.warning, text: paletteSpec.statusFg.warning },
      },
      eventTypes: {
        weekly_mission: {
          main: paletteSpec.status.warning,
          bg: paletteSpec.statusBg.warning,
          text: paletteSpec.statusFg.warning,
        },
        guild_war: {
          main: paletteSpec.status.error,
          bg: paletteSpec.statusBg.error,
          text: paletteSpec.statusFg.error,
        },
        other: {
          main: paletteSpec.status.info,
          bg: paletteSpec.statusBg.info,
          text: paletteSpec.statusFg.info,
        },
      },
      chips: {
        new: { main: paletteSpec.status.success, bg: paletteSpec.statusBg.success, text: paletteSpec.statusFg.success },
        updated: { main: paletteSpec.status.info, bg: paletteSpec.statusBg.info, text: paletteSpec.statusFg.info },
        pinned: { main: paletteSpec.status.warning, bg: paletteSpec.statusBg.warning, text: paletteSpec.statusFg.warning },
        locked: { main: paletteSpec.text.secondary, bg: alpha(paletteSpec.text.secondary, 0.14), text: paletteSpec.text.secondary },
        conflict: { main: paletteSpec.status.error, bg: paletteSpec.statusBg.error, text: paletteSpec.statusFg.error },
      },
    },
  };
}

export const ThemeControllerProvider: React.FC<ThemeControllerProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<ThemePreferences>(() => initThemePreferences());
  const [accessibilityPreferences, setAccessibilityPreferences] = useState<ThemeAccessibilityPreferences>(() => {
    try {
      return readAccessibilityPreferences();
    } catch {
      return {
        highContrast: false,
        dyslexiaFriendly: false,
        colorBlindMode: DEFAULT_COLOR_BLIND_MODE,
      };
    }
  });
  const [motionMode, setMotionModeState] = useState<MotionMode>(() => {
    try {
      return readStoredMotionMode();
    } catch {
      return DEFAULT_MOTION_MODE;
    }
  });
  const [systemReducedMotion, setSystemReducedMotion] = useState<boolean>(() => prefersReducedMotionByMediaQuery());
  const user = useAuthStore((state) => state.user);
  const remoteHydratedRef = React.useRef(false);
  const remoteApplyGuardRef = React.useRef(false);
  const lastPersistedRemoteKeyRef = React.useRef<string | null>(null);
  const remoteEndpointAvailableRef = React.useRef(true);
  const lastVisualSignatureRef = React.useRef<string | null>(null);

  const motionRuntime = useMemo(
    () => resolveMotionRuntime(preferences.theme, motionMode, preferences.motionIntensity, systemReducedMotion),
    [preferences.theme, preferences.motionIntensity, motionMode, systemReducedMotion],
  );
  const effectiveMotionMode = motionRuntime.effectiveMotionMode;
  const reducedMotion = motionRuntime.reducedMotion;
  const effectiveMotionIntensity = motionRuntime.interactionIntensity;

  const theme = useMemo(() => {
    const baseThemeOptions = getThemeOptions(preferences.theme);
    const themeObj = createTheme(applyColorPalette(baseThemeOptions, preferences.color));
    return themeObj;
  }, [preferences.theme, preferences.color]);

  const setTheme = (mode: ThemeMode) => {
    const resolvedTheme = resolveTheme(mode);
    setPreferences((previous) => {
      return {
        ...previous,
        theme: resolvedTheme,
        color: resolveColor(previous.color, resolvedTheme),
      } satisfies ThemePreferences;
    });
  };

  const setColor = (color: ThemeColor) => {
    setPreferences((previous) => {
      return {
        ...previous,
        color,
      } satisfies ThemePreferences;
    });
  };

  const setFontScale = (scale: number) => {
    setPreferences((previous) => {
      return {
        ...previous,
        fontScale: clamp(scale, MIN_FONT_SCALE, MAX_FONT_SCALE),
      } satisfies ThemePreferences;
    });
  };

  const setMotionIntensity = (intensity: number) => {
    setPreferences((previous) => {
      return {
        ...previous,
        motionIntensity: clamp(intensity, MIN_MOTION_INTENSITY, MAX_MOTION_INTENSITY),
      } satisfies ThemePreferences;
    });
  };

  const setMotionMode = (mode: MotionMode) => {
    const resolved = resolveMotionMode(mode);
    setMotionModeState(resolved);
    try {
      persistMotionMode(resolved);
    } catch (error) {
      console.warn('Failed to persist motion mode preference:', error);
    }
  };

  const setHighContrast = (enabled: boolean) => {
    setAccessibilityPreferences((previous) => {
      const next = { ...previous, highContrast: Boolean(enabled) };
      try {
        persistAccessibilityPreferences(next);
      } catch (error) {
        console.warn('Failed to persist high contrast preference:', error);
      }
      return next;
    });
  };

  const setDyslexiaFriendly = (enabled: boolean) => {
    setAccessibilityPreferences((previous) => {
      const next = { ...previous, dyslexiaFriendly: Boolean(enabled) };
      try {
        persistAccessibilityPreferences(next);
      } catch (error) {
        console.warn('Failed to persist dyslexia-friendly preference:', error);
      }
      return next;
    });
  };

  const setColorBlindMode = (mode: ColorBlindMode) => {
    const resolved = resolveColorBlindMode(mode);
    setAccessibilityPreferences((previous) => {
      const next = { ...previous, colorBlindMode: resolved };
      try {
        persistAccessibilityPreferences(next);
      } catch (error) {
        console.warn('Failed to persist color blind mode preference:', error);
      }
      return next;
    });
  };

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemReducedMotion(event.matches);
    };

    setSystemReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => subscribeThemeRolloutChanges(() => {
    setPreferences((previous) => {
      const nextTheme = resolveTheme(previous.theme);
      if (nextTheme === previous.theme) return previous;
      return {
        ...previous,
        theme: nextTheme,
        color: resolveColor(previous.color, nextTheme),
      } satisfies ThemePreferences;
    });
  }), []);

  useEffect(() => {
    remoteHydratedRef.current = false;
    remoteApplyGuardRef.current = false;
    lastPersistedRemoteKeyRef.current = null;
    remoteEndpointAvailableRef.current = true;

    if (!user?.id) {
      return;
    }

    let cancelled = false;

    const syncFromServer = async () => {
      try {
        const response = await themePreferencesAPI.get();
        if (cancelled || !response.preferences) {
          return;
        }

        const remote = response.preferences;
        const nextPreferences: ThemePreferences = {
          theme: resolveTheme(remote.theme),
          color: resolveColor(remote.color, resolveTheme(remote.theme)),
          fontScale: clamp(remote.fontScale, MIN_FONT_SCALE, MAX_FONT_SCALE),
          motionIntensity: clamp(remote.motionIntensity, MIN_MOTION_INTENSITY, MAX_MOTION_INTENSITY),
        };

        const remoteKey = serializePreferences(nextPreferences);
        lastPersistedRemoteKeyRef.current = remoteKey;

        if (serializePreferences(preferences) === remoteKey) {
          return;
        }

        remoteApplyGuardRef.current = true;
        setPreferences(nextPreferences);
      } catch (error) {
        if (isHttpNotFoundError(error)) {
          remoteEndpointAvailableRef.current = false;
          return;
        }
        console.warn('Failed to load server theme preferences:', error);
      } finally {
        if (!cancelled) {
          remoteHydratedRef.current = true;
        }
      }
    };

    syncFromServer();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    if (!remoteHydratedRef.current) return;
    if (!remoteEndpointAvailableRef.current) return;

    const nextKey = serializePreferences(preferences);

    if (remoteApplyGuardRef.current) {
      remoteApplyGuardRef.current = false;
      lastPersistedRemoteKeyRef.current = nextKey;
      return;
    }

    if (lastPersistedRemoteKeyRef.current === nextKey) {
      return;
    }

    const timer = window.setTimeout(() => {
      themePreferencesAPI
        .update({
          theme: preferences.theme,
          color: preferences.color,
          fontScale: preferences.fontScale,
          motionIntensity: preferences.motionIntensity,
        })
        .then(() => {
          lastPersistedRemoteKeyRef.current = nextKey;
        })
        .catch((error) => {
          if (isHttpNotFoundError(error)) {
            remoteEndpointAvailableRef.current = false;
            return;
          }
          console.warn('Failed to persist server theme preferences:', error);
        });
    }, 280);

    return () => window.clearTimeout(timer);
  }, [preferences.theme, preferences.color, preferences.fontScale, preferences.motionIntensity, user?.id]);

  useEffect(() => {
    setThemePreferences(preferences);
  }, [preferences.theme, preferences.color, preferences.fontScale, preferences.motionIntensity]);

  useEffect(() => {
    const tokens = getThemeColorTokens(preferences.color);
    const palette = getThemeColorPalette(preferences.color);
    const visual = getThemeVisualSpec(preferences.theme);
    const mode = isLightColorTheme(preferences.color) ? 'light' : 'dark';

    const root = document.documentElement;
    root.setAttribute('data-theme', preferences.theme);
    root.setAttribute('data-theme-mode', mode);
    root.setAttribute('data-theme-color', preferences.color);
    applyMotionStateToDom(motionMode, effectiveMotionMode, reducedMotion);
    applyAccessibilityStateToDom(accessibilityPreferences);

    const cssVars: Record<string, string> = {
      // Bridge Tailwind/shadcn-style tokens to runtime theme palette.
      '--background': palette.background.default,
      '--foreground': palette.text.primary,
      '--card': palette.background.paper,
      '--card-foreground': palette.text.primary,
      '--popover': palette.background.paper,
      '--popover-foreground': palette.text.primary,
      '--primary': palette.primary.main,
      '--primary-foreground': palette.primary.contrastText,
      '--secondary': alpha(palette.secondary.main, mode === 'dark' ? 0.35 : 0.2),
      '--secondary-foreground': palette.text.primary,
      '--muted': alpha(palette.background.secondary, mode === 'dark' ? 0.6 : 0.7),
      '--muted-foreground': palette.text.secondary,
      '--accent': alpha(palette.primary.main, mode === 'dark' ? 0.2 : 0.14),
      '--accent-foreground': palette.text.primary,
      '--destructive': palette.status.error,
      '--destructive-foreground': palette.statusFg.error,
      '--border': alpha(palette.divider, mode === 'dark' ? 0.82 : 0.62),
      '--input': alpha(palette.divider, mode === 'dark' ? 0.84 : 0.72),
      '--input-background': alpha(palette.background.paper, mode === 'dark' ? 0.62 : 0.94),
      '--ring': alpha(palette.primary.main, mode === 'dark' ? 0.72 : 0.64),
      '--sidebar': alpha(palette.background.default, mode === 'dark' ? 0.92 : 0.96),
      '--sidebar-foreground': palette.text.primary,
      '--sidebar-primary': palette.primary.main,
      '--sidebar-primary-foreground': palette.primary.contrastText,
      '--sidebar-accent': alpha(palette.primary.main, mode === 'dark' ? 0.18 : 0.1),
      '--sidebar-accent-foreground': palette.text.primary,
      '--sidebar-border': alpha(palette.divider, mode === 'dark' ? 0.72 : 0.56),
      '--sidebar-ring': alpha(palette.primary.main, mode === 'dark' ? 0.72 : 0.64),

      '--color-bg-primary': palette.background.default,
      '--color-bg-secondary': palette.background.secondary,
      '--color-surface-default': palette.background.paper,
      '--color-surface-elevated': palette.background.secondary,
      '--color-surface-sunken': palette.background.default,

      '--color-border-default': palette.divider,
      '--color-border-strong': palette.text.primary,
      '--color-border-subtle': palette.divider,

      '--color-accent-primary': palette.primary.main,
      '--color-accent-primary-fg': palette.primary.contrastText,
      '--color-accent-primary-hover': palette.primary.main,
      '--color-accent-primary-active': palette.primary.main,
      '--color-accent-primary-subtle': palette.secondary.main,
      '--primary-rgb': toRgbChannels(palette.primary.main),

      '--color-text-primary': palette.text.primary,
      '--color-text-secondary': palette.text.secondary,
      '--color-text-tertiary': palette.text.disabled,
      '--color-text-disabled': palette.text.disabled,
      '--color-text-inverse': palette.primary.contrastText,
      '--color-text-link': palette.primary.main,
      '--sys-surface-page': palette.background.default,
      '--sys-surface-panel': palette.background.paper,
      '--sys-surface-elevated': palette.background.secondary,
      '--sys-surface-sunken': alpha(palette.background.default, mode === 'dark' ? 0.95 : 0.9),
      '--sys-text-primary': palette.text.primary,
      '--sys-text-secondary': palette.text.secondary,
      '--sys-text-tertiary': palette.text.disabled,
      '--sys-text-inverse': palette.primary.contrastText,
      '--sys-text-link': palette.primary.main,
      '--calendar-icon-invert': mode === 'dark' ? '100%' : '0%', // FIXED: Invert calendar icon color based on theme mode
      '--sys-border-default': palette.divider,
      '--sys-border-strong': alpha(palette.text.primary, mode === 'dark' ? 0.58 : 0.44),
      '--sys-border-subtle': alpha(palette.divider, mode === 'dark' ? 0.72 : 0.62),
      '--sys-interactive-accent': palette.primary.main,
      '--sys-interactive-hover': alpha(palette.primary.main, mode === 'dark' ? 0.22 : 0.16),
      '--sys-interactive-active': alpha(palette.primary.main, mode === 'dark' ? 0.3 : 0.22),
      '--sys-interactive-focus-ring': alpha(palette.primary.main, mode === 'dark' ? 0.72 : 0.64),
      '--sys-surface-scrim': alpha('#000000', mode === 'dark' ? 0.6 : 0.5),
      '--sys-surface-overlay': alpha('#000000', mode === 'dark' ? 0.2 : 0.1),
      '--sys-surface-overlay-hover': alpha('#000000', mode === 'dark' ? 0.3 : 0.18),
      '--interaction-focus-ring-color': alpha(palette.primary.main, mode === 'dark' ? 0.72 : 0.64),
      '--interaction-focus-ring-width': '2px',
      '--interaction-focus-ring-glow': `0 0 0 4px ${alpha(palette.primary.main, mode === 'dark' ? 0.32 : 0.24)}`,

      '--color-status-success': palette.status.success,
      '--color-status-success-bg': palette.statusBg.success,
      '--color-status-success-fg': palette.statusFg.success,
      '--color-status-warning': palette.status.warning,
      '--color-status-warning-bg': palette.statusBg.warning,
      '--color-status-warning-fg': palette.statusFg.warning,
      '--color-status-error': palette.status.error,
      '--color-status-error-bg': palette.statusBg.error,
      '--color-status-error-fg': palette.statusFg.error,
      '--color-status-info': palette.status.info,
      '--color-status-info-bg': palette.statusBg.info,
      '--color-status-info-fg': palette.statusFg.info,

      '--theme-font-body': visual.fontFamily,
      '--theme-font-display': visual.headingFont,
      '--theme-font-scale': preferences.fontScale.toString(),
      '--theme-font-size-base': '16px',
      '--theme-font-size': `${(16 * preferences.fontScale).toFixed(2)}px`,
      '--theme-motion-intensity': effectiveMotionIntensity.toString(),
      '--theme-motion-mode': effectiveMotionMode,
      '--theme-motion-reduced': reducedMotion ? '1' : '0',
      '--theme-border-width': visual.borderWidth,
      '--theme-border-radius': `${visual.shape.borderRadius}px`,
      '--theme-border-style': visual.borderStyle,
      '--theme-shadow-sm': visual.shadows[1],
      '--theme-shadow-md': visual.shadows[2],
      '--theme-shadow-lg': visual.shadows[3],
      '--theme-bg-pattern': visual.capabilities.backgroundMode === 'canvas' ? 'none' : visual.bgPattern,
      '--theme-bg-size': visual.capabilities.backgroundMode === 'canvas' ? 'auto' : visual.bgSize,
      '--cmp-button-bg': palette.primary.main,
      '--cmp-button-text': palette.primary.contrastText,
      '--cmp-button-border': alpha(palette.primary.main, mode === 'dark' ? 0.62 : 0.4),
      '--cmp-button-hover-bg': alpha(palette.primary.main, mode === 'dark' ? 0.86 : 0.92),
      '--cmp-button-active-bg': alpha(palette.primary.main, mode === 'dark' ? 0.74 : 0.9),
      '--cmp-button-radius': `${visual.shape.buttonRadius}px`,
      '--cmp-card-bg': alpha(palette.background.paper, mode === 'dark' ? 0.84 : 0.9),
      '--cmp-card-border': alpha(palette.divider, mode === 'dark' ? 0.82 : 0.62),
      '--cmp-card-shadow': mode === 'dark'
        ? '0 16px 36px rgba(0, 0, 0, 0.45)'
        : '0 10px 26px rgba(15, 23, 42, 0.12)',
      '--cmp-card-radius': `${visual.shape.borderRadius}px`,
      '--cmp-input-bg': alpha(palette.background.paper, mode === 'dark' ? 0.62 : 0.94),
      '--cmp-input-text': palette.text.primary,
      '--cmp-input-border': alpha(palette.divider, mode === 'dark' ? 0.84 : 0.72),
      '--cmp-input-focus-border': palette.primary.main,
      '--cmp-input-placeholder': palette.text.secondary, // FIXED: Full opacity for WCAG compliance
      '--cmp-input-radius': `${visual.shape.inputRadius}px`,
      '--cmp-table-header-bg': alpha(palette.background.paper, mode === 'dark' ? 0.9 : 0.97),
      '--cmp-table-row-bg': alpha(palette.background.paper, mode === 'dark' ? 0.56 : 0.86),
      '--cmp-table-row-hover-bg': alpha(palette.primary.main, mode === 'dark' ? 0.16 : 0.08),
      '--cmp-table-border': alpha(palette.divider, mode === 'dark' ? 0.74 : 0.62),
      '--cmp-chip-bg': alpha(palette.primary.main, mode === 'dark' ? 0.22 : 0.12),
      '--cmp-chip-text': palette.primary.main,
      '--cmp-chip-border': alpha(palette.primary.main, mode === 'dark' ? 0.36 : 0.24),
      '--cmp-nav-bg': alpha(palette.background.default, mode === 'dark' ? 0.9 : 0.94),
      '--cmp-nav-item-bg': alpha(palette.background.paper, mode === 'dark' ? 0.62 : 0.9),
      '--cmp-nav-item-hover-bg': alpha(palette.primary.main, mode === 'dark' ? 0.18 : 0.1),
      '--cmp-nav-item-active-bg': alpha(palette.primary.main, mode === 'dark' ? 0.24 : 0.15),
      '--cmp-nav-border': alpha(palette.divider, mode === 'dark' ? 0.72 : 0.56),
      '--cmp-icon-button-overlay-bg': alpha(mode === 'dark' ? palette.background.default : palette.text.primary, mode === 'dark' ? 0.58 : 0.42),
      '--cmp-icon-button-overlay-hover-bg': alpha(mode === 'dark' ? palette.background.default : palette.text.primary, mode === 'dark' ? 0.7 : 0.54),
      '--cmp-icon-button-overlay-text': palette.primary.contrastText,
      '--cmp-segmented-bg': alpha(palette.background.paper, mode === 'dark' ? 0.42 : 0.72),
      '--cmp-segmented-border': alpha(palette.divider, mode === 'dark' ? 0.82 : 0.62),
      '--cmp-segmented-selected-bg': alpha(palette.primary.main, mode === 'dark' ? 0.22 : 0.16),
      '--cmp-segmented-selected-text': palette.text.primary,
      '--cmp-sort-arrow-active': palette.primary.main,
      '--cmp-sort-arrow-inactive': alpha(palette.text.secondary, 0.75), // FIXED: Increased opacity for better visibility
      '--cmp-panel-bg': alpha(palette.background.paper, mode === 'dark' ? 0.72 : 0.94),
      '--cmp-panel-header-bg': alpha(palette.background.secondary, mode === 'dark' ? 0.7 : 0.9),
      '--cmp-panel-border': alpha(palette.divider, mode === 'dark' ? 0.88 : 0.7),
      '--cmp-panel-drop-target-bg': alpha(palette.primary.main, mode === 'dark' ? 0.22 : 0.12),
      '--cmp-panel-drop-target-border': alpha(palette.primary.main, mode === 'dark' ? 0.84 : 0.68),
      '--cmp-panel-control-bg': alpha(palette.background.default, mode === 'dark' ? 0.66 : 0.82),
      '--cmp-dialog-bg': alpha(palette.background.paper, mode === 'dark' ? 0.92 : 0.98),
      '--cmp-dialog-border': alpha(palette.divider, mode === 'dark' ? 0.86 : 0.66),
      '--cmp-dialog-shadow': mode === 'dark'
        ? '0 28px 70px rgba(0, 0, 0, 0.62)'
        : '0 20px 52px rgba(15, 23, 42, 0.2)',
      '--cmp-dialog-radius': `${visual.shape.borderRadius}px`,

      '--accent0': tokens.primary,
      '--accent1': tokens.secondary,
      '--bg0': palette.background.default,
      '--surface1': palette.background.paper,
      '--surface2': palette.background.secondary,
      '--text0': palette.text.primary,
      '--text1': palette.text.secondary,
      '--divider': palette.divider,
      '--stroke': visual.borderWidth,
      '--logo-bg': `linear-gradient(45deg, ${tokens.primary} 30%, ${tokens.secondary} 90%)`,
      '--logo-text': palette.primary.contrastText,
      '--nav-active-bg': `linear-gradient(90deg, ${alpha(tokens.primary, 0.2)}, transparent)`,
      '--glow': `0 0 12px ${alpha(tokens.primary, 0.45)}`,
      '--radiusInput': `${visual.shape.borderRadius}px`,
      '--radiusBtn': `${visual.shape.borderRadius}px`,
      '--radiusCard': `${visual.shape.borderRadius}px`,
      '--shadow1': visual.shadows[1],
      '--shadow2': visual.shadows[2],
      '--shadow3': visual.shadows[3],
      '--motionFast': 'var(--interaction-fast, var(--theme-motion-fast, 180ms))',
      '--ease': 'var(--interaction-ease, var(--theme-motion-easing, cubic-bezier(0.22, 1, 0.36, 1)))',
      '--sigA': palette.divider,
      '--sigA-image': mode === 'dark'
        ? 'radial-gradient(rgba(255, 255, 255, 0.035) 0.6px, transparent 0.6px)'
        : 'radial-gradient(rgba(17, 24, 39, 0.055) 0.6px, transparent 0.6px)'
    };

    if (accessibilityPreferences.highContrast) {
      cssVars['--cmp-input-focus-ring-width'] = '3px';
      cssVars['--cmp-input-focus-ring-color'] = mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(17, 24, 39, 0.88)';
      cssVars['--cmp-button-disabled-opacity'] = '0.78';
      cssVars['--cmp-card-border'] = mode === 'dark' ? alpha(palette.text.primary, 0.92) : alpha(palette.text.primary, 0.78);
      cssVars['--cmp-input-border'] = mode === 'dark' ? alpha(palette.text.primary, 0.86) : alpha(palette.text.primary, 0.66);
    }

    if (accessibilityPreferences.dyslexiaFriendly) {
      cssVars['--theme-font-body'] = "'OpenDyslexic', 'Atkinson Hyperlegible', 'Segoe UI', sans-serif";
      cssVars['--theme-letter-spacing'] = '0.02em';
    }

    const colorBlindTokens = resolveColorBlindTokenOverrides(accessibilityPreferences.colorBlindMode);
    if (colorBlindTokens) {
      cssVars['--sys-interactive-accent'] = colorBlindTokens.accent;
      cssVars['--sys-interactive-focus-ring'] = alpha(colorBlindTokens.accent, 0.82);
      cssVars['--cmp-button-bg'] = colorBlindTokens.accent;
      cssVars['--cmp-button-border'] = alpha(colorBlindTokens.accent, mode === 'dark' ? 0.8 : 0.62);
      cssVars['--cmp-button-hover-bg'] = alpha(colorBlindTokens.accent, mode === 'dark' ? 0.88 : 0.92);
      cssVars['--cmp-button-active-bg'] = alpha(colorBlindTokens.accent, mode === 'dark' ? 0.72 : 0.8);
      cssVars['--color-status-success'] = colorBlindTokens.success;
      cssVars['--color-status-success-bg'] = alpha(colorBlindTokens.success, mode === 'dark' ? 0.28 : 0.16);
      cssVars['--color-status-warning'] = colorBlindTokens.warning;
      cssVars['--color-status-warning-bg'] = alpha(colorBlindTokens.warning, mode === 'dark' ? 0.28 : 0.16);
      cssVars['--color-status-error'] = colorBlindTokens.error;
      cssVars['--color-status-error-bg'] = alpha(colorBlindTokens.error, mode === 'dark' ? 0.28 : 0.16);
      cssVars['--color-status-info'] = colorBlindTokens.info;
      cssVars['--color-status-info-bg'] = alpha(colorBlindTokens.info, mode === 'dark' ? 0.28 : 0.16);
    }

    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    applyMotionScaleTokens(root, effectiveMotionIntensity);

    const body = document.body;
    for (const preset of THEME_PRESET_LIST) {
      body.classList.remove(`theme-${preset.id}`);
    }
    for (const preset of THEME_COLOR_PRESET_LIST) {
      body.classList.remove(`color-${preset.id}`);
    }
    body.classList.add(`theme-${preferences.theme}`);
    body.classList.add(`color-${preferences.color}`);
  }, [
    preferences.theme,
    preferences.color,
    preferences.fontScale,
    preferences.motionIntensity,
    accessibilityPreferences.highContrast,
    accessibilityPreferences.dyslexiaFriendly,
    accessibilityPreferences.colorBlindMode,
    motionMode,
    effectiveMotionMode,
    reducedMotion,
    effectiveMotionIntensity,
  ]);

  useEffect(() => {
    const visualSignature = `${preferences.theme}|${preferences.color}`;
    const previousSignature = lastVisualSignatureRef.current;
    lastVisualSignatureRef.current = visualSignature;

    if (!previousSignature || previousSignature === visualSignature) {
      return;
    }

    const root = document.documentElement;
    const body = document.body;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    root.classList.add('theme-transitioning');
    body.classList.add('theme-transitioning');
    root.setAttribute('data-theme-switching', 'true');
    window.scrollTo(scrollX, scrollY);

    const timer = window.setTimeout(() => {
      root.classList.remove('theme-transitioning');
      body.classList.remove('theme-transitioning');
      root.removeAttribute('data-theme-switching');
      window.scrollTo(scrollX, scrollY);
    }, reducedMotion ? 0 : THEME_TRANSITION_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
      root.classList.remove('theme-transitioning');
      body.classList.remove('theme-transitioning');
      root.removeAttribute('data-theme-switching');
    };
  }, [preferences.theme, preferences.color, reducedMotion]);


  return (
    <ThemeContext.Provider
      value={{
        currentTheme: preferences.theme,
        currentColor: preferences.color,
        fontScale: preferences.fontScale,
        motionIntensity: preferences.motionIntensity,
        motionMode,
        effectiveMotionMode,
        reducedMotion,
        highContrast: accessibilityPreferences.highContrast,
        dyslexiaFriendly: accessibilityPreferences.dyslexiaFriendly,
        colorBlindMode: accessibilityPreferences.colorBlindMode,
        setTheme,
        setColor,
        setFontScale,
        setMotionIntensity,
        setMotionMode,
        setHighContrast,
        setDyslexiaFriendly,
        setColorBlindMode,
      }}
    >
      <StyledEngineProvider injectFirst>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalScrollbar />
          {children}
        </MuiThemeProvider>
      </StyledEngineProvider>
    </ThemeContext.Provider>
  );
};

export const NEXUS_THEME_OPTIONS = THEME_PRESET_LIST;
export const NEXUS_COLOR_OPTIONS = THEME_COLOR_PRESET_LIST;

const THEME_MODE_ICONS: Record<ThemeMode, SvgIconComponent> = {
  'neo-brutalism': Architecture,
  steampunk: PrecisionManufacturing,
  minimalistic: HorizontalRule,
  cyberpunk: Memory,
  royal: WorkspacePremium,
  chibi: Mood,
  'post-apocalyptic': LocalFireDepartment,
};

export function getThemeModeIcon(themeMode: string): SvgIconComponent {
  return THEME_MODE_ICONS[themeMode as ThemeMode] ?? Palette;
}

// ============================================================================
// Theme Section Component
// ============================================================================

export interface ThemeSectionProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
  showActiveChip?: boolean;
}

export function ThemeSection({
  title,
  subtitle,
  compact = false,
  showActiveChip = true,
}: ThemeSectionProps) {
  const theme = useThemeController();
  const muiTheme = createTheme();
  const { t } = useTranslation();
  const isChibiTheme = theme.currentTheme === 'chibi';
  const sectionCardRadius = isChibiTheme ? '16px' : 4;
  const sectionOptionRadius = isChibiTheme ? '12px' : 3;

  const resolvedTitle = title ?? t('settings.visual_theme');
  const resolvedSubtitle = subtitle ?? t('settings.visual_theme_subtitle');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    theme.setTheme(event.target.value as ThemeMode);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: sectionCardRadius,
        borderColor: alpha(muiTheme.palette.primary.main, 0.2),
        overflow: 'visible',
      }}
    >
      <CardHeader
        avatar={<Palette sx={{ fontSize: 20, color: muiTheme.palette.primary.main }} />}
        title={
          <Typography variant="h6" fontWeight={900}>
            {resolvedTitle}
          </Typography>
        }
        subheader={
          !compact && (
            <Typography variant="body2" color="text.secondary">
              {resolvedSubtitle}
            </Typography>
          )
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <RadioGroup value={theme.currentTheme} onChange={handleChange}>
          <Stack spacing={1.5}>
            {THEME_PRESET_LIST.map((opt) => {
              const isSelected = opt.id === theme.currentTheme;
              const ThemeIcon = getThemeModeIcon(opt.id);
              return (
                <Box
                  key={opt.id}
                  sx={{
                    border: `1px solid ${isSelected ? muiTheme.palette.primary.main : muiTheme.palette.divider}`,
                    borderRadius: sectionOptionRadius,
                    p: compact ? 1 : 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    boxShadow: isSelected
                      ? `0 10px 20px ${alpha(muiTheme.palette.primary.main, 0.12)}`
                      : 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: alpha(muiTheme.palette.primary.main, 0.4),
                    },
                  }}
                >
                  <FormControlLabel
                    value={opt.id}
                    control={<Radio color="primary" />}
                    label={
                      <Stack spacing={0.3}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ThemeIcon
                            sx={{
                              fontSize: 16,
                              color: isSelected ? muiTheme.palette.primary.main : muiTheme.palette.text.secondary,
                            }}
                          />
                          <Typography variant="subtitle1" fontWeight={800}>
                            {t(`theme_menu.themes.${opt.id}.label`, { defaultValue: opt.label })}
                          </Typography>
                        </Stack>
                        {!compact && (opt as any).description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ lineHeight: 1.4 }}
                          >
                            {t(`theme_menu.themes.${opt.id}.description`, {
                              defaultValue: (opt as any).description,
                            })}
                          </Typography>
                        )}
                      </Stack>
                    }
                    sx={{ flex: 1, m: 0 }}
                  />
                  {isSelected && showActiveChip && (
                    <Chip
                      size="small"
                      color="primary"
                      label={t('settings.active')}
                      sx={{ fontWeight: 800 }}
                    />
                  )}
                </Box>
              );
            })}
          </Stack>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Color Section Component
// ============================================================================

export interface ColorSectionProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
  showActiveChip?: boolean;
}

export function ColorSection({
  title,
  subtitle,
  compact = false,
  showActiveChip = true,
}: ColorSectionProps) {
  const theme = useThemeController();
  const muiTheme = createTheme();
  const { t } = useTranslation();
  const isChibiTheme = theme.currentTheme === 'chibi';
  const sectionCardRadius = isChibiTheme ? '16px' : 4;
  const sectionOptionRadius = isChibiTheme ? '12px' : 3;

  const resolvedTitle = title ?? t('settings.color_palette');
  const resolvedSubtitle = subtitle ?? t('settings.color_palette_subtitle');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    theme.setColor(event.target.value as ThemeColor);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: sectionCardRadius,
        borderColor: alpha(muiTheme.palette.secondary.main, 0.2),
        overflow: 'visible',
      }}
    >
      <CardHeader
        avatar={<Palette sx={{ fontSize: 20, color: muiTheme.palette.secondary.main }} />}
        title={
          <Typography variant="h6" fontWeight={900}>
            {resolvedTitle}
          </Typography>
        }
        subheader={
          !compact && (
            <Typography variant="body2" color="text.secondary">
              {resolvedSubtitle}
            </Typography>
          )
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <RadioGroup value={theme.currentColor} onChange={handleChange}>
          <Stack spacing={1.5}>
            {THEME_COLOR_PRESET_LIST.map((opt) => {
              const isSelected = opt.id === theme.currentColor;
              return (
                <Box
                  key={opt.id}
                  sx={{
                    border: `1px solid ${isSelected ? muiTheme.palette.secondary.main : muiTheme.palette.divider}`,
                    borderRadius: sectionOptionRadius,
                    p: compact ? 1 : 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    boxShadow: isSelected
                      ? `0 10px 20px ${alpha(muiTheme.palette.secondary.main, 0.12)}`
                      : 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: alpha(muiTheme.palette.secondary.main, 0.4),
                    },
                  }}
                >
                  <FormControlLabel
                    value={opt.id}
                    control={<Radio color="secondary" />}
                    label={
                      <Stack spacing={0.3}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 24,
                              height: 16,
                              borderRadius: 1,
                              background: opt.swatch,
                              boxShadow: `0 0 0 2px ${alpha(muiTheme.palette.common.white, 0.12)}`,
                            }}
                          />
                          <Typography variant="subtitle1" fontWeight={800}>
                            {t(`theme_menu.colors.${opt.id}.label`, { defaultValue: opt.label })}
                          </Typography>
                        </Stack>
                        {!compact && opt.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ lineHeight: 1.4 }}
                          >
                            {t(`theme_menu.colors.${opt.id}.description`, {
                              defaultValue: opt.description,
                            })}
                          </Typography>
                        )}
                      </Stack>
                    }
                    sx={{ flex: 1, m: 0 }}
                  />
                  {isSelected && showActiveChip && (
                    <Chip
                      size="small"
                      color="secondary"
                      label={t('settings.active')}
                      sx={{ fontWeight: 800 }}
                    />
                  )}
                </Box>
              );
            })}
          </Stack>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Combined Theme & Color Picker Component
// ============================================================================

export interface ThemeColorPickerProps {
  showTheme?: boolean;
  showColor?: boolean;
  compact?: boolean;
  showActiveChip?: boolean;
}

export function ThemeColorPicker({
  showTheme = true,
  showColor = true,
  compact = false,
  showActiveChip = true,
}: ThemeColorPickerProps) {
  return (
    <Grid container spacing={3}>
      {showTheme && (
        <Grid size={{ xs: 12, md: showColor ? 6 : 12 }}>
          <ThemeSection compact={compact} showActiveChip={showActiveChip} />
        </Grid>
      )}
      {showColor && (
        <Grid size={{ xs: 12, md: showTheme ? 6 : 12 }}>
          <ColorSection compact={compact} showActiveChip={showActiveChip} />
        </Grid>
      )}
    </Grid>
  );
}
