import { create } from 'zustand';
import { 
  User, Role, Event, Announcement, AuditLogEntry, 
  WarHistoryEntry, WarTeam, 
} from './types';
import { eventsAPI, membersAPI, announcementsAPI, warsAPI, adminAPI } from './lib/api';

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

// --- UI STORE ---
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
      } catch { return 0; }
  })(),
  setTimezoneOffset: (offset) => {
    localStorage.setItem('timezone_offset', JSON.stringify(offset));
    set({ timezoneOffset: offset });
  },
}));

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

interface GuildState {
  events: Event[];
  members: User[];
  announcements: Announcement[];
  auditLogs: AuditLogEntry[];
  warHistory: WarHistoryEntry[];
  activeWarTeams: Record<string, WarTeam[]>;
  isLoading: boolean;
  // Polling state
  lastPolled: string | null;
  lastPollTimestamp: string | null; // ISO timestamp for incremental polling
  isPolling: boolean;
  pollingIntervalId: NodeJS.Timeout | null;
  fetchData: () => Promise<void>;
  // Polling methods
  pollData: () => Promise<boolean>;
  startPolling: (interval?: number, initialErrorCount?: number) => void;
  stopPolling: () => void;
  updateMember: (id: string, updates: Partial<User>) => Promise<void>;
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  joinEvent: (eventId: string, userId: string) => Promise<void>;
  leaveEvent: (eventId: string, userId: string) => Promise<void>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  archiveEvent: (id: string, isArchived: boolean) => Promise<void>;
  togglePinEvent: (id: string) => Promise<void>;
  toggleLockEvent: (id: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  updateWarTeams: (warId: string, teams: WarTeam[]) => void;
  createAnnouncement: (data: { title: string; content_html: string; author_id: string; media_urls?: string[] }) => Promise<void>;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  togglePinAnnouncement: (id: string) => Promise<void>;
  archiveAnnouncement: (id: string, isArchived: boolean) => Promise<void>;
  changePassword: (userId: string, current: string, next: string) => Promise<boolean>;
}

export const useGuildStore = create<GuildState>((set, get) => ({
  events: [],
  members: [],
  announcements: [],
  auditLogs: [],
  warHistory: [],
  activeWarTeams: {},
  isLoading: false,
  // Polling state
  lastPolled: null,
  lastPollTimestamp: null,
  isPolling: false,
  pollingIntervalId: null,

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const [membersRes, eventsRes, announcementsRes] = await Promise.allSettled([
        membersAPI.list(),
        eventsAPI.list(),
        announcementsAPI.list(),
      ]);

      if (membersRes.status === 'fulfilled') {
        set({ members: membersRes.value });
      }
      if (eventsRes.status === 'fulfilled') {
        set({ events: eventsRes.value });
      }
      if (announcementsRes.status === 'fulfilled') {
        set({ announcements: announcementsRes.value });
      }

      set({
        lastPolled: new Date().toISOString(),
        isLoading: false,
      });

      // Lazy load history (best-effort)
      warsAPI
        .getHistory({ limit: 10 })
        .then((history) => {
          set({ warHistory: history });
        })
        .catch(() => {});
    } catch (err) {
      console.warn('API unavailable or failed.', err);
      set({ isLoading: false });
    }
  },

  pollData: async () => {
    // Use incremental polling if we have a timestamp, otherwise full fetch
   const { lastPollTimestamp, members, events, announcements } = get();
    
    try {
      if (lastPollTimestamp) {
        // Incremental poll - fetch only changes
        const response = await fetch(
          `${(import.meta as any).env.VITE_API_BASE_URL}/api/poll?since=${encodeURIComponent(lastPollTimestamp)}`,
          { credentials: 'include' }
        );
        
        if (!response.ok) {
          console.warn('[Polling] Incremental poll failed, falling back to full fetch');
          const { fetchData } = get();
          await fetchData();
          return true;
        }
        
        const delta = await response.json();
        
        // Merge delta updates
        let updatedMembers = [...members];
        let updatedEvents = [...events];
        let updatedAnnouncements = [...announcements];
        
        // Update/add members
        delta.members.updated.forEach((updated: any) => {
          const index = updatedMembers.findIndex(m => m.id === updated.id);
          if (index >= 0) {
            updatedMembers[index] = updated;
          } else {
            updatedMembers.push(updated);
          }
        });
        
        // Remove deleted members
        delta.members.deleted.forEach((id: string) => {
          updatedMembers = updatedMembers.filter(m => m.id !== id);
        });
        
        // Update/add events
        delta.events.updated.forEach((updated: any) => {
          const index = updatedEvents.findIndex(e => e.id === updated.id);
          if (index >= 0) {
            updatedEvents[index] = updated;
          } else {
            updatedEvents.push(updated);
          }
        });
        
        // Remove deleted events
        delta.events.deleted.forEach((id: string) => {
          updatedEvents = updatedEvents.filter(e => e.id !== id);
        });
        
        // Update/add announcements
        delta.announcements.updated.forEach((updated: any) => {
          const index = updatedAnnouncements.findIndex(a => a.id === updated.id);
          if (index >= 0) {
            updatedAnnouncements[index] = updated;
          } else {
            updatedAnnouncements.push(updated);
          }
        });
        
        // Remove deleted announcements
        delta.announcements.deleted.forEach((id: string) => {
          updatedAnnouncements = updatedAnnouncements.filter(a => a.id !== id);
        });
        
        set({ 
          members: updatedMembers,
          events: updatedEvents,
          announcements: updatedAnnouncements,
          lastPollTimestamp: delta.latestTimestamp,
          lastPolled: new Date().toISOString(),
        });
        
        console.info(`[Polling] Delta update: ${delta.members.updated.length} members, ${delta.events.updated.length} events, ${delta.announcements.updated.length} announcements`);
      } else {
        // First poll or no timestamp - do full fetch
        const { fetchData } = get();
        await fetchData();
        // Set initial timestamp for next incremental poll
        set({ lastPollTimestamp: new Date().toISOString() });
      }
      
      return true;
    } catch (error) {
      console.warn('[Polling] Error during poll:', error);
      return false;
    }
  },

  startPolling: (interval = 30000, initialErrorCount = 0) => {
    const { pollingIntervalId, pollData, stopPolling } = get();
    if (pollingIntervalId) clearInterval(pollingIntervalId);
    
    let errorCount = initialErrorCount;
    const maxErrors = 5;
    const backoffMultiplier = 2;
    const maxInterval = 120000; // 2 minutes max
    
    const poll = async () => {
      const success = await pollData();
      
      if (!success) {
        // Error occurred - apply exponential backoff
        errorCount++;
        if (errorCount >= maxErrors) {
          console.warn('[Polling] Max errors reached, stopping polling');
          stopPolling();
          return;
        }
        
        const newInterval = Math.min(
          interval * Math.pow(backoffMultiplier, errorCount),
          maxInterval
        );
        
        console.warn(`[Polling] Backing off to ${newInterval / 1000}s due to error (Count: ${errorCount})`);
        
        // Restart with new interval and preserved error count
        stopPolling();
        setTimeout(() => get().startPolling(interval, errorCount), newInterval);
      } else {
        // Success - reset error count if needed
        if (errorCount > 0) {
          console.info('[Polling] Recovered from errors, resetting interval');
          errorCount = 0;
          // Restart with original interval to clear any backoff state
          stopPolling();
          get().startPolling(interval, 0);
        }
      }
    };
    
    const id = setInterval(poll, interval);
    set({ pollingIntervalId: id, isPolling: true });
  },

  stopPolling: () => {
    const { pollingIntervalId } = get();
    if (pollingIntervalId) clearInterval(pollingIntervalId);
    set({ pollingIntervalId: null, isPolling: false });
  },

  updateMember: async (id, updates) => {
    try {
        // Optimistic
        set(state => ({
            members: state.members.map(m => m.id === id ? { ...m, ...updates } : m)
        }));
        
        // API call
        // We need to map partial User updates to API methods
        // This is tricky as API is granular. 
        // For now, assuming basic profile updates
        if (updates.bio || updates.title_html || updates.power) {
            await membersAPI.updateProfile(id, {
                bioText: updates.bio,
                titleHtml: updates.title_html,
                power: updates.power
            });
        }
    } catch (e) {
        console.error("Update member failed", e);
        get().fetchData(); // Revert
    }
  },

  addAuditLog: (_entry) => {
    // Frontend doesn't create logs, backend does.
    // We just refresh logs
    adminAPI.getAuditLogs({ limit: 20 }).then(res => {
        set({ auditLogs: res.logs });
    });
  },

  joinEvent: async (eventId, _userId) => {
    try {
        await eventsAPI.join(eventId);
        get().fetchData(); 
    } catch (e) { console.error(e); }
  },

  leaveEvent: async (eventId, _userId) => {
    try {
        await eventsAPI.leave(eventId);
        get().fetchData();
    } catch (e) { console.error(e); }
  },

  updateEvent: async (id, updates) => {
    try {
        // Map updates to CreateEventData partials
        await eventsAPI.update(id, {
            title: updates.title,
            description: updates.description,
            startAt: updates.start_time,
            endAt: updates.end_time || undefined,
            type: updates.type
        });
        get().fetchData();
    } catch (e) { console.error(e); }
  },

  archiveEvent: async (id, isArchived) => {
    try {
        if (isArchived) await eventsAPI.delete(id); // Using delete/archive endpoint
        get().fetchData();
    } catch (e) { console.error(e); }
  },

  togglePinEvent: async (id) => {
     try {
         await eventsAPI.togglePin(id);
         get().fetchData();
     } catch (e) { console.error(e); }
  },

  toggleLockEvent: async (id) => {
     try {
         await eventsAPI.toggleLock(id);
         get().fetchData();
     } catch (e) { console.error(e); }
  },

  deleteEvent: async (id) => {
      try {
          await eventsAPI.delete(id);
          get().fetchData();
      } catch (e) { console.error(e); }
  },

  updateWarTeams: (_warId, _teams) => {
    // Local optimistic update for UI drag & drop
    // Real save should happen via specific API calls on "Save"
    // set((state) => ({ activeWarTeams: { ...state.activeWarTeams, [warId]: teams } }));
  },

  createAnnouncement: async (data) => {
      try {
          await announcementsAPI.create({
              title: data.title,
              bodyHtml: data.content_html,
              mediaUrls: data.media_urls
          });
          get().fetchData();
      } catch (e) { console.error(e); }
  },

  updateAnnouncement: async (id, updates) => {
      try {
          await announcementsAPI.update(id, {
              title: updates.title,
              bodyHtml: updates.content_html,
              isPinned: updates.is_pinned
          });
          get().fetchData();
      } catch (e) { console.error(e); }
  },

  deleteAnnouncement: async (id) => {
      try {
          await announcementsAPI.delete(id);
          get().fetchData();
      } catch (e) { console.error(e); }
  },

  togglePinAnnouncement: async (id) => {
      try {
          await announcementsAPI.pin(id);
          get().fetchData();
      } catch (e) { console.error(e); }
  },

  archiveAnnouncement: async (id, isArchived) => {
       try {
          await announcementsAPI.archive(id, isArchived);
          get().fetchData();
      } catch (e) { console.error(e); }
  },

  changePassword: async (userId, _current, _next) => {
      try {
          await membersAPI.resetPassword(userId); // Warning: this usually requires existing password check in real app
          return true;
      } catch (e) { return false; }
  },
}));
