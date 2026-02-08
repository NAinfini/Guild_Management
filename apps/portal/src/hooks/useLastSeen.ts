
import { useState, useCallback } from 'react';
import { storage } from '../lib/storage';

export function useLastSeen(key: string, legacyKey?: string) {
  const [lastSeen, setLastSeen] = useState<Date>(() => {
    const defaultValue = new Date(0).toISOString();
    const stored = storage.get<string>(key, legacyKey ? storage.get<string>(legacyKey, defaultValue) : defaultValue);
    if (legacyKey && stored !== defaultValue) {
      storage.set(key, stored);
      storage.remove(legacyKey);
    }
    return new Date(stored);
  });

  const markAsSeen = useCallback(() => {
    const now = new Date();
    storage.set(key, now.toISOString());
    setLastSeen(now);
  }, [key]);

  const hasNewContent = useCallback((contentDate: string | Date) => {
    return new Date(contentDate) > lastSeen;
  }, [lastSeen]);

  return {
    lastSeen,
    markAsSeen,
    hasNewContent
  };
}
