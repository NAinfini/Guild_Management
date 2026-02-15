import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(configDir, '../..');

export default defineConfig({
  root: path.resolve(repoRoot, 'apps/portal'),
  resolve: {
    alias: [
      { find: '@mui/material', replacement: path.resolve(repoRoot, 'apps/portal/src/mui-shim/material') },
      { find: '@mui/icons-material', replacement: path.resolve(repoRoot, 'apps/portal/src/mui-shim/icons-material') },
      { find: '@mui/x-charts', replacement: path.resolve(repoRoot, 'apps/portal/src/mui-shim/x-charts') },
      {
        find: /^@\/compat\/mui\/material\/(.*)$/,
        replacement: path.resolve(repoRoot, 'apps/portal/src/mui-shim/material') + '/$1',
      },
      {
        find: /^@\/compat\/mui\/icons-material\/(.*)$/,
        replacement: path.resolve(repoRoot, 'apps/portal/src/mui-shim/icons-material') + '/$1',
      },
      {
        find: /^@\/compat\/mui\/x-charts\/(.*)$/,
        replacement: path.resolve(repoRoot, 'apps/portal/src/mui-shim/x-charts') + '/$1',
      },
      { find: '@', replacement: path.resolve(repoRoot, 'apps/portal/src') },
    ],
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
