
import { useState, useCallback, useEffect } from 'react';
import { storage } from '../lib/storage';

export function useLastSeen(key: string) {
  const [lastSeen, setLastSeen] = useState<Date>(() => {
    const stored = storage.get<string>(key, new Date(0).toISOString());
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
