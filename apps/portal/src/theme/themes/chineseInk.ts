import { ThemeOptions } from '@mui/material/styles';
import { typography } from '../typography';

/**
 * CHINESE INK THEME
 * Atmosphere: Parchment & Ink Clouds
 * Material: Paper with Ink Strokes
 * Hover: Ink Spread Physics
 */
export const chineseInkTheme: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#1a1a1a', // Pure Ink Black
      contrastText: '#f0f0e8',
    },
    secondary: {
      main: '#be123c', // Seal Red
      contrastText: '#f0f0e8',
    },
    background: {
      default: '#f0f0e8', // Match var(--bg0)
      paper: '#f2f0e6',   // Match var(--surface1)
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#4a4a4a',
    },
    divider: 'rgba(15, 23, 42, 0.15)',
    action: {
      hover: 'rgba(26, 26, 26, 0.05)',
      selected: 'rgba(26, 26, 26, 0.1)',
    },
  },
  custom: {
    surface: {
      base: '#f0f0e8',
      raised: '#f2f0e6',
      overlay: 'rgba(240, 240, 232, 0.9)',
    },
    borderStrong: '1px solid #1a1a1a',
    mutedText: '#4a4a4a',
    glow: '0 0 10px rgba(26, 26, 26, 0.1)',
    glowCyan: '0 0 10px rgba(6, 182, 212, 0.2)',
    glowGreen: '0 0 10px rgba(22, 163, 74, 0.2)',
    glowRed: '0 0 10px rgba(190, 18, 60, 0.2)',
    glowGold: '0 0 10px rgba(245, 158, 11, 0.2)',
    border: '1px solid rgba(26, 26, 26, 0.15)',
    cardBorder: '1px solid #1a1a1a',
    customShadow: '4px 4px 0px rgba(0,0,0,0.1)',
    gradient: 'linear-gradient(135deg, #f0f0e8 0%, #e5e5dd 100%)',
    shimmer: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    
    // Status colors
    status: {
      active: { main: '#16a34a', bg: 'rgba(22, 163, 74, 0.1)', text: '#16a34a' },
      inactive: { main: '#4a4a4a', bg: 'rgba(74, 74, 74, 0.1)', text: '#4a4a4a' },
      vacation: { main: '#0891b2', bg: 'rgba(8, 145, 178, 0.1)', text: '#0891b2' },
      unknown: { main: '#71717a', bg: 'rgba(113, 113, 122, 0.1)', text: '#71717a' },
    },

    // War role colors
    warRoles: {
      dps: { main: '#be123c', bg: 'rgba(190, 18, 60, 0.1)', text: '#be123c' },
      heal: { main: '#16a34a', bg: 'rgba(22, 163, 74, 0.1)', text: '#16a34a' },
      tank: { main: '#1a1a1a', bg: 'rgba(26, 26, 26, 0.1)', text: '#1a1a1a' },
      lead: { main: '#be123c', bg: 'rgba(190, 18, 60, 0.15)', text: '#be123c' },
    },
    
    roleColors: {
      admin: '#be123c',
      moderator: '#1a1a1a',
      member: '#4a4a4a',
      external: '#71717a',
    },

    // Event type colors
    eventTypes: {
      weekly_mission: { main: '#1a1a1a', bg: 'rgba(26, 26, 26, 0.08)', text: '#1a1a1a' },
      guild_war: { main: '#be123c', bg: 'rgba(190, 18, 60, 0.1)', text: '#be123c' },
      other: { main: '#4a4a4a', bg: 'rgba(74, 74, 74, 0.05)', text: '#4a4a4a' },
    },

    // Chip/pill colors
    chips: {
      new: { main: '#be123c', bg: 'rgba(190, 18, 60, 0.1)', text: '#be123c' },
      updated: { main: '#1a1a1a', bg: 'rgba(26, 26, 26, 0.1)', text: '#1a1a1a' },
      pinned: { main: '#be123c', bg: 'rgba(190, 18, 60, 0.1)', text: '#be123c' },
      locked: { main: '#4a4a4a', bg: 'rgba(74, 74, 74, 0.1)', text: '#4a4a4a' },
      conflict: { main: '#be123c', bg: 'rgba(190, 18, 18, 0.15)', text: '#be123c' },
    },

    // War result colors
    result: {
      win: { main: '#16a34a', bg: 'rgba(22, 163, 74, 0.1)', text: '#16a34a' },
      loss: { main: '#be123c', bg: 'rgba(190, 18, 60, 0.1)', text: '#be123c' },
      draw: { main: '#1a1a1a', bg: 'rgba(26, 26, 26, 0.1)', text: '#1a1a1a' },
      unknown: { main: '#71717a', bg: 'rgba(113, 113, 122, 0.1)', text: '#71717a' },
    },

    // Class colors
    classes: {
      mingjin: { main: '#be123c', bg: 'rgba(190, 18, 60, 0.1)', text: '#be123c' },
      qiansi: { main: '#0891b2', bg: 'rgba(8, 145, 178, 0.1)', text: '#0891b2' },
      pozhu: { main: '#1a1a1a', bg: 'rgba(26, 26, 26, 0.1)', text: '#1a1a1a' },
      lieshi: { main: '#4a4a4a', bg: 'rgba(74, 74, 74, 0.05)', text: '#4a4a4a' },
    },

    // Role display colors
    roles: {
      admin: { main: '#be123c', bg: 'rgba(190, 18, 60, 0.1)', text: '#be123c' },
      moderator: { main: '#1a1a1a', bg: 'rgba(26, 26, 26, 0.1)', text: '#1a1a1a' },
      member: { main: '#4a4a4a', bg: 'rgba(74, 74, 74, 0.05)', text: '#4a4a4a' },
      external: { main: '#71717a', bg: 'rgba(113, 113, 122, 0.1)', text: '#71717a' },
    }
  },
  typography: {
    ...typography,
    fontFamily: '"Noto Serif SC", "Ma Shan Zheng", serif',
    h1: { ...typography.h1, fontFamily: '"Ma Shan Zheng", serif' },
    h2: { ...typography.h2, fontFamily: '"Ma Shan Zheng", serif' },
    h3: { ...typography.h3, fontFamily: '"Ma Shan Zheng", serif' },
    button: {
      fontFamily: '"Noto Serif SC", serif',
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 0, // Sharp edges for paper
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '4px 2px 4px 3px', // Imperfect cut
          padding: '8px 20px',
          border: 'var(--stroke) solid var(--text0)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all var(--motionFast) var(--ease)',
          '&:hover': {
            boxShadow: '0 0 15px 5px rgba(26, 26, 26, 0.15)', // Ink Spread
            transform: 'translateY(-1px)',
            backgroundColor: 'rgba(26, 26, 26, 0.03)',
            borderColor: 'var(--accent0)',
          },
        },
        containedPrimary: {
          backgroundColor: 'var(--accent1)',
          color: 'var(--bg0)',
          '&::after': {
            content: '"印"', // Tiny 'Seal' micro-accent
            position: 'absolute',
            bottom: '2px',
            right: '4px',
            fontSize: '8px',
            opacity: 0.4,
          },
          '&:hover': {
            backgroundColor: '#000',
          }
        },
        outlined: {
          border: 'var(--stroke) solid var(--text0)',
          '&:hover': {
            backgroundColor: 'rgba(26, 26, 26, 0.03)',
            border: 'var(--stroke) solid var(--accent0)',
          }
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--surface1)',
          backgroundImage: 'var(--sigA)', // Paper fiber noise
          border: 'var(--stroke) solid var(--text0)',
          boxShadow: 'var(--shadow1)',
          borderRadius: '2px',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            border: '4px solid transparent',
            borderImage: 'linear-gradient(to right, var(--text0), transparent) 1',
            opacity: 0.1,
            pointerEvents: 'none',
          },
          '&:hover': {
            boxShadow: '4px 4px 0px var(--text0)', // Blocky ink shadow
            transform: 'translate(-2px, -2px)',
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
           backgroundImage: 'var(--sigA)',
           backgroundColor: 'var(--surface1)',
           color: 'var(--text0)',
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          border: '1px solid var(--text0)',
          borderRadius: '0px',
          fontStyle: 'italic',
          '&:hover': {
            backgroundColor: 'var(--text0)',
            color: 'var(--bg0)',
          }
        },
        filled: {
          backgroundColor: 'var(--text0)',
          color: 'var(--bg0)',
          '&.MuiChip-colorPrimary': {
            backgroundColor: 'var(--accent0)',
            borderColor: 'var(--accent0)',
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--text0)',
            borderWidth: '1px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--accent0)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--text0)',
            boxShadow: '0 0 0 4px rgba(26, 26, 26, 0.05)', // Halo
          }
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: 'var(--accent0)',
          height: '4px',
          borderRadius: '2px',
          // Brush stroke simulated via irregular height? 
          // Better: clip-path or background-image
          backgroundImage: 'linear-gradient(90deg, transparent, var(--accent0), transparent)',
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
             backgroundColor: 'rgba(26, 26, 26, 0.05)',
             borderLeft: '4px solid var(--accent0)',
             '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '1px',
                background: 'var(--divider)',
             }
          }
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s var(--ease)',
          '&:hover': {
            backgroundColor: 'rgba(26, 26, 26, 0.08)',
            boxShadow: '0 0 10px 3px rgba(26, 26, 26, 0.1)',
            transform: 'scale(1.05)',
          }
        }
      }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          border: '1px solid var(--text0)',
          borderRadius: '2px',
          '&:hover': {
            backgroundColor: 'rgba(26, 26, 26, 0.05)',
            borderColor: 'var(--accent0)',
          },
          '&.Mui-selected': {
            backgroundColor: 'var(--text0)',
            color: 'var(--bg0)',
            borderColor: 'var(--text0)',
            '&:hover': {
              backgroundColor: '#000',
            }
          }
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'var(--surface1)',
          border: '1px solid var(--text0)',
          color: 'var(--text0)',
          fontFamily: '"Noto Serif SC", serif',
          boxShadow: '2px 2px 0px rgba(0,0,0,0.1)',
        }
      }
    },
    MuiSlider: {
      styleOverrides: {
        thumb: {
          backgroundColor: 'var(--accent0)',
          border: '2px solid var(--text0)',
          '&:hover': {
            boxShadow: '0 0 10px rgba(190, 18, 60, 0.3)',
          }
        },
        track: {
          backgroundColor: 'var(--accent0)',
          height: '4px',
        },
        rail: {
          backgroundColor: 'var(--divider)',
          height: '3px',
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--divider)',
          height: '6px',
          borderRadius: '0px',
        },
        bar: {
          backgroundColor: 'var(--accent0)',
          borderRadius: '0px',
        }
      }
    }
  }
};
