
import { ThemeOptions, alpha } from '@mui/material/styles';
import { typography } from '../typography';

// Optimized "Cyberpunk Neon" Theme - Performance Focused
export const defaultTheme: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b5cf6', // More vivid purple (Violet 500)
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#06b6d4', // Cyan 500
      light: '#22d3ee',
      dark: '#0891b2',
      contrastText: '#ffffff',
    },
    error: {
      main: '#f87171',
      light: '#fca5a5',
      dark: '#dc2626',
    },
    warning: {
      main: '#fbbf24',
      light: '#fcd34d',
      dark: '#f59e0b',
    },
    success: {
      main: '#34d399',
      light: '#6ee7b7',
      dark: '#059669',
    },
    background: {
      default: '#0a0e1a',
      paper: '#151b2e',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
    action: {
      hover: alpha('#a78bfa', 0.08),
      selected: alpha('#a78bfa', 0.16),
      disabled: alpha('#94a3b8', 0.3),
    },
    divider: alpha('#475569', 0.3),
  },
  custom: {
    surface: {
      base: '#0a0e1a',
      raised: '#151b2e',
      overlay: alpha('#0a0e1a', 0.9),
    },
    borderStrong: `1px solid ${alpha('#8b5cf6', 0.45)}`,
    mutedText: '#94a3b8',
    // Visual effects
    glow: `0 0 20px ${alpha('#8b5cf6', 0.5)}`,
    glowCyan: `0 0 20px ${alpha('#06b6d4', 0.5)}`,
    glowGreen: `0 0 20px ${alpha('#10b981', 0.5)}`,
    glowRed: `0 0 20px ${alpha('#ef4444', 0.5)}`,
    glowGold: `0 0 20px ${alpha('#f59e0b', 0.5)}`,
    border: `1px solid ${alpha('#8b5cf6', 0.3)}`,
    cardBorder: `1px solid ${alpha('#475569', 0.4)}`,
    customShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.5)',
    gradient: `linear-gradient(135deg, ${alpha('#8b5cf6', 0.2)} 0%, ${alpha('#06b6d4', 0.1)} 100%)`,
    shimmer: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.1)}, transparent)`,

    // Status colors
    status: {
      active: {
        main: '#34d399', // Green 400
        bg: alpha('#34d399', 0.15),
        text: '#6ee7b7',
      },
      inactive: {
        main: '#64748b', // Slate 500
        bg: alpha('#64748b', 0.15),
        text: '#94a3b8',
      },
      vacation: {
        main: '#22d3ee', // Cyan 400
        bg: alpha('#22d3ee', 0.15),
        text: '#67e8f9',
      },
      unknown: {
        main: '#94a3b8', // Slate 400
        bg: alpha('#94a3b8', 0.10),
        text: '#cbd5e1',
      },
    },

    // Guild war result colors
    result: {
      win: {
        main: '#34d399',
        bg: alpha('#34d399', 0.15),
        text: '#6ee7b7',
        glow: `0 0 20px ${alpha('#34d399', 0.5)}`,
      },
      loss: {
        main: '#f87171',
        bg: alpha('#f87171', 0.15),
        text: '#fca5a5',
        glow: `0 0 20px ${alpha('#f87171', 0.5)}`,
      },
      draw: {
        main: '#fbbf24',
        bg: alpha('#fbbf24', 0.15),
        text: '#fcd34d',
        glow: `0 0 20px ${alpha('#fbbf24', 0.5)}`,
      },
      unknown: {
        main: '#64748b',
        bg: alpha('#64748b', 0.15),
        text: '#94a3b8',
      },
    },

    // Class colors (game classes)
    classes: {
      mingjin: {
        main: '#60a5fa', // Blue 400
        bg: alpha('#60a5fa', 0.15),
        text: '#93c5fd',
      },
      qiansi: {
        main: '#34d399', // Green 400
        bg: alpha('#34d399', 0.15),
        text: '#6ee7b7',
      },
      pozhu: {
        main: '#c084fc', // Purple 400
        bg: alpha('#c084fc', 0.15),
        text: '#d8b4fe',
      },
      lieshi: {
        main: '#f87171', // Red 400
        bg: alpha('#f87171', 0.15),
        text: '#fca5a5',
      },
    },

    // Event type colors
    eventTypes: {
      weekly_mission: {
        main: '#60a5fa',
        bg: alpha('#60a5fa', 0.15),
        text: '#93c5fd',
      },
      guild_war: {
        main: '#f87171',
        bg: alpha('#f87171', 0.15),
        text: '#fca5a5',
      },
      other: {
        main: '#a78bfa',
        bg: alpha('#a78bfa', 0.15),
        text: '#c4b5fd',
      },
    },

    // Role colors
    roles: {
      admin: {
        main: '#f87171',
        bg: alpha('#f87171', 0.15),
        text: '#fca5a5',
      },
      moderator: {
        main: '#fbbf24',
        bg: alpha('#fbbf24', 0.15),
        text: '#fcd34d',
      },
      member: {
        main: '#60a5fa',
        bg: alpha('#60a5fa', 0.15),
        text: '#93c5fd',
      },
      external: {
        main: '#cbd5e1',
        bg: alpha('#cbd5e1', 0.12),
        text: '#e2e8f0',
      },
    },
    roleColors: {
      admin: '#f87171',
      moderator: '#fbbf24',
      member: '#60a5fa',
      external: '#cbd5e1',
    },

    // War role colors
    warRoles: {
      dps: {
        main: '#f87171',
        bg: alpha('#f87171', 0.15),
        text: '#fca5a5',
      },
      heal: {
        main: '#34d399',
        bg: alpha('#34d399', 0.15),
        text: '#6ee7b7',
      },
      tank: {
        main: '#60a5fa',
        bg: alpha('#60a5fa', 0.15),
        text: '#93c5fd',
      },
      lead: {
        main: '#fbbf24',
        bg: alpha('#fbbf24', 0.15),
        text: '#fcd34d',
      },
    },

    // Chip/pill colors
    chips: {
      new: {
        main: '#34d399',
        bg: alpha('#34d399', 0.15),
        text: '#6ee7b7',
      },
      updated: {
        main: '#22d3ee',
        bg: alpha('#22d3ee', 0.15),
        text: '#67e8f9',
      },
      pinned: {
        main: '#fbbf24',
        bg: alpha('#fbbf24', 0.15),
        text: '#fcd34d',
      },
      locked: {
        main: '#64748b',
        bg: alpha('#64748b', 0.15),
        text: '#94a3b8',
      },
      conflict: {
        main: '#fb923c',
        bg: alpha('#fb923c', 0.15),
        text: '#fdba74',
      },
    },
  },
  typography: {
    ...typography,
    fontFamily: '"Inter", "system-ui", sans-serif',
    button: {
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 12,
          padding: '10px 24px',
          transition: 'background-color 0.2s, border-color 0.2s, box-shadow 0.2s',
          border: '1px solid transparent',
          '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.5),
          },
        }),
        contained: ({ theme }) => ({
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: '#ffffff',
          border: `1px solid ${alpha('#ffffff', 0.1)}`,
          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
          '&:hover': {
            background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
          },
        }),
        outlined: ({ theme }) => ({
          borderColor: alpha(theme.palette.primary.main, 0.5),
          borderWidth: 2,
          color: theme.palette.primary.light,
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          backgroundColor: alpha('#151b2e', 0.8),
          backdropFilter: 'blur(10px)',
          border: theme.custom?.cardBorder,
          borderRadius: 20,
          boxShadow: theme.custom?.customShadow,
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'box-shadow 0.2s',
          '&:hover': {
            boxShadow: `0 8px 24px ${alpha('#000000', 0.5)}`,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
        },
        filled: ({ theme }) => ({
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.primary.dark, 0.3)})`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        }),
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'border-color 0.2s',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
                borderWidth: 2,
              },
            },
          },
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 12,
          margin: '4px 8px',
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
          },
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.16),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.20),
            },
          },
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha('#0a0e1a', 0.9),
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${alpha('#a78bfa', 0.2)}`,
          boxShadow: `0 2px 10px ${alpha('#000000', 0.3)}`,
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: alpha('#0a0e1a', 0.95),
          backdropFilter: 'blur(10px)',
          borderRight: `1px solid ${alpha('#a78bfa', 0.2)}`,
        }),
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 8,
        },
        bar: ({ theme }) => ({
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }),
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        }),
      },
    },
  },
};
