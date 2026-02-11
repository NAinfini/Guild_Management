import { create } from 'zustand';
import { User, Role } from './types';
import { storage, STORAGE_KEYS } from './lib/storage';

interface AudioSettings {
  mute: boolean;
  volume: number;
}

const getSavedAudioSettings = (): AudioSettings => {
  return storage.get<AudioSettings>(STORAGE_KEYS.AUDIO_SETTINGS, { mute: false, volume: 50 });
};

// ============================================================================
// UI STORE - Client-side UI state only
// ============================================================================

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  audioSettings: AudioSettings;
  setAudioSettings: (settings: Partial<AudioSettings>) => void;
  undoBuffer: any | null;
  setUndoBuffer: (buffer: any) => void;
  clearUndoBuffer: () => void;
  pageTitle: string;
  setPageTitle: (title: string) => void;
  timezoneOffset: number;
  setTimezoneOffset: (offset: number) => void;
  pushConnected: boolean;
  setPushConnected: (connected: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
  sidebarCollapsed: storage.get<boolean>(STORAGE_KEYS.SIDEBAR_COLLAPSED, false),
  toggleSidebarCollapsed: () =>
    set((state) => {
      const next = !state.sidebarCollapsed;
      storage.set(STORAGE_KEYS.SIDEBAR_COLLAPSED, next);
      return { sidebarCollapsed: next };
    }),
  setSidebarCollapsed: (collapsed) => {
    storage.set(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed);
    set({ sidebarCollapsed: collapsed });
  },
  audioSettings: getSavedAudioSettings(),
  setAudioSettings: (updates) => {
    const next = { ...get().audioSettings, ...updates };
    storage.set(STORAGE_KEYS.AUDIO_SETTINGS, next);
    set({ audioSettings: next });
  },
  undoBuffer: null,
  setUndoBuffer: (buffer) => set({ undoBuffer: buffer }),
  clearUndoBuffer: () => set({ undoBuffer: null }),
  pageTitle: '',
  setPageTitle: (title) => set({ pageTitle: title }),
  timezoneOffset: storage.get<number>(STORAGE_KEYS.TIMEZONE_OFFSET, 0),
  setTimezoneOffset: (offset) => {
    storage.set(STORAGE_KEYS.TIMEZONE_OFFSET, offset);
    set({ timezoneOffset: offset });
  },
  pushConnected: false,
  setPushConnected: (connected) => set({ pushConnected: connected }),
}));

// ============================================================================
// AUTH STORE - Authentication session state
// ============================================================================

interface AuthState {
  user: User | null;
  viewRole: Role | null; // For simulating other roles
  csrfToken: string | null; // CSRF token for request protection
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setCsrfToken: (token: string | null) => void;
  clearError: () => void;
  setViewRole: (role: Role | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  viewRole: null,
  csrfToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  setUser: (user) => set({ user, isAuthenticated: !!user, error: null }),
  setCsrfToken: (token) => set({ csrfToken: token }),
  clearError: () => set({ error: null }),
  setViewRole: (role) => set({ viewRole: role }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));

// ============================================================================
// MIGRATION COMPLETE ✅
// ============================================================================
// All server state (members, events, announcements, etc.) has been migrated
// to TanStack Query hooks in hooks/useServerState.ts
//
// Benefits:
// - 78% code reduction (472 lines → 106 lines)
// - Automatic caching and deduplication
// - Background refetching (no manual polling needed)
// - Optimistic updates
// - Shared cache across components
// - Better TypeScript inference
// - Automatic error handling
//
// See docs/STATE_MANAGEMENT_MIGRATION.md for details
// ============================================================================
