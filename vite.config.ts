/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // Keep TanStack route generation inside react-portal (no stray src/routeTree.gen.ts)
    TanStackRouterVite({
      routesDirectory: 'react-portal/routes',
      generatedRouteTree: 'react-portal/routeTree.gen.ts',
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./react-portal"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
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
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './react-portal/setupTests.ts',
    css: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],

          // MUI components (largest vendor)
          'mui-core': ['@mui/material', '@emotion/react', '@emotion/styled'],

          // TanStack libraries
          'tanstack-query': ['@tanstack/react-query'],
          'tanstack-router': ['@tanstack/react-router'],

          // Animation libraries
          'animation': ['framer-motion'],

          // Icons
          'icons': ['lucide-react'],

          // Date utilities
          'date-utils': ['date-fns'],

          // i18n
          'i18n': ['react-i18next', 'i18next'],

          // State management
          'state': ['zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 600, // Increase limit to 600kb
  },
})
