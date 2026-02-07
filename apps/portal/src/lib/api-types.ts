/**
 * API Response Types for Frontend
 */

export interface LoginResponse {
  user: {
    user_id: string;
    username: string;
    wechat_name: string | null;
    role: string;
    power: number;
    is_active: number;
  };
  sessionId: string;
  csrfToken?: string | null;
}

export interface SessionResponse {
  user: {
    user_id: string;
    username: string;
    wechat_name: string | null;
    role: string;
    power: number;
    is_active: number;
    session_expires_at_utc?: string;
  } | null;
  csrfToken: string | null;
}
