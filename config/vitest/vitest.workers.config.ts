import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    passWithNoTests: true,
    include: ['apps/worker/tests/**/*.test.ts'],
  },
});
