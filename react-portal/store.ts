import { create } from 'zustand';
import { User, Role } from './types';

interface AudioSettings {
  mute: boolean;
  volume: number;
}

const getSavedAudioSettings = (): AudioSettings => {
  try {
    const saved = localStorage.getItem('audio_settings');
    return saved ? JSON.parse(saved) : { mute: false, volume: 50 };
  } catch (e) {
    return { mute: false, volume: 50 };
  }
};

// ============================================================================
// UI STORE - Client-side UI state only
// ============================================================================

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  audioSettings: AudioSettings;
  setAudioSettings: (settings: Partial<AudioSettings>) => void;
  undoBuffer: any | null;
  setUndoBuffer: (buffer: any) => void;
  clearUndoBuffer: () => void;
  pageTitle: string;
  setPageTitle: (title: string) => void;
  timezoneOffset: number;
  setTimezoneOffset: (offset: number) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
  audioSettings: getSavedAudioSettings(),
  setAudioSettings: (updates) => {
    const next = { ...get().audioSettings, ...updates };
    localStorage.setItem('audio_settings', JSON.stringify(next));
    set({ audioSettings: next });
  },
  undoBuffer: null,
  setUndoBuffer: (buffer) => set({ undoBuffer: buffer }),
  clearUndoBuffer: () => set({ undoBuffer: null }),
  pageTitle: '',
  setPageTitle: (title) => set({ pageTitle: title }),
  timezoneOffset: (() => {
    try {
      return JSON.parse(localStorage.getItem('timezone_offset') || '0');
    } catch {
      return 0;
    }
  })(),
  setTimezoneOffset: (offset) => {
    localStorage.setItem('timezone_offset', JSON.stringify(offset));
    set({ timezoneOffset: offset });
  },
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
