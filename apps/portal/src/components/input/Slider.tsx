import * as React from "react";
import MuiSlider, { SliderProps as MuiSliderProps } from "@/ui-bridge/material/Slider";
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

function toSliderProgress(value: MuiSliderProps["value"], min: number, max: number): number {
  const numericValue = Array.isArray(value) ? value[0] ?? min : (value ?? min);
  const track = Math.max(max - min, 1);
  const normalized = (Number(numericValue) - min) / track;
  return Math.max(0, Math.min(1, Number.isFinite(normalized) ? normalized : 0));
}

const Slider = React.forwardRef<HTMLSpanElement, MuiSliderProps>(
  (
    {
      className,
      onChange,
      onChangeCommitted,
      onMouseDown,
      onBlur,
      disabled,
      style,
      min = 0,
      max = 100,
      value,
      ...props
    },
    ref,
  ) => {
    const sliderRef = React.useRef<HTMLSpanElement | null>(null);
    const assignSliderRef = React.useCallback(
      (node: HTMLSpanElement | null) => {
        sliderRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );
    const isDisabled = Boolean(disabled);
    const [activeTheme, setActiveTheme] = React.useState<string | null>(() => resolveDocumentTheme());
    const minimalisticThemeActive = activeTheme === "minimalistic";
    const steampunkThemeActive = activeTheme === "steampunk";
    const neoThemeActive = activeTheme === "neo-brutalism";
    const royalThemeActive = activeTheme === "royal";
    const chibiThemeActive = activeTheme === "chibi";
    const postApocalypticThemeActive = activeTheme === "post-apocalyptic";
    const [pressureVibrate, setPressureVibrate] = React.useState(false);
    const [neoSegmentInvert, setNeoSegmentInvert] = React.useState(false);
    const [royalOrbTravel, setRoyalOrbTravel] = React.useState(false);
    const [candySlosh, setCandySlosh] = React.useState(false);
    const [wastelandHitch, setWastelandHitch] = React.useState(false);
    const pressureTimerRef = React.useRef<number | null>(null);
    const neoSegmentTimerRef = React.useRef<number | null>(null);
    const royalOrbTimerRef = React.useRef<number | null>(null);
    const candySloshTimerRef = React.useRef<number | null>(null);
    const wastelandHitchTimerRef = React.useRef<number | null>(null);
    const dragStartedAtRef = React.useRef<number | null>(null);
    const sliderProgress = toSliderProgress(value, min, max);
    const resolvedStyle = {
      ...(style as React.CSSProperties | undefined),
      "--slider-progress": sliderProgress.toFixed(4),
    } as React.CSSProperties;

    React.useEffect(() => () => {
      if (pressureTimerRef.current !== null) {
        window.clearTimeout(pressureTimerRef.current);
      }
      if (neoSegmentTimerRef.current !== null) {
        window.clearTimeout(neoSegmentTimerRef.current);
      }
      if (royalOrbTimerRef.current !== null) {
        window.clearTimeout(royalOrbTimerRef.current);
      }
      if (candySloshTimerRef.current !== null) {
        window.clearTimeout(candySloshTimerRef.current);
      }
      if (wastelandHitchTimerRef.current !== null) {
        window.clearTimeout(wastelandHitchTimerRef.current);
      }
    }, []);

    React.useLayoutEffect(() => {
      const nextTheme = resolveScopedTheme(sliderRef.current);
      setActiveTheme((previous) => (previous === nextTheme ? previous : nextTheme));
    });

    const triggerPressureVibration = () => {
      if (!steampunkThemeActive || isReducedMotionActive() || isDisabled) return;
      const startedAt = dragStartedAtRef.current;
      if (startedAt === null) return;
      const now = typeof performance === "undefined" ? Date.now() : performance.now();
      dragStartedAtRef.current = null;
      if (now - startedAt > 200) return;

      setPressureVibrate(true);
      if (pressureTimerRef.current !== null) {
        window.clearTimeout(pressureTimerRef.current);
      }
      pressureTimerRef.current = window.setTimeout(() => {
        setPressureVibrate(false);
      }, 260);
    };

    const triggerCandySlosh = () => {
      if (!chibiThemeActive || isReducedMotionActive() || isDisabled) return;
      setCandySlosh(true);
      if (candySloshTimerRef.current !== null) {
        window.clearTimeout(candySloshTimerRef.current);
      }
      candySloshTimerRef.current = window.setTimeout(() => {
        setCandySlosh(false);
      }, 220);
    };

    const triggerWastelandHitch = () => {
      if (!postApocalypticThemeActive || isReducedMotionActive() || isDisabled) return;
      setWastelandHitch(true);
      if (wastelandHitchTimerRef.current !== null) {
        window.clearTimeout(wastelandHitchTimerRef.current);
      }
      wastelandHitchTimerRef.current = window.setTimeout(() => {
        setWastelandHitch(false);
      }, 220);
    };

    const handleChange = (
      event: Event,
      value: number | number[],
      activeThumb: number,
    ) => {
      if (!isDisabled) {
        if (dragStartedAtRef.current === null) {
          dragStartedAtRef.current = typeof performance === "undefined" ? Date.now() : performance.now();
        }
      }
      onChange?.(event, value, activeThumb);
    };

    const handleChangeCommitted = (event: Event | React.SyntheticEvent, value: number | number[]) => {
      if (!isDisabled) {
        triggerPressureVibration();
        triggerCandySlosh();
      }
      onChangeCommitted?.(event, value);
    };

    const handleMouseDown: React.MouseEventHandler<HTMLElement> = (event) => {
      onMouseDown?.(event);
      if (!isDisabled) {
        dragStartedAtRef.current = typeof performance === "undefined" ? Date.now() : performance.now();
        const reducedMotionNow = isReducedMotionActive();
        if (neoThemeActive && !reducedMotionNow) {
          setNeoSegmentInvert(true);
          if (neoSegmentTimerRef.current !== null) {
            window.clearTimeout(neoSegmentTimerRef.current);
          }
          neoSegmentTimerRef.current = window.setTimeout(() => {
            setNeoSegmentInvert(false);
          }, 180);
        }
        if (royalThemeActive && !reducedMotionNow) {
          setRoyalOrbTravel(true);
          if (royalOrbTimerRef.current !== null) {
            window.clearTimeout(royalOrbTimerRef.current);
          }
          royalOrbTimerRef.current = window.setTimeout(() => {
            setRoyalOrbTravel(false);
          }, 240);
        }
        triggerWastelandHitch();
      }
    };

    const handleMouseUp: React.MouseEventHandler<HTMLElement> = () => {
      triggerPressureVibration();
      triggerCandySlosh();
    };

    const handleBlur: React.FocusEventHandler<HTMLElement> = (event) => {
      onBlur?.(event);
      if (!isDisabled) {
        dragStartedAtRef.current = null;
      }
    };

    return (
      <MuiSlider
        ref={assignSliderRef}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        style={resolvedStyle}
        data-theme-signature={
          royalOrbTravel
            ? "royal-orb-travel"
            : candySlosh
              ? "candy-slosh"
            : wastelandHitch
              ? "wasteland-hitch"
            : neoSegmentInvert
              ? "neo-segment-invert"
              : pressureVibrate
                ? "pressure-vibrate"
                : undefined
        }
        data-neo-segmented-slider={neoThemeActive ? "true" : undefined}
        data-royal-glass-orb={royalThemeActive ? "true" : undefined}
        data-minimal-slider-orbit={minimalisticThemeActive ? "true" : undefined}
        data-chibi-candy-tube={chibiThemeActive ? "true" : undefined}
        data-wasteland-metal-thumb={postApocalypticThemeActive ? "true" : undefined}
        disabled={disabled}
        value={value}
        min={min}
        max={max}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onBlur={handleBlur}
        sx={{
          color: 'var(--primary)',
          height: 8,
          '& .MuiSlider-track': {
            border: 'none',
            ...(neoThemeActive
              ? {
                  borderRadius: '0',
                  backgroundImage:
                    'repeating-linear-gradient(90deg, currentColor 0 14px, color-mix(in srgb, currentColor 20%, transparent) 14px 20px)',
                }
              : null),
          },
          '& .MuiSlider-rail': {
            ...(neoThemeActive
              ? {
                  borderRadius: '0',
                  opacity: 0.35,
                  backgroundImage:
                    'repeating-linear-gradient(90deg, color-mix(in srgb, var(--foreground) 72%, transparent) 0 12px, transparent 12px 20px)',
                }
              : null),
          },
          '& .MuiSlider-thumb': {
            height: 20,
            width: 20,
            backgroundColor: 'var(--background)',
            borderRadius: neoThemeActive ? '2px' : undefined,
            border: minimalisticThemeActive ? 'none' : '2px solid currentColor',
            boxShadow: minimalisticThemeActive
              ? 'calc((var(--slider-progress, 0.5) - 0.5) * 10px) 6px 16px color-mix(in srgb, #000 18%, transparent)'
              : royalThemeActive
                ? 'inset 0 1px 2px color-mix(in srgb, #ffffff 58%, transparent), 0 8px 18px color-mix(in srgb, #000000 26%, transparent)'
                : 'none',
            ...(royalThemeActive
              ? {
                  background:
                    'radial-gradient(circle at 32% 28%, color-mix(in srgb, #ffffff 72%, transparent), color-mix(in srgb, var(--color-accent-primary) 28%, transparent) 54%, color-mix(in srgb, #2b2b2b 22%, transparent) 100%)',
                  border: '1px solid color-mix(in srgb, var(--color-accent-primary) 48%, transparent)',
                }
              : null),
            ...(postApocalypticThemeActive
              ? {
                  background:
                    'repeating-linear-gradient(135deg, color-mix(in srgb, #9a9a9a 78%, transparent) 0 3px, color-mix(in srgb, #535353 86%, transparent) 3px 6px)',
                  border: '1px solid color-mix(in srgb, #2f2f2f 78%, transparent)',
                }
              : null),
            '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
              boxShadow: 'inherit',
            },
            '&:before': {
              display: 'none',
            },
          },
          '& .MuiSlider-valueLabel': {
            lineHeight: 1.2,
            fontSize: 12,
            background: 'unset',
            padding: 0,
            width: 32,
            height: 32,
            borderRadius: '50% 50% 50% 0',
            backgroundColor: 'var(--primary)',
            transformOrigin: 'bottom left',
            transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
            '&:before': { display: 'none' },
            '&.MuiSlider-valueLabelOpen': {
              transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
            },
            '& > *': {
              transform: 'rotate(45deg)',
            },
          },
        }}
        {...props}
      />
    );
  }
);
Slider.displayName = "Slider";

export { Slider };
