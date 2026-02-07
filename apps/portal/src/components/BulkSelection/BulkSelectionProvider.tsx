/**
 * Bulk Selection Context and Provider
 * Manages selection state for bulk operations across different entity types
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface BulkSelectionContextValue {
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  toggleAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  selectedCount: number;
}

const BulkSelectionContext = createContext<BulkSelectionContextValue | null>(null);

interface BulkSelectionProviderProps {
  children: ReactNode;
}

export function BulkSelectionProvider({ children }: BulkSelectionProviderProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback((ids: string[]) => {
    // Guard against undefined/null ids
    if (!ids || ids.length === 0) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(prev => {
      // If all are selected, deselect all
      const allSelected = ids.every(id => prev.has(id));
      if (allSelected) {
        return new Set();
      }
      // Otherwise, select all
      return new Set(ids);
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  const value: BulkSelectionContextValue = {
    selectedIds,
    toggleSelection,
    toggleAll,
    clearSelection,
    isSelected,
    selectedCount: selectedIds.size,
  };

  return (
    <BulkSelectionContext.Provider value={value}>
      {children}
    </BulkSelectionContext.Provider>
  );
}

/**
 * Hook to use bulk selection
 */
export function useBulkSelection() {
  const context = useContext(BulkSelectionContext);
  if (!context) {
    throw new Error('useBulkSelection must be used within BulkSelectionProvider');
  }
  return context;
}
