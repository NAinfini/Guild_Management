
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
      if (item === null) return defaultValue;
      
      try {
        return JSON.parse(item);
      } catch {
        // Fallback: If parsing fails, it might be a raw string. 
        // If the expected type T seems to be a string (based on defaultValue), return the raw item.
        if (typeof defaultValue === 'string') {
            return item as unknown as T;
        }
        // console.warn(`Error reading localStorage key "${key}"`);
        return defaultValue;
      }
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
