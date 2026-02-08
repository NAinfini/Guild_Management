
/**
 * Local storage helpers.
 * Standardizes storage keys and read/write behavior across the portal.
 */

export const STORAGE_KEYS = {
  ANNOUNCEMENTS_LAST_SEEN: 'baiye_announcements_last_seen',
  EVENTS_LAST_SEEN: 'baiye_events_last_seen',
  MEMBERS_LAST_SEEN: 'baiye_members_last_seen',
  ROSTER_FILTERS: 'baiye_roster_filters',
  ROSTER_FILTERS_LEGACY: 'roster_filters',
  ROSTER_FILTER_PRESETS: 'roster_filter_presets',
  AUDIO_SETTINGS: 'audio_settings',
  TIMEZONE_OFFSET: 'timezone_offset',
  UI_THEME: 'baiye_theme',
  I18N_LANG: 'i18nextLng',
} as const;

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage ?? null;
}

function parseStoredValue<T>(raw: string, defaultValue: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Backward compatibility: plain strings were sometimes stored without JSON.
    if (typeof defaultValue === 'string') {
      return raw as unknown as T;
    }
    return defaultValue;
  }
}

export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    const localStorage = getLocalStorage();
    if (!localStorage) return defaultValue;

    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return parseStoredValue(item, defaultValue);
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    const localStorage = getLocalStorage();
    if (!localStorage) return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error);
    }
  },

  remove: (key: string): void => {
    const localStorage = getLocalStorage();
    if (!localStorage) return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  },
};
