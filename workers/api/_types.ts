/**
 * Shared types for Cloudflare Pages Functions API
 */

// ============================================================
// Environment Bindings
// ============================================================

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  ENVIRONMENT: string;
}

// ============================================================
// D1 Database Types
// ============================================================

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: {
    duration: number;
    size_after: number;
    rows_read: number;
    rows_written: number;
  };
  error?: string;
}

export interface D1ExecResult {
  count: number;
  duration: number;
}

// ============================================================
// R2 Bucket Types
// ============================================================

export interface R2Bucket {
  get(key: string, options?: R2GetOptions): Promise<R2ObjectBody | null>;
  put(key: string, value: ReadableStream | ArrayBuffer | string, options?: R2PutOptions): Promise<R2Object>;
  delete(keys: string | string[]): Promise<void>;
  list(options?: R2ListOptions): Promise<R2Objects>;
  head(key: string): Promise<R2Object | null>;
}

export interface R2GetOptions {
  onlyIf?: R2Conditional;
  range?: R2Range;
}

export interface R2PutOptions {
  httpMetadata?: R2HTTPMetadata;
  customMetadata?: Record<string, string>;
  md5?: ArrayBuffer | string;
  sha1?: ArrayBuffer | string;
  sha256?: ArrayBuffer | string;
  sha384?: ArrayBuffer | string;
  sha512?: ArrayBuffer | string;
}

export interface R2ListOptions {
  limit?: number;
  prefix?: string;
  cursor?: string;
  delimiter?: string;
  startAfter?: string;
  include?: ('httpMetadata' | 'customMetadata')[];
}

export interface R2Object {
  key: string;
  version: string;
  size: number;
  etag: string;
  httpEtag: string;
  uploaded: Date;
  httpMetadata?: R2HTTPMetadata;
  customMetadata?: Record<string, string>;
  range?: R2Range;
  checksums?: R2Checksums;
}

export interface R2ObjectBody extends R2Object {
  body: ReadableStream;
  bodyUsed: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json<T = unknown>(): Promise<T>;
  blob(): Promise<Blob>;
}

export interface R2Objects {
  objects: R2Object[];
  truncated: boolean;
  cursor?: string;
  delimitedPrefixes: string[];
}

export interface R2HTTPMetadata {
  contentType?: string;
  contentLanguage?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  cacheControl?: string;
  cacheExpiry?: Date;
}

export interface R2Conditional {
  etagMatches?: string;
  etagDoesNotMatch?: string;
  uploadedBefore?: Date;
  uploadedAfter?: Date;
}

export interface R2Range {
  offset?: number;
  length?: number;
  suffix?: number;
}

export interface R2Checksums {
  md5?: ArrayBuffer;
  sha1?: ArrayBuffer;
  sha256?: ArrayBuffer;
  sha384?: ArrayBuffer;
  sha512?: ArrayBuffer;
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    timestamp: string;
    [key: string]: unknown;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginatedResponse<T = unknown> {
  items: T[];
  total: number;
  cursor?: string;
  hasMore: boolean;
}

// ============================================================
// Database Entity Types
// ============================================================

export interface User {
  user_id: string;
  username: string;
  wechat_name: string | null;
  role: 'member' | 'moderator' | 'admin';
  power: number;
  is_active: 0 | 1;
  last_username_change_at_utc: string | null;
  deleted_at: string | null;
  created_at_utc: string;
  updated_at_utc: string;
}

export interface Session {
  session_id: string;
  user_id: string;
  csrf_token: string | null;
  created_at_utc: string;
  last_used_at_utc: string;
  expires_at_utc: string;
  revoked_at_utc: string | null;
  user_agent: string | null;
  ip_hash: string | null;
  updated_at_utc: string;
}

export interface MemberProfile {
  user_id: string;
  title_html: string | null;
  bio_text: string | null;
  vacation_start_at_utc: string | null;
  vacation_end_at_utc: string | null;
  created_at_utc: string;
  updated_at_utc: string;
}

export interface Event {
  event_id: string;
  type: 'weekly_mission' | 'guild_war' | 'other';
  title: string;
  description: string | null;
  start_at_utc: string;
  end_at_utc: string | null;
  capacity: number | null;
  is_pinned: 0 | 1;
  is_archived: 0 | 1;
  signup_locked: 0 | 1;
  created_by: string | null;
  updated_by: string | null;
  created_at_utc: string;
  updated_at_utc: string;
  archived_at_utc: string | null;
}

export interface Announcement {
  announcement_id: string;
  title: string;
  body_html: string | null;
  is_pinned: 0 | 1;
  is_archived: 0 | 1;
  created_by: string | null;
  updated_by: string | null;
  created_at_utc: string;
  updated_at_utc: string;
  archived_at_utc: string | null;
}

export interface MediaObject {
  media_id: string;
  storage_type: 'r2' | 'external_url';
  r2_key: string | null;
  url: string | null;
  content_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  duration_ms: number | null;
  sha256: string | null;
  created_by: string | null;
  created_at_utc: string;
  updated_at_utc: string;
}

export interface AuditLog {
  audit_id: string;
  entity_type: string;
  action: string;
  actor_id: string | null;
  entity_id: string;
  diff_title: string | null;
  detail_text: string | null;
  created_at_utc: string;
  updated_at_utc: string;
}

// ============================================================
// Request Context
// ============================================================

export interface RequestContext {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isModerator: boolean;
}

// ============================================================
// Utility Types
// ============================================================

export type PagesFunction<T = unknown> = (context: EventContext<Env, any, T>) => Response | Promise<Response>;

export interface EventContext<Env = unknown, P extends string = any, Data = unknown> {
  request: Request;
  env: Env;
  params: Record<P, string>;
  data: Data;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  waitUntil: (promise: Promise<unknown>) => void;
}
