
/**
 * Local Storage Helpers
 * Standardizes storage keys and access across the application
 */

export const STORAGE_KEYS = {
  ANNOUNCEMENTS_LAST_SEEN: 'baiye_announcements_last_seen',
  EVENTS_LAST_SEEN: 'baiye_events_last_seen',
  ROSTER_FILTERS: 'baiye_roster_filters',
  UI_THEME: 'baiye_theme',
  I18N_LANG: 'i18nextLng',
} as const;

export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error);
    }
  },
  
  remove: (key: string): void => {
    window.localStorage.removeItem(key);
  }
};
