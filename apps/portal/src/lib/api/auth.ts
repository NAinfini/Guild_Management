/**
 * Authentication API
 */

import { api } from '../api-client';

export interface LoginPayload {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthUser {
  user_id: string;
  username: string;
  wechat_name: string | null;
  role: 'member' | 'moderator' | 'admin';
  power: number;
  is_active?: number;
}

export interface LoginResponse {
  user: AuthUser;
  sessionId: string;
}

export interface SessionResponse {
  user: AuthUser | null;
  csrfToken?: string | null;
}

export const authAPI = {
  /**
   * Login with username and password
   */
  login: async (credentials: LoginPayload): Promise<LoginResponse> => {
    return api.post<LoginResponse>('/auth/login', credentials);
  },

  /**
   * Get current session / user
   */
  getSession: async (): Promise<SessionResponse> => {
    return api.get<SessionResponse>('/auth/session');
  },

  /**
   * Logout and clear session
   */
  logout: async (): Promise<void> => {
    await api.post<void>('/auth/logout');
  },

  /**
   * Change password
   */
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.post<void>('/auth/change-password', data);
  },
};
