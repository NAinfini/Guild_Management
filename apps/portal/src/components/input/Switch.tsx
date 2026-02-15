import * as React from "react";
import MuiSwitch, { SwitchProps as MuiSwitchProps } from "@/ui-bridge/material/Switch";
import { useTheme, type SxProps, type Theme } from "@/ui-bridge/material/styles";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<HTMLButtonElement, MuiSwitchProps>(
  ({ className, sx, ...props }, ref) => {
    const theme = useTheme();
    const custom = (theme as any)?.custom ?? {};
    const input = custom?.components?.input ?? {};
    const segmented = custom?.components?.segmentedControl ?? {};
    const semanticSurface = custom?.semantic?.surface ?? {};
    const semanticBorder = custom?.semantic?.border ?? {};
    const semanticInteractive = custom?.semantic?.interactive ?? {};
    const semanticText = custom?.semantic?.text ?? {};

    const uncheckedTrackBg =
      input.bg ??
      semanticSurface.sunken ??
      "var(--cmp-input-bg, var(--sys-surface-sunken))";
    const accentColor = semanticInteractive.accent ?? "var(--sys-interactive-accent)";
    const switchSurfaceBase = semanticSurface.sunken ?? "var(--sys-surface-sunken)";
    const checkedTrackBg =
      segmented.selectedBg ??
      `color-mix(in srgb, ${accentColor} 72%, ${switchSurfaceBase})`;
    const trackBorder =
      semanticBorder.subtle ??
      input.border ??
      "var(--cmp-input-border, var(--sys-border-subtle, var(--sys-border-default)))";
    const checkedTrackBorder = accentColor;
    const thumbBg =
      semanticSurface.raised ??
      "var(--sys-surface-elevated)";
    const thumbBorder =
      semanticBorder.default ??
      "var(--sys-border-default)";
    const focusRing =
      semanticInteractive.focusRing ??
      "var(--sys-interactive-focus-ring)";
    const disabledTrackBg =
      semanticSurface.panel ??
      theme.palette.action.disabledBackground;
    const disabledThumbBg =
      semanticText.tertiary ??
      theme.palette.action.disabled;
    const onStateColor =
      custom?.status?.success?.main ??
      "var(--color-status-success, var(--sys-interactive-accent))";
    const baseSx: SxProps<Theme> = {
      width: 46,
      height: 28,
      padding: 0,
      border: "none !important",
      borderRadius: "999px !important",
      backgroundColor: "transparent",
      '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: '2px',
        transitionDuration: '200ms',
        '& .MuiSwitch-thumb': {
          backgroundColor: thumbBg,
          borderColor: thumbBorder,
        },
        '&.Mui-checked': {
          transform: 'translateX(20px)',
          color: checkmarkColorFromTheme(theme, thumbBg),
          '& .MuiSwitch-thumb': {
            backgroundColor: checkmarkColorFromTheme(theme, thumbBg),
            borderColor: `color-mix(in srgb, ${onStateColor} 40%, ${thumbBorder})`,
          },
          '& + .MuiSwitch-track': {
            backgroundColor: checkedTrackBg,
            borderColor: `color-mix(in srgb, ${checkedTrackBorder} 62%, ${trackBorder})`,
            opacity: 1,
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${onStateColor} 38%, transparent)`,
          },
          '&.Mui-disabled + .MuiSwitch-track': {
            backgroundColor: disabledTrackBg,
            borderColor: trackBorder,
            opacity: 0.6,
          },
        },
        '&.Mui-focusVisible .MuiSwitch-thumb': {
          boxShadow: `0 0 0 2px ${focusRing}`,
        },
        '&.Mui-disabled .MuiSwitch-thumb': {
          backgroundColor: disabledThumbBg,
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          backgroundColor: disabledTrackBg,
          borderColor: trackBorder,
          opacity: 0.5,
        },
      },
      '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 22,
        height: 22,
        backgroundColor: thumbBg,
        border: `1px solid ${thumbBorder}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.18)',
      },
      '& .MuiSwitch-track': {
        borderRadius: 999,
        backgroundColor: uncheckedTrackBg,
        border: `1px solid ${trackBorder}`,
        opacity: 1,
        transition: 'background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
      },
    };

    const mergedSx: SxProps<Theme> = Array.isArray(sx)
      ? [baseSx, ...sx]
      : sx
        ? [baseSx, sx]
        : baseSx;

    return (
      <MuiSwitch
        ref={ref}
        data-ui="input"
        className={cn("nexus-switch", className)}
        sx={mergedSx}
        {...props}
      />
    );
  }
);
Switch.displayName = "Switch";

export { Switch };

function checkmarkColorFromTheme(theme: Theme, fallback: string): string {
  const themeCustom = (theme as any)?.custom ?? {};
  return (
    themeCustom?.semantic?.surface?.raised ??
    themeCustom?.semantic?.text?.onAccent ??
    fallback
  );
}
