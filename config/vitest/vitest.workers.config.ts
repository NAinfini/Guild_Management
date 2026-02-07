import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(configDir, '../..');

export default defineWorkersConfig({
  test: {
    globals: true,
    passWithNoTests: true,
    include: ['apps/worker/src/**/*.test.ts'],
    poolOptions: {
      workers: {
        wrangler: {
          configPath: path.resolve(repoRoot, 'config/wrangler/wrangler.toml'),
        },
        miniflare: {
          d1Databases: ['DB'],
          r2Buckets: ['BUCKET'],
        },
      },
    },
  },
});
