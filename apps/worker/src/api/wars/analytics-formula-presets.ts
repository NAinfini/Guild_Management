/**
 * Guild War Analytics Formula Presets
 * GET /api/wars/analytics-formula-presets
 * POST /api/wars/analytics-formula-presets
 * DELETE /api/wars/analytics-formula-presets?id=<presetId>
 */

import { createEndpoint } from '../../core/endpoint-factory';
import type { D1Database } from '../../core/types';
import { createAuditLog, generateId, utcNow } from '../../core/utils';
import type {
  AnalyticsFormulaPresetDTO,
  AnalyticsFormulaPresetListResponseDTO,
  CreateAnalyticsFormulaPresetBodyDTO,
  CreateAnalyticsFormulaPresetResponseDTO,
} from '@guild/shared-api/contracts';

interface FormulaPresetQuery {
  id?: string;
}

const DEFAULT_WEIGHTS = { kda: 60, towers: 15, distance: 25 } as const;

const CREATE_FORMULA_PRESET_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS analytics_formula_presets (
  preset_id      TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  version        INTEGER NOT NULL CHECK (version > 0),
  kda_weight     REAL NOT NULL CHECK (kda_weight >= 0),
  tower_weight   REAL NOT NULL CHECK (tower_weight >= 0),
  distance_weight REAL NOT NULL CHECK (distance_weight >= 0),
  is_default     INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1)),
  created_by     TEXT REFERENCES users(user_id) ON DELETE SET NULL,
  created_at_utc TEXT NOT NULL,
  updated_at_utc TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_formula_presets_default ON analytics_formula_presets(is_default, version DESC);
CREATE INDEX IF NOT EXISTS idx_formula_presets_created ON analytics_formula_presets(created_at_utc DESC);
`;

export const onRequestGet = createEndpoint<AnalyticsFormulaPresetListResponseDTO>({
  auth: 'optional',
  etag: true,
  cacheControl: 'public, max-age=60',

  handler: async ({ env }) => {
    await ensurePresetTable(env.DB);

    const result = await env.DB
      .prepare(
        `
        SELECT
          preset_id,
          name,
          version,
          kda_weight,
          tower_weight,
          distance_weight,
          is_default,
          created_by,
          created_at_utc,
          updated_at_utc
        FROM analytics_formula_presets
        ORDER BY is_default DESC, version DESC, created_at_utc DESC
      `
      )
      .all<AnalyticsFormulaPresetDTO>();

    const presets = result.results || [];

    if (presets.length === 0) {
      return {
        presets: [
          {
            preset_id: 'default',
            name: 'Default',
            version: 1,
            kda_weight: DEFAULT_WEIGHTS.kda,
            tower_weight: DEFAULT_WEIGHTS.towers,
            distance_weight: DEFAULT_WEIGHTS.distance,
            is_default: 1,
            created_by: null,
            created_at_utc: utcNow(),
            updated_at_utc: utcNow(),
          },
        ],
      };
    }

    return { presets };
  },
});

export const onRequestPost = createEndpoint<CreateAnalyticsFormulaPresetResponseDTO, any, CreateAnalyticsFormulaPresetBodyDTO>({
  auth: 'admin',
  cacheControl: 'no-store',

  parseBody: (body) => {
    if (!body || typeof body !== 'object') {
      throw new Error('Invalid request body');
    }

    if (!body.name || typeof body.name !== 'string') {
      throw new Error('name is required');
    }

    if (
      body.kdaWeight === undefined ||
      body.towerWeight === undefined ||
      body.distanceWeight === undefined
    ) {
      throw new Error('kdaWeight, towerWeight, and distanceWeight are required');
    }

    return body as CreateAnalyticsFormulaPresetBodyDTO;
  },

  handler: async ({ env, user, body }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    if (!body) {
      throw new Error('Invalid request body');
    }

    await ensurePresetTable(env.DB);

    const name = body.name.trim();
    if (!name) {
      throw new Error('name is required');
    }

    const weights = normalizeWeights(body.kdaWeight, body.towerWeight, body.distanceWeight);
    const shouldBeDefault = body.isDefault === 1;

    const versionRow = await env.DB
      .prepare(`SELECT COALESCE(MAX(version), 0) as max_version FROM analytics_formula_presets`)
      .first<{ max_version: number }>();
    const version = Number(versionRow?.max_version || 0) + 1;

    const hasDefaultRow = await env.DB
      .prepare(`SELECT preset_id FROM analytics_formula_presets WHERE is_default = 1 LIMIT 1`)
      .first<{ preset_id: string }>();

    const isDefault = shouldBeDefault || !hasDefaultRow ? 1 : 0;
    if (isDefault) {
      await env.DB.prepare(`UPDATE analytics_formula_presets SET is_default = 0 WHERE is_default = 1`).run();
    }

    const presetId = generateId('afp');
    const now = utcNow();

    await env.DB
      .prepare(
        `
        INSERT INTO analytics_formula_presets (
          preset_id,
          name,
          version,
          kda_weight,
          tower_weight,
          distance_weight,
          is_default,
          created_by,
          created_at_utc,
          updated_at_utc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      )
      .bind(
        presetId,
        name,
        version,
        weights.kda,
        weights.towers,
        weights.distance,
        isDefault,
        user.user_id,
        now,
        now
      )
      .run();

    await createAuditLog(
      env.DB,
      'war_analytics_formula',
      'create',
      user.user_id,
      presetId,
      'Create analytics formula preset',
      `name=${name}, version=${version}, kda=${weights.kda}, towers=${weights.towers}, distance=${weights.distance}, default=${isDefault}`
    );

    return {
      preset: {
        preset_id: presetId,
        name,
        version,
        kda_weight: weights.kda,
        tower_weight: weights.towers,
        distance_weight: weights.distance,
        is_default: isDefault as 0 | 1,
        created_by: user.user_id,
        created_at_utc: now,
        updated_at_utc: now,
      },
    };
  },
});

export const onRequestDelete = createEndpoint<{ ok: true }, FormulaPresetQuery>({
  auth: 'admin',
  cacheControl: 'no-store',

  parseQuery: (searchParams) => ({
    id: searchParams.get('id') || undefined,
  }),

  handler: async ({ env, query, user }) => {
    if (!query.id) {
      throw new Error('id is required');
    }

    if (!user) {
      throw new Error('User not authenticated');
    }

    await ensurePresetTable(env.DB);

    const target = await env.DB
      .prepare(
        `
        SELECT preset_id, name, is_default
        FROM analytics_formula_presets
        WHERE preset_id = ?
      `
      )
      .bind(query.id)
      .first<{ preset_id: string; name: string; is_default: number }>();

    if (!target) {
      throw new Error('Preset not found');
    }

    if (target.is_default === 1) {
      throw new Error('Cannot delete default preset');
    }

    await env.DB.prepare(`DELETE FROM analytics_formula_presets WHERE preset_id = ?`).bind(query.id).run();

    const defaultRow = await env.DB
      .prepare(`SELECT preset_id FROM analytics_formula_presets WHERE is_default = 1 LIMIT 1`)
      .first<{ preset_id: string }>();

    if (!defaultRow) {
      const fallback = await env.DB
        .prepare(
          `
          SELECT preset_id
          FROM analytics_formula_presets
          ORDER BY version DESC, created_at_utc DESC
          LIMIT 1
        `
        )
        .first<{ preset_id: string }>();
      if (fallback?.preset_id) {
        await env.DB.prepare(`UPDATE analytics_formula_presets SET is_default = 1 WHERE preset_id = ?`).bind(fallback.preset_id).run();
      }
    }

    await createAuditLog(
      env.DB,
      'war_analytics_formula',
      'delete',
      user.user_id,
      target.preset_id,
      'Delete analytics formula preset',
      `name=${target.name}`
    );

    return { ok: true };
  },
});

function normalizeWeights(kdaWeight: number, towerWeight: number, distanceWeight: number) {
  const kda = Number(kdaWeight);
  const towers = Number(towerWeight);
  const distance = Number(distanceWeight);

  if (!Number.isFinite(kda) || !Number.isFinite(towers) || !Number.isFinite(distance)) {
    throw new Error('Formula weights must be numbers');
  }
  if (kda < 0 || towers < 0 || distance < 0) {
    throw new Error('Formula weights must be non-negative');
  }

  const total = kda + towers + distance;
  if (Math.abs(total - 100) > 0.01) {
    throw new Error('Formula weights must total 100');
  }

  return { kda, towers, distance };
}

async function ensurePresetTable(db: D1Database) {
  await db.exec(CREATE_FORMULA_PRESET_TABLE_SQL);
}
