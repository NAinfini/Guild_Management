/**
 * Theme Controller - Centralized theme management
 *
 * Provides:
 * - initTheme(): Initialize theme from localStorage on app boot
 * - setTheme(theme): Change theme and persist to localStorage
 * - getTheme(): Get current theme name
 *
 * Themes: chinese-ink, dark-gold, neon-spectral, redgold, softpink
 *
 * Usage:
 * import { initTheme, setTheme, getTheme } from './themeController';
 *
 * // On app init
 * initTheme();
 *
 * // Change theme
 * setTheme('dark-gold');
 *
 * // Get current theme
 * const current = getTheme();
 */

export type ThemeMode =
  | 'default'
  | 'chinese-ink'
  | 'dark-gold'
  | 'neon-spectral'
  | 'redgold'
  | 'softpink';

const STORAGE_KEY = 'baiye_theme';
const DEFAULT_THEME: ThemeMode = 'default';

/**
 * Initialize theme from localStorage or use default
 * Call this once on app boot
 */
export function initTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const theme = (stored as ThemeMode) || DEFAULT_THEME;

    // Validate theme
    const validThemes: ThemeMode[] = [
      'default',
      'chinese-ink',
      'dark-gold',
      'neon-spectral',
      'redgold',
      'softpink',
    ];

    if (!validThemes.includes(theme)) {
      console.warn(`Invalid theme "${stored}", using default: ${DEFAULT_THEME}`);
      setTheme(DEFAULT_THEME);
      return DEFAULT_THEME;
    }

    // Apply theme to DOM
    document.documentElement.dataset.theme = theme;
    return theme;
  } catch (error) {
    console.error('Failed to init theme:', error);
    return DEFAULT_THEME;
  }
}

/**
 * Change theme and persist to localStorage
 * @param theme - Theme name
 */
export function setTheme(theme: ThemeMode): void {
  try {
    // Update DOM
    document.documentElement.dataset.theme = theme;

    // Persist to localStorage
    localStorage.setItem(STORAGE_KEY, theme);

    // Dispatch custom event for listeners
    window.dispatchEvent(
      new CustomEvent('theme-change', { detail: { theme } })
    );
  } catch (error) {
    console.error('Failed to set theme:', error);
  }
}

/**
 * Get current theme name
 * @returns Current theme or default
 */
export function getTheme(): ThemeMode {
  try {
    const current = document.documentElement.dataset.theme as ThemeMode;
    return current || DEFAULT_THEME;
  } catch (error) {
    console.error('Failed to get theme:', error);
    return DEFAULT_THEME;
  }
}

/**
 * Listen to theme changes
 * @param callback - Function to call when theme changes
 * @returns Cleanup function
 */
export function onThemeChange(callback: (theme: ThemeMode) => void): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<{ theme: ThemeMode }>;
    callback(customEvent.detail.theme);
  };

  window.addEventListener('theme-change', handler);

  return () => {
    window.removeEventListener('theme-change', handler);
  };
}
