/**
 * Theme System
 *
 * All theme-related exports including:
 * - React components (ThemeControllerProvider, ThemeSection, ColorSection)
 * - Theme utilities (initTheme, setTheme, getTheme, etc.)
 * - Types and presets
 */

// React Components & Hooks
export {
  ThemeControllerProvider,
  useThemeController,
  ThemeSection,
  ColorSection,
  ThemeColorPicker,
} from './ThemeController';
export { ThemeControllerProvider as ThemeController } from './ThemeController';

// Theme Engine Utilities (Pure Functions)
export {
  initTheme,
  initThemePreferences,
  setTheme,
  setThemeColor,
  setThemePreferences,
  getTheme,
  getThemeColor,
  getThemePreferences,
  onThemeChange,
  type ColorBlindMode,
  type ThemePreferences,
} from './ThemeController';

// Types
export * from './types/types';

// Presets & Colors
export * from './presets';
export * from './colors';
export * from './runtimeContracts';
export * from './rollout';
export * from './rolloutMonitoring';
