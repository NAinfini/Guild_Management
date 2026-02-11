export type ThemeColor =
  | 'default-violet'
  | 'black-gold'
  | 'chinese-ink'
  | 'neon-spectral'
  | 'red-gold'
  | 'soft-pink';

export interface ThemeColorRole {
  main: string;
  contrastText: string;
}

export interface ThemeColorText {
  primary: string;
  secondary: string;
  disabled: string;
}

export interface ThemeColorStatus {
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeColorBackground {
  default: string;
  paper: string;
  secondary: string;
}

export interface ThemeColorPalette {
  primary: ThemeColorRole;
  secondary: ThemeColorRole;
  background: ThemeColorBackground;
  text: ThemeColorText;
  divider: string;
  status: ThemeColorStatus;
  statusBg: ThemeColorStatus;
  statusFg: ThemeColorStatus;
}

export interface ThemeColorPreset {
  id: ThemeColor;
  label: string;
  description: string;
  swatch: string;
  primary: string;
  secondary: string;
  palette: ThemeColorPalette;
}
