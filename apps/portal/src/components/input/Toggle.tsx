"use client";
import { cn } from "@/lib/utils";

import * as React from "react";
import { ToggleButton, type ToggleButtonProps } from "@mui/material";
import { VariantProps, cva } from "class-variance-authority";

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

const toggleVariants = cva(
  "ui-button control inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border bg-transparent",
      },
      size: {
        default: "h-[2.125rem] px-2 min-w-[2.125rem]",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-[2.375rem] px-2.5 min-w-[2.375rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ToggleProps extends Omit<ToggleButtonProps, "onChange" | "value" | "size">, VariantProps<typeof toggleVariants> {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

function Toggle({
  className,
  variant,
  size,
  pressed,
  onPressedChange,
  onBlur,
  disabled,
  ...props
}: ToggleProps) {
  const toggleRef = React.useRef<HTMLButtonElement | null>(null);
  const isPressed = Boolean(pressed);
  const [activeTheme, setActiveTheme] = React.useState<string | null>(() => resolveDocumentTheme());
  const minimalisticThemeActive = activeTheme === "minimalistic";
  const cyberpunkThemeActive = activeTheme === "cyberpunk";
  const steampunkThemeActive = activeTheme === "steampunk";
  const chibiThemeActive = activeTheme === "chibi";
  const postApocalypticThemeActive = activeTheme === "post-apocalyptic";
  const hardcoreSignal = (props as Record<string, unknown>)["data-hardcore-mode"];
  const hardcoreModeActive =
    hardcoreSignal === true || hardcoreSignal === "" || hardcoreSignal === "true";
  const [paperGrainHit, setPaperGrainHit] = React.useState(false);
  const [scanlineSweep, setScanlineSweep] = React.useState(false);
  const [leverRecoil, setLeverRecoil] = React.useState(false);
  const [steamPuff, setSteamPuff] = React.useState(false);
  const [faceSwapPop, setFaceSwapPop] = React.useState(false);
  const [wastelandRustedStick, setWastelandRustedStick] = React.useState(false);
  const paperGrainTimerRef = React.useRef<number | null>(null);
  const scanlineTimerRef = React.useRef<number | null>(null);
  const leverRecoilTimerRef = React.useRef<number | null>(null);
  const steamPuffTimerRef = React.useRef<number | null>(null);
  const faceSwapTimerRef = React.useRef<number | null>(null);
  const wastelandStickTimerRef = React.useRef<number | null>(null);
  React.useEffect(() => () => {
    if (paperGrainTimerRef.current !== null) {
      window.clearTimeout(paperGrainTimerRef.current);
    }
    if (scanlineTimerRef.current !== null) {
      window.clearTimeout(scanlineTimerRef.current);
    }
    if (leverRecoilTimerRef.current !== null) {
      window.clearTimeout(leverRecoilTimerRef.current);
    }
    if (steamPuffTimerRef.current !== null) {
      window.clearTimeout(steamPuffTimerRef.current);
    }
    if (faceSwapTimerRef.current !== null) {
      window.clearTimeout(faceSwapTimerRef.current);
    }
    if (wastelandStickTimerRef.current !== null) {
      window.clearTimeout(wastelandStickTimerRef.current);
    }
  }, []);

  React.useLayoutEffect(() => {
    const nextTheme = resolveScopedTheme(toggleRef.current);
    setActiveTheme((previous) => (previous === nextTheme ? previous : nextTheme));
  });

  const handleToggle = () => {
    if (disabled) return;
    const reducedMotionNow = isReducedMotionActive();
    const next = !isPressed;
    onPressedChange?.(next);
    if (minimalisticThemeActive) {
      setPaperGrainHit(true);
      if (paperGrainTimerRef.current !== null) {
        window.clearTimeout(paperGrainTimerRef.current);
      }
      paperGrainTimerRef.current = window.setTimeout(() => {
        setPaperGrainHit(false);
      }, 100);
    }
    if (cyberpunkThemeActive && next && !reducedMotionNow) {
      setScanlineSweep(true);
      if (scanlineTimerRef.current !== null) {
        window.clearTimeout(scanlineTimerRef.current);
      }
      scanlineTimerRef.current = window.setTimeout(() => {
        setScanlineSweep(false);
      }, 220);
    }
    if (steampunkThemeActive) {
      setLeverRecoil(true);
      if (leverRecoilTimerRef.current !== null) {
        window.clearTimeout(leverRecoilTimerRef.current);
      }
      leverRecoilTimerRef.current = window.setTimeout(() => {
        setLeverRecoil(false);
      }, 240);

      if (next && !reducedMotionNow) {
        setSteamPuff(true);
        if (steamPuffTimerRef.current !== null) {
          window.clearTimeout(steamPuffTimerRef.current);
        }
        steamPuffTimerRef.current = window.setTimeout(() => {
          setSteamPuff(false);
        }, 260);
      }
    }
    if (chibiThemeActive && next && !reducedMotionNow) {
      setFaceSwapPop(true);
      if (faceSwapTimerRef.current !== null) {
        window.clearTimeout(faceSwapTimerRef.current);
      }
      faceSwapTimerRef.current = window.setTimeout(() => {
        setFaceSwapPop(false);
      }, 220);
    }
    if (postApocalypticThemeActive && hardcoreModeActive && !reducedMotionNow) {
      setWastelandRustedStick(true);
      if (wastelandStickTimerRef.current !== null) {
        window.clearTimeout(wastelandStickTimerRef.current);
      }
      wastelandStickTimerRef.current = window.setTimeout(() => {
        setWastelandRustedStick(false);
      }, 240);
    }
  };

  const handleBlur: React.FocusEventHandler<HTMLButtonElement> = (event) => {
    onBlur?.(event);
  };

  return (
    <ToggleButton
      ref={toggleRef}
      value="check"
      selected={isPressed}
      onChange={handleToggle}
      data-slot="toggle"
      data-state={isPressed ? "on" : "off"}
      data-theme-signature={
        paperGrainHit
          ? "paper-grain-hit"
          : wastelandRustedStick
            ? "wasteland-rusted-stick"
          : faceSwapPop
            ? "face-swap-pop"
          : scanlineSweep
            ? "scanline-sweep"
            : leverRecoil
              ? "lever-recoil"
              : undefined
      }
      data-steampunk-steam-puff={steamPuff ? "true" : undefined}
      className={cn(toggleVariants({ variant, size, className }), "border-none!")}
      disabled={disabled}
      onBlur={handleBlur}
      sx={{
        textTransform: 'none',
        color: 'var(--sys-text-secondary)',
        borderColor: variant === 'outline' ? 'var(--cmp-segmented-border)' : 'transparent',
        transition: 'background-color var(--motionFast) var(--ease), color var(--motionFast) var(--ease), box-shadow var(--motionFast) var(--ease)',
        '&:hover': {
          backgroundColor: 'var(--sys-interactive-hover)',
          color: 'var(--sys-text-primary)',
        },
        '&.Mui-selected': {
          backgroundColor: 'var(--cmp-segmented-selected-bg)',
          color: 'var(--cmp-segmented-selected-text)',
          boxShadow: 'inset 0 0 0 1px var(--cmp-segmented-border)',
          '&:hover': {
            backgroundColor: 'var(--cmp-segmented-selected-bg)',
          },
        },
        '&.Mui-focusVisible': {
          outline: 'var(--interaction-focus-ring-width, 2px) solid var(--interaction-focus-ring-color, var(--sys-interactive-focus-ring))',
          outlineOffset: '2px',
          boxShadow: 'var(--interaction-focus-ring-glow, none)',
        }
      }}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
