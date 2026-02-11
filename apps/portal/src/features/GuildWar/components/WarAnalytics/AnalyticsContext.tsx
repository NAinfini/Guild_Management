/**
 * War Analytics - Context Provider
 *
 * Centralized state management for analytics mode, filters, and mode-specific state
 */

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import {
  AnalyticsFilters,
  AnalyticsMode,
  MetricType,
  AggregationType,
  AnalyticsDrilldownState,
  CompareModeState,
  RankingsModeState,
  TeamsModeState,
  DEFAULT_FILTERS,
  DEFAULT_DRILLDOWN_STATE,
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

  // Drill-down panel
  drilldown: AnalyticsDrilldownState;
  openWarDetail: (params: {
    warId: number | string;
    sourceMode: AnalyticsMode;
    userId?: number;
    teamId?: number;
  }) => void;
  closeWarDetail: () => void;

  // Utility
  resetAllModes: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

const ANALYTICS_QUERY_KEYS = {
  mode: 'aw_mode',
  wars: 'aw_wars',
  startDate: 'aw_start',
  endDate: 'aw_end',
  participationOnly: 'aw_participation',
  opponentNormalized: 'aw_norm',
  metric: 'aw_metric',
  aggregation: 'aw_agg',
  selectedUsers: 'aw_users',
  selectedMetrics: 'aw_compare_metrics',
  selectedTeams: 'aw_teams',
  rankingsTopN: 'aw_top_n',
  rankingsMinParticipation: 'aw_min_part',
  rankingsClassFilter: 'aw_class',
} as const;

function parseNumericList(value: string | null | undefined): number[] {
  if (!value) return [];

  return [...new Set(
    value
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isFinite(item))
  )];
}

function parseStringList(value: string | null | undefined): string[] {
  if (!value) return [];
  return [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))];
}

function parseMetricList(value: string | null | undefined): MetricType[] {
  const parsed = parseStringList(value).filter(
    (metric): metric is MetricType => metric in METRIC_SET
  );
  return parsed.length > 0 ? parsed : [...DEFAULT_COMPARE_MODE.selectedMetrics];
}

const ANALYTICS_MODES: AnalyticsMode[] = ['compare', 'rankings', 'teams'];
const METRIC_SET = new Set<MetricType>(['damage', 'healing', 'building_damage', 'credits', 'kills', 'deaths', 'assists', 'kda']);
const AGGREGATION_SET = new Set<AggregationType>(['total', 'average', 'best', 'median']);

function buildInitialAnalyticsState() {
  const defaultState = {
    filters: { ...DEFAULT_FILTERS, normalizationWeights: { ...DEFAULT_FILTERS.normalizationWeights } },
    compareMode: { ...DEFAULT_COMPARE_MODE, selectedMetrics: [...DEFAULT_COMPARE_MODE.selectedMetrics], hiddenUserIds: new Set<number>() },
    rankingsMode: { ...DEFAULT_RANKINGS_MODE, classFilter: [...DEFAULT_RANKINGS_MODE.classFilter] },
    teamsMode: { ...DEFAULT_TEAMS_MODE },
  };

  if (typeof window === 'undefined') {
    return defaultState;
  }

  const search = new URLSearchParams(window.location.search);

  const modeRaw = search.get(ANALYTICS_QUERY_KEYS.mode);
  const mode = ANALYTICS_MODES.includes(modeRaw as AnalyticsMode)
    ? (modeRaw as AnalyticsMode)
    : defaultState.filters.mode;

  const metricRaw = search.get(ANALYTICS_QUERY_KEYS.metric);
  const metric = METRIC_SET.has(metricRaw as MetricType)
    ? (metricRaw as MetricType)
    : defaultState.filters.primaryMetric;

  const aggregationRaw = search.get(ANALYTICS_QUERY_KEYS.aggregation);
  const aggregation = AGGREGATION_SET.has(aggregationRaw as AggregationType)
    ? (aggregationRaw as AggregationType)
    : defaultState.filters.aggregation;

  const topNRaw = Number(search.get(ANALYTICS_QUERY_KEYS.rankingsTopN));
  const minParticipationRaw = Number(search.get(ANALYTICS_QUERY_KEYS.rankingsMinParticipation));

  return {
    filters: {
      ...defaultState.filters,
      mode,
      selectedWars: parseNumericList(search.get(ANALYTICS_QUERY_KEYS.wars)),
      startDate: search.get(ANALYTICS_QUERY_KEYS.startDate) || undefined,
      endDate: search.get(ANALYTICS_QUERY_KEYS.endDate) || undefined,
      participationOnly: search.get(ANALYTICS_QUERY_KEYS.participationOnly) === '0' ? false : true,
      opponentNormalized: search.get(ANALYTICS_QUERY_KEYS.opponentNormalized) === '1',
      primaryMetric: metric,
      aggregation,
    },
    compareMode: {
      ...defaultState.compareMode,
      selectedUserIds: parseNumericList(search.get(ANALYTICS_QUERY_KEYS.selectedUsers)),
      selectedMetrics: parseMetricList(search.get(ANALYTICS_QUERY_KEYS.selectedMetrics)),
      hiddenUserIds: new Set<number>(),
    },
    rankingsMode: {
      ...defaultState.rankingsMode,
      topN: Number.isFinite(topNRaw) && topNRaw > 0 ? topNRaw : defaultState.rankingsMode.topN,
      minParticipation:
        Number.isFinite(minParticipationRaw) && minParticipationRaw > 0
          ? minParticipationRaw
          : defaultState.rankingsMode.minParticipation,
      classFilter: parseStringList(search.get(ANALYTICS_QUERY_KEYS.rankingsClassFilter)),
    },
    teamsMode: {
      ...defaultState.teamsMode,
      selectedTeamIds: parseNumericList(search.get(ANALYTICS_QUERY_KEYS.selectedTeams)),
    },
  };
}

function setSearchParamIfNeeded(params: URLSearchParams, key: string, value: string | undefined) {
  if (!value) {
    params.delete(key);
    return;
  }
  params.set(key, value);
}

// ============================================================================
// Provider Component
// ============================================================================

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [initialState] = useState(() => buildInitialAnalyticsState());

  // Global filters state
  const [filters, setFilters] = useState<AnalyticsFilters>(initialState.filters);

  // Mode-specific states
  const [compareMode, setCompareMode] = useState<CompareModeState>(initialState.compareMode);
  const [rankingsMode, setRankingsMode] = useState<RankingsModeState>(initialState.rankingsMode);
  const [teamsMode, setTeamsMode] = useState<TeamsModeState>(initialState.teamsMode);
  const [drilldown, setDrilldown] = useState<AnalyticsDrilldownState>(DEFAULT_DRILLDOWN_STATE);

  // ============================================================================
  // Global Filters Actions
  // ============================================================================

  const updateFilters = useCallback((updates: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS, normalizationWeights: { ...DEFAULT_FILTERS.normalizationWeights } });
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
    setCompareMode({
      ...DEFAULT_COMPARE_MODE,
      selectedMetrics: [...DEFAULT_COMPARE_MODE.selectedMetrics],
      hiddenUserIds: new Set<number>(),
    });
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
    setRankingsMode({
      ...DEFAULT_RANKINGS_MODE,
      classFilter: [],
    });
  }, []);

  // ============================================================================
  // Teams Mode Actions
  // ============================================================================

  const updateTeamsMode = useCallback((updates: Partial<TeamsModeState>) => {
    setTeamsMode(prev => ({ ...prev, ...updates }));
  }, []);

  const resetTeamsMode = useCallback(() => {
    setTeamsMode({ ...DEFAULT_TEAMS_MODE });
  }, []);

  // ============================================================================
  // Drill-down actions
  // ============================================================================

  const openWarDetail = useCallback(
    ({ warId, sourceMode, userId, teamId }: { warId: number | string; sourceMode: AnalyticsMode; userId?: number; teamId?: number }) => {
      setDrilldown({
        selectedWarId: String(warId),
        sourceMode,
        selectedUserId: userId,
        selectedTeamId: teamId,
      });
    },
    []
  );

  const closeWarDetail = useCallback(() => {
    setDrilldown(DEFAULT_DRILLDOWN_STATE);
  }, []);

  // ============================================================================
  // Reset All
  // ============================================================================

  const resetAllModes = useCallback(() => {
    resetFilters();
    resetCompareMode();
    resetRankingsMode();
    resetTeamsMode();
    closeWarDetail();
  }, [resetFilters, resetCompareMode, resetRankingsMode, resetTeamsMode, closeWarDetail]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    const params = url.searchParams;

    setSearchParamIfNeeded(
      params,
      ANALYTICS_QUERY_KEYS.mode,
      filters.mode !== DEFAULT_FILTERS.mode ? filters.mode : undefined
    );
    setSearchParamIfNeeded(
      params,
      ANALYTICS_QUERY_KEYS.wars,
      filters.selectedWars.length > 0 ? filters.selectedWars.join(',') : undefined
    );
    setSearchParamIfNeeded(params, ANALYTICS_QUERY_KEYS.startDate, filters.startDate);
    setSearchParamIfNeeded(params, ANALYTICS_QUERY_KEYS.endDate, filters.endDate);
    setSearchParamIfNeeded(
      params,
      ANALYTICS_QUERY_KEYS.participationOnly,
      filters.participationOnly === DEFAULT_FILTERS.participationOnly ? undefined : '0'
    );
    setSearchParamIfNeeded(
      params,
      ANALYTICS_QUERY_KEYS.opponentNormalized,
      filters.opponentNormalized ? '1' : undefined
    );
    setSearchParamIfNeeded(
      params,
      ANALYTICS_QUERY_KEYS.metric,
      filters.primaryMetric !== DEFAULT_FILTERS.primaryMetric ? filters.primaryMetric : undefined
    );
    setSearchParamIfNeeded(
      params,
      ANALYTICS_QUERY_KEYS.aggregation,
      filters.aggregation !== DEFAULT_FILTERS.aggregation ? filters.aggregation : undefined
    );

    setSearchParamIfNeeded(
      params,
      ANALYTICS_QUERY_KEYS.selectedUsers,
      compareMode.selectedUserIds.length > 0 ? compareMode.selectedUserIds.join(',') : undefined
    );
    setSearchParamIfNeeded(
      params,
      ANALYTICS_QUERY_KEYS.selectedMetrics,
      compareMode.selectedMetrics.length > 0 &&
      compareMode.selectedMetrics.join(',') !== DEFAULT_COMPARE_MODE.selectedMetrics.join(',')
        ? compareMode.selectedMetrics.join(',')
        : undefined
    );

    setSearchParamIfNeeded(
      params,
      ANALYTICS_QUERY_KEYS.selectedTeams,
      teamsMode.selectedTeamIds.length > 0 ? teamsMode.selectedTeamIds.join(',') : undefined
    );

    setSearchParamIfNeeded(
      params,
      ANALYTICS_QUERY_KEYS.rankingsTopN,
      rankingsMode.topN !== DEFAULT_RANKINGS_MODE.topN ? String(rankingsMode.topN) : undefined
    );
    setSearchParamIfNeeded(
      params,
      ANALYTICS_QUERY_KEYS.rankingsMinParticipation,
      rankingsMode.minParticipation !== DEFAULT_RANKINGS_MODE.minParticipation
        ? String(rankingsMode.minParticipation)
        : undefined
    );
    setSearchParamIfNeeded(
      params,
      ANALYTICS_QUERY_KEYS.rankingsClassFilter,
      rankingsMode.classFilter.length > 0 ? rankingsMode.classFilter.join(',') : undefined
    );

    const nextSearch = params.toString();
    const nextUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ''}${url.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) {
      window.history.replaceState(window.history.state, '', nextUrl);
    }
  }, [
    filters.mode,
    filters.selectedWars,
    filters.startDate,
    filters.endDate,
    filters.participationOnly,
    filters.opponentNormalized,
    filters.primaryMetric,
    filters.aggregation,
    compareMode.selectedUserIds,
    compareMode.selectedMetrics,
    rankingsMode.topN,
    rankingsMode.minParticipation,
    rankingsMode.classFilter,
    teamsMode.selectedTeamIds,
  ]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: AnalyticsContextValue = {
    // Global filters
    filters,
    updateFilters,
    resetFilters,

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

    // Drill-down panel
    drilldown,
    openWarDetail,
    closeWarDetail,

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
  const { filters, compareMode, rankingsMode, teamsMode } = useAnalytics();

  switch (filters.mode) {
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
  const { filters, compareMode, rankingsMode, teamsMode } = useAnalytics();

  switch (filters.mode) {
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
