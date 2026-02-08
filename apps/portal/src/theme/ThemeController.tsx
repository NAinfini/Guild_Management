
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, StyledEngineProvider, createTheme, CssBaseline, GlobalStyles } from '@mui/material';
import { chineseInkTheme } from './themes/chineseInk';
import { darkGoldTheme } from './themes/darkGold';
import { defaultTheme } from './themes/default';
import { neonSpectralTheme } from './themes/neonSpectral';
import { redGoldTheme } from './themes/redGold';
import { softPinkTheme } from './themes/softPink';
import { ThemeOptions } from '@mui/material/styles';
import { initTheme, setTheme as setThemeController, getTheme, type ThemeMode } from './theme-engine';
import './themes.css'; // Import the CSS variables and Atmosphere styles

// Re-export ThemeMode for convenience
export type { ThemeMode };

interface ThemeContextType {
  currentTheme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeController = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeController must be used within a ThemeControllerProvider');
  }
  return context;
};

interface ThemeControllerProps {
  children: React.ReactNode;
}

/* Global Scrollbar Styles */
const GlobalScrollbar = () => (
  <GlobalStyles
    styles={(theme) => ({
      body: {
        backgroundColor: 'transparent !important', /* Allow atmosphere */
      },
      '*::-webkit-scrollbar': {
        width: '6px',
        height: '6px',
      },
      '*::-webkit-scrollbar-track': {
        background: theme.palette.mode === 'dark' ? '#0a0a0a' : '#f5f5f5',
      },
      '*::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
        borderRadius: '3px',
        '&:hover': {
          backgroundColor: theme.palette.primary.main,
        },
      },
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: `${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'} transparent`,
      },
      '.MuiButtonBase-root, .MuiChip-root, .MuiToggleButton-root': {
        position: 'relative',
      },
      '.MuiButtonBase-root:hover, .MuiChip-root:hover, .MuiToggleButton-root:hover': {
        zIndex: 2,
      },
    })}
  />
);

export const ThemeControllerProvider: React.FC<ThemeControllerProps> = ({ children }) => {
  const [currentThemeMode, setCurrentThemeMode] = useState<ThemeMode>(() => {
    return initTheme(); // Initialize from localStorage
  });

  const setTheme = (mode: ThemeMode) => {
    setCurrentThemeMode(mode);
    setThemeController(mode); // Sync with theme controller
  };

  // Sync theme with DOM for CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentThemeMode);
    document.documentElement.setAttribute('data-theme-switching', 'true');
    const timer = window.setTimeout(() => {
      document.documentElement.removeAttribute('data-theme-switching');
    }, 520);
    return () => window.clearTimeout(timer);
  }, [currentThemeMode]);

  const themeOptions: ThemeOptions = useMemo(() => {
    switch (currentThemeMode) {
      case 'default': return defaultTheme;
      case 'chinese-ink': return chineseInkTheme;
      case 'dark-gold': return darkGoldTheme;
      case 'neon-spectral': return neonSpectralTheme;
      case 'redgold': return redGoldTheme;
      case 'softpink': return softPinkTheme;
      default: return defaultTheme; // Safe fallback to default
    }
  }, [currentThemeMode]);

  const theme = useMemo(() => createTheme(themeOptions), [themeOptions]);

  return (
    <ThemeContext.Provider value={{ currentTheme: currentThemeMode, setTheme }}>
      <StyledEngineProvider injectFirst>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalScrollbar />

          {/* ATMOSPHERIC BACKGROUND LAYERS */}
          <div className="app-atmosphere">
            <div className="atmo-layer-base" />
            <div className="atmo-layer-texture" />
            <div className="atmo-layer-fx" />
          </div>
          <div className={`theme-ornaments theme-${currentThemeMode}`} aria-hidden="true">
            <span className="ornament o1" />
            <span className="ornament o2" />
            <span className="ornament o3" />
            <span className="ornament o4" />
          </div>

          {children}
        </MuiThemeProvider>
      </StyledEngineProvider>
    </ThemeContext.Provider>
  );
};
