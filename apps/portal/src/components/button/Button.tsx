import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import MuiButton, { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import { cn } from "@/lib/utils";

function resolveDocumentTheme(): string | null {
  if (typeof document === "undefined") return null;
  return document.documentElement.getAttribute("data-theme");
}

function resolveScopedTheme(element: Element | null): string | null {
  if (typeof document === "undefined") return null;
  const scopedTheme = element?.closest('[data-theme]')?.getAttribute("data-theme");
  if (scopedTheme) return scopedTheme;
  const bodyTheme = document.body.querySelector('[data-theme]')?.getAttribute("data-theme");
  if (bodyTheme) return bodyTheme;
  return resolveDocumentTheme();
}

function isReducedMotionActive(): boolean {
  if (typeof document === "undefined") return false;
  if (document.documentElement.getAttribute("data-reduced-motion") === "true") return true;
  const mode = document.documentElement.getAttribute("data-motion-mode");
  return mode === "off" || mode === "toned-down";
}

const buttonVariants = cva(
  "ui-button inline-flex items-center justify-center whitespace-nowrap font-medium disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "",
        destructive: "",
        outline: "",
        secondary: "",
        ghost: "",
        link: "underline-offset-4 hover:underline",
      },
      size: {
        default: "text-sm",
        sm: "text-sm",
        lg: "text-base",
        icon: "w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends Omit<MuiButtonProps, "variant" | "size" | "color">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const variantSxMap: Record<NonNullable<ButtonProps["variant"]>, MuiButtonProps["sx"]> = {
  default: {
    backgroundColor: "var(--cmp-button-bg)",
    color: "var(--cmp-button-text)",
    border: "1px solid var(--cmp-button-border)",
    "&:hover": {
      backgroundColor: "var(--cmp-button-hover-bg)",
      borderColor: "var(--cmp-button-border)",
    },
    "&:active": {
      backgroundColor: "var(--cmp-button-active-bg)",
    },
    "&.Mui-disabled": {
      backgroundColor: "var(--cmp-button-disabled-bg, color-mix(in srgb, var(--sys-surface-elevated) 84%, var(--cmp-button-bg) 16%))",
      color: "var(--cmp-button-disabled-text, var(--sys-text-secondary))",
      borderColor: "var(--cmp-button-disabled-border, color-mix(in srgb, var(--cmp-button-border) 62%, var(--sys-border-default)))",
      opacity: 1,
    },
  },
  destructive: {
    backgroundColor: "var(--color-status-error)",
    color: "var(--color-text-inverse)",
    border: "1px solid color-mix(in srgb, var(--color-status-error) 72%, transparent)",
    "&:hover": {
      backgroundColor: "color-mix(in srgb, var(--color-status-error) 86%, black)",
    },
    "&:active": {
      backgroundColor: "color-mix(in srgb, var(--color-status-error) 76%, black)",
    },
    "&.Mui-disabled": {
      backgroundColor: "color-mix(in srgb, var(--color-status-error) 38%, transparent)",
      color: "color-mix(in srgb, var(--color-text-inverse) 60%, transparent)",
    },
  },
  outline: {
    backgroundColor: "transparent",
    color: "var(--sys-text-primary)",
    border: "1px solid var(--cmp-input-border)",
    "&:hover": {
      backgroundColor: "var(--sys-interactive-hover)",
      borderColor: "var(--sys-border-strong)",
    },
    "&:active": {
      backgroundColor: "var(--sys-interactive-active)",
    },
    "&.Mui-disabled": {
      borderColor: "color-mix(in srgb, var(--cmp-input-border) 50%, transparent)",
      color: "var(--sys-text-tertiary)",
    },
  },
  secondary: {
    backgroundColor: "var(--sys-surface-elevated)",
    color: "var(--sys-text-primary)",
    border: "1px solid var(--sys-border-default)",
    "&:hover": {
      backgroundColor: "color-mix(in srgb, var(--sys-surface-elevated) 72%, var(--sys-interactive-hover))",
      borderColor: "var(--sys-border-strong)",
    },
    "&:active": {
      backgroundColor: "color-mix(in srgb, var(--sys-surface-elevated) 62%, var(--sys-interactive-active))",
    },
    "&.Mui-disabled": {
      color: "var(--sys-text-tertiary)",
      borderColor: "color-mix(in srgb, var(--sys-border-default) 55%, transparent)",
    },
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--sys-text-primary)",
    border: "1px solid transparent",
    "&:hover": {
      backgroundColor: "var(--sys-interactive-hover)",
    },
    "&:active": {
      backgroundColor: "var(--sys-interactive-active)",
    },
    "&.Mui-disabled": {
      color: "var(--sys-text-tertiary)",
    },
  },
  link: {
    backgroundColor: "transparent",
    color: "var(--sys-text-link)",
    border: "1px solid transparent",
    borderBottom: "1px dashed color-mix(in srgb, var(--sys-text-link) 60%, transparent)",
    minWidth: "unset",
    paddingInline: "0.35rem",
    "&:hover": {
      color: "var(--sys-text-link)",
      backgroundColor: "color-mix(in srgb, var(--sys-interactive-hover) 55%, transparent)",
      borderBottomColor: "var(--sys-text-link)",
    },
    "&:active": {
      color: "var(--sys-text-link)",
      borderBottomStyle: "solid",
    },
    "&.Mui-disabled": {
      color: "color-mix(in srgb, var(--sys-text-link) 55%, transparent)",
      borderBottomColor: "color-mix(in srgb, var(--sys-text-link) 28%, transparent)",
    },
  },
};

const sizeSxMap: Record<NonNullable<ButtonProps["size"]>, MuiButtonProps["sx"]> = {
  default: {
    minHeight: "2.375rem",
    paddingInline: "0.9rem",
    paddingBlock: "0.42rem",
  },
  sm: {
    minHeight: "2.125rem",
    paddingInline: "0.68rem",
    paddingBlock: "0.3rem",
  },
  lg: {
    minHeight: "2.625rem",
    paddingInline: "1.3rem",
    paddingBlock: "0.52rem",
  },
  icon: {
    width: "2.375rem",
    minWidth: "2.375rem",
    minHeight: "2.375rem",
    padding: "0.42rem",
  },
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      sx,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseUp,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const buttonRef = React.useRef<HTMLButtonElement | null>(null);
    const assignButtonRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        buttonRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );
    const resolvedVariant = (variant ?? "default") as NonNullable<ButtonProps["variant"]>;
    const resolvedSize = (size ?? "default") as NonNullable<ButtonProps["size"]>;
    const disabled = Boolean(props.disabled);
    const [activeTheme, setActiveTheme] = React.useState<string | null>(() => resolveDocumentTheme());
    const minimalisticThemeActive = activeTheme === "minimalistic";
    const cyberpunkThemeActive = activeTheme === "cyberpunk";
    const neoThemeActive = activeTheme === "neo-brutalism";
    const royalThemeActive = activeTheme === "royal";
    const chibiThemeActive = activeTheme === "chibi";
    const postApocalypticThemeActive = activeTheme === "post-apocalyptic";
    const successSignal = (props as Record<string, unknown>)["data-success-event"];
    const chibiSuccessEvent =
      successSignal === true || successSignal === "" || successSignal === "true";
    const glowSignal = (props as Record<string, unknown>)["data-glow-event"];
    const wastelandGlowEvent =
      glowSignal === true || glowSignal === "" || glowSignal === "true";
    const [cyberBorderHunt, setCyberBorderHunt] = React.useState(false);
    const [neoStamp, setNeoStamp] = React.useState(false);
    const [neoClunk, setNeoClunk] = React.useState(false);
    const [royalVelvetPress, setRoyalVelvetPress] = React.useState(false);
    const [royalSheenSweep, setRoyalSheenSweep] = React.useState(false);
    const [chibiConfettiBurst, setChibiConfettiBurst] = React.useState(false);
    const [wastelandCrackBleed, setWastelandCrackBleed] = React.useState(false);
    const cyberBorderTimerRef = React.useRef<number | null>(null);
    const neoStampTimerRef = React.useRef<number | null>(null);
    const neoClunkTimerRef = React.useRef<number | null>(null);
    const royalPressTimerRef = React.useRef<number | null>(null);
    const royalSheenTimerRef = React.useRef<number | null>(null);
    const chibiConfettiTimerRef = React.useRef<number | null>(null);
    const wastelandCrackTimerRef = React.useRef<number | null>(null);
    let muiVariant: MuiButtonProps["variant"] = "contained";
    let muiColor: MuiButtonProps["color"] = "primary";

    switch (resolvedVariant) {
      case "destructive":
        muiColor = "error";
        break;
      case "outline":
        muiVariant = "outlined";
        break;
      case "secondary":
        muiColor = "secondary";
        break;
      case "ghost":
        muiVariant = "text";
        muiColor = "inherit";
        break;
      case "link":
        muiVariant = "text";
        break;
      default:
        break;
    }

    const muiSize = resolvedSize === "sm" ? "small" : resolvedSize === "lg" ? "large" : "medium";
    const _asChild = asChild; // kept for API compatibility

    React.useEffect(() => () => {
      if (cyberBorderTimerRef.current !== null) {
        window.clearTimeout(cyberBorderTimerRef.current);
      }
      if (neoStampTimerRef.current !== null) {
        window.clearTimeout(neoStampTimerRef.current);
      }
      if (neoClunkTimerRef.current !== null) {
        window.clearTimeout(neoClunkTimerRef.current);
      }
      if (royalPressTimerRef.current !== null) {
        window.clearTimeout(royalPressTimerRef.current);
      }
      if (royalSheenTimerRef.current !== null) {
        window.clearTimeout(royalSheenTimerRef.current);
      }
      if (chibiConfettiTimerRef.current !== null) {
        window.clearTimeout(chibiConfettiTimerRef.current);
      }
      if (wastelandCrackTimerRef.current !== null) {
        window.clearTimeout(wastelandCrackTimerRef.current);
      }
    }, []);

    React.useLayoutEffect(() => {
      const nextTheme = resolveScopedTheme(buttonRef.current);
      setActiveTheme((previous) => (previous === nextTheme ? previous : nextTheme));
    });

    const handleMouseEnter: React.MouseEventHandler<HTMLButtonElement> = (event) => {
      onMouseEnter?.(event);
      if (!disabled) {
        if (royalThemeActive && !isReducedMotionActive()) {
          setRoyalSheenSweep(true);
          if (royalSheenTimerRef.current !== null) {
            window.clearTimeout(royalSheenTimerRef.current);
          }
          royalSheenTimerRef.current = window.setTimeout(() => {
            setRoyalSheenSweep(false);
          }, 220);
        }
      }
    };

    const handleMouseLeave: React.MouseEventHandler<HTMLButtonElement> = (event) => {
      onMouseLeave?.(event);
    };

    const handleMouseDown: React.MouseEventHandler<HTMLButtonElement> = (event) => {
      onMouseDown?.(event);
      if (!disabled) {
        const reducedMotionNow = isReducedMotionActive();
        if (cyberpunkThemeActive && !reducedMotionNow) {
          setCyberBorderHunt(true);
          if (cyberBorderTimerRef.current !== null) {
            window.clearTimeout(cyberBorderTimerRef.current);
          }
          cyberBorderTimerRef.current = window.setTimeout(() => {
            setCyberBorderHunt(false);
          }, 200);
        }
        if (neoThemeActive) {
          setNeoStamp(true);
          if (neoStampTimerRef.current !== null) {
            window.clearTimeout(neoStampTimerRef.current);
          }
          neoStampTimerRef.current = window.setTimeout(() => {
            setNeoStamp(false);
          }, 220);
          if (!reducedMotionNow) {
            setNeoClunk(true);
            if (neoClunkTimerRef.current !== null) {
              window.clearTimeout(neoClunkTimerRef.current);
            }
            neoClunkTimerRef.current = window.setTimeout(() => {
              setNeoClunk(false);
            }, 140);
          }
        }
        if (royalThemeActive) {
          setRoyalVelvetPress(true);
          if (royalPressTimerRef.current !== null) {
            window.clearTimeout(royalPressTimerRef.current);
          }
          royalPressTimerRef.current = window.setTimeout(() => {
            setRoyalVelvetPress(false);
          }, 240);
        }
        if (chibiThemeActive && chibiSuccessEvent && !reducedMotionNow) {
          setChibiConfettiBurst(true);
          if (chibiConfettiTimerRef.current !== null) {
            window.clearTimeout(chibiConfettiTimerRef.current);
          }
          chibiConfettiTimerRef.current = window.setTimeout(() => {
            setChibiConfettiBurst(false);
          }, 260);
        }
        if (postApocalypticThemeActive && wastelandGlowEvent && !reducedMotionNow) {
          setWastelandCrackBleed(true);
          if (wastelandCrackTimerRef.current !== null) {
            window.clearTimeout(wastelandCrackTimerRef.current);
          }
          wastelandCrackTimerRef.current = window.setTimeout(() => {
            setWastelandCrackBleed(false);
          }, 240);
        }
      }
    };

    const handleMouseUp: React.MouseEventHandler<HTMLButtonElement> = (event) => {
      onMouseUp?.(event);
    };

    const handleFocus: React.FocusEventHandler<HTMLButtonElement> = (event) => {
      onFocus?.(event);
    };

    const handleBlur: React.FocusEventHandler<HTMLButtonElement> = (event) => {
      onBlur?.(event);
    };

    return (
      <MuiButton
        ref={assignButtonRef}
        variant={muiVariant}
        color={muiColor}
        size={muiSize}
        data-theme-signature={
          royalVelvetPress
            ? "royal-velvet-press"
          : royalSheenSweep
            ? "royal-sheen-sweep"
            : wastelandCrackBleed
              ? "wasteland-crack-bleed"
            : chibiConfettiBurst
              ? "chibi-confetti-burst"
            : neoStamp
                ? "neo-stamp"
                : cyberBorderHunt
                  ? "cyber-border-hunt"
                  : undefined
        }
        data-neo-clunk={neoClunk ? "true" : undefined}
        data-minimal-typography-hover={minimalisticThemeActive ? "true" : undefined}
        data-ui="button"
        className={cn("control", buttonVariants({ variant: resolvedVariant, size: resolvedSize }), className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onFocus={handleFocus}
        onBlur={handleBlur}
        sx={[
          {
            borderRadius: "var(--cmp-button-radius)",
            textTransform: "none",
            boxShadow: "none",
            "&:focus-visible, &.Mui-focusVisible": {
              outline: "var(--interaction-focus-ring-width, 2px) solid var(--interaction-focus-ring-color, var(--sys-interactive-focus-ring))",
              outlineOffset: "2px",
              boxShadow: "var(--interaction-focus-ring-glow, none)",
            },
            "& .MuiTouchRipple-root": {
              color: "var(--sys-interactive-accent)",
            },
          },
          sizeSxMap[resolvedSize],
          variantSxMap[resolvedVariant],
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
