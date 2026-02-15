import React, { createContext, forwardRef, useContext, useMemo } from 'react';

/**
 * Temporary MUI compatibility shim used for phased migration.
 * Purpose: keep runtime/build operational while components are rewritten.
 */

type AnyProps = Record<string, any>;
type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface Theme {
  [key: string]: any;
}
export interface ThemeOptions {
  [key: string]: any;
}
export type SxProps<T = Theme> = AnyProps;
export type AlertColor = 'error' | 'warning' | 'info' | 'success';
export type SelectChangeEvent<T = string> = React.ChangeEvent<HTMLSelectElement> & {
  target: EventTarget & HTMLSelectElement & { value: T };
};

export type ButtonProps = AnyProps;
export type AvatarProps = AnyProps;
export type CheckboxProps = AnyProps;
export type DialogProps = AnyProps;
export type DividerProps = AnyProps;
export type FormLabelProps = AnyProps;
export type IconButtonProps = AnyProps;
export type InputBaseProps = AnyProps;
export type LinearProgressProps = AnyProps;
export type MenuItemProps = AnyProps;
export type PaperProps = AnyProps;
export type PopoverProps = AnyProps;
export type RadioGroupProps = AnyProps;
export type RadioProps = AnyProps;
export type SelectProps = AnyProps;
export type SliderProps = AnyProps;
export type SwitchProps = AnyProps;
export type ToggleButtonGroupProps = AnyProps;
export type ToggleButtonProps = AnyProps;
export type TooltipProps = AnyProps;
export type AccordionProps = AnyProps;

const DEFAULT_BREAKPOINT_VALUES: Record<BreakpointKey, number> = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

const DEFAULT_Z_INDEX = {
  mobileStepper: 1000,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};

const normalizeHex = (value: string) => value.replace('#', '');
const getContrastTextFallback = (input: string) => {
  const raw = typeof input === 'string' ? normalizeHex(input.trim()) : '';
  const hex = raw.length === 3 ? raw.split('').map((ch) => ch + ch).join('') : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return '#ffffff';
  }
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.6 ? '#000000' : '#ffffff';
};

const resolveBreakpointValue = (
  values: Record<BreakpointKey, number>,
  key: BreakpointKey | string | number,
) => {
  if (typeof key === 'number') {
    return key;
  }
  if (Object.prototype.hasOwnProperty.call(values, key)) {
    return values[key as BreakpointKey];
  }
  return values.md;
};

const normalizeBreakpoints = (breakpoints: AnyProps = {}) => {
  const values: Record<BreakpointKey, number> = {
    ...DEFAULT_BREAKPOINT_VALUES,
    ...(breakpoints.values || {}),
  };

  const down =
    typeof breakpoints.down === 'function'
      ? breakpoints.down
      : (key: BreakpointKey | string | number) => `(max-width:${resolveBreakpointValue(values, key) - 0.05}px)`;
  const up =
    typeof breakpoints.up === 'function'
      ? breakpoints.up
      : (key: BreakpointKey | string | number) => `(min-width:${resolveBreakpointValue(values, key)}px)`;
  const between =
    typeof breakpoints.between === 'function'
      ? breakpoints.between
      : (start: BreakpointKey | string | number, end: BreakpointKey | string | number) =>
          `${up(start)} and ${down(end)}`;

  return {
    ...breakpoints,
    values,
    down,
    up,
    between,
  };
};

const normalizePalette = (palette: AnyProps = {}) => {
  const common = {
    black: '#000000',
    white: '#ffffff',
    ...(palette.common || {}),
  };

  const getContrastText =
    typeof palette.getContrastText === 'function'
      ? palette.getContrastText
      : (color: string) => getContrastTextFallback(color);

  return {
    ...palette,
    common,
    divider: palette.divider ?? '#e0e0e0',
    text: {
      primary: '#111111',
      secondary: '#616161',
      ...(palette.text || {}),
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
      ...(palette.background || {}),
    },
    action: {
      active: '#1f1f1f',
      hover: 'rgba(0,0,0,0.04)',
      selected: 'rgba(0,0,0,0.08)',
      disabled: 'rgba(0,0,0,0.26)',
      disabledBackground: 'rgba(0,0,0,0.12)',
      focus: 'rgba(0,0,0,0.12)',
      ...(palette.action || {}),
    },
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
      ...(palette.primary || {}),
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
      contrastText: '#ffffff',
      ...(palette.secondary || {}),
    },
    error: {
      main: '#d32f2f',
      ...(palette.error || {}),
    },
    warning: {
      main: '#ed6c02',
      ...(palette.warning || {}),
    },
    info: {
      main: '#0288d1',
      ...(palette.info || {}),
    },
    success: {
      main: '#2e7d32',
      ...(palette.success || {}),
    },
    getContrastText,
  };
};

export const createTheme = (options: ThemeOptions = {}) => ({
  ...options,
  breakpoints: normalizeBreakpoints(options.breakpoints),
  palette: normalizePalette(options.palette),
  zIndex: {
    ...DEFAULT_Z_INDEX,
    ...(options.zIndex || {}),
  },
});

const themeContext = createContext<Theme>(createTheme({}));

const toStyleObject = (sx: any): React.CSSProperties => {
  if (!sx) return {};
  if (Array.isArray(sx)) return Object.assign({}, ...sx.filter((s) => s && typeof s === 'object'));
  if (typeof sx === 'function') return {};
  if (typeof sx === 'object') return sx as React.CSSProperties;
  return {};
};

const withCommonProps = (props: AnyProps) => {
  const {
    sx,
    variant,
    color,
    size,
    fullWidth,
    disableElevation,
    disableRipple,
    disableFocusRipple,
    startIcon,
    endIcon,
    in: inProp,
    open,
    keepMounted,
    transitionDuration,
    slotProps,
    slots,
    ownerState,
    disablePortal,
    disableScrollLock,
    TransitionComponent,
    TransitionProps,
    anchorEl,
    container,
    BackdropProps,
    BackdropComponent,
    ModalProps,
    ...rest
  } = props;

  if (inProp === false || open === false) {
    return { hidden: true, rest, sx };
  }

  return { hidden: false, rest, sx };
};

const createShimComponent = (tag: keyof React.JSX.IntrinsicElements = 'div') =>
  forwardRef<any, AnyProps>(function ShimComponent(props, ref) {
    const { component, as, children, style, className, startIcon, endIcon, ...rest } = props;
    const { hidden, rest: forwarded, sx } = withCommonProps(rest);
    const Element: any = as || component || tag;
    const composedChildren = [startIcon, children, endIcon].filter(
      (item) => item !== null && item !== undefined && item !== false,
    );
    const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
    const isVoidElement = typeof Element === 'string' && voidTags.has(Element);

    if (hidden) return null;

    const elementProps = {
      ref,
      className,
      style: { ...toStyleObject(sx), ...(style || {}) },
      ...forwarded,
    };

    if (isVoidElement || composedChildren.length === 0) {
      return React.createElement(Element, elementProps);
    }

    return React.createElement(Element, elementProps, ...composedChildren);
  });

export const ThemeProvider = ({ theme, children }: AnyProps) => {
  // Always normalize breakpoints so callers can safely use theme.breakpoints.down/up/between.
  const value = useMemo(() => createTheme(theme || {}), [theme]);
  return React.createElement(themeContext.Provider, { value }, children);
};

export const StyledEngineProvider = ({ children }: AnyProps) => React.createElement(React.Fragment, null, children);
export const CssBaseline = () => null;

export const useTheme = () => useContext(themeContext) || {};
export const useMediaQuery = (query: string) => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia(query).matches;
  } catch {
    return false;
  }
};

export const alpha = (color: string, value: number) => 'color-mix(in srgb, ' + color + ' ' + ((value || 0) * 100) + '%, transparent)';

export const styled = (Base: any) => (styles: any) => {
  const Styled = forwardRef<any, AnyProps>(function StyledComponent(props, ref) {
    const computed = typeof styles === 'function' ? styles(props) : styles;
    const { style, ...rest } = props;
    const Component = Base || 'div';
    return React.createElement(Component, { ref, ...rest, style: { ...(computed || {}), ...(style || {}) } });
  });
  return Styled;
};

export const GlobalStyles = (_props: AnyProps) => null;

export const Box = createShimComponent('div');
export const Paper = createShimComponent('div');
export const Card = createShimComponent('div');
export const CardContent = createShimComponent('div');
export const CardHeader = createShimComponent('div');
export const CardActionArea = createShimComponent('div');
export const Stack = createShimComponent('div');
export const Grid = createShimComponent('div');
export const Toolbar = createShimComponent('div');
export const AppBar = createShimComponent('header');
export const Badge = createShimComponent('span');
export const Chip = createShimComponent('span');
export const Divider = createShimComponent('hr');
export const Typography = createShimComponent('span');
export const Link = createShimComponent('a');
export const Avatar = createShimComponent('div');
export const Skeleton = createShimComponent('div');
export const Alert = createShimComponent('div');
export const AlertTitle = createShimComponent('strong');
export const Snackbar = createShimComponent('div');
export const Dialog = createShimComponent('div');
export const DialogTitle = createShimComponent('h2');
export const DialogContent = createShimComponent('div');
export const DialogContentText = createShimComponent('p');
export const DialogActions = createShimComponent('div');
export const Drawer = createShimComponent('aside');
export const Popover = createShimComponent('div');
export const Menu = createShimComponent('div');
export const MenuItem = createShimComponent('button');
export const Pagination = createShimComponent('nav');
export const FormControl = createShimComponent('div');
export const FormGroup = createShimComponent('div');
export const FormHelperText = createShimComponent('small');
export const FormLabel = createShimComponent('label');
export const InputLabel = createShimComponent('label');
export const InputBase = createShimComponent('input');
export const InputAdornment = createShimComponent('span');
export const Input = createShimComponent('input');
export const List = createShimComponent('ul');
export const ListItem = createShimComponent('li');
export const ListItemAvatar = createShimComponent('div');
export const ListItemIcon = createShimComponent('span');
export const ListItemText = createShimComponent('span');
export const ListItemButton = createShimComponent('button');
export const Table = createShimComponent('table');
export const TableBody = createShimComponent('tbody');
export const TableCell = createShimComponent('td');
export const TableContainer = createShimComponent('div');
export const TableHead = createShimComponent('thead');
export const TableRow = createShimComponent('tr');
export const Tabs = createShimComponent('div');
export const Tab = createShimComponent('button');
export const ToggleButtonGroup = createShimComponent('div');
export const ToggleButton = createShimComponent('button');
export const ImageList = createShimComponent('div');
export const ImageListItem = createShimComponent('div');
export const LinearProgress = createShimComponent('div');

export const Button = createShimComponent('button');
export const ButtonBase = createShimComponent('button');
export const ButtonGroup = createShimComponent('div');
export const IconButton = createShimComponent('button');
export const Select = createShimComponent('select');
export const Switch = forwardRef<any, AnyProps>(function SwitchComponent(props, ref) {
  return React.createElement('input', { ref, type: 'checkbox', ...(props || {}) });
});
export const Checkbox = forwardRef<any, AnyProps>(function CheckboxComponent(props, ref) {
  return React.createElement('input', { ref, type: 'checkbox', ...(props || {}) });
});
export const Radio = forwardRef<any, AnyProps>(function RadioComponent(props, ref) {
  return React.createElement('input', { ref, type: 'radio', ...(props || {}) });
});
export const RadioGroup = createShimComponent('div');
export const TextField = createShimComponent('input');

export const Accordion = createShimComponent('div');
export const AccordionSummary = createShimComponent('div');
export const AccordionDetails = createShimComponent('div');
export const Collapse = createShimComponent('div');
export const Fade = createShimComponent('div');
export const Slide = createShimComponent('div');
export const Zoom = createShimComponent('div');

/** Auto-generated compatibility exports for currently imported MUI symbols. */
export const FormControlLabel = createShimComponent('label');
export const Tooltip = createShimComponent('div');

export default { ThemeProvider, StyledEngineProvider, CssBaseline };
