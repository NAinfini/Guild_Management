import { integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// This Drizzle schema is a typed subset used by Drizzle-based handlers.
// Canonical D1 schema lives in infra/database/d1-schema/D1_Schema.sql.

export const users = sqliteTable('users', {
  userId: text('user_id').primaryKey(),
  username: text('username').notNull(),
  wechatName: text('wechat_name'),
  role: text('role').notNull(),
  power: integer('power').notNull().default(0),
  isActive: integer('is_active').notNull().default(1),
  deletedAtUtc: text('deleted_at_utc'),
  createdAtUtc: text('created_at_utc').notNull(),
  updatedAtUtc: text('updated_at_utc').notNull(),
});

export const userPreferences = sqliteTable('user_preferences', {
  userId: text('user_id')
    .notNull()
    .references(() => users.userId, { onDelete: 'cascade' })
    .primaryKey(),
  theme: text('theme').notNull(),
  color: text('color').notNull(),
  fontScale: real('font_scale').notNull(),
  motionIntensity: real('motion_intensity').notNull(),
  updatedAtUtc: text('updated_at_utc').notNull(),
});

export const memberProfiles = sqliteTable('member_profiles', {
  userId: text('user_id')
    .notNull()
    .references(() => users.userId, { onDelete: 'cascade' })
    .primaryKey(),
  titleHtml: text('title_html'),
  bioText: text('bio_text'),
  vacationStartAtUtc: text('vacation_start_at_utc'),
  vacationEndAtUtc: text('vacation_end_at_utc'),
  createdAtUtc: text('created_at_utc').notNull(),
  updatedAtUtc: text('updated_at_utc').notNull(),
});

export const events = sqliteTable('events', {
  eventId: text('event_id').primaryKey(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  startAtUtc: text('start_at_utc').notNull(),
  endAtUtc: text('end_at_utc'),
  capacity: integer('capacity'),
  isPinned: integer('is_pinned').notNull().default(0),
  isArchived: integer('is_archived').notNull().default(0),
  signupLocked: integer('signup_locked').notNull().default(0),
  deletedAtUtc: text('deleted_at_utc'),
  createdBy: text('created_by').references(() => users.userId),
  updatedBy: text('updated_by').references(() => users.userId),
  createdAtUtc: text('created_at_utc').notNull(),
  updatedAtUtc: text('updated_at_utc').notNull(),
  archivedAtUtc: text('archived_at_utc'),
});

export const teams = sqliteTable('teams', {
  teamId: text('team_id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  isLocked: integer('is_locked').notNull().default(0),
  createdBy: text('created_by').references(() => users.userId, { onDelete: 'set null' }),
  createdAtUtc: text('created_at_utc').notNull(),
  updatedAtUtc: text('updated_at_utc').notNull(),
});

export const eventTeams = sqliteTable(
  'event_teams',
  {
    eventId: text('event_id')
      .notNull()
      .references(() => events.eventId, { onDelete: 'cascade' }),
    teamId: text('team_id')
      .notNull()
      .references(() => teams.teamId, { onDelete: 'cascade' }),
    assignedAtUtc: text('assigned_at_utc').notNull(),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.teamId] })]
);

export const teamMembers = sqliteTable(
  'team_members',
  {
    teamId: text('team_id')
      .notNull()
      .references(() => teams.teamId, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    sortOrder: integer('sort_order').notNull().default(0),
    roleTag: text('role_tag'),
    joinedAtUtc: text('joined_at_utc').notNull(),
  },
  (t) => [primaryKey({ columns: [t.teamId, t.userId] })]
);

export const mediaObjects = sqliteTable('media_objects', {
  mediaId: text('media_id').primaryKey(),
  storageType: text('storage_type').notNull(),
  r2Key: text('r2_key'),
  url: text('url'),
  contentType: text('content_type'),
  sizeBytes: integer('size_bytes'),
  width: integer('width'),
  height: integer('height'),
  durationMs: integer('duration_ms'),
  sha256: text('sha256'),
  createdBy: text('created_by').references(() => users.userId),
  createdAtUtc: text('created_at_utc').notNull(),
  updatedAtUtc: text('updated_at_utc').notNull(),
});

export const memberMedia = sqliteTable(
  'member_media',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    mediaId: text('media_id')
      .notNull()
      .references(() => mediaObjects.mediaId, { onDelete: 'cascade' }),
    kind: text('kind').notNull(),
    isAvatar: integer('is_avatar').notNull().default(0),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAtUtc: text('created_at_utc').notNull(),
    updatedAtUtc: text('updated_at_utc').notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.mediaId] })]
);

export const memberAvailabilityBlocks = sqliteTable('member_availability_blocks', {
  blockId: text('block_id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.userId, { onDelete: 'cascade' }),
  weekday: integer('weekday').notNull(),
  startMin: integer('start_min').notNull(),
  endMin: integer('end_min').notNull(),
  createdAtUtc: text('created_at_utc').notNull(),
  updatedAtUtc: text('updated_at_utc').notNull(),
});

export const auditLog = sqliteTable('audit_log', {
  auditId: text('audit_id').primaryKey(),
  entityType: text('entity_type').notNull(),
  action: text('action').notNull(),
  actorId: text('actor_id').references(() => users.userId),
  entityId: text('entity_id').notNull(),
  diffTitle: text('diff_title'),
  detailText: text('detail_text'),
  createdAtUtc: text('created_at_utc').notNull(),
  updatedAtUtc: text('updated_at_utc').notNull(),
});

export const warHistory = sqliteTable('war_history', {
  warId: text('war_id').primaryKey(),
  eventId: text('event_id'),
  warDate: text('war_date').notNull(),
  title: text('title'),
  notes: text('notes'),
  ourKills: integer('our_kills'),
  enemyKills: integer('enemy_kills'),
  ourTowers: integer('our_towers'),
  enemyTowers: integer('enemy_towers'),
  ourBaseHp: integer('our_base_hp'),
  enemyBaseHp: integer('enemy_base_hp'),
  ourDistance: integer('our_distance'),
  enemyDistance: integer('enemy_distance'),
  ourCredits: integer('our_credits'),
  enemyCredits: integer('enemy_credits'),
  result: text('result').notNull(),
  createdBy: text('created_by').references(() => users.userId),
  updatedBy: text('updated_by').references(() => users.userId),
  createdAtUtc: text('created_at_utc').notNull(),
  updatedAtUtc: text('updated_at_utc').notNull(),
});

export const warMemberStats = sqliteTable(
  'war_member_stats',
  {
    warId: text('war_id')
      .notNull()
      .references(() => warHistory.warId, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    kills: integer('kills'),
    deaths: integer('deaths'),
    assists: integer('assists'),
    damage: integer('damage'),
    healing: integer('healing'),
    buildingDamage: integer('building_damage'),
    damageTaken: integer('damage_taken'),
    credits: integer('credits'),
    note: text('note'),
    createdAtUtc: text('created_at_utc').notNull(),
    updatedAtUtc: text('updated_at_utc').notNull(),
  },
  (t) => [primaryKey({ columns: [t.warId, t.userId] })]
);
