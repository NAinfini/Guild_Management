
import { Theme as MuiTheme, ThemeOptions as MuiThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface CustomTheme {
      // Visual effects
      glow: string;
      glowCyan: string;
      glowGreen: string;
      glowRed: string;
      glowGold: string;
      border: string;
      borderStrong: string;
      cardBorder: string;
      customShadow: string;
      gradient: string;
      shimmer: string;
      mutedText: string;
      roleColors: Record<string, string>;
      surface?: {
        base: string;
        raised: string;
        overlay: string;
      };

      // Status colors
      status: {
        active: { main: string; bg: string; text: string; };
        inactive: { main: string; bg: string; text: string; };
        vacation: { main: string; bg: string; text: string; };
        unknown: { main: string; bg: string; text: string; };
      };

      // Guild war result colors
      result: {
        win: { main: string; bg: string; text: string; glow?: string; };
        loss: { main: string; bg: string; text: string; glow?: string; };
        draw: { main: string; bg: string; text: string; glow?: string; };
        unknown: { main: string; bg: string; text: string; };
      };

      // Class colors (game classes)
      classes: {
        mingjin: { main: string; bg: string; text: string; };
        qiansi: { main: string; bg: string; text: string; };
        pozhu: { main: string; bg: string; text: string; };
        lieshi: { main: string; bg: string; text: string; };
      };

      // Event type colors
      eventTypes: {
        weekly_mission: { main: string; bg: string; text: string; };
        guild_war: { main: string; bg: string; text: string; };
        other: { main: string; bg: string; text: string; };
      };

      // Role colors
      roles: {
        admin: { main: string; bg: string; text: string; };
        moderator: { main: string; bg: string; text: string; };
        member: { main: string; bg: string; text: string; };
        external?: { main: string; bg: string; text: string; };
      };

      // War role colors (DPS, Heal, Tank, Lead)
      warRoles: {
        dps: { main: string; bg: string; text: string; };
        heal: { main: string; bg: string; text: string; };
        tank: { main: string; bg: string; text: string; };
        lead: { main: string; bg: string; text: string; };
      };

      // Chip/pill colors
      chips: {
        new: { main: string; bg: string; text: string; };
        updated: { main: string; bg: string; text: string; };
        pinned: { main: string; bg: string; text: string; };
        locked: { main: string; bg: string; text: string; };
        conflict: { main: string; bg: string; text: string; };
      };
  }

  interface Theme {
    custom?: CustomTheme;
  }

  // Allow configuration using `createTheme`
  interface ThemeOptions {
    custom?: Partial<CustomTheme>;
  }
}
