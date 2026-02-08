/**
 * Updated useAuth Hook with Store Integration
 * Provides authentication state and methods
 */

import { useCallback } from 'react';
import { useAuthStore } from '../../../store';
import { apiDirect, APIError } from '../../../lib/api-client';
import { typedAPI } from '../../../lib/api/api-builder';
import type { LoginResponse, SessionResponse } from '../../../lib/api-types';
import { canAccessAdminArea, canManageMemberRoles } from '../../../lib/permissions';

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

// Helper to map API DTO to Domain User
const mapUserDTO = (dto: any) => ({
  id: dto.user_id,
  username: dto.username,
  wechat_name: dto.wechat_name,
  role: dto.role,
  power: dto.power,
  active_status: dto.is_active ? 'active' : 'inactive',
  // Map other fields as needed if API sends them
  session_expires_at: dto.session_expires_at_utc,
});

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
      // API client now unwraps { success, data } envelope automatically
      const response = await typedAPI.auth.login<LoginResponse>({ body: credentials });
      setUser(mapUserDTO(response.user) as any);
      // Store CSRF token from response
      if (response.csrfToken) {
        setCsrfToken(response.csrfToken);
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
      await typedAPI.auth.logout({ body: {} });
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
      // API client now unwraps { success, data } envelope automatically
      const response = await typedAPI.auth.signup<LoginResponse>({ body: data });
      setUser(mapUserDTO(response.user) as any);
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
      await typedAPI.auth.changePassword({ body: data });
      return { success: true };
    } catch (error) {
      const message = error instanceof APIError ? error.message : 'Password change failed';
      return { success: false, error: message };
    }
  }, []);

  const validateSession = useCallback(async () => {
    try {
      // Use typedAPI for consistent endpoint contract
      const response = await typedAPI.auth.session<SessionResponse>();
      setUser(response.user ? (mapUserDTO(response.user) as any) : null);
      setCsrfToken(response.csrfToken || null);
      return !!response.user;
    } catch (error) {
      setUser(null);
      setCsrfToken(null);
      return false;
    }
  }, [setUser, setCsrfToken]);

  return {
    user,
    isAuthenticated,
    isAdmin: canManageMemberRoles(user?.role),
    isModerator: canAccessAdminArea(user?.role),
    isLoading: useAuthStore((state) => state.isLoading),
    error: useAuthStore((state) => state.error),
    login,
    logout,
    signup,
    changePassword,
    validateSession,
  };
}
