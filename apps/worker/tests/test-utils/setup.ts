/**
 * Test utilities for Cloudflare Workers API tests
 * Provides D1 schema seeding, test user creation, and authenticated request helpers
 */

import { env } from 'cloudflare:test';

// Schema DDL â€?essential tables for testing
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  wechat_name TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  power INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  last_username_change_at_utc TEXT,
  deleted_at_utc TEXT,
  created_at_utc TEXT NOT NULL,
  updated_at_utc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_auth_password (
  user_id TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at_utc TEXT NOT NULL,
  updated_at_utc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  csrf_token TEXT,
  created_at_utc TEXT NOT NULL,
  last_used_at_utc TEXT NOT NULL,
  expires_at_utc TEXT NOT NULL,
  revoked_at_utc TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  updated_at_utc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS member_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  title_html TEXT,
  bio_text TEXT,
  vacation_start_at_utc TEXT,
  vacation_end_at_utc TEXT,
  created_at_utc TEXT NOT NULL,
  updated_at_utc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS member_classes (
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  class_code TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, class_code)
);

CREATE TABLE IF NOT EXISTS member_media (
  user_id TEXT NOT NULL,
  media_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, media_id)
);

CREATE TABLE IF NOT EXISTS events (
  event_id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'other' CHECK (type IN ('weekly_mission', 'guild_war', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  start_at_utc TEXT NOT NULL,
  end_at_utc TEXT,
  capacity INTEGER,
  min_level INTEGER NOT NULL DEFAULT 0,
  max_participants INTEGER NOT NULL DEFAULT 50,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  signup_locked INTEGER NOT NULL DEFAULT 0,
  created_by TEXT,
  updated_by TEXT,
  deleted_at_utc TEXT,
  created_at_utc TEXT NOT NULL,
  updated_at_utc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS announcements (
  announcement_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body_html TEXT,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_by TEXT,
  updated_by TEXT,
  deleted_at_utc TEXT,
  created_at_utc TEXT NOT NULL,
  updated_at_utc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  audit_id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_id TEXT,
  entity_id TEXT NOT NULL,
  diff_title TEXT,
  detail_text TEXT,
  created_at_utc TEXT NOT NULL,
  updated_at_utc TEXT NOT NULL
);
`;

const now = new Date().toISOString();
const future = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();

/**
 * Initialize the D1 test database with schema
 */
export async function seedSchema() {
  await env.DB.exec(SCHEMA_SQL);
}

/**
 * Hash a password (matches apps/worker/src/lib/utils.ts hashPassword)
 */
async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Seed a test user with credentials
 */
export async function seedUser(opts: {
  id: string;
  username: string;
  password: string;
  role?: 'member' | 'moderator' | 'admin';
  isActive?: boolean;
}) {
  const { id, username, password, role = 'member', isActive = true } = opts;
  const salt = 'test-salt-' + id;
  const hash = await hashPassword(password, salt);

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO users (user_id, username, role, power, is_active, created_at_utc, updated_at_utc) VALUES (?, ?, ?, 1000, ?, ?, ?)`
    ).bind(id, username, role, isActive ? 1 : 0, now, now),
    env.DB.prepare(
      `INSERT INTO user_auth_password (user_id, password_hash, salt, created_at_utc, updated_at_utc) VALUES (?, ?, ?, ?, ?)`
    ).bind(id, hash, salt, now, now),
    env.DB.prepare(
      `INSERT INTO member_profiles (user_id, created_at_utc, updated_at_utc) VALUES (?, ?, ?)`
    ).bind(id, now, now),
  ]);
}

/**
 * Seed a test session for an authenticated user
 */
export async function seedSession(opts: { sessionId: string; userId: string }) {
  const { sessionId, userId } = opts;
  await env.DB.prepare(
    `INSERT INTO sessions (session_id, user_id, csrf_token, created_at_utc, last_used_at_utc, expires_at_utc, updated_at_utc) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(sessionId, userId, 'test-csrf', now, now, future, now).run();
}

/**
 * Create an authenticated request with session cookie
 */
export function authedRequest(
  url: string,
  sessionId: string,
  init?: RequestInit
): Request {
  const headers = new Headers(init?.headers);
  headers.set('Cookie', `session_id=${sessionId}`);
  return new Request(url, { ...init, headers });
}

/**
 * Seed a test event
 */
export async function seedEvent(opts: {
  id: string;
  title: string;
  type?: string;
  createdBy?: string;
}) {
  const { id, title, type = 'other', createdBy } = opts;
  await env.DB.prepare(
    `INSERT INTO events (event_id, type, title, start_at_utc, created_by, created_at_utc, updated_at_utc) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, type, title, now, createdBy || null, now, now).run();
}

/**
 * Seed a test announcement
 */
export async function seedAnnouncement(opts: {
  id: string;
  title: string;
  createdBy?: string;
}) {
  const { id, title, createdBy } = opts;
  await env.DB.prepare(
    `INSERT INTO announcements (announcement_id, title, created_by, created_at_utc, updated_at_utc) VALUES (?, ?, ?, ?, ?)`
  ).bind(id, title, createdBy || null, now, now).run();
}
