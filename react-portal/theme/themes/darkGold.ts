
import { ThemeOptions, alpha } from '@mui/material/styles';
import { typography } from '../typography';

// Pro Max "Luxury Obsidian" - Refined for High Contrast and Premium Feel
export const darkGoldTheme: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffd700', // Pure Gold
      light: '#ffea70',
      dark: '#b39500', 
      contrastText: '#000000',
    },
    secondary: {
      main: '#e5e7eb', // Platinum
      light: '#ffffff',
      dark: '#9ca3af',
      contrastText: '#000000',
    },
    background: {
      default: '#000000', // Pure Black
      paper: '#09090b',   // Zinc 950
    },
    text: {
      primary: '#f4f4f5', // Zinc 100
      secondary: '#a1a1aa', // Zinc 400
    },
    action: {
      hover: alpha('#fbbf24', 0.08),
      selected: alpha('#fbbf24', 0.16),
    },
    divider: alpha('#fbbf24', 0.2), // Gold Divider
    success: {
      main: '#22c55e', // Green 500
      light: '#4ade80',
      dark: '#16a34a',
    },
    error: {
      main: '#ef4444', // Red 500
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b', // Amber 500
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#3b82f6', // Blue 500
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  custom: {
    surface: {
      base: '#0b0a0a',
      raised: '#14110f',
      overlay: alpha('#0b0a0a', 0.9),
    },
    borderStrong: `1px solid ${alpha('#ffd700', 0.4)}`,
    mutedText: '#a1a1aa',
    // Visual effects
    glow: `0 0 25px ${alpha('#ffd700', 0.4)}, 0 0 10px ${alpha('#ffd700', 0.2)}`,
    glowCyan: `0 0 20px ${alpha('#06b6d4', 0.4)}`,
    glowGreen: `0 0 20px ${alpha('#22c55e', 0.4)}`,
    glowRed: `0 0 20px ${alpha('#ef4444', 0.4)}`,
    glowGold: `0 0 30px ${alpha('#ffd700', 0.6)}`,
    border: `1px solid ${alpha('#ffd700', 0.4)}`,
    cardBorder: `1px solid ${alpha('#ffd700', 0.15)}`,
    customShadow: '0 25px 50px -12px rgba(0, 0, 0, 1)',
    gradient: `linear-gradient(135deg, ${alpha('#ffd700', 0.15)} 0%, ${alpha('#000000', 0.4)} 100%)`,
    shimmer: `linear-gradient(90deg, transparent, ${alpha('#ffd700', 0.3)}, transparent)`,

    // Status colors
    status: {
      active: {
        main: '#22c55e',
        bg: alpha('#22c55e', 0.15),
        text: '#4ade80',
      },
      inactive: {
        main: '#71717a',
        bg: alpha('#71717a', 0.15),
        text: '#a1a1aa',
      },
      vacation: {
        main: '#06b6d4',
        bg: alpha('#06b6d4', 0.15),
        text: '#22d3ee',
      },
      unknown: {
        main: '#d4d4d8',
        bg: alpha('#d4d4d8', 0.10),
        text: '#e4e4e7',
      },
    },

    // Guild war result colors
    result: {
      win: {
        main: '#22c55e',
        bg: alpha('#22c55e', 0.15),
        text: '#4ade80',
        glow: `0 0 20px ${alpha('#22c55e', 0.5)}`,
      },
      loss: {
        main: '#ef4444',
        bg: alpha('#ef4444', 0.15),
        text: '#f87171',
        glow: `0 0 20px ${alpha('#ef4444', 0.5)}`,
      },
      draw: {
        main: '#f59e0b',
        bg: alpha('#f59e0b', 0.15),
        text: '#fbbf24',
        glow: `0 0 20px ${alpha('#f59e0b', 0.5)}`,
      },
      unknown: {
        main: '#71717a',
        bg: alpha('#71717a', 0.15),
        text: '#a1a1aa',
      },
    },

    // Class colors (game classes)
    classes: {
      mingjin: {
        main: '#3b82f6', // Blue
        bg: alpha('#3b82f6', 0.15),
        text: '#60a5fa',
      },
      qiansi: {
        main: '#22c55e', // Green
        bg: alpha('#22c55e', 0.15),
        text: '#4ade80',
      },
      pozhu: {
        main: '#a855f7', // Purple
        bg: alpha('#a855f7', 0.15),
        text: '#c084fc',
      },
      lieshi: {
        main: '#dc2626', // Dark Red
        bg: alpha('#dc2626', 0.15),
        text: '#f87171',
      },
    },

    // Event type colors
    eventTypes: {
      weekly_mission: {
        main: '#3b82f6',
        bg: alpha('#3b82f6', 0.15),
        text: '#60a5fa',
      },
      guild_war: {
        main: '#dc2626',
        bg: alpha('#dc2626', 0.15),
        text: '#f87171',
      },
      other: {
        main: '#8b5cf6',
        bg: alpha('#8b5cf6', 0.15),
        text: '#a78bfa',
      },
    },

    // Role colors
    roles: {
      admin: {
        main: '#dc2626',
        bg: alpha('#dc2626', 0.15),
        text: '#f87171',
      },
      moderator: {
        main: '#f59e0b',
        bg: alpha('#f59e0b', 0.15),
        text: '#fbbf24',
      },
      member: {
        main: '#3b82f6',
        bg: alpha('#3b82f6', 0.15),
        text: '#60a5fa',
      },
      external: {
        main: '#e5e7eb',
        bg: alpha('#e5e7eb', 0.12),
        text: '#f9fafb',
      },
    },
    roleColors: {
      admin: '#dc2626',
      moderator: '#f59e0b',
      member: '#3b82f6',
      external: '#e5e7eb',
    },

    // War role colors
    warRoles: {
      dps: {
        main: '#ef4444',
        bg: alpha('#ef4444', 0.15),
        text: '#f87171',
      },
      heal: {
        main: '#22c55e',
        bg: alpha('#22c55e', 0.15),
        text: '#4ade80',
      },
      tank: {
        main: '#3b82f6',
        bg: alpha('#3b82f6', 0.15),
        text: '#60a5fa',
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
        main: '#22c55e',
        bg: alpha('#22c55e', 0.15),
        text: '#4ade80',
      },
      updated: {
        main: '#06b6d4',
        bg: alpha('#06b6d4', 0.15),
        text: '#22d3ee',
      },
      pinned: {
        main: '#fbbf24',
        bg: alpha('#fbbf24', 0.15),
        text: '#fcd34d',
      },
      locked: {
        main: '#71717a',
        bg: alpha('#71717a', 0.15),
        text: '#a1a1aa',
      },
      conflict: {
        main: '#f59e0b',
        bg: alpha('#f59e0b', 0.15),
        text: '#fbbf24',
      },
    },
  },
  typography: {
    ...typography,
    fontFamily: '"Outfit", "Inter", sans-serif',
    allVariants: {
       letterSpacing: '0.02em',
    },
    button: {
       letterSpacing: '0.1em',
       fontWeight: 700,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 0,
          textTransform: 'uppercase',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          padding: '10px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            boxShadow: theme.custom?.glow,
            letterSpacing: '0.15em',
          },
        }),
        contained: ({ theme }) => ({
           background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
           color: '#000000',
           border: 'none',
           '&:hover': {
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.6)}`,
           }
        })
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: '4px',
          fontWeight: 600,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          transition: 'all 0.2s ease',
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.03), rgba(0,0,0,0))',
          backgroundColor: '#09090b',
          border: theme.custom?.cardBorder,
          borderRadius: 0,
          boxShadow: 'none',
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            backdropFilter: 'blur(12px)',
        })
      }
    },
    MuiDrawer: {
      styleOverrides: {
         paper: ({ theme }) => ({
            backgroundColor: '#000000',
            borderRight: theme.custom?.border,
         })
      }
    }
  },
};
