
import { ThemeOptions, alpha } from '@mui/material/styles';
import { typography } from '../typography';

// Neon Spectral Theme - High Contrast & Vibrant
export const neonSpectralTheme: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#00f2ea', // Cyan Neon
      light: '#80fbf7',
      dark: '#00bdb5',
      contrastText: '#000000',
    },
    secondary: {
      main: '#ff00ff', // Magenta Neon
      light: '#ff80ff',
      dark: '#b300b3',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ff3333',
      light: '#ff8080',
      dark: '#b30000',
    },
    warning: {
      main: '#ffcc00',
      light: '#ffe066',
      dark: '#b38f00',
    },
    success: {
      main: '#39ff14', // Electric Lime
      light: '#85ff6e',
      dark: '#22ad05',
    },
    background: {
      default: '#050510', // Deepest Blue/Black
      paper: '#0a0a1f',   // Dark Blue/Purple
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3cc',
    },
    action: {
      hover: alpha('#00f2ea', 0.1),
      selected: alpha('#ff00ff', 0.15),
      disabled: alpha('#5c5c8a', 0.3),
    },
    divider: alpha('#3333ff', 0.2),
  },
  custom: {
    surface: {
      base: '#050510',
      raised: '#0a0a1f',
      overlay: alpha('#050510', 0.9),
    },
    borderStrong: `1px solid ${alpha('#00f2ea', 0.35)}`,
    mutedText: '#b3b3cc',
    // Neon glow effects
    glow: `0 0 10px ${alpha('#00f2ea', 0.6)}, 0 0 20px ${alpha('#00f2ea', 0.4)}`,
    glowCyan: `0 0 10px ${alpha('#00f2ea', 0.6)}, 0 0 20px ${alpha('#00f2ea', 0.4)}`,
    glowGreen: `0 0 10px ${alpha('#39ff14', 0.6)}, 0 0 20px ${alpha('#39ff14', 0.4)}`,
    glowRed: `0 0 10px ${alpha('#ff3333', 0.6)}, 0 0 20px ${alpha('#ff3333', 0.4)}`,
    glowGold: `0 0 10px ${alpha('#ffcc00', 0.6)}, 0 0 20px ${alpha('#ffcc00', 0.4)}`,
    border: `1px solid ${alpha('#00f2ea', 0.3)}`,
    cardBorder: `1px solid ${alpha('#ff00ff', 0.2)}`,
    customShadow: `0 8px 32px 0 ${alpha('#000000', 0.5)}`,
    gradient: `linear-gradient(135deg, ${alpha('#00f2ea', 0.15)} 0%, ${alpha('#ff00ff', 0.05)} 100%)`,
    shimmer: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.1)}, transparent)`,

    // Status colors
    status: {
      active: { main: '#39ff14', bg: alpha('#39ff14', 0.15), text: '#85ff6e' },
      inactive: { main: '#5c5c8a', bg: alpha('#5c5c8a', 0.15), text: '#b3b3cc' },
      vacation: { main: '#00f2ea', bg: alpha('#00f2ea', 0.15), text: '#80fbf7' },
      unknown: { main: '#b3b3cc', bg: alpha('#b3b3cc', 0.10), text: '#e6e6f2' },
    },

    // Guild war result colors
    result: {
      win: { main: '#39ff14', bg: alpha('#39ff14', 0.15), text: '#85ff6e', glow: `0 0 15px ${alpha('#39ff14', 0.5)}` },
      loss: { main: '#ff3333', bg: alpha('#ff3333', 0.15), text: '#ff8080', glow: `0 0 15px ${alpha('#ff3333', 0.5)}` },
      draw: { main: '#ffcc00', bg: alpha('#ffcc00', 0.15), text: '#ffe066', glow: `0 0 15px ${alpha('#ffcc00', 0.5)}` },
      unknown: { main: '#5c5c8a', bg: alpha('#5c5c8a', 0.15), text: '#b3b3cc' },
    },

    // Class colors
    classes: {
      mingjin: { main: '#00f2ea', bg: alpha('#00f2ea', 0.15), text: '#80fbf7' },
      qiansi: { main: '#39ff14', bg: alpha('#39ff14', 0.15), text: '#85ff6e' },
      pozhu: { main: '#ff00ff', bg: alpha('#ff00ff', 0.15), text: '#ff80ff' },
      lieshi: { main: '#ff3333', bg: alpha('#ff3333', 0.15), text: '#ff8080' },
    },

    // Event type colors
    eventTypes: {
      weekly_mission: { main: '#00f2ea', bg: alpha('#00f2ea', 0.15), text: '#80fbf7' },
      guild_war: { main: '#ff3333', bg: alpha('#ff3333', 0.15), text: '#ff8080' },
      other: { main: '#ff00ff', bg: alpha('#ff00ff', 0.15), text: '#ff80ff' },
    },

    // Role colors
    roles: {
      admin: { main: '#ff3333', bg: alpha('#ff3333', 0.15), text: '#ff8080' },
      moderator: { main: '#ffcc00', bg: alpha('#ffcc00', 0.15), text: '#ffe066' },
      member: { main: '#00f2ea', bg: alpha('#00f2ea', 0.15), text: '#80fbf7' },
      external: { main: '#e5e7eb', bg: alpha('#e5e7eb', 0.12), text: '#f9fafb' },
    },
    roleColors: {
      admin: '#ff3333',
      moderator: '#ffcc00',
      member: '#00f2ea',
      external: '#e5e7eb',
    },

     // War role colors
     warRoles: {
      dps: { main: '#ff3333', bg: alpha('#ff3333', 0.15), text: '#ff8080' },
      heal: { main: '#39ff14', bg: alpha('#39ff14', 0.15), text: '#85ff6e' },
      tank: { main: '#00f2ea', bg: alpha('#00f2ea', 0.15), text: '#80fbf7' },
      lead: { main: '#ffcc00', bg: alpha('#ffcc00', 0.15), text: '#ffe066' },
    },

    // Chip/pill colors
    chips: {
      new: { main: '#39ff14', bg: alpha('#39ff14', 0.15), text: '#85ff6e' },
      updated: { main: '#00f2ea', bg: alpha('#00f2ea', 0.15), text: '#80fbf7' },
      pinned: { main: '#ffcc00', bg: alpha('#ffcc00', 0.15), text: '#ffe066' },
      locked: { main: '#5c5c8a', bg: alpha('#5c5c8a', 0.15), text: '#b3b3cc' },
      conflict: { main: '#ff8800', bg: alpha('#ff8800', 0.15), text: '#ffbb66' },
    },
  },
  typography: {
    ...typography,
    fontFamily: '"Orbitron", "Inter", sans-serif', // Sci-fi font preference
    button: {
      fontWeight: 800,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
    h1: { ...typography.h1, fontWeight: 900, letterSpacing: '-0.02em', textShadow: `0 0 20px ${alpha('#00f2ea', 0.3)}` },
    h2: { ...typography.h2, fontWeight: 800, letterSpacing: '-0.01em', textShadow: `0 0 15px ${alpha('#ff00ff', 0.3)}` },
    h3: { ...typography.h3, fontWeight: 800 },
    // h4 and h6 might not be defined in the base typography import, so we define them or skip if not needed.
    // Assuming standard MUI theme structure, they should be fine if typed as ThemeOptions. 
    // The linter might be inferring from the imported object.
    h4: { fontWeight: 700 },
    h6: { fontWeight: 700, letterSpacing: '0.05em' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 2, // Sharper corners for sci-fi look
          boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.2)}`,
          border: '1px solid transparent',
          '&:hover': {
            boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.5)}`,
            borderColor: theme.palette.primary.main,
          },
        }),
        contained: ({ theme }) => ({
          background: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '&:hover': {
            background: theme.palette.primary.light,
          },
        }),
        outlined: ({ theme }) => ({
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
          '&:hover': {
            borderColor: theme.palette.primary.light,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          backgroundColor: alpha(theme.palette.background.paper || '#0a0a1f', 0.7),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          borderRadius: 16,
          boxShadow: `0 8px 32px 0 ${alpha('#000000', 0.4)}`,
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 800,
          border: '1px solid transparent',
        },
        filled: ({ theme }) => ({
          background: alpha(theme.palette.primary.main, 0.15),
          color: theme.palette.primary.light,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          background: alpha('#050510', 0.8),
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          background: alpha('#050510', 0.9),
          backdropFilter: 'blur(16px)',
          borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }),
      },
    },
  },
};
