import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(configDir, '../..');

export default defineConfig({
  root: path.resolve(repoRoot, 'apps/portal'),
  resolve: {
    alias: {
      '@': path.resolve(repoRoot, 'apps/portal/src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
    setupFiles: path.resolve(repoRoot, 'apps/portal/tests/setupTests.ts'),
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    css: true,
  },
});
