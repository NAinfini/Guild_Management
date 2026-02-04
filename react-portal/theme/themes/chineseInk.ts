
import { ThemeOptions, alpha } from '@mui/material/styles';
import { typography } from '../typography';

// Pro Max "Zen Garden" - Refined for Texture and Readability
export const chineseInkTheme: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#292524', // Stone 800 (Ink)
      light: '#57534e',
      dark: '#0c0a09',
      contrastText: '#f5f5f4',
    },
    secondary: {
      main: '#991b1b', // Red 800 (Seal)
      light: '#ef4444',
      dark: '#7f1d1d',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f4', // Stone 100 (Warm Rice Paper)
      paper: '#ffffff',   // White
    },
    text: {
      primary: '#1c1917', // Stone 900
      secondary: '#57534e', // Stone 500
    },
    action: {
      hover: alpha('#292524', 0.04),
      selected: alpha('#292524', 0.08),
    },
    divider: '#e7e5e4', // Stone 200
  },
  custom: {
    surface: {
      base: '#0a0a0a',
      raised: '#ffffff',
      overlay: alpha('#0a0a0a', 0.9),
    },
    borderStrong: `1px solid ${alpha('#292524', 0.3)}`,
    mutedText: '#57534e',
    // Visual effects (matte, no glow for Zen aesthetic)
    glow: 'none',
    glowCyan: 'none',
    glowGreen: 'none',
    glowRed: 'none',
    glowGold: 'none',
    border: '1px solid #d6d3d1', // Stone 300
    cardBorder: '1px solid #e7e5e4',
    customShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    gradient: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(0,0,0,0.02) 100%)',
    shimmer: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.03), transparent)',

    // Status colors
    status: {
      active: {
        main: '#16a34a', // Green 600
        bg: alpha('#16a34a', 0.1),
        text: '#166534',
      },
      inactive: {
        main: '#78716c', // Stone 500
        bg: alpha('#78716c', 0.1),
        text: '#57534e',
      },
      vacation: {
        main: '#0891b2', // Cyan 600
        bg: alpha('#0891b2', 0.1),
        text: '#0e7490',
      },
      unknown: {
        main: '#a8a29e', // Stone 400
        bg: alpha('#a8a29e', 0.1),
        text: '#78716c',
      },
    },

    // Guild war result colors
    result: {
      win: {
        main: '#16a34a',
        bg: alpha('#16a34a', 0.1),
        text: '#166534',
      },
      loss: {
        main: '#dc2626',
        bg: alpha('#dc2626', 0.1),
        text: '#991b1b',
      },
      draw: {
        main: '#d97706',
        bg: alpha('#d97706', 0.1),
        text: '#b45309',
      },
      unknown: {
        main: '#78716c',
        bg: alpha('#78716c', 0.1),
        text: '#57534e',
      },
    },

    // Class colors (game classes)
    classes: {
      mingjin: {
        main: '#1d4ed8', // Darker Blue for ink on paper
        bg: alpha('#1d4ed8', 0.1),
        text: '#172554',
      },
      qiansi: {
        main: '#15803d', // Darker Green
        bg: alpha('#15803d', 0.1),
        text: '#052e16',
      },
      pozhu: {
        main: '#7e22ce', // Darker Purple
        bg: alpha('#7e22ce', 0.1),
        text: '#3b0764',
      },
      lieshi: {
        main: '#b91c1c', // Darker Red
        bg: alpha('#b91c1c', 0.1),
        text: '#450a0a',
      },
    },

    // Event type colors
    eventTypes: {
      weekly_mission: {
        main: '#2563eb',
        bg: alpha('#2563eb', 0.1),
        text: '#1d4ed8',
      },
      guild_war: {
        main: '#dc2626',
        bg: alpha('#dc2626', 0.1),
        text: '#991b1b',
      },
      other: {
        main: '#7c3aed',
        bg: alpha('#7c3aed', 0.1),
        text: '#6d28d9',
      },
    },

    // Role colors
    roles: {
      admin: {
        main: '#dc2626',
        bg: alpha('#dc2626', 0.1),
        text: '#991b1b',
      },
      moderator: {
        main: '#d97706',
        bg: alpha('#d97706', 0.1),
        text: '#b45309',
      },
      member: {
        main: '#2563eb',
        bg: alpha('#2563eb', 0.1),
        text: '#1d4ed8',
      },
      external: {
        main: '#4b5563',
        bg: alpha('#4b5563', 0.12),
        text: '#374151',
      },
    },
    roleColors: {
      admin: '#dc2626',
      moderator: '#d97706',
      member: '#2563eb',
      external: '#4b5563',
    },

    // War role colors
    warRoles: {
      dps: {
        main: '#dc2626',
        bg: alpha('#dc2626', 0.1),
        text: '#991b1b',
      },
      heal: {
        main: '#16a34a',
        bg: alpha('#16a34a', 0.1),
        text: '#166534',
      },
      tank: {
        main: '#2563eb',
        bg: alpha('#2563eb', 0.1),
        text: '#1d4ed8',
      },
      lead: {
        main: '#d97706',
        bg: alpha('#d97706', 0.1),
        text: '#b45309',
      },
    },

    // Chip/pill colors
    chips: {
      new: {
        main: '#16a34a',
        bg: alpha('#16a34a', 0.1),
        text: '#166534',
      },
      updated: {
        main: '#0891b2',
        bg: alpha('#0891b2', 0.1),
        text: '#0e7490',
      },
      pinned: {
        main: '#d97706',
        bg: alpha('#d97706', 0.1),
        text: '#b45309',
      },
      locked: {
        main: '#78716c',
        bg: alpha('#78716c', 0.1),
        text: '#57534e',
      },
      conflict: {
        main: '#ea580c',
        bg: alpha('#ea580c', 0.1),
        text: '#c2410c',
      },
    },
  },
  typography: {
    ...typography,
    fontFamily: '"Noto Serif SC", "Songti SC", serif',
    button: {
       fontFamily: '"Inter", sans-serif', // Keep UI elements readable
       fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 4, // Slightly rounded for paper feel
          textTransform: 'none',
          boxShadow: 'none',
          border: '1px solid transparent',
          transition: 'all 0.2s ease',
          '&:hover': {
             backgroundColor: '#f5f5f4',
             borderColor: theme.palette.primary.main,
             transform: 'translateY(-1px)',
             boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          },
        }),
        contained: ({ theme }) => ({
           backgroundColor: theme.palette.primary.main,
           color: '#fafaf9',
           '&:hover': {
              backgroundColor: theme.palette.primary.dark,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
           }
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: '4px',
          fontWeight: 600,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          transition: 'all 0.2s ease',
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          // Subtle texture pattern could be added here if using images
          border: theme.custom?.cardBorder,
          boxShadow: theme.custom?.customShadow,
          borderRadius: 8,
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#f5f5f4', 0.9),
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #d6d3d1',
          color: '#1c1917',
          boxShadow: 'none',
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
         paper: {
            backgroundColor: '#ffffff',
            borderRight: '1px solid #d6d3d1',
         }
      }
    }
  },
};
