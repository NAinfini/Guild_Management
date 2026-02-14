import * as React from 'react';
import { useThemeController } from '@/theme/ThemeController';
import { getThemeVisualSpec } from '@/theme/presets';
import { resolveThemePostFxStack } from './postFxGates';
import { rafThrottle } from './rafThrottle';
import {
  resolveThemeRolloutRuntime,
  subscribeThemeRolloutChanges,
} from '@/theme/rollout';
import { evaluateThemeRolloutMonitoring } from '@/theme/rolloutMonitoring';

const FX_OFF_STORAGE_KEY = 'baiye_fx_off';
const HEAVY_FX_MIN_INTENSITY = 0.35;
const CYBER_CHROMATIC_DRIFT_PX = 3.4;
const CYBER_CHROMATIC_DURATION_MS = 260;
const CYBER_GLITCH_DURATION_MS = 240;

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
  const { currentTheme, motionIntensity, reducedMotion, effectiveMotionMode } = useThemeController();
  const [rolloutVersion, setRolloutVersion] = React.useState(0);
  const [isDocumentVisible, setIsDocumentVisible] = React.useState(
    () => typeof document === 'undefined' || document.visibilityState === 'visible',
  );
  const layerRef = React.useRef<HTMLDivElement | null>(null);
  const [fxChromaticDrift, setFxChromaticDrift] = React.useState(0);
  const [fxGlitchEvent, setFxGlitchEvent] = React.useState(false);
  const chromaticTimerRef = React.useRef<number | null>(null);
  const glitchTimerRef = React.useRef<number | null>(null);

  const visualSpec = React.useMemo(
    () => getThemeVisualSpec(currentTheme),
    [currentTheme],
  );
  const capabilities = visualSpec.capabilities;
  const rolloutRuntime = React.useMemo(
    () =>
      resolveThemeRolloutRuntime({
        themeId: currentTheme,
        fxQuality: capabilities.fxQuality,
      }),
    [capabilities.fxQuality, currentTheme, rolloutVersion],
  );
  const postFxStack = React.useMemo(() => resolveThemePostFxStack({
    themeId: rolloutRuntime.themeId,
    fxQuality: rolloutRuntime.fxQuality,
    reducedMotion,
    motionMode: effectiveMotionMode,
    baselineFxOnly: rolloutRuntime.baselineFxOnly,
  }), [
    currentTheme,
    effectiveMotionMode,
    rolloutRuntime.baselineFxOnly,
    rolloutRuntime.fxQuality,
    rolloutRuntime.themeId,
    reducedMotion,
  ]);
  const rolloutMonitoring = React.useMemo(
    () =>
      evaluateThemeRolloutMonitoring({
        reducedMotion,
        enabledEffects: postFxStack.enabled,
        ambientDiagnostics: null,
      }),
    [postFxStack.enabled, reducedMotion],
  );

  React.useEffect(() => subscribeThemeRolloutChanges(() => {
    setRolloutVersion((current) => current + 1);
  }), []);

  const interactiveFxEnabled = React.useMemo(() => {
    if (isFxGloballyDisabled()) return false;
    if (rolloutRuntime.baselineFxOnly) return false;
    if (reducedMotion) return false;
    if (effectiveMotionMode === 'off') return false;
    if (!isDocumentVisible) return false;
    if (motionIntensity < HEAVY_FX_MIN_INTENSITY) return false;
    if (!capabilities.hasAnimatedBackground || capabilities.fxQuality <= 0) return false;
    return postFxStack.medium.length > 0 || postFxStack.heavy.length > 0;
  }, [
    capabilities.fxQuality,
    capabilities.hasAnimatedBackground,
    effectiveMotionMode,
    isDocumentVisible,
    motionIntensity,
    rolloutRuntime.baselineFxOnly,
    postFxStack.heavy.length,
    postFxStack.medium.length,
    reducedMotion,
  ]);
  const heavyFxEnabled = interactiveFxEnabled && postFxStack.heavy.length > 0;
  const cyberInteractionFxEnabled = React.useMemo(() => {
    if (!interactiveFxEnabled) return false;
    if (currentTheme !== 'cyberpunk') return false;
    if (reducedMotion) return false;
    return effectiveMotionMode === 'full';
  }, [
    currentTheme,
    effectiveMotionMode,
    interactiveFxEnabled,
    reducedMotion,
  ]);

  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === 'visible');
    };

    handleVisibilityChange();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  React.useEffect(() => () => {
    if (chromaticTimerRef.current !== null) {
      window.clearTimeout(chromaticTimerRef.current);
    }
    if (glitchTimerRef.current !== null) {
      window.clearTimeout(glitchTimerRef.current);
    }
  }, []);

  React.useEffect(() => {
    if (cyberInteractionFxEnabled) return;
    setFxChromaticDrift(0);
    setFxGlitchEvent(false);
  }, [cyberInteractionFxEnabled]);

  React.useEffect(() => {
    const node = layerRef.current;
    if (!node) return;
    node.style.setProperty('--fx-chromatic-drift', `${fxChromaticDrift.toFixed(3)}px`);
  }, [fxChromaticDrift]);

  React.useEffect(() => {
    const node = layerRef.current;
    if (!node) return;

    node.dataset.theme = rolloutRuntime.themeId;
    node.dataset.fxQuality = String(rolloutRuntime.fxQuality);
    node.dataset.backgroundMode = capabilities.backgroundMode;
    node.dataset.hasAnimatedBackground = String(capabilities.hasAnimatedBackground);
    node.dataset.hasMascot = String(capabilities.hasMascot);
    node.dataset.motionMode = effectiveMotionMode;
    node.dataset.heavy = String(heavyFxEnabled);
    node.dataset.fxBaseline = postFxStack.baseline.join(',');
    node.dataset.fxEnabled = postFxStack.enabled.join(',');
    node.dataset.fxMedium = postFxStack.medium.join(',');
    node.dataset.fxHeavy = postFxStack.heavy.join(',');
    node.dataset.fxChromaticDrift = String(Number(fxChromaticDrift.toFixed(3)));
    node.dataset.fxGlitchEvent = String(fxGlitchEvent);
    node.dataset.reducedMotion = String(reducedMotion);
    node.dataset.visible = String(isDocumentVisible);
    node.dataset.rolloutBaselineFxOnly = String(rolloutRuntime.baselineFxOnly);
    node.dataset.rolloutMaxFxQuality = String(rolloutRuntime.maxFxQuality);
    node.dataset.rolloutThemeBlocked = String(rolloutRuntime.themeBlocked);
    node.dataset.rolloutAccessibilityRisk = String(rolloutMonitoring.accessibilityRisk);
    node.dataset.rolloutPerformanceRisk = String(rolloutMonitoring.performanceRisk);
    node.dataset.rolloutReasons = rolloutMonitoring.reasons.join(',');
  }, [
    fxChromaticDrift,
    fxGlitchEvent,
    capabilities,
    effectiveMotionMode,
    heavyFxEnabled,
    isDocumentVisible,
    rolloutMonitoring.accessibilityRisk,
    rolloutMonitoring.performanceRisk,
    rolloutMonitoring.reasons,
    rolloutRuntime.baselineFxOnly,
    rolloutRuntime.fxQuality,
    rolloutRuntime.maxFxQuality,
    rolloutRuntime.themeId,
    rolloutRuntime.themeBlocked,
    postFxStack.baseline,
    postFxStack.enabled,
    postFxStack.heavy,
    postFxStack.medium,
    reducedMotion,
  ]);

  React.useEffect(() => {
    if (!interactiveFxEnabled || typeof window === 'undefined') return;

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
    const hasChromatic = postFxStack.enabled.includes('ChromaticAberration');
    const hasGlitch = postFxStack.enabled.includes('Glitch');

    const handlePointerDown = () => {
      if (!cyberInteractionFxEnabled) return;
      if (hasChromatic) {
        setFxChromaticDrift(CYBER_CHROMATIC_DRIFT_PX);
        if (chromaticTimerRef.current !== null) {
          window.clearTimeout(chromaticTimerRef.current);
        }
        chromaticTimerRef.current = window.setTimeout(() => {
          setFxChromaticDrift(0);
        }, CYBER_CHROMATIC_DURATION_MS);
      }
      if (hasGlitch) {
        setFxGlitchEvent(true);
        if (glitchTimerRef.current !== null) {
          window.clearTimeout(glitchTimerRef.current);
        }
        glitchTimerRef.current = window.setTimeout(() => {
          setFxGlitchEvent(false);
        }, CYBER_GLITCH_DURATION_MS);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleWindowResize, { passive: true });
    updateScroll();

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleWindowResize);
      updatePointer.cancel();
      updateScroll.cancel();
      handleResize.cancel();
    };
  }, [cyberInteractionFxEnabled, interactiveFxEnabled, postFxStack.enabled]);

  const fxSurfaceOpacity = Math.max(0.08, Math.min(0.42, capabilities.fxQuality * 0.1));
  const fxOrbScale = Math.max(0.9, Math.min(1.35, 0.92 + motionIntensity * 0.2));

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      data-theme-fx-layer="true"
      data-fx-chromatic-drift={String(Number(fxChromaticDrift.toFixed(3)))}
      data-fx-glitch-event={String(fxGlitchEvent)}
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
      {interactiveFxEnabled ? (
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
              transform: `translate3d(calc(-50% + var(--fx-chromatic-drift, 0px)), -50%, 0) scale(${fxOrbScale.toFixed(3)})`,
              opacity: Math.max(0.14, Math.min(0.35, 0.15 + motionIntensity * 0.1)),
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
