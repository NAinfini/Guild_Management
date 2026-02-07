import { ThemeOptions } from '@mui/material/styles';
import { typography } from '../typography';

/**
 * RED GOLD THEME
 * Atmosphere: Crimson Bloom & Torchlight
 * Material: Red Lacquer & Polished Gold Filigree
 * Hover: Lacquer Highlight Expansion
 */
export const redGoldTheme: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#f59e0b', // Imperial Gold
      contrastText: '#1a0505',
    },
    secondary: {
      main: '#ef4444', // Royal Red
      contrastText: '#fff1f2',
    },
    background: {
      default: '#1a0505',
      paper: '#2a0a0a',
    },
    text: {
      primary: '#fff1f2',
      secondary: '#fecaca',
    },
    divider: 'rgba(245, 158, 11, 0.2)',
    action: {
      hover: 'rgba(245, 158, 11, 0.08)',
      selected: 'rgba(245, 158, 11, 0.16)',
    },
  },
  custom: {
    surface: {
      base: '#1a0505',
      raised: '#2a0a0a',
      overlay: 'rgba(26, 5, 5, 0.9)',
    },
    borderStrong: '2px solid #f59e0b',
    mutedText: '#fecaca',
    glow: '0 0 20px rgba(245, 158, 11, 0.3)',
    glowCyan: '0 0 20px rgba(6, 182, 212, 0.3)',
    glowGreen: '0 0 20px rgba(16, 185, 129, 0.3)',
    glowRed: '0 0 20px rgba(239, 68, 68, 0.3)',
    glowGold: '0 0 25px rgba(245, 158, 11, 0.4)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    cardBorder: '2px double #f59e0b',
    customShadow: '0 12px 32px rgba(0,0,0,0.6)',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    shimmer: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
    
    // Status colors
    status: {
      active: { main: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399' },
      inactive: { main: '#fecaca', bg: 'rgba(254, 202, 202, 0.15)', text: '#fecaca' },
      vacation: { main: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4' },
      unknown: { main: '#7f1d1d', bg: 'rgba(127, 29, 29, 0.15)', text: '#7f1d1d' },
    },

    // War role colors
    warRoles: {
      dps: { main: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
      heal: { main: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399' },
      tank: { main: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
      lead: { main: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b' },
    },
    
    roleColors: {
      admin: '#f59e0b',
      moderator: '#ef4444',
      member: '#fff1f2',
      external: '#7f1d1d',
    },

    // Event type colors
    eventTypes: {
      weekly_mission: { main: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
      guild_war: { main: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
      other: { main: '#fff1f2', bg: 'rgba(255, 241, 242, 0.1)', text: '#fff1f2' },
    },

    // Chip/pill colors
    chips: {
      new: { main: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b' },
      updated: { main: '#06b6d4', bg: 'rgba(6, 182, 212, 0.2)', text: '#06b6d4' },
      pinned: { main: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b' },
      locked: { main: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' },
      conflict: { main: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' },
    },

    // War result colors
    result: {
      win: { main: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399' },
      loss: { main: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
      draw: { main: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
      unknown: { main: '#7f1d1d', bg: 'rgba(127, 29, 29, 0.15)', text: '#7f1d1d' },
    },

    // Class colors
    classes: {
      mingjin: { main: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
      qiansi: { main: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4' },
      pozhu: { main: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
      lieshi: { main: '#fff1f2', bg: 'rgba(255, 241, 242, 0.1)', text: '#fff1f2' },
    },

    // Role display colors
    roles: {
      admin: { main: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
      moderator: { main: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
      member: { main: '#fff1f2', bg: 'rgba(255, 241, 242, 0.1)', text: '#fff1f2' },
      external: { main: '#7f1d1d', bg: 'rgba(127, 29, 29, 0.15)', text: '#7f1d1d' },
    }
  },
  typography: {
    ...typography,
    fontFamily: '"Crimson Text", serif',
    h1: { ...typography.h1, fontFamily: '"Crimson Text", serif', color: 'var(--accent1)' },
    h2: { ...typography.h2, fontFamily: '"Crimson Text", serif' },
    button: {
      fontFamily: '"Crimson Text", serif',
      fontWeight: 700,
      textTransform: 'none',
      letterSpacing: '0.02em',
    }
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          border: '1px solid var(--accent1)',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#2a0a0a',
          color: 'var(--accent1)',
          transition: 'all 0.3s ease',
          '&::after': {
             content: '""',
             position: 'absolute',
             top: 0,
             left: 0,
             width: '100%',
             height: '40%',
             background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)',
             pointerEvents: 'none',
          },
          '&:hover': {
            borderColor: 'var(--accent1)',
            boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)',
            '&::after': {
               height: '100%',
               background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)',
            }
          }
        },
        containedPrimary: {
          backgroundColor: '#8b0e0e', // Deep Lacquer Red
          color: 'var(--accent1)',
          border: '2px solid var(--accent1)',
          '&:hover': {
            backgroundColor: '#a51111',
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--surface1)',
          border: '2px double var(--accent1)',
          position: 'relative',
          '&::before': { // Gilded corners
             content: '""',
             position: 'absolute',
             top: '-4px',
             left: '-4px',
             width: '20px',
             height: '20px',
             borderTop: '4px solid var(--accent1)',
             borderLeft: '4px solid var(--accent1)',
             pointerEvents: 'none',
          },
          '&:hover': {
            boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
            transform: 'scale(1.005)',
            '&::before': {
               width: '30px',
               height: '30px',
               transition: 'all 0.3s ease',
            }
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--surface1)',
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--accent1)',
            borderWidth: '1px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--accent1)',
            boxShadow: 'inset 0 0 5px rgba(245, 158, 11, 0.2)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--accent1)',
            borderWidth: '2px',
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#3f0e0e',
          border: '1px solid var(--accent1)',
          color: 'var(--accent1)',
          borderRadius: '4px 12px',
          '& .MuiChip-label': { fontWeight: 600 }
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
          backgroundColor: 'var(--accent1)',
          height: '2px',
          '&::before, &::after': {
             content: '"✦"', // Small filigree endpoint
             position: 'absolute',
             top: '-6px',
             fontSize: '10px',
             color: 'var(--accent1)',
          },
          '&::before': { left: '-12px' },
          '&::after': { right: '-12px' },
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          position: 'relative',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)',
            transform: 'scale(1.05)',
          }
        }
      }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          border: '1px solid var(--accent1)',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)',
          },
          '&.Mui-selected': {
            backgroundColor: '#3f0e0e',
            borderColor: 'var(--accent1)',
            borderWidth: '2px',
            boxShadow: 'inset 0 0 10px rgba(245, 158, 11, 0.2)',
          }
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'var(--surface1)',
          border: '2px solid var(--accent1)',
          color: 'var(--text0)',
          fontFamily: '"Crimson Text", serif',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }
      }
    },
    MuiSlider: {
      styleOverrides: {
        thumb: {
          backgroundColor: 'var(--accent1)',
          border: '2px solid var(--accent0)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          '&:hover': {
            boxShadow: '0 0 15px var(--accent1)',
          }
        },
        track: {
          background: 'linear-gradient(90deg, var(--accent0), var(--accent1))',
          height: '4px',
        },
        rail: {
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          height: '3px',
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          height: '6px',
          borderRadius: '4px',
        },
        bar: {
          background: 'linear-gradient(90deg, var(--accent0), var(--accent1))',
          boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)',
        }
      }
    }
  }
};
