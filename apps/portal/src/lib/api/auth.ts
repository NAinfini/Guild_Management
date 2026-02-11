/**
 * Authentication API
 */

import { typedAPI } from './api-builder';

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
  csrfToken?: string;
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
    return typedAPI.auth.login<LoginResponse>({ body: credentials });
  },

  /**
   * Get current session / user
   */
  getSession: async (): Promise<SessionResponse> => {
    return typedAPI.auth.session<SessionResponse>();
  },

  /**
   * Logout and clear session
   */
  logout: async (): Promise<void> => {
    await typedAPI.auth.logout<void>();
  },

  /**
   * Change password
   */
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await typedAPI.auth.changePassword<void>({ body: data });
  },
};
