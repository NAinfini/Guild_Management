-- ============================================================
-- CREATE REAL ADMIN ACCOUNT
-- Generated: 2026-02-05
-- ============================================================

PRAGMA foreign_keys = ON;

-- ============================================================
-- ADMIN ACCOUNT CREDENTIALS
-- ============================================================
-- Username: admin
-- Password: Admin123!
--
-- IMPORTANT: Change this password after first login!
-- ============================================================

-- Delete existing admin if exists (in correct order to avoid FK constraint)
DELETE FROM audit_log WHERE entity_id = 'usr_admin_real';
DELETE FROM member_classes WHERE user_id = 'usr_admin_real';
DELETE FROM member_profiles WHERE user_id = 'usr_admin_real';
DELETE FROM user_auth_password WHERE user_id = 'usr_admin_real';
DELETE FROM users WHERE user_id = 'usr_admin_real';

-- Create admin user
INSERT INTO users (
  user_id,
  username,
  wechat_name,
  role,
  power,
  is_active,
  created_at_utc,
  updated_at_utc
) VALUES (
  'usr_admin_real',
  'admin',
  'Administrator',
  'admin',
  99999,
  1,
  datetime('now'),
  datetime('now')
);

-- Create password hash for "Admin123!"
-- Using SHA-256 with UUID salt (same as signup endpoint)
-- Hash: 1a75b5eb4068447916e8ed92a985350d0bc34a6e1352d19af7790943bcb6d78c
-- Salt: 32f95304-5715-4022-800a-edfb328991e9
INSERT INTO user_auth_password (
  user_id,
  password_hash,
  salt,
  created_at_utc,
  updated_at_utc
) VALUES (
  'usr_admin_real',
  '1a75b5eb4068447916e8ed92a985350d0bc34a6e1352d19af7790943bcb6d78c',
  '32f95304-5715-4022-800a-edfb328991e9',
  datetime('now'),
  datetime('now')
);

-- Create admin profile
INSERT INTO member_profiles (
  user_id,
  title_html,
  bio_text,
  created_at_utc,
  updated_at_utc
) VALUES (
  'usr_admin_real',
  '<span class="title-gold">System Administrator</span>',
  'Main administrator account for guild management.',
  datetime('now'),
  datetime('now')
);

-- Add primary class (optional)
INSERT INTO member_classes (
  user_id,
  class_code,
  sort_order,
  created_at_utc,
  updated_at_utc
) VALUES (
  'usr_admin_real',
  'wanhua',
  1,
  datetime('now'),
  datetime('now')
);

-- Create audit log entry (actor_id can be NULL for system actions)
INSERT INTO audit_log (
  audit_id,
  entity_type,
  action,
  actor_id,
  entity_id,
  diff_title,
  detail_text,
  created_at_utc,
  updated_at_utc
) VALUES (
  'audit_admin_' || hex(randomblob(8)),
  'user',
  'create',
  NULL,
  'usr_admin_real',
  'Created system administrator account',
  '{"username":"admin","role":"admin","power":99999}',
  datetime('now'),
  datetime('now')
);
