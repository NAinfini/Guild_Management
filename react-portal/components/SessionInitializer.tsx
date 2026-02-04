/**
 * Session Initializer
 * Validates session on app mount
 */

import { useEffect } from 'react';
import { useAuth } from '../hooks';

export function SessionInitializer({ children }: { children: React.ReactNode }) {
  const { validateSession } = useAuth();

  useEffect(() => {
    // Validate session on mount
    validateSession();
  }, [validateSession]);

  return <>{children}</>;
}
