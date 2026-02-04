-- Mock data for Guild Management Portal
-- Run this after D1_Schema.sql to populate test data

PRAGMA foreign_keys = ON;

-- Clean existing data (if any)
DELETE FROM war_member_stats;
DELETE FROM war_pool_members;
DELETE FROM war_team_members;
DELETE FROM war_teams;
DELETE FROM war_history;
DELETE FROM event_attachments;
DELETE FROM event_participants;
DELETE FROM events;
DELETE FROM announcement_media;
DELETE FROM announcements;
DELETE FROM member_media;
DELETE FROM gallery_images;
DELETE FROM media_objects;
DELETE FROM member_availability_blocks;
DELETE FROM member_classes;
DELETE FROM member_wuxue;
DELETE FROM member_xinfa;
DELETE FROM member_qishu;
DELETE FROM member_notes;
DELETE FROM member_profiles;
DELETE FROM sessions;
DELETE FROM user_auth_password;
DELETE FROM users;

-- Insert test users (passwords are all "password" hashed with salt "testsalt123")
-- Using a simple hash for demo: we'll use bcrypt hash for "password"
INSERT INTO users (user_id, username, wechat_name, role, power, is_active, created_at_utc, updated_at_utc) VALUES
('user-001', 'admin', 'Admin WeChat', 'admin', 15000, 1, datetime('now'), datetime('now')),
('user-002', 'moderator1', 'Mod WeChat', 'moderator', 12000, 1, datetime('now'), datetime('now')),
('user-003', 'player1', 'Player1 WX', 'member', 10500, 1, datetime('now'), datetime('now')),
('user-004', 'player2', 'Player2 WX', 'member', 9800, 1, datetime('now'), datetime('now')),
('user-005', 'player3', 'Player3 WX', 'member', 11200, 1, datetime('now'), datetime('now')),
('user-006', 'player4', 'Player4 WX', 'member', 8900, 1, datetime('now'), datetime('now')),
('user-007', 'vacation_user', 'Vacation WX', 'member', 7500, 1, datetime('now'), datetime('now'));

-- Insert passwords (bcrypt hash of "password" with default salt)
-- $2a$10$rr0xH9azJL05h3KdPvJlvOJB7A9DrOqUKqiF3cGOcr/T0PNF.q866
INSERT INTO user_auth_password (user_id, password_hash, salt, created_at_utc, updated_at_utc) VALUES
('user-001', '$2a$10$rr0xH9azJL05h3KdPvJlvOJB7A9DrOqUKqiF3cGOcr/T0PNF.q866', 'testsalt', datetime('now'), datetime('now')),
('user-002', '$2a$10$rr0xH9azJL05h3KdPvJlvOJB7A9DrOqUKqiF3cGOcr/T0PNF.q866', 'testsalt', datetime('now'), datetime('now')),
('user-003', '$2a$10$rr0xH9azJL05h3KdPvJlvOJB7A9DrOqUKqiF3cGOcr/T0PNF.q866', 'testsalt', datetime('now'), datetime('now')),
('user-004', '$2a$10$rr0xH9azJL05h3KdPvJlvOJB7A9DrOqUKqiF3cGOcr/T0PNF.q866', 'testsalt', datetime('now'), datetime('now')),
('user-005', '$2a$10$rr0xH9azJL05h3KdPvJlvOJB7A9DrOqUKqiF3cGOcr/T0PNF.q866', 'testsalt', datetime('now'), datetime('now')),
('user-006', '$2a$10$rr0xH9azJL05h3KdPvJlvOJB7A9DrOqUKqiF3cGOcr/T0PNF.q866', 'testsalt', datetime('now'), datetime('now')),
('user-007', '$2a$10$rr0xH9azJL05h3KdPvJlvOJB7A9DrOqUKqiF3cGOcr/T0PNF.q866', 'testsalt', datetime('now'), datetime('now'));

-- Member profiles
INSERT INTO member_profiles (user_id, title_html, bio_text, created_at_utc, updated_at_utc) VALUES
('user-001', '<span style="color: #ff0000;">Guild Master</span>', 'Leading BaiYe guild to victory!', datetime('now'), datetime('now')),
('user-002', '<span style="color: #ff9900;">Senior Officer</span>', 'Helping manage guild operations.', datetime('now'), datetime('now')),
('user-003', NULL, 'Main DPS player, always ready for raids.', datetime('now'), datetime('now')),
('user-004', NULL, 'Support specialist here to help the team.', datetime('now'), datetime('now')),
('user-005', NULL, 'Tank main, protecting my allies.', datetime('now'), datetime('now')),
('user-006', NULL, 'Casual player, love guild events!', datetime('now'), datetime('now')),
('user-007', NULL, 'Taking a break, will be back soon.', datetime('now'), datetime('now'));

-- Vacation for user-007
UPDATE member_profiles SET 
  vacation_start_at_utc = datetime('now', '-3 days'),
  vacation_end_at_utc = datetime('now', '+7 days')
WHERE user_id = 'user-007';

-- Member classes
INSERT INTO member_classes (user_id, class_code, sort_order, created_at_utc, updated_at_utc) VALUES
('user-001', 'qiansi_yu', 1, datetime('now'), datetime('now')),
('user-002', 'mingjin_hong', 1, datetime('now'), datetime('now')),
('user-003', 'pozhu_feng', 1, datetime('now'), datetime('now')),
('user-003', 'pozhu_chen', 2, datetime('now'), datetime('now')),
('user-004', 'qiansi_lin', 1, datetime('now'), datetime('now')),
('user-005', 'lieshi_wei', 1, datetime('now'), datetime('now')),
('user-006', 'mingjin_ying', 1, datetime('now'), datetime('now')),
('user-007', 'lieshi_jun', 1, datetime('now'), datetime('now'));

-- Create announcements
INSERT INTO announcements (announcement_id, title, body_html, is_pinned, is_archived, created_by, updated_by, created_at_utc, updated_at_utc) VALUES
('ann-001', 'Welcome to BaiYe Portal!', '<p>Welcome to our new guild management portal. Please update your profile and check out the event schedule.</p>', 1, 0, 'user-001', 'user-001', datetime('now', '-10 days'), datetime('now', '-10 days')),
('ann-002', 'Guild War This Weekend', '<p><strong>Important:</strong> Guild war is scheduled for this weekend at 8 PM UTC. All members please sign up!</p>', 1, 0, 'user-002', 'user-002', datetime('now', '-3 days'), datetime('now', '-3 days')),
('ann-003', 'Weekly Raid Schedule Updated', '<p>We''ve updated our weekly raid times to better accommodate more members. Check the Events page for details.</p>', 0, 0, 'user-002', 'user-002', datetime('now', '-1 day'), datetime('now', '-1 day'));

-- Create events
INSERT INTO events (event_id, type, title, description, start_at_utc, end_at_utc, capacity, is_pinned, is_archived, signup_locked, created_by, updated_by, created_at_utc, updated_at_utc) VALUES
('event-001', 'weekly_mission', 'Weekly Raid - Monday', 'Weekly team raid, all welcome!', datetime('now', '+1 day', '+19 hours'), datetime('now', '+1 day', '+21 hours'), 20, 1, 0, 0, 'user-002', 'user-002', datetime('now', '-5 days'), datetime('now', '-5 days')),
('event-002', 'guild_war', 'Guild War Championship', 'Important guild war event against rival guild', datetime('now', '+3 days', '+20 hours'), datetime('now', '+3 days', '+22 hours'), 30, 1, 0, 0, 'user-001', 'user-001', datetime('now', '-2 days'), datetime('now', '-2 days')),
('event-003', 'other', 'Community Gathering', 'Casual event for fun and socializing', datetime('now', '+7 days', '+18 hours'), NULL, NULL, 0, 0, 0, 'user-002', 'user-002', datetime('now', '-1 day'), datetime('now', '-1 day'));

-- Event participants
INSERT INTO event_participants (event_id, user_id, joined_at_utc, joined_by, created_at_utc, updated_at_utc) VALUES
('event-001', 'user-001', datetime('now', '-4 days'), 'user-001', datetime('now', '-4 days'), datetime('now', '-4 days')),
('event-001', 'user-002', datetime('now', '-4 days'), 'user-002', datetime('now', '-4 days'), datetime('now', '-4 days')),
('event-001', 'user-003', datetime('now', '-3 days'), 'user-003', datetime('now', '-3 days'), datetime('now', '-3 days')),
('event-001', 'user-004', datetime('now', '-3 days'), 'user-004', datetime('now', '-3 days'), datetime('now', '-3 days')),
('event-001', 'user-005', datetime('now', '-2 days'), 'user-005', datetime('now', '-2 days'), datetime('now', '-2 days')),
('event-002', 'user-001', datetime('now', '-2 days'), 'user-001', datetime('now', '-2 days'), datetime('now', '-2 days')),
('event-002', 'user-002', datetime('now', '-2 days'), 'user-002', datetime('now', '-2 days'), datetime('now', '-2 days')),
('event-002', 'user-003', datetime('now', '-1 day'), 'user-003', datetime('now', '-1 day'), datetime('now', '-1 day')),
('event-002', 'user-004', datetime('now', '-1 day'), 'user-004', datetime('now', '-1 day'), datetime('now', '-1 day')),
('event-002', 'user-005', datetime('now', '-1 day'), 'user-005', datetime('now', '-1 day'), datetime('now', '-1 day')),
('event-002', 'user-006', datetime('now', '-1 day'), 'user-006', datetime('now', '-1 day'), datetime('now', '-1 day'));

-- Create a past guild war for history
INSERT INTO war_history (war_id, event_id, war_date, title, notes, our_kills, enemy_kills, our_towers, enemy_towers, our_base_hp, enemy_base_hp, our_distance, enemy_distance, our_credits, enemy_credits, result, created_by, updated_by, created_at_utc, updated_at_utc) VALUES
('war-001', NULL, datetime('now', '-14 days'), 'War vs Dragon Guild', 'Epic battle, great teamwork!', 45, 38, 3, 2, 15000, 3200, 850, 720, 12500, 10200, 'win', 'user-001', 'user-001', datetime('now', '-14 days'), datetime('now', '-14 days'));

-- War teams for history
INSERT INTO war_teams (war_team_id, war_id, name, note, is_locked, sort_order, created_at_utc, updated_at_utc) VALUES
('team-001', 'war-001', 'Alpha Squad', 'Main attack team', 1, 1, datetime('now', '-14 days'), datetime('now', '-14 days')),
('team-002', 'war-001', 'Bravo Squad', 'Defense team', 1, 2, datetime('now', '-14 days'), datetime('now', '-14 days'));

-- War team members
INSERT INTO war_team_members (war_id, war_team_id, user_id, role_tag, sort_order, created_at_utc, updated_at_utc) VALUES
('war-001', 'team-001', 'user-001', 'Leader', 1, datetime('now', '-14 days'), datetime('now', '-14 days')),
('war-001', 'team-001', 'user-003', 'DPS', 2, datetime('now', '-14 days'), datetime('now', '-14 days')),
('war-001', 'team-002', 'user-002', 'Officer', 1, datetime('now', '-14 days'), datetime('now', '-14 days')),
('war-001', 'team-002', 'user-005', 'Tank', 2, datetime('now', '-14 days'), datetime('now', '-14 days'));

-- War member stats
INSERT INTO war_member_stats (war_id, user_id, kills, deaths, assists, damage, healing, building_damage, damage_taken, credits, created_at_utc, updated_at_utc) VALUES
('war-001', 'user-001', 12, 3, 8, 850000, 45000, 120000, 320000, 3200, datetime('now', '-14 days'), datetime('now', '-14 days')),
('war-001', 'user-002', 8, 5, 12, 620000, 180000, 95000, 450000, 2800, datetime('now', '-14 days'), datetime('now', '-14 days')),
('war-001', 'user-003', 15, 4, 6, 1200000, 12000, 85000, 280000, 3500, datetime('now', '-14 days'), datetime('now', '-14 days')),
('war-001', 'user-005', 4, 6, 15, 480000, 95000, 55000, 780000, 2400, datetime('now', '-14 days'), datetime('now', '-14 days'));

-- Insert some audit log entries
INSERT INTO audit_log (audit_id, entity_type, action, actor_id, entity_id, diff_title, detail_text, created_at_utc, updated_at_utc) VALUES
('audit-001', 'announcement', 'create', 'user-001', 'ann-001', 'Created announcement', 'Welcome to BaiYe Portal!', datetime('now', '-10 days'), datetime('now', '-10 days')),
('audit-002', 'event', 'create', 'user-002', 'event-001', 'Created event', 'Weekly Raid - Monday', datetime('now', '-5 days'), datetime('now', '-5 days')),
('audit-003', 'event', 'create', 'user-001', 'event-002', 'Created event', 'Guild War Championship', datetime('now', '-2 days'), datetime('now', '-2 days')),
('audit-004', 'announcement', 'create', 'user-002', 'ann-002', 'Created announcement', 'Guild War This Weekend', datetime('now', '-3 days'), datetime('now', '-3 days'));
