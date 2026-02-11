
import { Theme as MuiTheme, ThemeOptions as MuiThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface CustomTheme {
      semantic?: {
        surface: {
          page: string;
          panel: string;
          elevated: string;
          sunken: string;
        };
        text: {
          primary: string;
          secondary: string;
          tertiary: string;
          inverse: string;
          link: string;
        };
        border: {
          default: string;
          strong: string;
          subtle: string;
        };
        interactive: {
          accent: string;
          hover: string;
          active: string;
          focusRing: string;
        };
      };
      components?: {
        button: {
          bg: string;
          text: string;
          border: string;
          hoverBg: string;
          activeBg: string;
        };
        card: {
          bg: string;
          border: string;
          shadow: string;
        };
        input: {
          bg: string;
          text: string;
          border: string;
          focusBorder: string;
          placeholder: string;
        };
        table: {
          headerBg: string;
          rowBg: string;
          rowHoverBg: string;
          border: string;
        };
        chip: {
          bg: string;
          text: string;
          border: string;
        };
        nav: {
          bg: string;
          itemBg: string;
          itemHoverBg: string;
          itemActiveBg: string;
          border: string;
        };
        dialog: {
          bg: string;
          border: string;
          shadow: string;
        };
      };
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

      // Member card accent colors (class-specific)
      memberCardAccents?: {
        default: string;     // Blue
        qiansi_lin: string;  // Green
        lieshi_wei: string;  // Brown
        lieshi_jun: string;  // Yellow
        empty: string;       // Gray
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
