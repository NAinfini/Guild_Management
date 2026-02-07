import { ThemeOptions } from '@mui/material/styles';
import { typography } from '../typography';

/**
 * SOFT PINK THEME
 * Atmosphere: Blush Bokeh & Pearl Dust
 * Material: Porcelain & Silk
 * Hover: Pearl Shimmer Sweep
 */
export const softPinkTheme: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#ec4899', // Rose
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f472b6', // Pearl Pink
      contrastText: '#ffffff',
    },
    background: {
      default: '#fff0f5',
      paper: '#fff5f9',
    },
    text: {
      primary: '#500724',
      secondary: '#9d174d',
    },
    divider: 'rgba(236, 72, 153, 0.1)',
    action: {
      hover: 'rgba(236, 72, 153, 0.05)',
      selected: 'rgba(236, 72, 153, 0.1)',
    },
  },
  custom: {
    surface: {
      base: '#fff0f5',
      raised: '#fff5f9',
      overlay: 'rgba(255, 240, 245, 0.9)',
    },
    borderStrong: '1px solid #ec4899',
    mutedText: '#9d174d',
    glow: '0 0 15px rgba(236, 72, 153, 0.2)',
    glowCyan: '0 0 15px rgba(6, 182, 212, 0.2)',
    glowGreen: '0 0 15px rgba(16, 185, 129, 0.2)',
    glowRed: '0 0 15px rgba(239, 68, 68, 0.2)',
    glowGold: '0 0 15px rgba(245, 158, 11, 0.2)',
    border: '1px solid rgba(236, 72, 153, 0.1)',
    cardBorder: '1px solid rgba(255,255,255,0.8)',
    customShadow: '0 15px 40px rgba(236, 72, 153, 0.15)',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    shimmer: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
    
    // Status colors
    status: {
      active: { main: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' },
      inactive: { main: '#9d174d', bg: 'rgba(157, 23, 77, 0.1)', text: '#9d174d' },
      vacation: { main: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', text: '#06b6d4' },
      unknown: { main: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', text: '#94a3b8' },
    },

    // War role colors
    warRoles: {
      dps: { main: '#ec4899', bg: 'rgba(236, 114, 153, 0.1)', text: '#ec4899' },
      heal: { main: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' },
      tank: { main: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
      lead: { main: '#ec4899', bg: 'rgba(236, 114, 153, 0.15)', text: '#ec4899' },
    },
    
    roleColors: {
      admin: '#ec4899',
      moderator: '#f472b6',
      member: '#500724',
      external: '#94a3b8',
    },

    // Event type colors
    eventTypes: {
      weekly_mission: { main: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)', text: '#ec4899' },
      guild_war: { main: '#f472b6', bg: 'rgba(244, 114, 182, 0.1)', text: '#f472b6' },
      other: { main: '#9d174d', bg: 'rgba(157, 23, 77, 0.05)', text: '#9d174d' },
    },

    // Chip/pill colors
    chips: {
      new: { main: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', text: '#ec4899' },
      updated: { main: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' },
      pinned: { main: '#f472b6', bg: 'rgba(244, 114, 182, 0.15)', text: '#f472b6' },
      locked: { main: '#9d174d', bg: 'rgba(157, 23, 77, 0.15)', text: '#9d174d' },
      conflict: { main: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
    },

    // War result colors
    result: {
      win: { main: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' },
      loss: { main: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
      draw: { main: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)', text: '#ec4899' },
      unknown: { main: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', text: '#94a3b8' },
    },

    // Class colors
    classes: {
      mingjin: { main: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)', text: '#ec4899' },
      qiansi: { main: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', text: '#06b6d4' },
      pozhu: { main: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
      lieshi: { main: '#500724', bg: 'rgba(80, 7, 36, 0.05)', text: '#500724' },
    },

    // Role display colors
    roles: {
      admin: { main: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)', text: '#ec4899' },
      moderator: { main: '#f472b6', bg: 'rgba(244, 114, 182, 0.1)', text: '#f472b6' },
      member: { main: '#500724', bg: 'rgba(80, 7, 36, 0.05)', text: '#500724' },
      external: { main: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', text: '#94a3b8' },
    }
  },
  typography: {
    ...typography,
    fontFamily: '"Quicksand", sans-serif',
    h1: { ...typography.h1, fontFamily: '"Quicksand", sans-serif' },
    h2: { ...typography.h2, fontFamily: '"Quicksand", sans-serif' },
    button: {
      fontFamily: '"Quicksand", sans-serif',
      fontWeight: 700,
      textTransform: 'none',
    }
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px',
          padding: '10px 24px',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--surface1)',
          color: 'var(--accent0)',
          border: '1px solid var(--divider)',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          '&::before': {
             content: '""',
             position: 'absolute',
             top: 0,
             left: '-100%',
             width: '100%',
             height: '100%',
             background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
             transition: 'none',
          },
          '&:hover': {
            transform: 'translateY(-2px) scale(1.02)',
            boxShadow: '0 8px 20px rgba(236, 72, 153, 0.2)',
            '&::before': {
               left: '100%',
               transition: 'left 0.8s ease-in-out',
            }
          }
        },
        containedPrimary: {
           backgroundColor: 'var(--accent0)',
           color: '#fff',
           border: 'none',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--surface1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: 'var(--shadow1)',
          position: 'relative',
          '&::after': {
             content: '""',
             position: 'absolute',
             inset: 0,
             borderRadius: '24px',
             boxShadow: 'inset 0 0 15px rgba(255, 255, 255, 0.5)', // Pearly rim
             pointerEvents: 'none',
          },
          '&:hover': {
             boxShadow: '0 15px 40px rgba(236, 72, 153, 0.15)',
             transform: 'translateY(-4px)',
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--surface1)',
          backdropFilter: 'blur(8px)',
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          backgroundColor: 'rgba(255,255,255,0.5)',
          '& .MuiOutlinedInput-notchedOutline': {
             borderColor: 'var(--divider)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
             borderColor: 'var(--accent0)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
             borderColor: 'var(--accent0)',
             boxShadow: '0 0 10px rgba(236, 72, 153, 0.2)',
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '50px',
          backgroundColor: '#fff',
          border: '1px solid var(--divider)',
          color: 'var(--accent0)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
          '&.MuiChip-clickable:hover': {
             backgroundColor: 'var(--accent1)',
             color: '#fff',
          }
        },
        filled: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        })
      }
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
           backgroundColor: 'var(--accent0)',
           height: '4px',
           borderRadius: '2px',
           boxShadow: '0 2px 10px rgba(236, 72, 153, 0.3)',
           // Silk ribbon feel: slight curve via pseudo?
        }
      }
    },
    MuiSwitch: {
      styleOverrides: {
        thumb: {
           background: 'radial-gradient(circle at 30% 30%, #fff, #fbcfe8)',
           boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        track: {
           background: 'linear-gradient(90deg, #fbcfe8, #ec4899)',
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
            transition: 'none',
          },
          '&:hover': {
            backgroundColor: 'rgba(236, 72, 153, 0.08)',
            boxShadow: '0 8px 20px rgba(236, 72, 153, 0.2)',
            transform: 'translateY(-2px) scale(1.05)',
            '&::before': {
              left: '100%',
              transition: 'left 0.6s ease-in-out',
            }
          }
        }
      }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          border: '1px solid var(--divider)',
          borderRadius: '16px',
          '&:hover': {
            backgroundColor: 'rgba(236, 72, 153, 0.08)',
            borderColor: 'var(--accent0)',
          },
          '&.Mui-selected': {
            backgroundColor: 'var(--accent1)',
            color: '#fff',
            borderColor: 'var(--accent0)',
            boxShadow: '0 4px 15px rgba(236, 72, 153, 0.2)',
          }
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'var(--surface1)',
          border: '1px solid var(--divider)',
          color: 'var(--text0)',
          fontFamily: '"Quicksand", sans-serif',
          boxShadow: '0 8px 30px rgba(236, 72, 153, 0.15)',
          borderRadius: '12px',
        }
      }
    },
    MuiSlider: {
      styleOverrides: {
        thumb: {
          background: 'radial-gradient(circle at 30% 30%, #fff, var(--accent1))',
          border: '2px solid var(--accent0)',
          boxShadow: '0 2px 8px rgba(236, 72, 153, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)',
            transform: 'scale(1.1)',
          }
        },
        track: {
          background: 'linear-gradient(90deg, var(--accent0), var(--accent1))',
          height: '6px',
          borderRadius: '3px',
        },
        rail: {
          backgroundColor: 'var(--divider)',
          height: '4px',
          borderRadius: '2px',
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          height: '8px',
          borderRadius: '999px',
        },
        bar: {
          background: 'linear-gradient(90deg, var(--accent0), var(--accent1))',
          borderRadius: '999px',
          boxShadow: '0 2px 10px rgba(236, 72, 153, 0.3)',
        }
      }
    }
  }
};
