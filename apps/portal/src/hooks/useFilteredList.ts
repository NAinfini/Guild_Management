import { useMemo } from 'react';

interface UseFilteredListOptions<T> {
  items: T[];
  searchText: string;
  searchFields: (keyof T)[];
  filterFn?: (item: T) => boolean;
  sortFn?: (a: T, b: T) => number;
}

/**
 * Generic hook for filtering a list by search text + optional filter + sort.
 * Replaces repeated useMemo filter/sort patterns across feature pages.
 */
export function useFilteredList<T>({
  items,
  searchText,
  searchFields,
  filterFn,
  sortFn,
}: UseFilteredListOptions<T>): T[] {
  return useMemo(() => {
    let result = [...items];

    if (filterFn) {
      result = result.filter(filterFn);
    }

    if (searchText.trim()) {
      const lower = searchText.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return typeof value === 'string' && value.toLowerCase().includes(lower);
        })
      );
    }

    if (sortFn) {
      result.sort(sortFn);
    }

    return result;
  }, [items, searchText, searchFields, filterFn, sortFn]);
}
