/**
 * Updated useAuth Hook with Store Integration
 * Provides authentication state and methods
 */

import { useCallback } from 'react';
import { useAuthStore } from '../store';
import { api, apiDirect, APIError } from '../lib/api-client';
import type { LoginResponse, SessionResponse } from '../lib/api-types';

interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

interface SignupData {
  username: string;
  password: string;
  wechatName?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setCsrfToken = useAuthStore((state) => state.setCsrfToken);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const isAuthenticated = !!user;

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<{ data: LoginResponse }>('/auth/login', credentials);
      const data = response.data;
      setUser(data.user as any); // Type conversion needed due to different User types
      // Store CSRF token from response
      if (data.csrfToken) {
        setCsrfToken(data.csrfToken);
      }
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      const message = error instanceof APIError ? error.message : 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  }, [setUser, setCsrfToken, setLoading, setError]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  }, [setUser]);

  const signup = useCallback(async (data: SignupData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<{ data: LoginResponse }>('/auth/signup', data);
      const result = response.data;
      setUser(result.user as any);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      const message = error instanceof APIError ? error.message : 'Signup failed';
      setError(message);
      return { success: false, error: message };
    }
  }, [setUser, setLoading, setError]);

  const changePassword = useCallback(async (data: ChangePasswordData) => {
    try {
      await api.post('/auth/change-password', data);
      return { success: true };
    } catch (error) {
      const message = error instanceof APIError ? error.message : 'Password change failed';
      return { success: false, error: message };
    }
  }, []);

  const validateSession = useCallback(async () => {
    try {
      const response = await apiDirect.get<{ data: SessionResponse }>('/auth/session');
      const data = response.data;
      setUser(data.user as any);
      // Store CSRF token from session
      if (data.csrfToken) {
        setCsrfToken(data.csrfToken);
      }
      return true;
    } catch (error) {
      setUser(null);
      setCsrfToken(null);
      return false;
    }
  }, [setUser, setCsrfToken]);

  return {
    user,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    isModerator: user?.role === 'moderator' || user?.role === 'admin',
    isLoading: useAuthStore((state) => state.isLoading),
    error: useAuthStore((state) => state.error),
    login,
    logout,
    signup,
    changePassword,
    validateSession,
  };
}
