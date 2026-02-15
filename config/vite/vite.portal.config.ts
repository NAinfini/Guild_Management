import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { defineConfig } from 'vite';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(configDir, '../..');

export default defineConfig({
  root: path.resolve(repoRoot, 'apps/portal'),
  plugins: [TanStackRouterVite(), react()],
  resolve: {
    dedupe: ['three'],
    alias: [
      { find: '@', replacement: path.resolve(repoRoot, 'apps/portal/src') },
      { find: 'three', replacement: path.resolve(repoRoot, 'node_modules/three') },
    ],
  },
  optimizeDeps: {
    include: ['three'],
  },
  css: {
    postcss: path.resolve(repoRoot, 'config/postcss/postcss.config.js'),
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    proxy: {
      '/api': {
        target: 'https://guild-management.na-infini.workers.dev',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: path.resolve(repoRoot, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/')
          ) {
            return 'react-vendor';
          }
          if (id.includes('/node_modules/@tanstack/react-query/')) {
            return 'tanstack-query';
          }
          if (id.includes('/node_modules/@tanstack/react-router/')) {
            return 'tanstack-router';
          }
          if (id.includes('/node_modules/date-fns/')) {
            return 'date-utils';
          }
          if (id.includes('/node_modules/react-i18next/') || id.includes('/node_modules/i18next/')) {
            return 'i18n';
          }
          if (id.includes('/node_modules/zustand/')) {
            return 'state';
          }
          if (id.includes('/node_modules/@dnd-kit/')) {
            return 'dnd-kit';
          }
          if (
            id.includes('/src/ui-bridge/material/') ||
            id.includes('/src/ui-bridge/icons-material/') ||
            id.includes('/src/ui-bridge/x-charts/')
          ) {
            return 'ui-bridge';
          }
          if (id.includes('/node_modules/@tiptap/') || id.includes('/src/components/input/TiptapEditor')) {
            return 'tiptap-editor';
          }
          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
