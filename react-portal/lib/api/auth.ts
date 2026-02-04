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
  userId: string;
  username: string;
  wechatName: string | null;
  role: 'member' | 'moderator' | 'admin';
  power: number;
}

export interface LoginResponse {
  user: AuthUser;
  sessionId: string;
}

export interface SessionResponse {
  user: AuthUser;
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
