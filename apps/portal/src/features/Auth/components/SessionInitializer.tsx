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
  const SESSION_CHECK_INTERVAL_MS = 5 * 60 * 1000;

  useWebSocket(); // Initialize global real-time synchronization

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const hadUser = !!useAuthStore.getState().user;
      const isValid = await validateSession();
      if (active && hadUser && !isValid) {
        setSessionExpired(true);
      }
    };

    void checkSession();
    const intervalId = window.setInterval(() => {
      void checkSession();
    }, SESSION_CHECK_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [validateSession]);

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
