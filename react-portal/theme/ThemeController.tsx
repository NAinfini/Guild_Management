
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, StyledEngineProvider, createTheme, CssBaseline, GlobalStyles } from '@mui/material';
import { defaultTheme } from './themes/default';
import { chineseInkTheme } from './themes/chineseInk';
import { darkGoldTheme } from './themes/darkGold';
import { neonSpectralTheme } from './themes/neonSpectral';
import { ThemeOptions } from '@mui/material/styles';

export type ThemeMode = 'default' | 'chineseInk' | 'darkGold' | 'neonSpectral';

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
    })}
  />
);

export const ThemeControllerProvider: React.FC<ThemeControllerProps> = ({ children }) => {
  const [currentThemeMode, setCurrentThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('app-theme-mode');
    return (saved as ThemeMode) || 'default';
  });

  const setTheme = (mode: ThemeMode) => {
    setCurrentThemeMode(mode);
    localStorage.setItem('app-theme-mode', mode);
  };

  const themeOptions: ThemeOptions = useMemo(() => {
    switch (currentThemeMode) {
      case 'chineseInk': return chineseInkTheme;
      case 'darkGold': return darkGoldTheme;
      case 'neonSpectral': return neonSpectralTheme;
      default: return defaultTheme;
    }
  }, [currentThemeMode]);

  const theme = useMemo(() => createTheme(themeOptions), [themeOptions]);

  return (
    <ThemeContext.Provider value={{ currentTheme: currentThemeMode, setTheme }}>
      <StyledEngineProvider injectFirst>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalScrollbar />
          {children}
        </MuiThemeProvider>
      </StyledEngineProvider>
    </ThemeContext.Provider>
  );
};
