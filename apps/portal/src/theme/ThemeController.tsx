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
import { Palette } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store';
import { themePreferencesAPI } from '@/lib/api/themePreferences';
import {
  getThemeColorPalette,
  getThemeColorTokens,
  THEME_COLOR_PRESET_LIST,
  GAME_CLASS_COLORS,
  DEFAULT_THEME_COLOR,
  THEME_COLOR_IDS,
  isThemeColor,
  type ThemeColor,
} from './colors';
import {
  getThemeOptions,
  getThemeVisualSpec,
  THEME_PRESET_LIST,
  DEFAULT_THEME_MODE,
  THEME_PRESETS,
  isThemeMode,
  type ThemeMode,
} from './presets';
import './theme.css';
import './colors/color-tokens.css';
import './presets/index.css';

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

// ============================================================================
// Theme Engine - Pure Utility Functions (No React Dependencies)
// ============================================================================

const STORAGE_KEY_THEME = 'baiye_theme';
const STORAGE_KEY_COLOR = 'baiye_theme_color';
const STORAGE_KEY_FONT_SCALE = 'baiye_theme_font_scale';
const STORAGE_KEY_MOTION_INTENSITY = 'baiye_theme_motion_intensity';
const DEFAULT_FONT_SCALE = 1;
const DEFAULT_MOTION_INTENSITY = 1;
const MIN_FONT_SCALE = 0.9;
const MAX_FONT_SCALE = 1.25;
const MIN_MOTION_INTENSITY = 0;
const MAX_MOTION_INTENSITY = 1.5;

const LEGACY_THEME_MAP: Record<string, ThemeMode> = {
  default: 'neo-brutalism' as any,
  'dark-gold': 'steampunk' as any,
  'neon-spectral': 'cyberpunk' as any,
  redgold: 'royal' as any,
  softpink: 'chibi' as any,
  'chinese-ink': 'minimalistic' as any,
};

const LEGACY_COLOR_MAP: Record<string, ThemeColor> = {
  'default': 'default-violet' as any,
  'violet-cyan': 'default-violet' as any,
  'gold-amber': 'black-gold' as any,
  'crimson-gold': 'red-gold' as any,
  'soft-rose': 'soft-pink' as any,
  'teal-neon': 'neon-spectral' as any,
};

function resolveTheme(theme: string | null): ThemeMode {
  if (!theme) return DEFAULT_THEME_MODE;
  const migrated = LEGACY_THEME_MAP[theme] ?? theme;
  return isThemeMode(migrated) ? migrated : DEFAULT_THEME_MODE;
}

function resolveColor(color: string | null, theme: ThemeMode): ThemeColor {
  if (color) {
    const migrated = LEGACY_COLOR_MAP[color] ?? color;
    if (isThemeColor(migrated)) return migrated;
  }
  return (THEME_PRESETS[theme] as any)?.defaultColor ?? DEFAULT_THEME_COLOR;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function serializePreferences(preferences: ThemePreferences): string {
  return [
    preferences.theme,
    preferences.color,
    preferences.fontScale.toFixed(3),
    preferences.motionIntensity.toFixed(3),
  ].join('|');
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

function persistThemePreferences({ theme, color, fontScale, motionIntensity }: ThemePreferences): void {
  localStorage.setItem(STORAGE_KEY_THEME, theme);
  localStorage.setItem(STORAGE_KEY_COLOR, color);
  localStorage.setItem(STORAGE_KEY_FONT_SCALE, String(fontScale));
  localStorage.setItem(STORAGE_KEY_MOTION_INTENSITY, String(motionIntensity));
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
    persistThemePreferences(preferences);
    applyThemeToDom(preferences);
    return preferences;
  } catch (error) {
    console.error('Failed to init theme:', error);
    const fallback = {
      theme: DEFAULT_THEME_MODE,
      color: DEFAULT_THEME_COLOR,
      fontScale: DEFAULT_FONT_SCALE,
      motionIntensity: DEFAULT_MOTION_INTENSITY,
    } satisfies ThemePreferences;
    applyThemeToDom(fallback);
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

// Legacy compatibility wrappers
export function applyTheme(theme: ThemeMode): void {
  setTheme(theme);
}

export function applyColorMode(color: ThemeColor): void {
  setThemeColor(color);
}

export const VALID_THEME_COLORS = THEME_COLOR_IDS;

// ============================================================================
// React Components & Theme Provider
// ============================================================================

interface ThemeContextType {
  currentTheme: ThemeMode;
  currentColor: ThemeColor;
  fontScale: number;
  motionIntensity: number;
  setTheme: (theme: ThemeMode) => void;
  setColor: (color: ThemeColor) => void;
  setFontScale: (scale: number) => void;
  setMotionIntensity: (intensity: number) => void;
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
    custom: {
      ...themeOptions.custom,
      semantic: {
        surface: {
          page: paletteSpec.background.default,
          panel: paletteSpec.background.paper,
          elevated: paletteSpec.background.secondary,
          sunken: alpha(paletteSpec.background.default, mode === 'dark' ? 0.95 : 0.9),
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
  const user = useAuthStore((state) => state.user);
  const remoteHydratedRef = React.useRef(false);
  const remoteApplyGuardRef = React.useRef(false);
  const lastPersistedRemoteKeyRef = React.useRef<string | null>(null);

  const theme = useMemo(() => {
    const baseThemeOptions = getThemeOptions(preferences.theme);
    const themeObj = createTheme(applyColorPalette(baseThemeOptions, preferences.color));
    return themeObj;
  }, [preferences.theme, preferences.color]);

  const setTheme = (mode: ThemeMode) => {
    setPreferences((previous) => {
      const next = {
        ...previous,
        theme: mode,
      } satisfies ThemePreferences;
      setThemePreferences(next);
      return next;
    });
  };

  const setColor = (color: ThemeColor) => {
    setPreferences((previous) => {
      const next = {
        ...previous,
        color,
      } satisfies ThemePreferences;
      setThemePreferences(next);
      return next;
    });
  };

  const setFontScale = (scale: number) => {
    setPreferences((previous) => {
      const next = {
        ...previous,
        fontScale: clamp(scale, MIN_FONT_SCALE, MAX_FONT_SCALE),
      } satisfies ThemePreferences;
      setThemePreferences(next);
      return next;
    });
  };

  const setMotionIntensity = (intensity: number) => {
    setPreferences((previous) => {
      const next = {
        ...previous,
        motionIntensity: clamp(intensity, MIN_MOTION_INTENSITY, MAX_MOTION_INTENSITY),
      } satisfies ThemePreferences;
      setThemePreferences(next);
      return next;
    });
  };

  useEffect(() => {
    remoteHydratedRef.current = false;
    remoteApplyGuardRef.current = false;
    lastPersistedRemoteKeyRef.current = null;

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
        setThemePreferences(nextPreferences);
      } catch (error) {
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
          console.warn('Failed to persist server theme preferences:', error);
        });
    }, 280);

    return () => window.clearTimeout(timer);
  }, [preferences.theme, preferences.color, preferences.fontScale, preferences.motionIntensity, user?.id]);

  useEffect(() => {
    const tokens = getThemeColorTokens(preferences.color);
    const palette = getThemeColorPalette(preferences.color);
    const visual = getThemeVisualSpec(preferences.theme);
    const mode = isLightColorTheme(preferences.color) ? 'light' : 'dark';

    const root = document.documentElement;
    root.setAttribute('data-theme', preferences.theme);
    root.setAttribute('data-theme-mode', mode);
    root.setAttribute('data-theme-color', preferences.color);

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
      '--sys-border-default': palette.divider,
      '--sys-border-strong': alpha(palette.text.primary, mode === 'dark' ? 0.58 : 0.44),
      '--sys-border-subtle': alpha(palette.divider, mode === 'dark' ? 0.72 : 0.62),
      '--sys-interactive-accent': palette.primary.main,
      '--sys-interactive-hover': alpha(palette.primary.main, mode === 'dark' ? 0.22 : 0.16),
      '--sys-interactive-active': alpha(palette.primary.main, mode === 'dark' ? 0.3 : 0.22),
      '--sys-interactive-focus-ring': alpha(palette.primary.main, mode === 'dark' ? 0.72 : 0.64),
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
      '--theme-motion-intensity': preferences.motionIntensity.toString(),
      '--theme-border-width': visual.borderWidth,
      '--theme-border-radius': `${visual.shape.borderRadius}px`,
      '--theme-border-style': visual.borderStyle,
      '--theme-shadow-sm': visual.shadows[1],
      '--theme-shadow-md': visual.shadows[2],
      '--theme-shadow-lg': visual.shadows[3],
      '--theme-bg-pattern': visual.bgPattern,
      '--theme-bg-size': visual.bgSize,
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
      '--cmp-input-placeholder': alpha(palette.text.secondary, 0.88),
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

    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    applyMotionScaleTokens(root, preferences.motionIntensity);

    const body = document.body;
    for (const preset of THEME_PRESET_LIST) {
      body.classList.remove(`theme-${preset.id}`);
    }
    for (const preset of THEME_COLOR_PRESET_LIST) {
      body.classList.remove(`color-${preset.id}`);
    }
    body.classList.add(`theme-${preferences.theme}`);
    body.classList.add(`color-${preferences.color}`);

    root.setAttribute('data-theme-switching', 'true');
    const timer = window.setTimeout(() => {
      root.removeAttribute('data-theme-switching');
    }, 520);

    return () => window.clearTimeout(timer);
  }, [preferences.theme, preferences.color, preferences.fontScale, preferences.motionIntensity]);


  return (
    <ThemeContext.Provider
      value={{
        currentTheme: preferences.theme,
        currentColor: preferences.color,
        fontScale: preferences.fontScale,
        motionIntensity: preferences.motionIntensity,
        setTheme,
        setColor,
        setFontScale,
        setMotionIntensity,
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

  const resolvedTitle = title ?? t('settings.visual_theme');
  const resolvedSubtitle = subtitle ?? t('settings.visual_theme_subtitle');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    theme.setTheme(event.target.value as ThemeMode);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        borderColor: alpha(muiTheme.palette.primary.main, 0.2),
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
              return (
                <Box
                  key={opt.id}
                  sx={{
                    border: `1px solid ${isSelected ? muiTheme.palette.primary.main : muiTheme.palette.divider}`,
                    borderRadius: 3,
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
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: 1,
                              background: (opt as any).swatch || muiTheme.palette.primary.main,
                              boxShadow: `0 0 0 2px ${alpha((opt as any).swatch || muiTheme.palette.primary.main, 0.2)}`,
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

  const resolvedTitle = title ?? t('settings.color_palette');
  const resolvedSubtitle = subtitle ?? t('settings.color_palette_subtitle');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    theme.setColor(event.target.value as ThemeColor);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        borderColor: alpha(muiTheme.palette.secondary.main, 0.2),
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
                    borderRadius: 3,
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
