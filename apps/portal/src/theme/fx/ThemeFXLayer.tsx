import * as React from 'react';
import { onThemeChange, useThemeController, type ThemePreferences } from '@/theme/ThemeController';
import { getThemeVisualSpec } from '@/theme/presets';
import { rafThrottle } from './rafThrottle';

const FX_OFF_STORAGE_KEY = 'baiye_fx_off';
const HEAVY_FX_MIN_INTENSITY = 0.35;

function prefersReducedMotionByMediaQuery(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isFxGloballyDisabled(): boolean {
  if (import.meta.env.VITE_THEME_FX_OFF === '1') return true;
  if (typeof window === 'undefined') return false;

  try {
    return window.localStorage.getItem(FX_OFF_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function ThemeFXLayer() {
  const { currentTheme, motionIntensity } = useThemeController();
  const [themeSnapshot, setThemeSnapshot] = React.useState<Pick<ThemePreferences, 'theme' | 'motionIntensity'>>({
    theme: currentTheme,
    motionIntensity,
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(
    prefersReducedMotionByMediaQuery,
  );
  const [isDocumentVisible, setIsDocumentVisible] = React.useState(
    () => typeof document === 'undefined' || document.visibilityState === 'visible',
  );
  const layerRef = React.useRef<HTMLDivElement | null>(null);

  const visualSpec = React.useMemo(
    () => getThemeVisualSpec(themeSnapshot.theme),
    [themeSnapshot.theme],
  );
  const capabilities = visualSpec.capabilities;

  const heavyFxEnabled = React.useMemo(() => {
    if (isFxGloballyDisabled()) return false;
    if (prefersReducedMotion) return false;
    if (!isDocumentVisible) return false;
    if (themeSnapshot.motionIntensity < HEAVY_FX_MIN_INTENSITY) return false;
    return capabilities.hasAnimatedBackground && capabilities.fxQuality > 0;
  }, [
    capabilities.fxQuality,
    capabilities.hasAnimatedBackground,
    isDocumentVisible,
    prefersReducedMotion,
    themeSnapshot.motionIntensity,
  ]);

  React.useEffect(() => {
    setThemeSnapshot({ theme: currentTheme, motionIntensity });
  }, [currentTheme, motionIntensity]);

  React.useEffect(
    () =>
      onThemeChange((next) => {
        setThemeSnapshot({
          theme: next.theme,
          motionIntensity: next.motionIntensity,
        });
      }),
    [],
  );

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    setPrefersReducedMotion(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === 'visible');
    };

    handleVisibilityChange();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  React.useEffect(() => {
    const node = layerRef.current;
    if (!node) return;

    node.dataset.theme = themeSnapshot.theme;
    node.dataset.fxQuality = String(capabilities.fxQuality);
    node.dataset.backgroundMode = capabilities.backgroundMode;
    node.dataset.hasAnimatedBackground = String(capabilities.hasAnimatedBackground);
    node.dataset.hasMascot = String(capabilities.hasMascot);
    node.dataset.heavy = String(heavyFxEnabled);
    node.dataset.reducedMotion = String(prefersReducedMotion);
    node.dataset.visible = String(isDocumentVisible);
  }, [capabilities, heavyFxEnabled, isDocumentVisible, prefersReducedMotion, themeSnapshot.theme]);

  React.useEffect(() => {
    if (!heavyFxEnabled || typeof window === 'undefined') return;

    const node = layerRef.current;
    if (!node) return;
    let maxScrollRange = 1;

    const recalcScrollRange = () => {
      maxScrollRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    };

    const updatePointer = rafThrottle((event: PointerEvent) => {
      const width = Math.max(window.innerWidth, 1);
      const height = Math.max(window.innerHeight, 1);
      const px = Math.max(0, Math.min(1, event.clientX / width));
      const py = Math.max(0, Math.min(1, event.clientY / height));
      node.style.setProperty('--fx-pointer-x', px.toFixed(4));
      node.style.setProperty('--fx-pointer-y', py.toFixed(4));
    });

    const updateScroll = rafThrottle(() => {
      const progress = Math.max(0, Math.min(1, window.scrollY / maxScrollRange));
      node.style.setProperty('--fx-scroll-progress', progress.toFixed(4));
    });
    const handleResize = rafThrottle(() => {
      recalcScrollRange();
      updateScroll();
    });

    recalcScrollRange();
    const handlePointerMove = (event: PointerEvent) => updatePointer(event);
    const handleScroll = () => updateScroll();
    const handleWindowResize = () => handleResize();

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleWindowResize, { passive: true });
    updateScroll();

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleWindowResize);
      updatePointer.cancel();
      updateScroll.cancel();
      handleResize.cancel();
    };
  }, [heavyFxEnabled]);

  const fxSurfaceOpacity = Math.max(0.08, Math.min(0.42, capabilities.fxQuality * 0.1));
  const fxOrbScale = Math.max(0.9, Math.min(1.35, 0.92 + themeSnapshot.motionIntensity * 0.2));

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      data-theme-fx-layer="true"
      className="theme-fx-layer"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'clip',
        contain: 'layout paint style',
        transform: 'translateZ(0)',
      }}
    >
      {heavyFxEnabled ? (
        <div
          data-theme-fx-content="active"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
            contain: 'paint',
            opacity: fxSurfaceOpacity,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '-8%',
              background:
                capabilities.backgroundMode === 'canvas'
                  ? 'radial-gradient(circle at 50% 82%, color-mix(in srgb, var(--color-accent-primary) 28%, transparent), transparent 58%)'
                  : 'radial-gradient(circle at 50% 88%, color-mix(in srgb, var(--color-accent-primary) 22%, transparent), transparent 60%)',
              transform:
                'translate3d(calc((var(--fx-pointer-x, 0.5) - 0.5) * 28px), calc((var(--fx-scroll-progress, 0) * -18px)), 0)',
              willChange: 'transform, opacity',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '220px',
              height: '220px',
              borderRadius: '999px',
              left: 'calc(var(--fx-pointer-x, 0.5) * 100%)',
              top: 'calc(var(--fx-pointer-y, 0.5) * 100%)',
              transform: `translate3d(-50%, -50%, 0) scale(${fxOrbScale.toFixed(3)})`,
              opacity: Math.max(0.14, Math.min(0.35, 0.15 + themeSnapshot.motionIntensity * 0.1)),
              background:
                'radial-gradient(circle, color-mix(in srgb, var(--color-accent-primary) 35%, transparent), transparent 68%)',
              willChange: 'transform, opacity',
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export default ThemeFXLayer;
