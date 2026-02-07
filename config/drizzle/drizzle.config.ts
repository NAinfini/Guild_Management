import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './apps/worker/src/db/schema.ts',
  out: './infra/database/drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DRIZZLE_DB_URL || './.wrangler/state/v3/d1/local.sqlite',
  },
  strict: true,
  verbose: true,
});
