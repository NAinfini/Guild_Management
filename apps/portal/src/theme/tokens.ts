export type ThemeMode = 'neo-brutalism' | 'steampunk' | 'cyberpunk' | 'post-apocalyptic' | 'chibi' | 'royal' | 'minimalistic';
export type ThemeColor = 'default-violet' | 'black-gold' | 'chinese-ink' | 'neon-spectral' | 'red-gold' | 'soft-pink';
export type ThemeBackgroundMode = 'css' | 'canvas';

export interface ThemeVisualCapabilities {
  hasAnimatedBackground: boolean;
  hasMascot: boolean;
  fxQuality: 0 | 1 | 2 | 3;
  backgroundMode: ThemeBackgroundMode;
}

export interface ThemeVisualSpec {
  id: ThemeMode;
  label: string;
  fontFamily: string;
  headingFont: string;
  defaultColor: ThemeColor;
  borderWidth: string;
  borderStyle: string;
  bgPattern: string;
  bgSize: string;
  shape: {
    borderRadius: number;
    buttonRadius: number;
    inputRadius: number;
  };
  shadows: string[];
  capabilities: ThemeVisualCapabilities;
}

const DEFAULT_THEME_CAPABILITIES: ThemeVisualCapabilities = {
  hasAnimatedBackground: false,
  hasMascot: false,
  fxQuality: 0,
  backgroundMode: 'css',
};

function withThemeCapabilities(
  spec: Omit<ThemeVisualSpec, 'capabilities'> & {
    capabilities?: Partial<ThemeVisualCapabilities>;
  },
): ThemeVisualSpec {
  return {
    ...spec,
    capabilities: {
      ...DEFAULT_THEME_CAPABILITIES,
      ...spec.capabilities,
    },
  };
}

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

export const goldAmberColor: ThemeColorPreset = {
  id: 'black-gold',
  label: 'Black Gold',
  description: 'Black-and-gold luxury contrast from Nexus library',
  swatch: 'linear-gradient(135deg, #D4AF37 0%, #1E1E1E 100%)',
  primary: '#D4AF37',
  secondary: '#1E1E1E',
  palette: {
    primary: { main: '#D4AF37', contrastText: '#000000' },
    secondary: { main: '#1E1E1E', contrastText: '#FAFAFA' },
    background: { default: '#050505', paper: '#121212', secondary: '#121212' },
    text: { primary: '#FAFAFA', secondary: '#D4D4D8', disabled: '#52525B' }, // FIXED: WCAG AA compliant
    divider: '#D4AF3740', // Gold with 25% opacity
    status: { success: '#D4AF37', warning: '#F59E0B', error: '#EF4444', info: '#FAFAFA' },
    statusBg: { success: '#2A2410', warning: '#292008', error: '#331010', info: '#27272A' },
    statusFg: { success: '#FAFAFA', warning: '#FFFBEB', error: '#FEE2E2', info: '#FAFAFA' },
  },
};

export const chineseInkColor: ThemeColorPreset = {
  id: 'chinese-ink',
  label: 'Chinese Ink',
  description: 'Ink monochrome with parchment paper neutrals',
  swatch: 'linear-gradient(135deg, #111111 0%, #EBE8E1 100%)',
  primary: '#111111',
  secondary: '#EBE8E1',
  palette: {
    primary: { main: '#111111', contrastText: '#FFFFFF' },
    secondary: { main: '#EBE8E1', contrastText: '#111111' },
    background: { default: '#F7F5F0', paper: '#FFFFFF', secondary: '#EBE8E1' },
    text: { primary: '#111111', secondary: '#4B5563', disabled: '#9CA3AF' }, // FIXED: WCAG AA compliant
    divider: '#9CA3AF',
    status: { success: '#065F46', warning: '#92400E', error: '#991B1B', info: '#1F2937' },
    statusBg: { success: '#D1FAE5', warning: '#FEF3C7', error: '#FEE2E2', info: '#F3F4F6' },
    statusFg: { success: '#111111', warning: '#111111', error: '#7F1D1D', info: '#111111' },
  },
};

export const tealNeonColor: ThemeColorPreset = {
  id: 'neon-spectral',
  label: 'Neon Spectral',
  description: 'Electric cyan on deep violet, copied from Nexus library',
  swatch: 'linear-gradient(135deg, #00F0FF 0%, #0F0529 100%)',
  primary: '#00F0FF',
  secondary: '#0F0529',
  palette: {
    primary: { main: '#00F0FF', contrastText: '#000000' },
    secondary: { main: '#0F0529', contrastText: '#E0E7FF' },
    background: { default: '#030014', paper: '#150A33', secondary: '#0F0529' },
    text: { primary: '#E0E7FF', secondary: '#C4B5FD', disabled: '#6366F1' }, // FIXED: WCAG AA compliant
    divider: '#4C1D95',
    status: { success: '#00FF94', warning: '#FFE600', error: '#FF0055', info: '#00F0FF' },
    statusBg: { success: '#003319', warning: '#332B00', error: '#330011', info: '#002233' },
    statusFg: { success: '#D1FAE5', warning: '#FEF9C3', error: '#FBCFE8', info: '#CFFAFE' },
  },
};

export const crimsonGoldColor: ThemeColorPreset = {
  id: 'red-gold',
  label: 'Red Gold',
  description: 'Wasteland red-and-gold palette from Nexus library',
  swatch: 'linear-gradient(135deg, #F59E0B 0%, #450A0A 100%)',
  primary: '#F59E0B',
  secondary: '#450A0A',
  palette: {
    primary: { main: '#F59E0B', contrastText: '#2A0404' },
    secondary: { main: '#450A0A', contrastText: '#FEF2F2' },
    background: { default: '#2A0404', paper: '#450A0A', secondary: '#450A0A' },
    text: { primary: '#FEF2F2', secondary: '#FECACA', disabled: '#991B1B' }, // FIXED: WCAG AA compliant
    divider: '#7F1D1D',
    status: { success: '#F59E0B', warning: '#EA580C', error: '#EF4444', info: '#FEF2F2' },
    statusBg: { success: '#291F00', warning: '#431407', error: '#330505', info: '#591010' },
    statusFg: { success: '#FEF3C7', warning: '#FED7AA', error: '#FEE2E2', info: '#FEF2F2' },
  },
};

export const softRoseColor: ThemeColorPreset = {
  id: 'soft-pink',
  label: 'Soft Pink',
  description: 'Cute pink palette copied from Nexus library',
  swatch: 'linear-gradient(135deg, #FB7185 0%, #FFE4E9 100%)',
  primary: '#FB7185',
  secondary: '#FFE4E9',
  palette: {
    primary: { main: '#FB7185', contrastText: '#4A1024' },
    secondary: { main: '#FFE4E9', contrastText: '#831843' },
    background: { default: '#FFF0F5', paper: '#FFFFFF', secondary: '#FFE4E9' },
    text: { primary: '#831843', secondary: '#9D174D', disabled: '#EC4899' }, // FIXED: WCAG AA compliant
    divider: '#FBCFE8',
    status: { success: '#34D399', warning: '#FBBF24', error: '#FB7185', info: '#F472B6' },
    statusBg: { success: '#ECFDF5', warning: '#FFFBEB', error: '#FFF1F2', info: '#FFF1F2' },
    statusFg: { success: '#065F46', warning: '#92400E', error: '#9F1239', info: '#9D174D' },
  },
};

export const violetCyanColor: ThemeColorPreset = {
  id: 'default-violet',
  label: 'Default Violet',
  description: 'Clean violet palette with bright neutral surfaces',
  swatch: 'linear-gradient(135deg, #7C3AED 0%, #F8FAFC 100%)',
  primary: '#7C3AED',
  secondary: '#F8FAFC',
  palette: {
    primary: { main: '#7C3AED', contrastText: '#FFFFFF' },
    secondary: { main: '#F8FAFC', contrastText: '#0F172A' },
    background: { default: '#FFFFFF', paper: '#FFFFFF', secondary: '#F8FAFC' },
    text: { primary: '#0F172A', secondary: '#334155', disabled: '#94A3B8' }, // FIXED: WCAG AA compliant
    divider: '#94A3B8',
    status: { success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6' },
    statusBg: { success: '#ECFDF5', warning: '#FFFBEB', error: '#FEF2F2', info: '#EFF6FF' },
    statusFg: { success: '#065F46', warning: '#92400E', error: '#991B1B', info: '#1E3A8A' },
  },
};

export const THEME_COLOR_PRESET_LIST: ThemeColorPreset[] = [
  violetCyanColor,
  goldAmberColor,
  chineseInkColor,
  tealNeonColor,
  crimsonGoldColor,
  softRoseColor,
];

export const THEME_COLOR_PRESETS: Record<ThemeColor, ThemeColorPreset> = {
  'default-violet': violetCyanColor,
  'black-gold': goldAmberColor,
  'chinese-ink': chineseInkColor,
  'red-gold': crimsonGoldColor,
  'soft-pink': softRoseColor,
  'neon-spectral': tealNeonColor,
};

export const GAME_CLASS_COLORS = {
  mingjin: { main: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)', text: '#dbeafe' },
  qiansi: { main: '#22c55e', bg: 'rgba(34, 197, 94, 0.2)', text: '#dcfce7' },
  pozhu: { main: '#a855f7', bg: 'rgba(168, 85, 247, 0.2)', text: '#f3e8ff' },
  lieshi: { main: '#7f1d1d', bg: 'rgba(127, 29, 29, 0.28)', text: '#fee2e2' },
} as const;

export const NEO_BRUTALISM_VISUAL_SPEC: ThemeVisualSpec = withThemeCapabilities({
  id: 'neo-brutalism',
  label: 'Neo-Brutalism',
  fontFamily: "'Inter', sans-serif",
  headingFont: "'Archivo Black', sans-serif",
  defaultColor: 'default-violet',
  borderWidth: '2px',
  borderStyle: 'solid',
  bgPattern: 'none',
  bgSize: 'auto',
  shape: { borderRadius: 0, buttonRadius: 0, inputRadius: 0 },
  shadows: [
    'none',
    '2px 2px 0px currentColor',
    '4px 4px 0px currentColor',
    '6px 6px 0px currentColor',
  ],
  capabilities: {
    hasAnimatedBackground: true,
    hasMascot: false,
    fxQuality: 2,
    backgroundMode: 'canvas',
  },
});

export const STEAMPUNK_VISUAL_SPEC: ThemeVisualSpec = withThemeCapabilities({
  id: 'steampunk',
  label: 'Steampunk',
  fontFamily: "'Courier Prime', monospace",
  headingFont: "'Rye', serif",
  defaultColor: 'black-gold',
  borderWidth: '4px',
  borderStyle: 'double',
  bgPattern: 'none',
  bgSize: 'auto',
  shape: { borderRadius: 6, buttonRadius: 4, inputRadius: 2 },
  shadows: ['none', '0 2px 4px rgba(0,0,0,0.4)', '0 4px 12px rgba(0,0,0,0.6)', '0 12px 32px rgba(0,0,0,0.8)'],
  capabilities: {
    hasAnimatedBackground: true,
    hasMascot: false,
    fxQuality: 2,
    backgroundMode: 'canvas',
  },
});

export const MINIMALISTIC_VISUAL_SPEC: ThemeVisualSpec = withThemeCapabilities({
  id: 'minimalistic',
  label: 'Minimalistic',
  fontFamily: "'Inter', sans-serif",
  headingFont: "'Inter', sans-serif",
  defaultColor: 'chinese-ink',
  borderWidth: '1px',
  borderStyle: 'solid',
  bgPattern: 'none',
  bgSize: 'auto',
  shape: { borderRadius: 6, buttonRadius: 6, inputRadius: 6 },
  shadows: ['none', '0 1px 2px 0 rgba(0, 0, 0, 0.05)', '0 4px 6px -1px rgba(0, 0, 0, 0.1)', '0 10px 15px -3px rgba(0, 0, 0, 0.1)'],
  capabilities: {
    hasAnimatedBackground: true,
    hasMascot: false,
    fxQuality: 1,
    backgroundMode: 'canvas',
  },
});

export const CYBERPUNK_VISUAL_SPEC: ThemeVisualSpec = withThemeCapabilities({
  id: 'cyberpunk',
  label: 'Cyberpunk',
  fontFamily: "'Rajdhani', sans-serif",
  headingFont: "'Orbitron', sans-serif",
  defaultColor: 'neon-spectral',
  borderWidth: '1px',
  borderStyle: 'solid',
  bgPattern: 'none',
  bgSize: 'auto',
  shape: { borderRadius: 2, buttonRadius: 2, inputRadius: 2 },
  shadows: ['none', '0 0 5px var(--color-accent-primary)', '0 0 10px var(--color-accent-primary)', '0 0 20px var(--color-accent-primary)'],
  capabilities: {
    hasAnimatedBackground: true,
    hasMascot: true,
    fxQuality: 3,
    backgroundMode: 'canvas',
  },
});

export const ROYAL_VISUAL_SPEC: ThemeVisualSpec = withThemeCapabilities({
  id: 'royal',
  label: 'Royal',
  fontFamily: "'Lato', sans-serif",
  headingFont: "'Playfair Display', serif",
  defaultColor: 'red-gold',
  borderWidth: '1px',
  borderStyle: 'solid',
  bgPattern: 'none',
  bgSize: 'auto',
  shape: { borderRadius: 4, buttonRadius: 4, inputRadius: 4 },
  shadows: ['none', '0 4px 6px rgba(0,0,0,0.1)', '0 10px 15px rgba(0,0,0,0.15)', '0 20px 25px rgba(0,0,0,0.2)'],
  capabilities: {
    hasAnimatedBackground: true,
    hasMascot: true,
    fxQuality: 2,
    backgroundMode: 'canvas',
  },
});

export const CHIBI_VISUAL_SPEC: ThemeVisualSpec = withThemeCapabilities({
  id: 'chibi',
  label: 'Chibi',
  fontFamily: "'Fredoka', sans-serif",
  headingFont: "'Fredoka', sans-serif",
  defaultColor: 'soft-pink',
  borderWidth: '3px',
  borderStyle: 'solid',
  bgPattern: 'none',
  bgSize: 'auto',
  shape: { borderRadius: 14, buttonRadius: 12, inputRadius: 12 },
  shadows: ['none', '0 4px 0 rgba(0,0,0,0.1)', '0 6px 0 rgba(0,0,0,0.15)', '0 8px 0 rgba(0,0,0,0.2)'],
  capabilities: {
    hasAnimatedBackground: true,
    hasMascot: true,
    fxQuality: 2,
    backgroundMode: 'canvas',
  },
});

export const POST_APOCALYPTIC_VISUAL_SPEC: ThemeVisualSpec = withThemeCapabilities({
  id: 'post-apocalyptic',
  label: 'Post-Apocalyptic',
  fontFamily: "'Courier Prime', monospace",
  headingFont: "'Special Elite', cursive",
  defaultColor: 'black-gold',
  borderWidth: '2px',
  borderStyle: 'dashed',
  bgPattern: 'none',
  bgSize: 'auto',
  shape: { borderRadius: 2, buttonRadius: 0, inputRadius: 0 },
  shadows: ['none', '2px 2px 0px rgba(0,0,0,0.6)', '4px 4px 0px rgba(0,0,0,0.6)', '6px 6px 0px rgba(0,0,0,0.6)'],
  capabilities: {
    hasAnimatedBackground: true,
    hasMascot: false,
    fxQuality: 2,
    backgroundMode: 'canvas',
  },
});

export const THEME_VISUAL_SPECS: Record<ThemeMode, ThemeVisualSpec> = {
  'neo-brutalism': NEO_BRUTALISM_VISUAL_SPEC,
  'steampunk': STEAMPUNK_VISUAL_SPEC,
  'minimalistic': MINIMALISTIC_VISUAL_SPEC,
  'cyberpunk': CYBERPUNK_VISUAL_SPEC,
  'royal': ROYAL_VISUAL_SPEC,
  'chibi': CHIBI_VISUAL_SPEC,
  'post-apocalyptic': POST_APOCALYPTIC_VISUAL_SPEC,
};

export const THEME_VISUAL_SPEC_LIST: ThemeVisualSpec[] = [
  NEO_BRUTALISM_VISUAL_SPEC,
  STEAMPUNK_VISUAL_SPEC,
  MINIMALISTIC_VISUAL_SPEC,
  CYBERPUNK_VISUAL_SPEC,
  ROYAL_VISUAL_SPEC,
  CHIBI_VISUAL_SPEC,
  POST_APOCALYPTIC_VISUAL_SPEC,
];
