
export type Role = 'admin' | 'moderator' | 'member' | 'external';

export type ClassType = 
  | 'mingjin_hong' | 'mingjin_ying' 
  | 'qiansi_yu' | 'qiansi_lin' 
  | 'pozhu_feng' | 'pozhu_chen' | 'pozhu_yuan' 
  | 'lieshi_wei' | 'lieshi_jun';

export interface TimeBlock {
  start: string; // HH:mm
  end: string;   // HH:mm
}

export interface DayAvailability {
  day: string; // 'Monday', etc.
  blocks: TimeBlock[];
}

export interface ProgressionData {
  qishu: Record<string, number>;
  wuxue: Record<string, number>;
  xinfa: Record<string, number>;
}

export interface UserMedia {
  id: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  thumbnail?: string;
  hash: string;
}

export interface User {
  id: string;
  username: string;
  wechat_name?: string;
  role: Role;
  power: number;
  classes: ClassType[];
  created_at?: string;
  avatar_url?: string;
  title_html?: string;
  active_status: 'active' | 'inactive' | 'vacation';
  notes?: string;
  bio?: string;
  vacation_start?: string;
  vacation_end?: string;
  availability?: DayAvailability[];
  progression?: ProgressionData;
  media?: UserMedia[];
  audio_url?: string;
  media_counts?: {
    images: number;
    videos: number;
    audio: number;
  };
  /* Added missing level properties used in Admin and Profile pages */
  combat_level?: number;
  support_level?: number;
  strategy_level?: number;
  last_seen?: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  type: 'weekly_mission' | 'guild_war' | 'other';
  title: string;
  description: string;
  start_time: string; // ISO UTC
  end_time?: string; // ISO UTC
  capacity?: number;
  participants: User[];
  is_locked: boolean;
  is_pinned: boolean;
  is_archived?: boolean;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content_html: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  is_archived: boolean;
  media_urls?: string[];
}

export interface AuditLogEntry {
  id: string;
  actor_id: string;
  actor_username: string;
  action: string;
  entity_type: string;
  entity_id: string;
  timestamp: string;
  detail_text: string;
  diff_summary?: string;
  metadata?: Record<string, any>;
}

export interface WarMemberStat {
  id: string;
  username: string;
  class: ClassType;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  healing: number;
  building_damage: number;
  credits: number;
  damage_taken: number;
  distance_moved?: number;
  note?: string;
}

export interface WarTeam {
  id: string;
  name: string;
  members: { user_id: string; role_tag?: string }[];
  note?: string;
  is_locked?: boolean;
}

export interface WarHistoryEntry {
  id: string;
  event_id: string;
  date: string;
  title: string;
  result: 'victory' | 'defeat' | 'draw' | 'pending';
  score?: number;
  enemy_score?: number;
  own_stats: { kills: number; towers: number; base_hp: number; credits: number; distance?: number };
  enemy_stats: { kills: number; towers: number; base_hp: number; credits: number; distance?: number };
  teams_snapshot: WarTeam[];
  pool_snapshot: string[];
  member_stats: WarMemberStat[];
  notes?: string;
  updated_at: string;
}
