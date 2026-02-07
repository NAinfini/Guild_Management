import { ThemeOptions } from '@mui/material/styles';
import { typography } from '../typography';

/**
 * DARK GOLD THEME
 * Atmosphere: Studio Black & Spotlight
 * Material: Matte Ceramic & Gold Metal
 * Hover: Specular Metallic Sweep
 */
export const darkGoldTheme: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#fbbf24', // Gold
      contrastText: '#000',
    },
    secondary: {
      main: '#d4af37',
      contrastText: '#000',
    },
    background: {
      default: '#000000',
      paper: '#111111',
    },
    text: {
      primary: '#e5e5e5',
      secondary: '#a3a3a3',
    },
    divider: 'rgba(255, 255, 255, 0.1)',
  },
  custom: {
    surface: {
      base: '#000000',
      raised: '#111111',
      overlay: 'rgba(0, 0, 0, 0.9)',
    },
    borderStrong: '1px solid #fbbf24',
    mutedText: '#a3a3a3',
    glow: '0 0 15px rgba(251, 191, 36, 0.3)',
    glowCyan: '0 0 15px rgba(6, 182, 212, 0.3)',
    glowGreen: '0 0 15px rgba(16, 185, 129, 0.3)',
    glowRed: '0 0 15px rgba(239, 68, 68, 0.3)',
    glowGold: '0 0 20px rgba(251, 191, 36, 0.5)',
    border: '1px solid rgba(251, 191, 36, 0.2)',
    cardBorder: '1px solid rgba(251, 191, 36, 0.2)',
    customShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.6)',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #d4af37 100%)',
    shimmer: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
    
    // Status colors
    status: {
      active: { main: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399' },
      inactive: { main: '#a3a3a3', bg: 'rgba(163, 163, 163, 0.15)', text: '#a3a3a3' },
      vacation: { main: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4' },
      unknown: { main: '#737373', bg: 'rgba(115, 115, 115, 0.15)', text: '#737373' },
    },

    // War role colors
    warRoles: {
      dps: { main: '#f87171', bg: 'rgba(248, 113, 113, 0.15)', text: '#f87171' },
      heal: { main: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399' },
      tank: { main: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24' },
      lead: { main: '#fbbf24', bg: 'rgba(251, 191, 36, 0.2)', text: '#fbbf24' },
    },
    
    roleColors: {
      admin: '#fbbf24',
      moderator: '#d4af37',
      member: '#e2e8f0',
      external: '#737373',
    },

    // Event type colors
    eventTypes: {
      weekly_mission: { main: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24' },
      guild_war: { main: '#d4af37', bg: 'rgba(212, 175, 55, 0.15)', text: '#d4af37' },
      other: { main: '#e5e5e5', bg: 'rgba(229, 229, 229, 0.1)', text: '#e5e5e5' },
    },

    // Chip/pill colors
    chips: {
      new: { main: '#fbbf24', bg: 'rgba(251, 191, 36, 0.2)', text: '#fbbf24' },
      updated: { main: '#06b6d4', bg: 'rgba(6, 182, 212, 0.2)', text: '#06b6d4' },
      pinned: { main: '#fbbf24', bg: 'rgba(251, 191, 36, 0.2)', text: '#fbbf24' },
      locked: { main: '#f87171', bg: 'rgba(248, 113, 113, 0.2)', text: '#f87171' },
      conflict: { main: '#f87171', bg: 'rgba(248, 113, 113, 0.2)', text: '#f87171' },
    },

    // War result colors
    result: {
      win: { main: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399' },
      loss: { main: '#f87171', bg: 'rgba(248, 113, 113, 0.15)', text: '#f87171' },
      draw: { main: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24' },
      unknown: { main: '#737373', bg: 'rgba(115, 115, 115, 0.15)', text: '#737373' },
    },

    // Class colors
    classes: {
      mingjin: { main: '#f87171', bg: 'rgba(248, 113, 113, 0.15)', text: '#f87171' },
      qiansi: { main: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4' },
      pozhu: { main: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24' },
      lieshi: { main: '#e5e5e5', bg: 'rgba(229, 229, 229, 0.1)', text: '#e5e5e5' },
    },

    // Role display colors
    roles: {
      admin: { main: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24' },
      moderator: { main: '#d4af37', bg: 'rgba(212, 175, 55, 0.15)', text: '#d4af37' },
      member: { main: '#e5e5e5', bg: 'rgba(229, 229, 229, 0.1)', text: '#e5e5e5' },
      external: { main: '#737373', bg: 'rgba(115, 115, 115, 0.15)', text: '#737373' },
    }
  },
  typography: {
    ...typography,
    fontFamily: '"Inter", sans-serif',
    button: {
      fontWeight: 800,
      letterSpacing: '0.1em',
    }
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '2px',
          fontWeight: 900,
          textTransform: 'uppercase',
          border: '1px solid var(--divider)',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#111',
          color: 'var(--accent0)',
          '&::before': {
             content: '""',
             position: 'absolute',
             top: 0,
             left: '-150%',
             width: '100%',
             height: '100%',
             background: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.4), transparent)',
             transform: 'skewX(-25deg)',
             transition: 'none',
          },
          '&:hover': {
            borderColor: 'var(--accent0)',
            '&::before': {
              left: '150%',
              transition: 'left 0.6s ease-in-out',
            },
          },
          '&:active': {
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
          }
        },
        containedPrimary: {
          backgroundColor: 'var(--accent0)',
          color: '#000',
          '&:hover': {
            backgroundColor: '#f59e0b',
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--surface1)',
          border: '1px solid rgba(251, 191, 36, 0.2)',
          boxShadow: 'var(--shadow2)',
          '&::after': {
             content: '""',
             position: 'absolute',
             top: 0,
             left: 0,
             right: 0,
             height: '1px',
             background: 'linear-gradient(90deg, transparent, var(--accent0), transparent)',
             opacity: 0.5,
          },
          '&:hover': {
             borderColor: 'var(--accent0)',
             '&::after': {
                opacity: 1,
                transition: 'opacity 0.3s ease',
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
            borderColor: 'var(--divider)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(251, 191, 36, 0.5)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--accent0)',
            borderWidth: '1px',
            boxShadow: '0 0 0 2px var(--bg0), 0 0 0 3px var(--accent0)',
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
           backgroundColor: '#0a0a0a',
           border: '1px solid var(--divider)',
           borderRadius: 2,
           boxShadow: 'inset 1px 1px 1px rgba(255,255,255,0.05)',
           '&.MuiChip-clickable:hover': {
              borderColor: 'var(--accent0)',
              backgroundColor: '#111',
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
          height: '2px',
          backgroundColor: 'var(--accent0)',
          boxShadow: '0 0 8px var(--accent0)',
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-150%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.3), transparent)',
            transform: 'skewX(-25deg)',
            transition: 'none',
          },
          '&:hover': {
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            boxShadow: '0 0 15px rgba(251, 191, 36, 0.3)',
            '&::before': {
              left: '150%',
              transition: 'left 0.5s ease-in-out',
            }
          }
        }
      }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          border: '1px solid var(--divider)',
          borderRadius: '2px',
          '&:hover': {
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            borderColor: 'var(--accent0)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(251, 191, 36, 0.2)',
            borderColor: 'var(--accent0)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
          }
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'var(--surface1)',
          border: '1px solid var(--accent0)',
          color: 'var(--text0)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
        }
      }
    },
    MuiSlider: {
      styleOverrides: {
        thumb: {
          backgroundColor: 'var(--accent0)',
          border: '2px solid #000',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          '&:hover': {
            boxShadow: '0 0 15px var(--accent0)',
          }
        },
        track: {
          backgroundColor: 'var(--accent0)',
          height: '3px',
        },
        rail: {
          backgroundColor: 'var(--divider)',
          height: '2px',
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          height: '4px',
        },
        bar: {
          backgroundColor: 'var(--accent0)',
          boxShadow: '0 0 8px var(--accent0)',
        }
      }
    }
  }
};
