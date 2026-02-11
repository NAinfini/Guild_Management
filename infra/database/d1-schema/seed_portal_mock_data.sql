PRAGMA foreign_keys = ON;

-- ============================================================
-- Portal seed data (idempotent)
-- - Upserts users
-- - Sets member classes with valid class_code values
-- - Seeds guild war history + member stats
-- - Populates related tables with coherent mock data
-- ============================================================

-- ------------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------------
INSERT INTO users (user_id, username, wechat_name, role, power, is_active, created_at_utc, updated_at_utc)
VALUES
  ('u_admin', 'Admin', 'admin_wechat', 'admin', 95000, 1, '2026-01-01 00:00:00', '2026-02-09 00:00:00'),
  ('u_mod', 'NightStalker', 'night_ops', 'moderator', 62000, 1, '2026-01-01 00:00:00', '2026-02-09 00:00:00'),
  ('u_m1', '¡Ÿ‘®√Œ”„', 'lymy', 'member', 38900, 1, '2026-01-10 00:00:00', '2026-02-09 00:00:00'),
  ('u_m2', '÷‹∂˚”Ò', 'zeyu', 'member', 39000, 1, '2026-01-10 00:00:00', '2026-02-09 00:00:00'),
  ('u_m3', '√Œæ≥∏ƒ»’‘Ÿ◊´', 'mjgrzz', 'member', 37500, 1, '2026-01-10 00:00:00', '2026-02-09 00:00:00'),
  ('u_m4', 'ŒË∑„œ∑—©', 'wfxx', 'member', 37000, 1, '2026-01-10 00:00:00', '2026-02-09 00:00:00'),
  ('u_m5', 'IronVanguard', 'iron_van', 'member', 40100, 1, '2026-01-12 00:00:00', '2026-02-09 00:00:00'),
  ('u_m6', 'EchoBlade', 'echo_blade', 'member', 35800, 1, '2026-01-12 00:00:00', '2026-02-09 00:00:00'),
  ('u_m7', 'SableFox', 'sable_fox', 'member', 33200, 1, '2026-01-12 00:00:00', '2026-02-09 00:00:00'),
  ('u_m8', 'AsterRune', 'aster_rune', 'member', 34600, 1, '2026-01-12 00:00:00', '2026-02-09 00:00:00')
ON CONFLICT(user_id) DO UPDATE SET
  username = excluded.username,
  wechat_name = excluded.wechat_name,
  role = excluded.role,
  power = excluded.power,
  is_active = excluded.is_active,
  updated_at_utc = excluded.updated_at_utc;

-- ------------------------------------------------------------------
-- MEMBER PROFILES + NOTES + AVAILABILITY
-- ------------------------------------------------------------------
INSERT INTO member_profiles (user_id, title_html, bio_text, vacation_start_at_utc, vacation_end_at_utc, created_at_utc, updated_at_utc)
VALUES
  ('u_admin', '<b>Guild Commander</b>', 'Coordinates operations and approvals.', NULL, NULL, '2026-01-01 00:00:00', '2026-02-09 00:00:00'),
  ('u_mod', '<b>Field Moderator</b>', 'Maintains event discipline and war logistics.', NULL, NULL, '2026-01-01 00:00:00', '2026-02-09 00:00:00'),
  ('u_m1', '<span>Frontline Control</span>', 'Prefers objective pressure and tower timing.', NULL, NULL, '2026-01-10 00:00:00', '2026-02-09 00:00:00'),
  ('u_m2', '<span>Utility Core</span>', 'Handles rotations and defensive anchor.', NULL, NULL, '2026-01-10 00:00:00', '2026-02-09 00:00:00'),
  ('u_m3', '<span>Skirmish Specialist</span>', 'Strong duel and flank decision making.', NULL, NULL, '2026-01-10 00:00:00', '2026-02-09 00:00:00'),
  ('u_m4', '<span>Tempo Support</span>', 'Good macro tracking and teamfight peel.', NULL, NULL, '2026-01-10 00:00:00', '2026-02-09 00:00:00'),
  ('u_m5', '<span>Breaker</span>', 'Reliable pressure and sustained damage.', NULL, NULL, '2026-01-12 00:00:00', '2026-02-09 00:00:00'),
  ('u_m6', '<span>Ambush</span>', 'Best in chaotic mid-fight re-entry.', NULL, NULL, '2026-01-12 00:00:00', '2026-02-09 00:00:00'),
  ('u_m7', '<span>Guard</span>', 'Absorbs pressure and keeps vision line.', NULL, NULL, '2026-01-12 00:00:00', '2026-02-09 00:00:00'),
  ('u_m8', '<span>Control</span>', 'Flexible utility and steady objective play.', NULL, NULL, '2026-01-12 00:00:00', '2026-02-09 00:00:00')
ON CONFLICT(user_id) DO UPDATE SET
  title_html = excluded.title_html,
  bio_text = excluded.bio_text,
  vacation_start_at_utc = excluded.vacation_start_at_utc,
  vacation_end_at_utc = excluded.vacation_end_at_utc,
  updated_at_utc = excluded.updated_at_utc;

INSERT INTO member_notes (user_id, slot, note_text, created_by, updated_by, created_at_utc, updated_at_utc)
VALUES
  ('u_m1', 1, 'Strong tower conversion rate.', 'u_admin', 'u_admin', '2026-02-01 00:00:00', '2026-02-09 00:00:00'),
  ('u_m3', 1, 'Needs tighter disengage timing.', 'u_mod', 'u_mod', '2026-02-01 00:00:00', '2026-02-09 00:00:00'),
  ('u_m6', 1, 'High risk/high reward pick style.', 'u_mod', 'u_mod', '2026-02-01 00:00:00', '2026-02-09 00:00:00')
ON CONFLICT(user_id, slot) DO UPDATE SET
  note_text = excluded.note_text,
  updated_by = excluded.updated_by,
  updated_at_utc = excluded.updated_at_utc;

INSERT INTO member_availability_blocks (block_id, user_id, weekday, start_min, end_min, created_at_utc, updated_at_utc)
VALUES
  ('ab_m1_1', 'u_m1', 2, 1200, 1380, '2026-02-01 00:00:00', '2026-02-09 00:00:00'),
  ('ab_m2_1', 'u_m2', 2, 1140, 1380, '2026-02-01 00:00:00', '2026-02-09 00:00:00'),
  ('ab_m3_1', 'u_m3', 4, 1200, 1410, '2026-02-01 00:00:00', '2026-02-09 00:00:00'),
  ('ab_m4_1', 'u_m4', 4, 1180, 1380, '2026-02-01 00:00:00', '2026-02-09 00:00:00')
ON CONFLICT(block_id) DO UPDATE SET
  start_min = excluded.start_min,
  end_min = excluded.end_min,
  updated_at_utc = excluded.updated_at_utc;

-- ------------------------------------------------------------------
-- CLASSES (real class_code values used by app)
-- ------------------------------------------------------------------
DELETE FROM member_classes WHERE user_id IN (
  'u_admin','u_mod','u_m1','u_m2','u_m3','u_m4','u_m5','u_m6','u_m7','u_m8'
);

INSERT INTO member_classes (user_id, class_code, sort_order, created_at_utc, updated_at_utc)
VALUES
  ('u_admin', 'lieshi_wei', 0, '2026-01-01 00:00:00', '2026-02-09 00:00:00'),
  ('u_admin', 'qiansi_lin', 1, '2026-01-01 00:00:00', '2026-02-09 00:00:00'),

  ('u_mod', 'mingjin_hong', 0, '2026-01-01 00:00:00', '2026-02-09 00:00:00'),
  ('u_mod', 'qiansi_yu', 1, '2026-01-01 00:00:00', '2026-02-09 00:00:00'),

  ('u_m1', 'qiansi_lin', 0, '2026-01-10 00:00:00', '2026-02-09 00:00:00'),
  ('u_m1', 'lieshi_wei', 1, '2026-01-10 00:00:00', '2026-02-09 00:00:00'),

  ('u_m2', 'qiansi_yu', 0, '2026-01-10 00:00:00', '2026-02-09 00:00:00'),
  ('u_m2', 'mingjin_ying', 1, '2026-01-10 00:00:00', '2026-02-09 00:00:00'),

  ('u_m3', 'lieshi_wei', 0, '2026-01-10 00:00:00', '2026-02-09 00:00:00'),
  ('u_m3', 'pozhu_feng', 1, '2026-01-10 00:00:00', '2026-02-09 00:00:00'),

  ('u_m4', 'qiansi_lin', 0, '2026-01-10 00:00:00', '2026-02-09 00:00:00'),
  ('u_m4', 'mingjin_hong', 1, '2026-01-10 00:00:00', '2026-02-09 00:00:00'),

  ('u_m5', 'pozhu_chen', 0, '2026-01-12 00:00:00', '2026-02-09 00:00:00'),
  ('u_m6', 'mingjin_ying', 0, '2026-01-12 00:00:00', '2026-02-09 00:00:00'),
  ('u_m7', 'lieshi_jun', 0, '2026-01-12 00:00:00', '2026-02-09 00:00:00'),
  ('u_m8', 'qiansi_lin', 0, '2026-01-12 00:00:00', '2026-02-09 00:00:00');

-- ------------------------------------------------------------------
-- LEGACY PROGRESSION TABLES (minimal rows for compatibility)
-- ------------------------------------------------------------------
INSERT OR IGNORE INTO member_qishu (user_id, created_at_utc, updated_at_utc) VALUES
  ('u_admin','2026-01-01 00:00:00','2026-02-09 00:00:00'),
  ('u_mod','2026-01-01 00:00:00','2026-02-09 00:00:00'),
  ('u_m1','2026-01-10 00:00:00','2026-02-09 00:00:00'),
  ('u_m2','2026-01-10 00:00:00','2026-02-09 00:00:00'),
  ('u_m3','2026-01-10 00:00:00','2026-02-09 00:00:00'),
  ('u_m4','2026-01-10 00:00:00','2026-02-09 00:00:00'),
  ('u_m5','2026-01-12 00:00:00','2026-02-09 00:00:00'),
  ('u_m6','2026-01-12 00:00:00','2026-02-09 00:00:00'),
  ('u_m7','2026-01-12 00:00:00','2026-02-09 00:00:00'),
  ('u_m8','2026-01-12 00:00:00','2026-02-09 00:00:00');

INSERT OR IGNORE INTO member_wuxue (user_id, created_at_utc, updated_at_utc) SELECT user_id, created_at_utc, updated_at_utc FROM member_qishu;
INSERT OR IGNORE INTO member_xinfa (user_id, created_at_utc, updated_at_utc) SELECT user_id, created_at_utc, updated_at_utc FROM member_qishu;

INSERT INTO member_progression (user_id, category, item_id, level, max_level, created_at_utc, updated_at_utc)
VALUES
  ('u_m1', 'jingmai', 'meridian_core', 8, 20, '2026-02-01 00:00:00', '2026-02-09 00:00:00'),
  ('u_m2', 'jingmai', 'meridian_core', 9, 20, '2026-02-01 00:00:00', '2026-02-09 00:00:00'),
  ('u_m3', 'juexing', 'awakening_path', 7, 20, '2026-02-01 00:00:00', '2026-02-09 00:00:00'),
  ('u_m4', 'shenbing', 'artifact_refine', 6, 20, '2026-02-01 00:00:00', '2026-02-09 00:00:00'),
  ('u_m5', 'lingmai', 'spirit_channel', 10, 20, '2026-02-01 00:00:00', '2026-02-09 00:00:00')
ON CONFLICT(user_id, category, item_id) DO UPDATE SET
  level = excluded.level,
  max_level = excluded.max_level,
  updated_at_utc = excluded.updated_at_utc;

-- ------------------------------------------------------------------
-- ANNOUNCEMENTS
-- ------------------------------------------------------------------
INSERT INTO announcements (announcement_id, title, body_html, is_pinned, is_archived, created_by, updated_by, created_at_utc, updated_at_utc)
VALUES
  ('a_001', 'Guild War Ops Update', '<p>Updated preparation flow and roster controls.</p>', 1, 0, 'u_admin', 'u_admin', '2026-02-03 10:00:00', '2026-02-09 00:00:00'),
  ('a_002', 'Weekly Mission Rotation', '<p>This week focuses on coordinated tower pressure drills.</p>', 0, 0, 'u_mod', 'u_mod', '2026-02-05 08:30:00', '2026-02-09 00:00:00')
ON CONFLICT(announcement_id) DO UPDATE SET
  title = excluded.title,
  body_html = excluded.body_html,
  is_pinned = excluded.is_pinned,
  is_archived = excluded.is_archived,
  updated_by = excluded.updated_by,
  updated_at_utc = excluded.updated_at_utc;

-- ------------------------------------------------------------------
-- EVENTS + TEAMS
-- ------------------------------------------------------------------
INSERT INTO events (event_id, type, title, description, start_at_utc, end_at_utc, capacity, is_pinned, is_archived, signup_locked, created_by, updated_by, created_at_utc, updated_at_utc)
VALUES
  ('e_gw_20260120', 'guild_war', 'Guild War - Jan 20', 'Historic war record import.', '2026-01-20 20:00:00', '2026-01-20 21:30:00', 30, 0, 1, 1, 'u_admin', 'u_admin', '2026-01-18 10:00:00', '2026-02-09 00:00:00'),
  ('e_gw_20260127', 'guild_war', 'Guild War - Jan 27', 'Historic war record import.', '2026-01-27 20:00:00', '2026-01-27 21:30:00', 30, 0, 1, 1, 'u_admin', 'u_admin', '2026-01-25 10:00:00', '2026-02-09 00:00:00'),
  ('e_gw_20260203', 'guild_war', 'Guild War - Feb 03', 'Historic war record import.', '2026-02-03 20:00:00', '2026-02-03 21:30:00', 30, 1, 1, 1, 'u_admin', 'u_admin', '2026-02-01 10:00:00', '2026-02-09 00:00:00'),
  ('e_gw_20260210', 'guild_war', 'Guild War - Feb 10', 'Prepared war lineup.', '2026-02-10 20:00:00', '2026-02-10 21:30:00', 30, 1, 0, 0, 'u_admin', 'u_mod', '2026-02-08 10:00:00', '2026-02-09 00:00:00'),
  ('e_weekly_001', 'weekly_mission', 'Weekly Mission Alpha', 'Tower pressure and rotation drill.', '2026-02-12 19:30:00', '2026-02-12 20:30:00', 20, 0, 0, 0, 'u_mod', 'u_mod', '2026-02-08 08:00:00', '2026-02-09 00:00:00'),
  ('e_other_001', 'other', 'Resource Relay', 'Logistics and route assignment.', '2026-02-14 18:00:00', '2026-02-14 19:00:00', 15, 0, 0, 0, 'u_admin', 'u_admin', '2026-02-08 08:00:00', '2026-02-09 00:00:00')
ON CONFLICT(event_id) DO UPDATE SET
  type = excluded.type,
  title = excluded.title,
  description = excluded.description,
  start_at_utc = excluded.start_at_utc,
  end_at_utc = excluded.end_at_utc,
  capacity = excluded.capacity,
  is_pinned = excluded.is_pinned,
  is_archived = excluded.is_archived,
  signup_locked = excluded.signup_locked,
  updated_by = excluded.updated_by,
  updated_at_utc = excluded.updated_at_utc;

INSERT INTO teams (team_id, name, description, is_locked, created_by, created_at_utc, updated_at_utc)
VALUES
  ('t_alpha', 'Alpha', 'Primary pressure squad.', 0, 'u_admin', '2026-01-01 00:00:00', '2026-02-09 00:00:00'),
  ('t_bravo', 'Bravo', 'Objective control squad.', 0, 'u_admin', '2026-01-01 00:00:00', '2026-02-09 00:00:00'),
  ('t_charlie', 'Charlie', 'Flex reserve squad.', 0, 'u_mod', '2026-01-01 00:00:00', '2026-02-09 00:00:00')
ON CONFLICT(team_id) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  is_locked = excluded.is_locked,
  updated_at_utc = excluded.updated_at_utc;

DELETE FROM team_members WHERE team_id IN ('t_alpha','t_bravo','t_charlie');
INSERT INTO team_members (team_id, user_id, sort_order, role_tag, joined_at_utc)
VALUES
  ('t_alpha', 'u_m1', 0, 'lead', '2026-02-01 00:00:00'),
  ('t_alpha', 'u_m2', 1, 'support', '2026-02-01 00:00:00'),
  ('t_alpha', 'u_m5', 2, 'dmg', '2026-02-01 00:00:00'),
  ('t_bravo', 'u_m3', 0, 'lead', '2026-02-01 00:00:00'),
  ('t_bravo', 'u_m4', 1, 'support', '2026-02-01 00:00:00'),
  ('t_bravo', 'u_m6', 2, 'dmg', '2026-02-01 00:00:00'),
  ('t_charlie', 'u_m7', 0, 'tank', '2026-02-01 00:00:00'),
  ('t_charlie', 'u_m8', 1, 'support', '2026-02-01 00:00:00');

DELETE FROM event_teams WHERE event_id IN ('e_gw_20260120','e_gw_20260127','e_gw_20260203','e_gw_20260210');
INSERT INTO event_teams (event_id, team_id, assigned_at_utc)
VALUES
  ('e_gw_20260120', 't_alpha', '2026-01-20 18:00:00'),
  ('e_gw_20260120', 't_bravo', '2026-01-20 18:00:00'),
  ('e_gw_20260127', 't_alpha', '2026-01-27 18:00:00'),
  ('e_gw_20260127', 't_bravo', '2026-01-27 18:00:00'),
  ('e_gw_20260203', 't_alpha', '2026-02-03 18:00:00'),
  ('e_gw_20260203', 't_bravo', '2026-02-03 18:00:00'),
  ('e_gw_20260210', 't_alpha', '2026-02-10 18:00:00'),
  ('e_gw_20260210', 't_bravo', '2026-02-10 18:00:00'),
  ('e_gw_20260210', 't_charlie', '2026-02-10 18:00:00');

-- ------------------------------------------------------------------
-- WAR HISTORY + MEMBER STATS
-- ------------------------------------------------------------------
INSERT INTO war_history (war_id, event_id, war_date, title, notes, our_kills, enemy_kills, our_towers, enemy_towers, our_base_hp, enemy_base_hp, our_distance, enemy_distance, our_credits, enemy_credits, result, created_by, updated_by, created_at_utc, updated_at_utc)
VALUES
  ('wh_20260120', 'e_gw_20260120', '2026-01-20 20:00:00', 'Guild War - Jan 20', 'Clean macro game, late push secured.', 58, 49, 7, 5, 62, 0, 12400, 11100, 18400, 16800, 'win', 'u_admin', 'u_admin', '2026-01-20 22:00:00', '2026-02-09 00:00:00'),
  ('wh_20260127', 'e_gw_20260127', '2026-01-27 20:00:00', 'Guild War - Jan 27', 'Lost early tempo, recovered too late.', 44, 52, 4, 6, 0, 41, 9800, 10800, 14300, 15600, 'loss', 'u_admin', 'u_mod', '2026-01-27 22:00:00', '2026-02-09 00:00:00'),
  ('wh_20260203', 'e_gw_20260203', '2026-02-03 20:00:00', 'Guild War - Feb 03', 'Stable control and objective conversion.', 61, 57, 8, 7, 35, 0, 13100, 12700, 19700, 19100, 'win', 'u_admin', 'u_admin', '2026-02-03 22:00:00', '2026-02-09 00:00:00')
ON CONFLICT(war_id) DO UPDATE SET
  event_id = excluded.event_id,
  war_date = excluded.war_date,
  title = excluded.title,
  notes = excluded.notes,
  our_kills = excluded.our_kills,
  enemy_kills = excluded.enemy_kills,
  our_towers = excluded.our_towers,
  enemy_towers = excluded.enemy_towers,
  our_base_hp = excluded.our_base_hp,
  enemy_base_hp = excluded.enemy_base_hp,
  our_distance = excluded.our_distance,
  enemy_distance = excluded.enemy_distance,
  our_credits = excluded.our_credits,
  enemy_credits = excluded.enemy_credits,
  result = excluded.result,
  updated_by = excluded.updated_by,
  updated_at_utc = excluded.updated_at_utc;

DELETE FROM war_member_stats WHERE war_id IN ('wh_20260120','wh_20260127','wh_20260203');

INSERT INTO war_member_stats (war_id, user_id, kills, deaths, assists, damage, healing, building_damage, damage_taken, credits, note, created_at_utc, updated_at_utc)
VALUES
  ('wh_20260120','u_m1', 9,4,12, 168000,42000,25000,82000,3200, 'Tower engage anchor.', '2026-01-20 22:00:00','2026-02-09 00:00:00'),
  ('wh_20260120','u_m2', 7,5,15, 141000,58000,17000,76000,2900, 'Strong peel coverage.', '2026-01-20 22:00:00','2026-02-09 00:00:00'),
  ('wh_20260120','u_m3', 11,6,9, 176000,31000,21000,90000,3300, 'Won key duel windows.', '2026-01-20 22:00:00','2026-02-09 00:00:00'),
  ('wh_20260120','u_m4', 6,4,16, 132000,62000,12000,70000,2750, 'Excellent teamfight setup.', '2026-01-20 22:00:00','2026-02-09 00:00:00'),

  ('wh_20260127','u_m1', 6,8,10, 149000,35000,16000,97000,2500, 'Overextended mid-game.', '2026-01-27 22:00:00','2026-02-09 00:00:00'),
  ('wh_20260127','u_m2', 5,7,13, 126000,53000,9000,84000,2300, 'Defensive uptime solid.', '2026-01-27 22:00:00','2026-02-09 00:00:00'),
  ('wh_20260127','u_m3', 8,9,7, 161000,27000,18000,102000,2600, 'Could not close fights.', '2026-01-27 22:00:00','2026-02-09 00:00:00'),
  ('wh_20260127','u_m4', 4,6,14, 117000,57000,8000,79000,2150, 'Late-game stabilization.', '2026-01-27 22:00:00','2026-02-09 00:00:00'),

  ('wh_20260203','u_m1', 10,5,13, 173000,41000,26000,85000,3400, 'Strong objective reads.', '2026-02-03 22:00:00','2026-02-09 00:00:00'),
  ('wh_20260203','u_m2', 8,4,17, 145000,64000,14000,73000,3100, 'Consistent support lane.', '2026-02-03 22:00:00','2026-02-09 00:00:00'),
  ('wh_20260203','u_m3', 12,7,11, 182000,30000,23000,93000,3550, 'Converted pickoffs to towers.', '2026-02-03 22:00:00','2026-02-09 00:00:00'),
  ('wh_20260203','u_m4', 7,5,18, 136000,68000,11000,71000,3000, 'Great utility coverage.', '2026-02-03 22:00:00','2026-02-09 00:00:00');

-- ------------------------------------------------------------------
-- AUDIT LOG
-- ------------------------------------------------------------------
INSERT INTO audit_log (audit_id, entity_type, action, actor_id, entity_id, diff_title, detail_text, created_at_utc, updated_at_utc)
VALUES
  ('al_001', 'member', 'update_classes', 'u_admin', 'u_m1', 'Updated classes', 'Set primary class to qiansi_lin.', '2026-02-09 00:01:00', '2026-02-09 00:01:00'),
  ('al_002', 'war', 'create_history', 'u_mod', 'wh_20260203', 'Imported war history', 'Added war summary and member stats.', '2026-02-09 00:02:00', '2026-02-09 00:02:00'),
  ('al_003', 'event', 'create', 'u_admin', 'e_weekly_001', 'Created weekly mission', 'Weekly mission event scheduled.', '2026-02-09 00:03:00', '2026-02-09 00:03:00')
ON CONFLICT(audit_id) DO UPDATE SET
  detail_text = excluded.detail_text,
  updated_at_utc = excluded.updated_at_utc;
