/**
 * Session Initializer
 * Validates session on app mount
 */

import React, { useEffect, useState } from 'react';
import { useAuth, useWebSocket } from '@/hooks';
import { SessionExpiredModal } from './SessionExpiredModal';
import { useAuthStore } from '@/store';

export function SessionInitializer({ children }: { children: React.ReactNode }) {
  const { validateSession } = useAuth();
  const [sessionExpired, setSessionExpired] = useState(false);
  const user = useAuthStore(state => state.user);
  
  useWebSocket(); // Initialize global real-time synchronization

  useEffect(() => {
    // Validate session on mount
    const checkSession = async () => {
      // Only check if we think we have a user/token potentially, or always check?
      // validateSession handles internal checks.
      const isValid = await validateSession();
      if (!isValid && user) {
        // If we had a user but validation failed, it's an expiry
        setSessionExpired(true);
      }
    };
    
    checkSession();
  }, [validateSession, user]); // Added user to deps to run check if user state changes? Or keep minimal

  const handleLoginRedirect = () => {
    setSessionExpired(false);
    window.location.href = '/login';
  };

  return (
    <>
      {children}
      <SessionExpiredModal 
        open={sessionExpired} 
        onLogin={handleLoginRedirect} 
      />
    </>
  );
}
