import { ThemeOptions } from '@mui/material/styles';
import { typography } from '../typography';

/**
 * NEON SPECTRAL THEME
 * Atmosphere: Cyber City Glow & Scanlines
 * Material: Hologram Glass & Neon Seams
 * Hover: Signal Jitter & Seam Intensity
 */
export const neonSpectralTheme: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#06b6d4', // Cyan
      contrastText: '#000',
    },
    secondary: {
      main: '#d946ef', // Magenta
      contrastText: '#fff',
    },
    background: {
      default: '#050510',
      paper: '#0a0f1e', // Slightly darker than surface1 bg
    },
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
    },
    divider: 'rgba(6, 182, 212, 0.2)',
    action: {
      hover: 'rgba(6, 182, 212, 0.1)',
      selected: 'rgba(6, 182, 212, 0.2)',
    },
  },
  custom: {
    surface: {
      base: '#050510',
      raised: '#0a0f1e',
      overlay: 'rgba(5, 5, 16, 0.9)',
    },
    borderStrong: '1px solid #06b6d4',
    mutedText: '#94a3b8',
    glow: '0 0 20px rgba(6, 182, 212, 0.5)',
    glowCyan: '0 0 20px rgba(6, 182, 212, 0.5)',
    glowGreen: '0 0 20px rgba(16, 185, 129, 0.5)',
    glowRed: '0 0 20px rgba(239, 68, 68, 0.5)',
    glowGold: '0 0 20px rgba(245, 158, 11, 0.5)',
    border: '1px solid rgba(6, 182, 212, 0.3)',
    cardBorder: '1px solid rgba(6, 182, 212, 0.2)',
    customShadow: '0 0 30px rgba(0, 0, 0, 0.8)',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #d946ef 100%)',
    shimmer: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.2), transparent)',
    
    // Status colors
    status: {
      active: { main: '#34d399', bg: 'rgba(52, 211, 153, 0.2)', text: '#34d399' },
      inactive: { main: '#94a3b8', bg: 'rgba(148, 163, 184, 0.2)', text: '#94a3b8' },
      vacation: { main: '#06b6d4', bg: 'rgba(6, 182, 212, 0.2)', text: '#06b6d4' },
      unknown: { main: '#475569', bg: 'rgba(71, 85, 105, 0.2)', text: '#475569' },
    },

    // War role colors
    warRoles: {
      dps: { main: '#d946ef', bg: 'rgba(217, 70, 239, 0.2)', text: '#d946ef' },
      heal: { main: '#06b6d4', bg: 'rgba(6, 182, 212, 0.2)', text: '#06b6d4' },
      tank: { main: '#06b6d4', bg: 'rgba(6, 182, 212, 0.2)', text: '#06b6d4' },
      lead: { main: '#06b6d4', bg: 'rgba(6, 182, 212, 0.3)', text: '#06b6d4' },
    },
    
    roleColors: {
      admin: '#d946ef',
      moderator: '#06b6d4',
      member: '#e2e8f0',
      external: '#94a3b8',
    },

    // Event type colors
    eventTypes: {
      weekly_mission: { main: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4' },
      guild_war: { main: '#d946ef', bg: 'rgba(217, 70, 239, 0.15)', text: '#d946ef' },
      other: { main: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', text: '#94a3b8' },
    },

    // Chip/pill colors
    chips: {
      new: { main: '#06b6d4', bg: 'rgba(6, 182, 212, 0.2)', text: '#06b6d4' },
      updated: { main: '#34d399', bg: 'rgba(52, 211, 153, 0.2)', text: '#34d399' },
      pinned: { main: '#d946ef', bg: 'rgba(217, 70, 239, 0.2)', text: '#d946ef' },
      locked: { main: '#f43f5e', bg: 'rgba(244, 63, 94, 0.2)', text: '#f43f5e' },
      conflict: { main: '#f43f5e', bg: 'rgba(244, 63, 94, 0.2)', text: '#f43f5e' },
    },

    // War result colors
    result: {
      win: { main: '#34d399', bg: 'rgba(52, 211, 153, 0.2)', text: '#34d399' },
      loss: { main: '#f43f5e', bg: 'rgba(244, 63, 94, 0.2)', text: '#f43f5e' },
      draw: { main: '#06b6d4', bg: 'rgba(6, 182, 212, 0.2)', text: '#06b6d4' },
      unknown: { main: '#475569', bg: 'rgba(71, 85, 105, 0.2)', text: '#475569' },
    },

    // Class colors
    classes: {
      mingjin: { main: '#d946ef', bg: 'rgba(217, 70, 239, 0.15)', text: '#d946ef' },
      qiansi: { main: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4' },
      pozhu: { main: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
      lieshi: { main: '#e2e8f0', bg: 'rgba(226, 232, 240, 0.1)', text: '#e2e8f0' },
    },

    // Role display colors
    roles: {
      admin: { main: '#d946ef', bg: 'rgba(217, 70, 239, 0.15)', text: '#d946ef' },
      moderator: { main: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4' },
      member: { main: '#e2e8f0', bg: 'rgba(226, 232, 240, 0.1)', text: '#e2e8f0' },
      external: { main: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8' },
    }
  },
  typography: {
    ...typography,
    fontFamily: '"Rajdhani", sans-serif',
    h1: { ...typography.h1, fontFamily: '"Orbitron", sans-serif', letterSpacing: '0.2em' },
    h2: { ...typography.h2, fontFamily: '"Orbitron", sans-serif' },
    button: {
      fontFamily: '"Orbitron", sans-serif',
      letterSpacing: '0.1em',
      fontWeight: 700,
    }
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          position: 'relative',
          background: 'rgba(6, 182, 212, 0.05)',
          color: 'var(--accent1)',
          transition: 'all 0.2s ease',
          overflow: 'visible',
          // Neon seam border OUTSIDE the button
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '-2px', // Border is OUTSIDE the button
            clipPath: 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)',
            background: 'linear-gradient(135deg, var(--accent1), var(--accent0))',
            opacity: 0.4,
            zIndex: -1,
            pointerEvents: 'none',
            transition: 'opacity 0.2s ease',
          },
          // Inner clipping for button content
          clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
          '&:hover': {
            background: 'rgba(6, 182, 212, 0.15)',
            boxShadow: '0 0 20px var(--accent1), 0 0 30px var(--accent0)',
            animation: 'glitchJitter 0.3s ease-in-out',
            '&::before': {
              opacity: 1,
              boxShadow: '0 0 15px var(--accent1)',
            },
            '& .MuiButton-label, &': {
              animation: 'glitchChroma 0.3s ease-in-out',
            }
          },
        },
        containedPrimary: {
          backgroundColor: 'var(--accent1)',
          color: '#000',
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)',
          '&:hover': {
            backgroundColor: '#22d3ee',
            boxShadow: '0 0 30px rgba(6, 182, 212, 0.8)',
          },
          '&::before': {
            opacity: 0.8,
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--surface1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--divider)',
          position: 'relative',
          overflow: 'visible',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '-1px',
            background: 'linear-gradient(45deg, var(--accent1), transparent, var(--accent0))',
            zIndex: -1,
            opacity: 0.2,
          },
          '&:hover': {
            borderColor: 'var(--accent1)',
            '&::before': { opacity: 0.6 }
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
          '& .MuiOutlinedInput-notchedOutline': {
             borderColor: 'var(--divider)',
             borderRadius: '0px',
             clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
             borderColor: 'var(--accent1)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
             borderColor: 'var(--accent1)',
             borderWidth: '1px',
             boxShadow: '0 0 10px var(--accent1)',
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid var(--accent1)',
          color: 'var(--accent1)',
          textShadow: '0 0 5px var(--accent1)',
          '& .MuiChip-label': {
             paddingLeft: '8px',
             paddingRight: '8px',
          }
        },
        filled: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          boxShadow: `0 0 15px ${theme.palette.primary.main}`,
        })
      }
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
           background: 'linear-gradient(90deg, transparent, var(--accent1), transparent)',
           height: '3px',
           boxShadow: '0 0 10px var(--accent1)',
           animation: 'pulse 2s infinite',
        }
      }
    },
    MuiSwitch: {
      styleOverrides: {
        track: {
           backgroundColor: 'rgba(6, 182, 212, 0.2)',
        },
        thumb: {
           backgroundColor: 'var(--accent1)',
           boxShadow: '0 0 10px var(--accent1)',
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          position: 'relative',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(6, 182, 212, 0.15)',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
            animation: 'glitchJitter 0.3s ease-in-out',
          }
        }
      }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          border: '1px solid var(--divider)',
          clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
          '&:hover': {
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            borderColor: 'var(--accent1)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(6, 182, 212, 0.2)',
            borderColor: 'var(--accent1)',
            boxShadow: '0 0 10px var(--accent1)',
          }
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'var(--surface1)',
          border: '1px solid var(--accent1)',
          color: 'var(--text0)',
          boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)',
        }
      }
    },
    MuiSlider: {
      styleOverrides: {
        thumb: {
          backgroundColor: 'var(--accent1)',
          border: '2px solid var(--accent0)',
          boxShadow: '0 0 10px var(--accent1)',
          '&:hover': {
            boxShadow: '0 0 20px var(--accent1)',
          }
        },
        track: {
          background: 'linear-gradient(90deg, var(--accent1), var(--accent0))',
          height: '3px',
          border: 'none',
        },
        rail: {
          backgroundColor: 'rgba(6, 182, 212, 0.2)',
          height: '2px',
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(6, 182, 212, 0.2)',
          height: '4px',
        },
        bar: {
          background: 'linear-gradient(90deg, var(--accent1), var(--accent0))',
          boxShadow: '0 0 10px var(--accent1)',
          animation: 'pulse 2s infinite',
        }
      }
    }
  }
};
