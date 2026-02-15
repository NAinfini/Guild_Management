import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query' // Keep original import if possible or use this one
import { ThemeControllerProvider, initThemePreferences } from '@/theme/ThemeController'
import { queryClient } from './lib/queryClient'
import App from './App'
import '@fontsource-variable/inter'
import '@fontsource-variable/space-grotesk'
import './index.css'
import './i18n/config'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'

// ThemeWrapper removed in favor of ThemeControllerProvider

initThemePreferences()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeControllerProvider>
          <App />
        </ThemeControllerProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

