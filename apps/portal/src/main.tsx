import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, CssBaseline, StyledEngineProvider } from '@mui/material'
import { QueryClientProvider } from '@tanstack/react-query' // Keep original import if possible or use this one
import { ThemeControllerProvider } from './theme/ThemeController'
import { queryClient } from './lib/queryClient'
import App from './App'
import '@fontsource-variable/inter'
import '@fontsource-variable/space-grotesk'
import './index.css'
import { useUIStore } from './store'
import './i18n/config'
import { ErrorBoundary } from './components/ErrorBoundary'

// ThemeWrapper removed in favor of ThemeControllerProvider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <StyledEngineProvider injectFirst>
        <QueryClientProvider client={queryClient}>
          <ThemeControllerProvider>
            <App />
          </ThemeControllerProvider>
        </QueryClientProvider>
      </StyledEngineProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
