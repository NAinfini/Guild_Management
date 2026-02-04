/**
 * API Response Types for Frontend
 */

export interface LoginResponse {
  user: {
    userId: string;
    username: string;
    wechatName: string | null;
    role: string;
    power: number;
    isActive: boolean;
  };
  csrfToken: string | null;
}

export interface SessionResponse {
  user: {
    userId: string;
    username: string;
    wechatName: string | null;
    role: string;
    power: number;
    isActive: boolean;
    sessionExpiresAt?: string;
  };
  csrfToken: string | null;
}
