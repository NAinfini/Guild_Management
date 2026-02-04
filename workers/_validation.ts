/**
 * Zod validation schemas for API requests
 */

import { z } from 'zod';

// ============================================================
// Authentication Schemas
// ============================================================

export const loginSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(8).max(100),
  rememberMe: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
});

export const signupSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(100),
  wechatName: z.string().min(1).max(50).optional(),
});

// ============================================================
// Event Schemas
// ============================================================

export const createEventSchema = z.object({
  type: z.enum(['weekly_mission', 'guild_war', 'other']),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  startAt: z.string().datetime(), // ISO 8601 datetime
  endAt: z.string().datetime().optional(),
  capacity: z.number().int().positive().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const eventActionSchema = z.object({
  isPinned: z.boolean().optional(),
  signupLocked: z.boolean().optional(),
});

export const batchEventActionSchema = z.object({
  eventIds: z.array(z.string()).min(1).max(100),
  action: z.enum(['archive', 'unarchive', 'delete']),
});

// ============================================================
// Announcement Schemas
// ============================================================

export const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  bodyHtml: z.string().max(10000).optional(),
  isPinned: z.boolean().optional(),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();

// ============================================================
// Member Schemas
// ============================================================

export const updateProfileSchema = z.object({
  titleHtml: z.string().max(500).optional(),
  bioText: z.string().max(2000).optional(),
  power: z.number().int().min(0).optional(),
  vacationStart: z.string().datetime().optional(),
  vacationEnd: z.string().datetime().optional(),
});

export const updateUsernameSchema = z.object({
  newUsername: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(100),
});

export const updateRoleSchema = z.object({
  role: z.enum(['member', 'moderator', 'admin']),
});

export const batchMemberActionSchema = z.object({
  userIds: z.array(z.string()).min(1).max(100),
  action: z.enum(['set_role', 'deactivate', 'reactivate']),
  role: z.enum(['member', 'moderator', 'admin']).optional(),
});

export const memberClassesSchema = z.object({
  classes: z.array(z.string()).min(1).max(10),
});

export const availabilityBlockSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startMin: z.number().int().min(0).max(1440),
  endMin: z.number().int().min(0).max(1440),
});

export const updateAvailabilitySchema = z.object({
  blocks: z.array(availabilityBlockSchema),
});

export const progressionUpdateSchema = z.object({
  category: z.enum(['qishu', 'xinfa', 'wuxue']),
  itemId: z.string(),
  level: z.number().int().min(0).max(20),
});

// ============================================================
// Media Schemas
// ============================================================

export const uploadImageSchema = z.object({
  file: z.instanceof(File),
  kind: z.enum(['avatar', 'gallery']),
});

export const uploadAudioSchema = z.object({
  file: z.instanceof(File),
});

export const addVideoUrlSchema = z.object({
  url: z.string().url(),
});

export const reorderMediaSchema = z.object({
  mediaIds: z.array(z.string()),
});

// ============================================================
// Guild War Schemas
// ============================================================

export const createWarTeamSchema = z.object({
  name: z.string().min(1).max(100),
  note: z.string().max(500).optional(),
});

export const updateWarTeamSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  note: z.string().max(500).optional(),
  isLocked: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const assignMemberSchema = z.object({
  userId: z.string(),
  teamId: z.string().optional(), // If null, assign to pool
  roleTag: z.string().max(32).optional(),
});

export const updateWarStatsSchema = z.object({
  ourKills: z.number().int().min(0).optional(),
  enemyKills: z.number().int().min(0).optional(),
  ourTowers: z.number().int().min(0).optional(),
  enemyTowers: z.number().int().min(0).optional(),
  ourBaseHp: z.number().int().min(0).optional(),
  enemyBaseHp: z.number().int().min(0).optional(),
  ourDistance: z.number().int().min(0).optional(),
  enemyDistance: z.number().int().min(0).optional(),
  ourCredits: z.number().int().min(0).optional(),
  enemyCredits: z.number().int().min(0).optional(),
  result: z.enum(['win', 'loss', 'draw', 'unknown']).optional(),
  notes: z.string().max(2000).optional(),
});

export const memberStatsSchema = z.object({
  userId: z.string(),
  kills: z.number().int().min(0).optional(),
  deaths: z.number().int().min(0).optional(),
  assists: z.number().int().min(0).optional(),
  damage: z.number().int().min(0).optional(),
  healing: z.number().int().min(0).optional(),
  buildingDamage: z.number().int().min(0).optional(),
  damageTaken: z.number().int().min(0).optional(),
  credits: z.number().int().min(0).optional(),
  note: z.string().max(500).optional(),
});

// ============================================================
// Admin Schemas
// ============================================================

export const auditLogQuerySchema = z.object({
  entityType: z.string().optional(),
  actorId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const memberNoteSchema = z.object({
  slot: z.number().int().min(1).max(5),
  noteText: z.string().max(2000).optional(),
});

// ============================================================
// Helper function to validate request body
// ============================================================

export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: z.ZodError }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}
