import * as React from "react";
import MuiCheckbox, { CheckboxProps } from "@/ui-bridge/material/Checkbox";
import Box from "@/ui-bridge/material/Box";
import CheckIcon from "@/ui-bridge/icons-material/Check";
import { useTheme, type SxProps, type Theme } from "@/ui-bridge/material/styles";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, sx, ...props }, ref) => {
    const theme = useTheme();
    const custom = (theme as any)?.custom ?? {};
    const semanticText = custom?.semantic?.text ?? {};
    const semanticSurface = custom?.semantic?.surface ?? {};
    const semanticInteractive = custom?.semantic?.interactive ?? {};
    const semanticBorder = custom?.semantic?.border ?? {};

    const defaultColor = semanticText.secondary ?? theme.palette.text.secondary;
    const checkedColor =
      custom?.status?.success?.main ??
      semanticInteractive.accent ??
      "var(--color-status-success, var(--sys-interactive-accent))";
    const focusRing =
      semanticInteractive.focusRing ?? "var(--sys-interactive-focus-ring)";
    const boxBg =
      semanticSurface.sunken ?? "var(--cmp-input-bg, var(--sys-surface-sunken))";
    const boxBorder =
      semanticBorder.default ?? "var(--cmp-input-border, var(--sys-border-default))";
    const checkmarkColor =
      semanticSurface.raised ?? "var(--sys-text-on-accent, #ffffff)";

    const baseSx: SxProps<Theme> = {
      p: 0.25,
      borderRadius: "6px",
      color: defaultColor,
      transition: "color 140ms ease",
      "& .MuiTouchRipple-root": { display: "none" },
      "& .nexus-checkbox-box": {
        width: 16,
        height: 16,
        borderRadius: "4px",
        border: `1.5px solid ${boxBorder}`,
        boxSizing: "border-box",
        backgroundColor: boxBg,
        transition: "background-color 140ms ease, border-color 140ms ease",
      },
      "& .nexus-checkbox-box--checked": {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderColor: "currentColor",
        backgroundColor: "currentColor",
        color: checkmarkColor,
      },
      "&.Mui-checked": {
        color: checkedColor,
      },
      "&.Mui-focusVisible": {
        outline: `2px solid ${focusRing}`,
        outlineOffset: 2,
      },
      "&.Mui-disabled": {
        opacity: 0.45,
      },
    };

    const mergedSx: SxProps<Theme> = Array.isArray(sx)
      ? [baseSx, ...sx]
      : sx
        ? [baseSx, sx]
        : baseSx;

    return (
      <MuiCheckbox
        ref={ref}
        disableRipple
        icon={<Box className="nexus-checkbox-box" />}
        checkedIcon={
          <Box className="nexus-checkbox-box nexus-checkbox-box--checked">
            <CheckIcon sx={{ fontSize: 12 }} />
          </Box>
        }
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm p-0 disabled:cursor-not-allowed",
          className
        )}
        sx={mergedSx}
        {...props}
      />
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
