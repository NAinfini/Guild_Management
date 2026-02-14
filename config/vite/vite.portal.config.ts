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
    alias: {
      '@': path.resolve(repoRoot, 'apps/portal/src'),
      three: path.resolve(repoRoot, 'node_modules/three'),
    },
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
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          'mui-core': ['@mui/material', '@emotion/react', '@emotion/styled'],
          'tanstack-query': ['@tanstack/react-query'],
          'tanstack-router': ['@tanstack/react-router'],
          animation: ['motion/react'],
          'date-utils': ['date-fns'],
          i18n: ['react-i18next', 'i18next'],
          state: ['zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
