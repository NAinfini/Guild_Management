import { createEndpoint } from '../../core/endpoint-factory';
import { utcNow } from '../../core/utils';

interface ThemePreferencesDTO {
  theme: string;
  color: string;
  fontScale: number;
  motionIntensity: number;
  updatedAtUtc: string;
}

interface ThemePreferencesResponse {
  preferences: ThemePreferencesDTO | null;
}

interface UpsertThemePreferencesBody {
  theme: string;
  color: string;
  fontScale: number;
  motionIntensity: number;
}

const MIN_FONT_SCALE = 0.9;
const MAX_FONT_SCALE = 1.25;
const MIN_MOTION_INTENSITY = 0;
const MAX_MOTION_INTENSITY = 1.5;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function assertPreferenceToken(label: string, value: string): string {
  const normalized = value.trim();
  if (!/^[a-z0-9-]{2,40}$/.test(normalized)) {
    throw new Error(`Invalid ${label}`);
  }
  return normalized;
}

async function ensurePreferencesTable(db: any): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
      theme TEXT NOT NULL,
      color TEXT NOT NULL,
      font_scale REAL NOT NULL,
      motion_intensity REAL NOT NULL,
      updated_at_utc TEXT NOT NULL
    );
  `);
}

export const onRequestGet = createEndpoint<ThemePreferencesResponse>({
  auth: 'required',
  cacheControl: 'no-store',

  handler: async ({ env, user }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    await ensurePreferencesTable(env.DB);

    const row = await env.DB
      .prepare(
        `SELECT theme, color, font_scale, motion_intensity, updated_at_utc
         FROM user_preferences
         WHERE user_id = ?
         LIMIT 1`
      )
      .bind(user.user_id)
      .first<{
        theme: string;
        color: string;
        font_scale: number;
        motion_intensity: number;
        updated_at_utc: string;
      }>();

    if (!row) {
      return { preferences: null };
    }

    return {
      preferences: {
        theme: row.theme,
        color: row.color,
        fontScale: row.font_scale,
        motionIntensity: row.motion_intensity,
        updatedAtUtc: row.updated_at_utc,
      },
    };
  },
});

export const onRequestPut = createEndpoint<ThemePreferencesResponse, any, UpsertThemePreferencesBody>({
  auth: 'required',
  cacheControl: 'no-store',

  parseBody: (body) => {
    if (!body || typeof body !== 'object') {
      throw new Error('Invalid request body');
    }

    const theme = assertPreferenceToken('theme', String(body.theme ?? ''));
    const color = assertPreferenceToken('color', String(body.color ?? ''));

    const rawFontScale = Number(body.fontScale);
    const rawMotionIntensity = Number(body.motionIntensity);

    if (!Number.isFinite(rawFontScale) || !Number.isFinite(rawMotionIntensity)) {
      throw new Error('Invalid numeric theme preferences');
    }

    return {
      theme,
      color,
      fontScale: clamp(rawFontScale, MIN_FONT_SCALE, MAX_FONT_SCALE),
      motionIntensity: clamp(rawMotionIntensity, MIN_MOTION_INTENSITY, MAX_MOTION_INTENSITY),
    };
  },

  handler: async ({ env, user, body }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    if (!body) {
      throw new Error('Invalid request body');
    }

    await ensurePreferencesTable(env.DB);

    const now = utcNow();

    await env.DB
      .prepare(
        `INSERT INTO user_preferences (user_id, theme, color, font_scale, motion_intensity, updated_at_utc)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           theme = excluded.theme,
           color = excluded.color,
           font_scale = excluded.font_scale,
           motion_intensity = excluded.motion_intensity,
           updated_at_utc = excluded.updated_at_utc`
      )
      .bind(
        user.user_id,
        body.theme,
        body.color,
        body.fontScale,
        body.motionIntensity,
        now,
      )
      .run();

    return {
      preferences: {
        theme: body.theme,
        color: body.color,
        fontScale: body.fontScale,
        motionIntensity: body.motionIntensity,
        updatedAtUtc: now,
      },
    };
  },
});
