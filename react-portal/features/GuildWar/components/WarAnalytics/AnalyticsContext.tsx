/**
 * War Analytics - Context Provider
 *
 * Centralized state management for analytics mode, filters, and mode-specific state
 */

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import {
  AnalyticsFilters,
  PlayerModeState,
  CompareModeState,
  RankingsModeState,
  TeamsModeState,
  DEFAULT_FILTERS,
  DEFAULT_PLAYER_MODE,
  DEFAULT_COMPARE_MODE,
  DEFAULT_RANKINGS_MODE,
  DEFAULT_TEAMS_MODE,
  SELECTION_LIMITS,
} from './types';

// ============================================================================
// Context Types
// ============================================================================

interface AnalyticsContextValue {
  // Global filters
  filters: AnalyticsFilters;
  updateFilters: (updates: Partial<AnalyticsFilters>) => void;
  resetFilters: () => void;

  // Player mode
  playerMode: PlayerModeState;
  updatePlayerMode: (updates: Partial<PlayerModeState>) => void;
  resetPlayerMode: () => void;

  // Compare mode
  compareMode: CompareModeState;
  updateCompareMode: (updates: Partial<CompareModeState>) => void;
  resetCompareMode: () => void;
  toggleUserSelection: (userId: number) => void;
  focusUser: (userId: number | undefined) => void;
  toggleUserVisibility: (userId: number) => void;
  clearHiddenUsers: () => void;

  // Rankings mode
  rankingsMode: RankingsModeState;
  updateRankingsMode: (updates: Partial<RankingsModeState>) => void;
  resetRankingsMode: () => void;

  // Teams mode
  teamsMode: TeamsModeState;
  updateTeamsMode: (updates: Partial<TeamsModeState>) => void;
  resetTeamsMode: () => void;

  // Utility
  resetAllModes: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // Global filters state
  const [filters, setFilters] = useState<AnalyticsFilters>(DEFAULT_FILTERS);

  // Mode-specific states
  const [playerMode, setPlayerMode] = useState<PlayerModeState>(DEFAULT_PLAYER_MODE);
  const [compareMode, setCompareMode] = useState<CompareModeState>(DEFAULT_COMPARE_MODE);
  const [rankingsMode, setRankingsMode] = useState<RankingsModeState>(DEFAULT_RANKINGS_MODE);
  const [teamsMode, setTeamsMode] = useState<TeamsModeState>(DEFAULT_TEAMS_MODE);

  // ============================================================================
  // Global Filters Actions
  // ============================================================================

  const updateFilters = useCallback((updates: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // ============================================================================
  // Player Mode Actions
  // ============================================================================

  const updatePlayerMode = useCallback((updates: Partial<PlayerModeState>) => {
    setPlayerMode(prev => ({ ...prev, ...updates }));
  }, []);

  const resetPlayerMode = useCallback(() => {
    setPlayerMode(DEFAULT_PLAYER_MODE);
  }, []);

  // ============================================================================
  // Compare Mode Actions
  // ============================================================================

  const updateCompareMode = useCallback((updates: Partial<CompareModeState>) => {
    setCompareMode(prev => {
      // Handle Set updates carefully
      if (updates.hiddenUserIds !== undefined) {
        return { ...prev, ...updates };
      }
      return { ...prev, ...updates };
    });
  }, []);

  const resetCompareMode = useCallback(() => {
    setCompareMode(DEFAULT_COMPARE_MODE);
  }, []);

  const toggleUserSelection = useCallback((userId: number) => {
    setCompareMode(prev => {
      const isSelected = prev.selectedUserIds.includes(userId);

      if (isSelected) {
        // Remove user
        return {
          ...prev,
          selectedUserIds: prev.selectedUserIds.filter(id => id !== userId),
          // Clear focus if removing focused user
          focusedUserId: prev.focusedUserId === userId ? undefined : prev.focusedUserId,
          // Remove from hidden set
          hiddenUserIds: new Set([...prev.hiddenUserIds].filter(id => id !== userId)),
        };
      } else {
        // Add user (check hard cap)
        if (prev.selectedUserIds.length >= SELECTION_LIMITS.COMPARE_HARD_CAP) {
          console.warn(`Cannot select more than ${SELECTION_LIMITS.COMPARE_HARD_CAP} users`);
          return prev;
        }

        return {
          ...prev,
          selectedUserIds: [...prev.selectedUserIds, userId],
        };
      }
    });
  }, []);

  const focusUser = useCallback((userId: number | undefined) => {
    setCompareMode(prev => ({
      ...prev,
      focusedUserId: userId,
    }));
  }, []);

  const toggleUserVisibility = useCallback((userId: number) => {
    setCompareMode(prev => {
      const newHidden = new Set(prev.hiddenUserIds);
      if (newHidden.has(userId)) {
        newHidden.delete(userId);
      } else {
        newHidden.add(userId);
      }
      return {
        ...prev,
        hiddenUserIds: newHidden,
      };
    });
  }, []);

  const clearHiddenUsers = useCallback(() => {
    setCompareMode(prev => ({
      ...prev,
      hiddenUserIds: new Set(),
    }));
  }, []);

  // ============================================================================
  // Rankings Mode Actions
  // ============================================================================

  const updateRankingsMode = useCallback((updates: Partial<RankingsModeState>) => {
    setRankingsMode(prev => ({ ...prev, ...updates }));
  }, []);

  const resetRankingsMode = useCallback(() => {
    setRankingsMode(DEFAULT_RANKINGS_MODE);
  }, []);

  // ============================================================================
  // Teams Mode Actions
  // ============================================================================

  const updateTeamsMode = useCallback((updates: Partial<TeamsModeState>) => {
    setTeamsMode(prev => ({ ...prev, ...updates }));
  }, []);

  const resetTeamsMode = useCallback(() => {
    setTeamsMode(DEFAULT_TEAMS_MODE);
  }, []);

  // ============================================================================
  // Reset All
  // ============================================================================

  const resetAllModes = useCallback(() => {
    resetFilters();
    resetPlayerMode();
    resetCompareMode();
    resetRankingsMode();
    resetTeamsMode();
  }, [resetFilters, resetPlayerMode, resetCompareMode, resetRankingsMode, resetTeamsMode]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: AnalyticsContextValue = {
    // Global filters
    filters,
    updateFilters,
    resetFilters,

    // Player mode
    playerMode,
    updatePlayerMode,
    resetPlayerMode,

    // Compare mode
    compareMode,
    updateCompareMode,
    resetCompareMode,
    toggleUserSelection,
    focusUser,
    toggleUserVisibility,
    clearHiddenUsers,

    // Rankings mode
    rankingsMode,
    updateRankingsMode,
    resetRankingsMode,

    // Teams mode
    teamsMode,
    updateTeamsMode,
    resetTeamsMode,

    // Utility
    resetAllModes,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to check if selection limit warnings should be shown
 */
export function useSelectionLimits() {
  const { compareMode } = useAnalytics();

  const selectedCount = compareMode.selectedUserIds.length;
  const showSoftWarning = selectedCount >= SELECTION_LIMITS.COMPARE_SOFT_CAP;
  const reachedHardCap = selectedCount >= SELECTION_LIMITS.COMPARE_HARD_CAP;

  return {
    selectedCount,
    showSoftWarning,
    reachedHardCap,
    softCap: SELECTION_LIMITS.COMPARE_SOFT_CAP,
    hardCap: SELECTION_LIMITS.COMPARE_HARD_CAP,
  };
}

/**
 * Hook to get current mode state based on active mode
 */
export function useCurrentModeState() {
  const { filters, playerMode, compareMode, rankingsMode, teamsMode } = useAnalytics();

  switch (filters.mode) {
    case 'player':
      return playerMode;
    case 'compare':
      return compareMode;
    case 'rankings':
      return rankingsMode;
    case 'teams':
      return teamsMode;
    default:
      return null;
  }
}

/**
 * Hook to check if any data is selected (for enabling/disabling chart render)
 */
export function useHasSelection() {
  const { filters, playerMode, compareMode, rankingsMode, teamsMode } = useAnalytics();

  switch (filters.mode) {
    case 'player':
      return playerMode.selectedUserId !== null && filters.selectedWars.length > 0;
    case 'compare':
      return compareMode.selectedUserIds.length > 0 && filters.selectedWars.length > 0;
    case 'rankings':
      return filters.selectedWars.length > 0;
    case 'teams':
      return teamsMode.selectedTeamIds.length > 0 && filters.selectedWars.length > 0;
    default:
      return false;
  }
}
