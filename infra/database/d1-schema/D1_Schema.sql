-- D1 (SQLite) schema for YysLS BaiYe Portal (fixed)
-- All timestamp columns use the *_utc suffix and are stored as UTC datetime TEXT in format 'YYYY-MM-DD HH:MM:SS'.
-- Notes:
--  - D1 is SQLite: foreign keys must be enabled per connection.
--  - Quota rules are enforced with a mix of UNIQUE/partial indexes + triggers (where feasible).

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- USERS + AUTH + SESSIONS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  user_id      TEXT PRIMARY KEY,
  username     TEXT NOT NULL UNIQUE,
  wechat_name  TEXT,
  role         TEXT NOT NULL CHECK (role IN ('member','moderator','admin')),
  power        INTEGER NOT NULL DEFAULT 0,
  is_active    INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  last_username_change_at_utc TEXT,  -- For rate limiting username changes (1 per 30 days)
  deleted_at_utc   TEXT,  -- Soft delete timestamp for undo functionality
  created_at_utc   TEXT NOT NULL,
  updated_at_utc   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_wechat_name ON users(wechat_name);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE deleted_at_utc IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_active ON users(role, power DESC) WHERE deleted_at_utc IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_updated ON users(updated_at_utc DESC);
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at_utc DESC);
CREATE INDEX IF NOT EXISTS idx_users_deleted ON users(deleted_at_utc) WHERE deleted_at_utc IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active) WHERE deleted_at_utc IS NULL;

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  theme TEXT NOT NULL,
  color TEXT NOT NULL,
  font_scale REAL NOT NULL,
  motion_intensity REAL NOT NULL,
  updated_at_utc TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_updated ON user_preferences(updated_at_utc DESC);

CREATE TABLE IF NOT EXISTS user_auth_password (
  user_id       TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  salt          TEXT NOT NULL,
  updated_at_utc    TEXT NOT NULL,
  created_at_utc    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id    TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  csrf_token    TEXT,  -- CSRF protection token
  created_at_utc    TEXT NOT NULL,
  last_used_at_utc  TEXT NOT NULL,
  expires_at_utc    TEXT NOT NULL,
  revoked_at_utc    TEXT,
  user_agent    TEXT,
  ip_hash       TEXT,
  updated_at_utc    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at_utc ON sessions(expires_at_utc);

-- API Keys for programmatic access
CREATE TABLE IF NOT EXISTS api_keys (
  key_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- First 8 chars for identification
  name TEXT NOT NULL,
  scopes TEXT, -- JSON array of allowed scopes
  is_active INTEGER NOT NULL DEFAULT 1,
  last_used_at_utc TEXT,
  expires_at_utc TEXT,
  created_at_utc TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = 1;

-- ------------------------------------------------------------
-- MEMBER PROFILE (Roster + My Profile + Admin Console edits)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS member_profiles (
  user_id           TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  title_html        TEXT,
  bio_text          TEXT,
  vacation_start_at_utc TEXT,
  vacation_end_at_utc   TEXT,
  created_at_utc        TEXT NOT NULL,
  updated_at_utc        TEXT NOT NULL
);

-- Admin/private member notes (Admin Console only)
-- Exactly 5 slots per user (slot 1..5). UI can show 5 textareas.
CREATE TABLE IF NOT EXISTS member_notes (
  user_id     TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  slot        INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 5),
  note_text   TEXT,
  created_by  TEXT REFERENCES users(user_id),
  updated_by  TEXT REFERENCES users(user_id),
  created_at_utc  TEXT NOT NULL,
  updated_at_utc  TEXT NOT NULL,
  PRIMARY KEY (user_id, slot)
);

CREATE INDEX IF NOT EXISTS idx_member_notes_updated ON member_notes(user_id, updated_at_utc DESC);

-- ------------------------------------------------------------
-- MEMBER PROGRESSION TABLES (QISHU / XINFA / WUXUE)
-- Wide tables per docs (one row per user per category).
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS member_qishu (
  user_id      TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  created_at_utc   TEXT NOT NULL,
  updated_at_utc   TEXT NOT NULL,
  shihouzhengsheng         INTEGER NOT NULL DEFAULT 0,
  jinchantengyue           INTEGER NOT NULL DEFAULT 0,
  yanjiushi                INTEGER NOT NULL DEFAULT 0,
  baiguidaxueshou          INTEGER NOT NULL DEFAULT 0,
  weituozhengfa            INTEGER NOT NULL DEFAULT 0,
  liuxingzhuihuo           INTEGER NOT NULL DEFAULT 0,
  xiaoyinqianlang          INTEGER NOT NULL DEFAULT 0,
  yingzhaolianzao          INTEGER NOT NULL DEFAULT 0,
  yaochapomo               INTEGER NOT NULL DEFAULT 0,
  zizaiwuai                INTEGER NOT NULL DEFAULT 0,
  gouzuiduoshi             INTEGER NOT NULL DEFAULT 0,
  qilonghuima              INTEGER NOT NULL DEFAULT 0,
  shenlongtuhuo            INTEGER NOT NULL DEFAULT 0,
  taibaizuiyue             INTEGER NOT NULL DEFAULT 0,
  yelongxiangshou          INTEGER NOT NULL DEFAULT 0,
  wanwuweifeng             INTEGER NOT NULL DEFAULT 0,
  hongchenzhangmu          INTEGER NOT NULL DEFAULT 0,
  qingfengjiyue            INTEGER NOT NULL DEFAULT 0,
  wuxiangjinshen           INTEGER NOT NULL DEFAULT 0,
  yinyangmizongbu          INTEGER NOT NULL DEFAULT 0,
  yiezhiming               INTEGER NOT NULL DEFAULT 0,
  yingguanghuiye           INTEGER NOT NULL DEFAULT 0,
  yaowuxing                INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS member_xinfa (
  user_id      TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  created_at_utc   TEXT NOT NULL,
  updated_at_utc   TEXT NOT NULL,
  yishuige                 INTEGER NOT NULL DEFAULT 0,
  huashangyueling          INTEGER NOT NULL DEFAULT 0,
  junchenyao               INTEGER NOT NULL DEFAULT 0,
  sishiwuchang             INTEGER NOT NULL DEFAULT 0,
  wumingxinfa              INTEGER NOT NULL DEFAULT 0,
  jianqizongheng           INTEGER NOT NULL DEFAULT 0,
  shanhejieyun             INTEGER NOT NULL DEFAULT 0,
  wangchuanjuexiang        INTEGER NOT NULL DEFAULT 0,
  qianyingyihu             INTEGER NOT NULL DEFAULT 0,
  shuangtianbaiye          INTEGER NOT NULL DEFAULT 0,
  fuyaozhishang            INTEGER NOT NULL DEFAULT 0,
  zhengrengui              INTEGER NOT NULL DEFAULT 0,
  nuzhanma                 INTEGER NOT NULL DEFAULT 0,
  hulufeifei               INTEGER NOT NULL DEFAULT 0,
  chunleipian              INTEGER NOT NULL DEFAULT 0,
  xinghuabujian            INTEGER NOT NULL DEFAULT 0,
  qiansigu                 INTEGER NOT NULL DEFAULT 0,
  weimengge                INTEGER NOT NULL DEFAULT 0,
  duanshizhigou            INTEGER NOT NULL DEFAULT 0,
  sanqiongzhizhi           INTEGER NOT NULL DEFAULT 0,
  suohenniannian           INTEGER NOT NULL DEFAULT 0,
  guiyanjing               INTEGER NOT NULL DEFAULT 0,
  changshengwuxiang        INTEGER NOT NULL DEFAULT 0,
  posuoying                INTEGER NOT NULL DEFAULT 0,
  minghuitongchen          INTEGER NOT NULL DEFAULT 0,
  danxinzhuan              INTEGER NOT NULL DEFAULT 0,
  qianshanfa               INTEGER NOT NULL DEFAULT 0,
  liaoyuanxinghuo          INTEGER NOT NULL DEFAULT 0,
  zhulangxinjing           INTEGER NOT NULL DEFAULT 0,
  yijingyiwu               INTEGER NOT NULL DEFAULT 0,
  ningshenzhang            INTEGER NOT NULL DEFAULT 0,
  zongdizhaixing           INTEGER NOT NULL DEFAULT 0,
  zhixuanpianzhu           INTEGER NOT NULL DEFAULT 0,
  kunshouxinjing           INTEGER NOT NULL DEFAULT 0,
  kangzaodafa              INTEGER NOT NULL DEFAULT 0,
  panshijue                INTEGER NOT NULL DEFAULT 0,
  xinminiyu                INTEGER NOT NULL DEFAULT 0,
  canglangjianjue          INTEGER NOT NULL DEFAULT 0,
  shengzhouxingmu          INTEGER NOT NULL DEFAULT 0,
  dengerliang              INTEGER NOT NULL DEFAULT 0,
  datangge                 INTEGER NOT NULL DEFAULT 0,
  guzhongbuci              INTEGER NOT NULL DEFAULT 0,
  chuanhoujue              INTEGER NOT NULL DEFAULT 0,
  liaoyuenta               INTEGER NOT NULL DEFAULT 0,
  qiantianshi              INTEGER NOT NULL DEFAULT 0,
  tianxingjian             INTEGER NOT NULL DEFAULT 0,
  jileqixue                INTEGER NOT NULL DEFAULT 0,
  shanyuewuying            INTEGER NOT NULL DEFAULT 0,
  shenglonghuohu           INTEGER NOT NULL DEFAULT 0,
  wanxuejian               INTEGER NOT NULL DEFAULT 0,
  tieshenjue               INTEGER NOT NULL DEFAULT 0,
  shabaiwei                INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS member_wuxue (
  user_id      TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  created_at_utc   TEXT NOT NULL,
  updated_at_utc   TEXT NOT NULL,
  shanghaijiacheng         INTEGER NOT NULL DEFAULT 0,
  shoushangjianmian        INTEGER NOT NULL DEFAULT 0,
  qixuejiacheng            INTEGER NOT NULL DEFAULT 0,
  mingjingongjijiacheng    INTEGER NOT NULL DEFAULT 0,
  lieshigongjijiacheng     INTEGER NOT NULL DEFAULT 0,
  qiansigongjijiacheng     INTEGER NOT NULL DEFAULT 0,
  pozhugongjijiacheng      INTEGER NOT NULL DEFAULT 0,
  tuji                     INTEGER NOT NULL DEFAULT 0,
  gushou                   INTEGER NOT NULL DEFAULT 0,
  shenxing                 INTEGER NOT NULL DEFAULT 0,
  fengzu                   INTEGER NOT NULL DEFAULT 0,
  tongqiangtiebie          INTEGER NOT NULL DEFAULT 0,
  jiuqujingshenqiang       INTEGER NOT NULL DEFAULT 0,
  jiuchongchunse           INTEGER NOT NULL DEFAULT 0,
  bafangfengleiqiang       INTEGER NOT NULL DEFAULT 0,
  shifangpozhen            INTEGER NOT NULL DEFAULT 0,
  qianjisutian             INTEGER NOT NULL DEFAULT 0,
  qianxiangyinhungu        INTEGER NOT NULL DEFAULT 0,
  jiefudaofa               INTEGER NOT NULL DEFAULT 0,
  tianzhichuixiang         INTEGER NOT NULL DEFAULT 0,
  zhanxuedaofa             INTEGER NOT NULL DEFAULT 0,
  wumingjianfa             INTEGER NOT NULL DEFAULT 0,
  wumingqiangfa            INTEGER NOT NULL DEFAULT 0,
  mingchuanyaodian         INTEGER NOT NULL DEFAULT 0,
  nilisangou               INTEGER NOT NULL DEFAULT 0,
  jijujiujian              INTEGER NOT NULL DEFAULT 0,
  suziyouchen              INTEGER NOT NULL DEFAULT 0,
  suzixingyun              INTEGER NOT NULL DEFAULT 0,
  zuimengyouchun           INTEGER NOT NULL DEFAULT 0,
  qingshanzhibi            INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_member_qishu_updated_at ON member_qishu(updated_at_utc);
CREATE INDEX IF NOT EXISTS idx_member_xinfa_updated_at ON member_xinfa(updated_at_utc);
CREATE INDEX IF NOT EXISTS idx_member_wuxue_updated_at ON member_wuxue(updated_at_utc);

-- Ordered multi-class list (first = primary)
CREATE TABLE IF NOT EXISTS member_classes (
  user_id     TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  class_code  TEXT NOT NULL,
  sort_order  INTEGER NOT NULL,
  created_at_utc  TEXT NOT NULL,
  updated_at_utc  TEXT NOT NULL,
  PRIMARY KEY (user_id, class_code)
);

CREATE INDEX IF NOT EXISTS idx_member_classes_class_code ON member_classes(class_code);
CREATE INDEX IF NOT EXISTS idx_member_classes_user ON member_classes(user_id, sort_order);

-- Weekly availability blocks (stored in user's local timezone minutes)
CREATE TABLE IF NOT EXISTS member_availability_blocks (
  block_id    TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  weekday     INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_min   INTEGER NOT NULL CHECK (start_min BETWEEN 0 AND 1440),
  end_min     INTEGER NOT NULL CHECK (end_min BETWEEN 0 AND 1440 AND end_min > start_min),
  created_at_utc  TEXT NOT NULL,
  updated_at_utc  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_avail_user_day ON member_availability_blocks(user_id, weekday);

-- ------------------------------------------------------------
-- MEDIA (R2 objects + external video URLs)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS media_objects (
  media_id      TEXT PRIMARY KEY,
  storage_type  TEXT NOT NULL CHECK (storage_type IN ('r2','external_url')),
  r2_key        TEXT UNIQUE,         -- for r2 objects
  url           TEXT,                -- for external_url (video links)
  content_type  TEXT,
  size_bytes    INTEGER,
  width         INTEGER,
  height        INTEGER,
  duration_ms   INTEGER,
  sha256        TEXT,
  created_by    TEXT REFERENCES users(user_id),
  created_at_utc    TEXT NOT NULL,
  updated_at_utc    TEXT NOT NULL,
  CHECK (
    (storage_type = 'r2' AND r2_key IS NOT NULL AND url IS NULL)
    OR
    (storage_type = 'external_url' AND url IS NOT NULL AND r2_key IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_media_sha256 ON media_objects(sha256);

-- ------------------------------------------------------------
-- MEDIA CONVERSION TRACKING
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS media_conversions (
  conversion_id TEXT PRIMARY KEY,
  media_id      TEXT NOT NULL REFERENCES media_objects(media_id) ON DELETE CASCADE,
  original_key  TEXT NOT NULL,
  converted_key TEXT NOT NULL,
  target_format TEXT NOT NULL CHECK (target_format IN ('webp', 'opus')),
  status        TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  error_message TEXT,
  created_at_utc    TEXT NOT NULL,
  updated_at_utc    TEXT NOT NULL,
  completed_at_utc  TEXT
);

CREATE INDEX IF NOT EXISTS idx_media_conversions_media ON media_conversions(media_id);
CREATE INDEX IF NOT EXISTS idx_media_conversions_status ON media_conversions(status, created_at_utc);

-- ------------------------------------------------------------
-- GALLERY IMAGES (Community Gallery)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS gallery_images (
  gallery_id TEXT PRIMARY KEY,
  media_id TEXT NOT NULL REFERENCES media_objects(media_id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  category TEXT, -- e.g., 'screenshot', 'meme', 'event', 'achievement', 'other'
  is_featured INTEGER NOT NULL DEFAULT 0 CHECK (is_featured IN (0, 1)),
  uploaded_by TEXT REFERENCES users(user_id),
  created_at_utc TEXT NOT NULL,
  updated_at_utc TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery_images(category, created_at_utc DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_featured ON gallery_images(is_featured DESC, created_at_utc DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_updated ON gallery_images(updated_at_utc DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_uploader ON gallery_images(uploaded_by, created_at_utc DESC);

-- Enforce gallery images must be stored in R2 (no external URLs)
CREATE TRIGGER IF NOT EXISTS trg_gallery_images_storage_type
BEFORE INSERT ON gallery_images
FOR EACH ROW
WHEN (SELECT storage_type FROM media_objects WHERE media_id = NEW.media_id) != 'r2'
BEGIN
  SELECT RAISE(ABORT, 'gallery_images must reference r2 media_objects');
END;

-- Member media mapping:
--  - kind: image / audio / video_url
--  - is_avatar selects ONE of the images as the profile avatar
CREATE TABLE IF NOT EXISTS member_media (
  user_id     TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  media_id    TEXT NOT NULL REFERENCES media_objects(media_id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('image','audio','video_url')),
  is_avatar   INTEGER NOT NULL DEFAULT 0 CHECK (is_avatar IN (0, 1)),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at_utc  TEXT NOT NULL,
  updated_at_utc  TEXT NOT NULL,
  PRIMARY KEY (user_id, media_id),
  CHECK (kind = 'image' OR is_avatar = 0)
);

CREATE INDEX IF NOT EXISTS idx_member_media_user_kind ON member_media(user_id, kind, sort_order);
CREATE INDEX IF NOT EXISTS idx_member_media_user ON member_media(user_id);

-- One avatar per user (among images)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_member_media_one_avatar ON member_media(user_id) WHERE is_avatar = 1;

-- One audio per user
CREATE UNIQUE INDEX IF NOT EXISTS uniq_member_media_one_audio ON member_media(user_id) WHERE kind = 'audio';

-- Quotas (enforced at DB level where feasible):
--  - images: max 10 per member
--  - video_url: max 10 per member
CREATE TRIGGER IF NOT EXISTS trg_member_media_quota_images
BEFORE INSERT ON member_media
FOR EACH ROW
WHEN NEW.kind = 'image' AND (SELECT COUNT(*) FROM member_media WHERE user_id = NEW.user_id AND kind = 'image') >= 10
BEGIN
  SELECT RAISE(ABORT, 'member image quota exceeded');
END;

CREATE TRIGGER IF NOT EXISTS trg_member_media_quota_video
BEFORE INSERT ON member_media
FOR EACH ROW
WHEN NEW.kind = 'video_url' AND (SELECT COUNT(*) FROM member_media WHERE user_id = NEW.user_id AND kind = 'video_url') >= 10
BEGIN
  SELECT RAISE(ABORT, 'member video_url quota exceeded');
END;


-- Enforce media storage rules:
--  - image/audio must reference media_objects.storage_type = 'r2'
--  - video_url must reference media_objects.storage_type = 'external_url'
CREATE TRIGGER IF NOT EXISTS trg_member_media_storage_type_r2
BEFORE INSERT ON member_media
FOR EACH ROW
WHEN NEW.kind IN ('image','audio') AND (SELECT storage_type FROM media_objects WHERE media_id = NEW.media_id) != 'r2'
BEGIN
  SELECT RAISE(ABORT, 'image/audio must reference r2 media_objects');
END;

CREATE TRIGGER IF NOT EXISTS trg_member_media_storage_type_external
BEFORE INSERT ON member_media
FOR EACH ROW
WHEN NEW.kind = 'video_url' AND (SELECT storage_type FROM media_objects WHERE media_id = NEW.media_id) != 'external_url'
BEGIN
  SELECT RAISE(ABORT, 'video_url must reference external_url media_objects');
END;

-- ------------------------------------------------------------
-- ANNOUNCEMENTS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS announcements (
  announcement_id TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  body_html       TEXT,
  is_pinned       INTEGER NOT NULL DEFAULT 0 CHECK (is_pinned IN (0, 1)),
  is_archived     INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
  deleted_at_utc  TEXT,  -- Soft delete for undo functionality
  created_by      TEXT REFERENCES users(user_id),
  updated_by      TEXT REFERENCES users(user_id),
  created_at_utc      TEXT NOT NULL,
  updated_at_utc      TEXT NOT NULL,
  archived_at_utc     TEXT
);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_pinned DESC, created_at_utc DESC) WHERE is_archived = 0 AND deleted_at_utc IS NULL;
CREATE INDEX IF NOT EXISTS idx_announcements_updated ON announcements(updated_at_utc DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_deleted ON announcements(deleted_at_utc) WHERE deleted_at_utc IS NOT NULL;

CREATE TABLE IF NOT EXISTS announcement_media (
  announcement_id  TEXT NOT NULL REFERENCES announcements(announcement_id) ON DELETE CASCADE,
  media_id         TEXT NOT NULL REFERENCES media_objects(media_id) ON DELETE CASCADE,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at_utc       TEXT NOT NULL,
  updated_at_utc       TEXT NOT NULL,
  PRIMARY KEY (announcement_id, media_id)
);

CREATE INDEX IF NOT EXISTS idx_announcement_media_order ON announcement_media(announcement_id, sort_order);


-- Announcement media must be stored in R2 (no external URLs)
CREATE TRIGGER IF NOT EXISTS trg_announcement_media_storage_type
BEFORE INSERT ON announcement_media
FOR EACH ROW
WHEN (SELECT storage_type FROM media_objects WHERE media_id = NEW.media_id) != 'r2'
BEGIN
  SELECT RAISE(ABORT, 'announcement_media must reference r2 media_objects');
END;

-- Max 10 images per announcement (per docs)
CREATE TRIGGER IF NOT EXISTS trg_announcement_media_quota
BEFORE INSERT ON announcement_media
FOR EACH ROW
WHEN (SELECT COUNT(*) FROM announcement_media WHERE announcement_id = NEW.announcement_id) >= 10
BEGIN
  SELECT RAISE(ABORT, 'announcement image quota exceeded');
END;

-- ------------------------------------------------------------
-- EVENTS (Unified events + signups)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS events (
  event_id       TEXT PRIMARY KEY,
  type           TEXT NOT NULL CHECK (type IN ('weekly_mission','guild_war','other')),
  title          TEXT NOT NULL,
  description    TEXT,
  start_at_utc       TEXT NOT NULL,
  end_at_utc         TEXT,
   capacity       INTEGER,
  is_pinned      INTEGER NOT NULL DEFAULT 0 CHECK (is_pinned IN (0, 1)),
  is_archived    INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
  signup_locked  INTEGER NOT NULL DEFAULT 0 CHECK (signup_locked IN (0, 1)),
  deleted_at_utc TEXT,  -- Soft delete for undo functionality
  created_by     TEXT REFERENCES users(user_id),
  updated_by     TEXT REFERENCES users(user_id),
  created_at_utc     TEXT NOT NULL,
  updated_at_utc     TEXT NOT NULL,
  archived_at_utc    TEXT,
  CHECK (capacity IS NULL OR capacity >= 0),
  CHECK (end_at_utc IS NULL OR end_at_utc >= start_at_utc)
);

CREATE INDEX IF NOT EXISTS idx_events_upcoming ON events(is_archived, start_at_utc) WHERE deleted_at_utc IS NULL;
CREATE INDEX IF NOT EXISTS idx_events_type_start_at_utc ON events(type, start_at_utc);
CREATE INDEX IF NOT EXISTS idx_events_pinned ON events(is_pinned, start_at_utc);
CREATE INDEX IF NOT EXISTS idx_events_updated_at ON events(updated_at_utc DESC);
CREATE INDEX IF NOT EXISTS idx_events_deleted ON events(deleted_at_utc) WHERE deleted_at_utc IS NOT NULL;

-- event_participants replaced by team_members + event_teams assignment
-- (Legacy table removed)

CREATE TABLE IF NOT EXISTS event_attachments (
  attachment_id TEXT PRIMARY KEY,
  event_id      TEXT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
  media_id      TEXT NOT NULL REFERENCES media_objects(media_id) ON DELETE CASCADE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at_utc    TEXT NOT NULL,
  updated_at_utc    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_event_attachments_order ON event_attachments(event_id, sort_order);


-- Event attachments must be stored in R2 (no external URLs)
CREATE TRIGGER IF NOT EXISTS trg_event_attachments_storage_type
BEFORE INSERT ON event_attachments
FOR EACH ROW
WHEN (SELECT storage_type FROM media_objects WHERE media_id = NEW.media_id) != 'r2'
BEGIN
  SELECT RAISE(ABORT, 'event_attachments must reference r2 media_objects');
END;

-- Max 5 attachments per event (per docs)
CREATE TRIGGER IF NOT EXISTS trg_event_attachments_quota
BEFORE INSERT ON event_attachments
FOR EACH ROW
WHEN (SELECT COUNT(*) FROM event_attachments WHERE event_id = NEW.event_id) >= 5
BEGIN
  SELECT RAISE(ABORT, 'event attachment quota exceeded');
END;

-- ------------------------------------------------------------
-- GUILD WAR: Active + History + Results + Stats
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- UNIVERSAL TEAMS (Persistent Squads/Groups)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS teams (
  team_id       TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  is_locked     INTEGER NOT NULL DEFAULT 0 CHECK (is_locked IN (0, 1)),
  created_by    TEXT REFERENCES users(user_id) ON DELETE SET NULL,
  created_at_utc    TEXT NOT NULL,
  updated_at_utc    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS team_members (
  team_id       TEXT NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  role_tag      TEXT,
  joined_at_utc     TEXT NOT NULL,
  PRIMARY KEY (team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

-- ------------------------------------------------------------
-- EVENT ASSIGNMENTS (Teams Assigned to Events)
-- Replaces old event_participants and war_teams concept
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS event_teams (
  event_id      TEXT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
  team_id       TEXT NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
  assigned_at_utc   TEXT NOT NULL,
  PRIMARY KEY (event_id, team_id)
);

CREATE INDEX IF NOT EXISTS idx_event_teams_event ON event_teams(event_id);
CREATE INDEX IF NOT EXISTS idx_event_teams_team ON event_teams(team_id);

-- ------------------------------------------------------------
-- GUILD WAR: Active + History + Results + Stats
-- ------------------------------------------------------------
-- Note: War Teams are now handled via event_teams linking to the war's event_id

CREATE TABLE IF NOT EXISTS war_history (
  war_id         TEXT PRIMARY KEY,
  event_id       TEXT UNIQUE REFERENCES events(event_id) ON DELETE SET NULL,
  war_date       TEXT NOT NULL, -- usually the event start_at_utc date/time in UTC
  title          TEXT,
  notes          TEXT,
  our_kills      INTEGER,
  enemy_kills    INTEGER,
  our_towers     INTEGER,
  enemy_towers   INTEGER,
  our_base_hp    INTEGER,
  enemy_base_hp  INTEGER,
  our_distance   INTEGER,
  enemy_distance INTEGER,
  our_credits    INTEGER,
  enemy_credits  INTEGER,
  result         TEXT NOT NULL DEFAULT 'unknown' CHECK (result IN ('win','loss','draw','unknown')),
  created_by     TEXT REFERENCES users(user_id),
  updated_by     TEXT REFERENCES users(user_id),
  created_at_utc     TEXT NOT NULL,
  updated_at_utc     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_war_history_date ON war_history(war_date DESC);
CREATE INDEX IF NOT EXISTS idx_war_history_updated ON war_history(updated_at_utc DESC);
CREATE INDEX IF NOT EXISTS idx_war_history_result_date ON war_history(result, war_date DESC);

-- (Legacy war_teams, war_team_members, war_pool_members tables REMOVED)

-- Per-member stats per war (History + Analytics)
CREATE TABLE IF NOT EXISTS war_member_stats (
  war_id            TEXT NOT NULL REFERENCES war_history(war_id) ON DELETE CASCADE,
  user_id           TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  kills             INTEGER,
  deaths            INTEGER,
  assists           INTEGER,
  damage            INTEGER,
  healing           INTEGER,
  building_damage   INTEGER,
  damage_taken      INTEGER,
  credits           INTEGER,
  note              TEXT,
  created_at_utc        TEXT NOT NULL,
  updated_at_utc        TEXT NOT NULL,
  PRIMARY KEY (war_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_war_member_stats_user ON war_member_stats(user_id, war_id);

-- ------------------------------------------------------------
-- AUDIT LOG (Admin Console)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_log (
  audit_id     TEXT PRIMARY KEY,
  entity_type  TEXT NOT NULL,   -- event/announcement/member/war/etc.
  action       TEXT NOT NULL,   -- create/update/archive/delete/role_change/etc.
  actor_id     TEXT REFERENCES users(user_id),
  entity_id    TEXT NOT NULL,
  diff_title   TEXT,
  detail_text  TEXT,
  created_at_utc   TEXT NOT NULL,
  updated_at_utc   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at_utc DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity_created ON audit_log(entity_type, created_at_utc DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor_created ON audit_log(actor_id, created_at_utc DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity_id ON audit_log(entity_id);

-- ------------------------------------------------------------
-- UNIFIED MEMBER PROGRESSION (for new categories: jingmai, juexing, shenbing, lingmai)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS member_progression (
  user_id      TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  category     TEXT NOT NULL,
  item_id      TEXT NOT NULL,
  level        INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 20),
  max_level    INTEGER NOT NULL DEFAULT 20 CHECK (max_level >= 1 AND max_level <= 20),
  created_at_utc   TEXT NOT NULL,
  updated_at_utc   TEXT NOT NULL,
  PRIMARY KEY (user_id, category, item_id)
);

CREATE INDEX IF NOT EXISTS idx_member_progression_user_category ON member_progression(user_id, category);
CREATE INDEX IF NOT EXISTS idx_member_progression_updated ON member_progression(updated_at_utc);
