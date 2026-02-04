/**
 * Hook for managing roster filter presets
 * Stores user-created and default filter presets in localStorage
 */

import { useState, useEffect, useCallback } from 'react';

export interface RosterFilterState {
  roles: string[];
  classes: string[];
  powerRange: [number, number];
  status: 'all' | 'active' | 'inactive';
  hasMedia: boolean;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: RosterFilterState;
  isDefault: boolean;
}

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'high-power',
    name: 'High Power Members',
    isDefault: true,
    filters: {
      roles: [],
      classes: [],
      powerRange: [10000000, 999999999],
      status: 'all',
      hasMedia: false,
    },
  },
  {
    id: 'active-officers',
    name: 'Active Officers',
    isDefault: true,
    filters: {
      roles: ['officer', 'leader'],
      classes: [],
      powerRange: [0, 999999999],
      status: 'active',
      hasMedia: false,
    },
  },
  {
    id: 'new-recruits',
    name: 'New Recruits',
    isDefault: true,
    filters: {
      roles: ['member'],
      classes: [],
      powerRange: [0, 5000000],
      status: 'all',
      hasMedia: false,
    },
  },
];

const STORAGE_KEY = 'roster_filter_presets';

export function useFilterPresets() {
  const [presets, setPresets] = useState<FilterPreset[]>([]);

  // Load presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const customPresets: FilterPreset[] = JSON.parse(stored);
        setPresets([...DEFAULT_PRESETS, ...customPresets]);
      } else {
        setPresets(DEFAULT_PRESETS);
      }
    } catch (error) {
      console.error('Failed to load filter presets:', error);
      setPresets(DEFAULT_PRESETS);
    }
  }, []);

  // Save preset
  const savePreset = useCallback((name: string, filters: RosterFilterState) => {
    const newPreset: FilterPreset = {
      id: `custom-${Date.now()}`,
      name,
      filters,
      isDefault: false,
    };

    setPresets((prev) => {
      const customPresets = prev.filter((p) => !p.isDefault);
      const updated = [...customPresets, newPreset];
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save preset:', error);
      }
      
      return [...DEFAULT_PRESETS, ...updated];
    });

    return newPreset;
  }, []);

  // Delete preset (only custom presets)
  const deletePreset = useCallback((id: string) => {
    setPresets((prev) => {
      const filtered = prev.filter((p) => p.id !== id || p.isDefault);
      const customPresets = filtered.filter((p) => !p.isDefault);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customPresets));
      } catch (error) {
        console.error('Failed to delete preset:', error);
      }
      
      return filtered;
    });
  }, []);

  return {
    presets,
    savePreset,
    deletePreset,
  };
}
