import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Adjust,
  ChangeHistory,
  Favorite,
  PrecisionManufacturing,
  RadioButtonChecked,
  Stop,
  Train,
  WorkspacePremium,
} from '@mui/icons-material';
import { ThemeAmbientCanvas } from './ThemeAmbientCanvas';

type ThemeAmbientMode =
  | 'neo-brutalism'
  | 'steampunk'
  | 'minimalistic'
  | 'cyberpunk'
  | 'royal'
  | 'chibi'
  | 'post-apocalyptic';

interface ThemeAmbientEffectsProps {
  theme: ThemeAmbientMode | string;
  reducedMotion?: boolean;
  motionIntensity?: number;
}

interface ClickBurst {
  id: number;
  x: number;
  y: number;
}

const FALLING_ITEMS = [
  { x: '6%', delay: '0s', duration: '9.8s', size: 26, drift: '-16px' },
  { x: '15%', delay: '-2s', duration: '10.9s', size: 22, drift: '12px' },
  { x: '24%', delay: '-3.4s', duration: '8.7s', size: 28, drift: '-10px' },
  { x: '33%', delay: '-1.1s', duration: '11.6s', size: 24, drift: '14px' },
  { x: '42%', delay: '-4.3s', duration: '9.4s', size: 25, drift: '-12px' },
  { x: '51%', delay: '-2.7s', duration: '10.2s', size: 27, drift: '11px' },
  { x: '60%', delay: '-5.1s', duration: '9.1s', size: 23, drift: '-13px' },
  { x: '69%', delay: '-3.8s', duration: '11.2s', size: 26, drift: '15px' },
  { x: '78%', delay: '-6s', duration: '8.9s', size: 24, drift: '-9px' },
  { x: '87%', delay: '-4.6s', duration: '10.6s', size: 27, drift: '10px' },
];

const ROYAL_SPARKLES = [
  { x: '12%', y: '18%', delay: '0s' },
  { x: '28%', y: '10%', delay: '-1.2s' },
  { x: '46%', y: '20%', delay: '-2.4s' },
  { x: '68%', y: '14%', delay: '-0.8s' },
  { x: '84%', y: '22%', delay: '-1.9s' },
];

const CYBER_RAIN_COLUMNS = [
  { x: '8%', delay: '0s', duration: '8s', alpha: 0.16 },
  { x: '16%', delay: '-1.3s', duration: '9.1s', alpha: 0.2 },
  { x: '24%', delay: '-3.4s', duration: '7.7s', alpha: 0.18 },
  { x: '33%', delay: '-2.1s', duration: '8.8s', alpha: 0.14 },
  { x: '42%', delay: '-5s', duration: '9.6s', alpha: 0.2 },
  { x: '52%', delay: '-0.9s', duration: '7.9s', alpha: 0.16 },
  { x: '61%', delay: '-2.8s', duration: '8.6s', alpha: 0.17 },
  { x: '72%', delay: '-4.7s', duration: '9.4s', alpha: 0.2 },
  { x: '82%', delay: '-1.7s', duration: '8.1s', alpha: 0.15 },
  { x: '90%', delay: '-3.8s', duration: '9.2s', alpha: 0.18 },
];

const CYBER_TARGETS = [
  { x: '10%', y: '22%', label: 'DRONE.01', delay: '0s', duration: '13s' },
  { x: '24%', y: '34%', label: 'NODE.17', delay: '-1.8s', duration: '16s' },
  { x: '42%', y: '18%', label: 'TOWER.00', delay: '-2.6s', duration: '14s' },
  { x: '64%', y: '28%', label: 'ANOMALY.01', delay: '-3.4s', duration: '15s' },
  { x: '80%', y: '20%', label: 'DRONE.02', delay: '-4.2s', duration: '17s' },
];

const STEAM_GAUGES = [
  { x: '12%', y: '24%', size: 78, value: '74', delay: '0s', duration: '10s', rotate: '24deg' },
  { x: '30%', y: '16%', size: 62, value: '89', delay: '-1.5s', duration: '9s', rotate: '-30deg' },
  { x: '76%', y: '18%', size: 70, value: '61', delay: '-2.4s', duration: '11s', rotate: '36deg' },
];

const BRUTAL_TARGETS = [
  { x: '12%', y: '20%', label: 'TRACKING', delay: '0s', duration: '9s' },
  { x: '38%', y: '40%', label: 'SECTOR.B', delay: '-1.4s', duration: '12s' },
  { x: '66%', y: '24%', label: 'NODE.X', delay: '-2.9s', duration: '11s' },
  { x: '82%', y: '56%', label: 'READY', delay: '-3.6s', duration: '10s' },
];

const DUST_PARTICLES = [
  { x: '8%', y: '66%', delay: '0s', duration: '8s' },
  { x: '18%', y: '60%', delay: '-1.5s', duration: '7.2s' },
  { x: '32%', y: '70%', delay: '-3.4s', duration: '9.6s' },
  { x: '48%', y: '64%', delay: '-2.1s', duration: '8.7s' },
  { x: '61%', y: '68%', delay: '-4s', duration: '7.5s' },
  { x: '74%', y: '62%', delay: '-1s', duration: '8.9s' },
  { x: '86%', y: '69%', delay: '-2.6s', duration: '9.2s' },
];

const MINIMAL_WAVES = [
  { y: '24%', delay: '0s', duration: '16s' },
  { y: '42%', delay: '-3s', duration: '19s' },
  { y: '60%', delay: '-6s', duration: '21s' },
];

const APOCALYPSE_ITEMS = [
  { yStart: '-10vh', yEnd: '62vh', delay: '0s', duration: '13s', rotate: '680deg', size: 30 },
  { yStart: '-5vh', yEnd: '58vh', delay: '-2.2s', duration: '11.8s', rotate: '810deg', size: 24 },
  { yStart: '2vh', yEnd: '66vh', delay: '-4.1s', duration: '12.4s', rotate: '760deg', size: 28 },
  { yStart: '-7vh', yEnd: '56vh', delay: '-1.5s', duration: '10.9s', rotate: '740deg', size: 23 },
  { yStart: '0vh', yEnd: '60vh', delay: '-3.8s', duration: '12.9s', rotate: '900deg', size: 27 },
];

const POST_APOCALYPSE_ICONS = [
  PrecisionManufacturing,
  RadioButtonChecked,
  ChangeHistory,
  Stop,
  Adjust,
] as const;

function renderFallingSet(kind: 'heart' | 'crown') {
  const Icon = kind === 'heart' ? Favorite : WorkspacePremium;
  const sizeMultiplier = kind === 'heart' ? 1.45 : 1.6;
  return (
    <>
      {FALLING_ITEMS.map((item, index) => (
        <Icon
          key={`${kind}-${index}`}
          className={`theme-ambient__item theme-ambient__fall theme-ambient__${kind}`}
          style={
            {
              '--ambient-x': item.x,
              '--ambient-delay': item.delay,
              '--ambient-duration': item.duration,
              '--ambient-size': `${Math.round(item.size * sizeMultiplier)}px`,
              '--ambient-drift': item.drift,
            } as React.CSSProperties
          }
        />
      ))}
      {kind === 'heart' && (
        <>
          <div className="theme-ambient__blob theme-ambient__blob--1" />
          <div className="theme-ambient__blob theme-ambient__blob--2" />
          <div className="theme-ambient__blob theme-ambient__blob--3" />
        </>
      )}
      {kind === 'crown' &&
        ROYAL_SPARKLES.map((sparkle, index) => (
          <span
            key={`crown-sparkle-${index}`}
            className="theme-ambient__sparkle"
            style={
              {
                '--ambient-x': sparkle.x,
                '--ambient-y': sparkle.y,
                '--ambient-delay': sparkle.delay,
              } as React.CSSProperties
            }
          />
        ))}
      <div className="theme-ambient__floor-open" />
    </>
  );
}

function renderMinimalistic() {
  return (
    <>
      <div className="theme-ambient__minimal-grid" />
      {MINIMAL_WAVES.map((wave, index) => (
        <span
          key={`minimal-wave-${index}`}
          className="theme-ambient__minimal-wave"
          style={
            {
              '--ambient-y': wave.y,
              '--ambient-delay': wave.delay,
              '--ambient-duration': wave.duration,
            } as React.CSSProperties
          }
        />
      ))}
      <div className="theme-ambient__minimal-orb theme-ambient__minimal-orb--1" />
      <div className="theme-ambient__minimal-orb theme-ambient__minimal-orb--2" />
    </>
  );
}

function renderSteampunk() {
  return (
    <>
      <div className="theme-ambient__scene-shell theme-ambient__scene-shell--steampunk" />
      <div className="theme-ambient__steam-fog" />
      <div className="theme-ambient__pipe theme-ambient__pipe--1" />
      <div className="theme-ambient__pipe theme-ambient__pipe--2" />
      <div className="theme-ambient__pipe theme-ambient__pipe--3" />
      {STEAM_GAUGES.map((gauge, index) => (
        <div
          key={`steam-gauge-${index}`}
          className="theme-ambient__gauge"
          style={
            {
              '--ambient-x': gauge.x,
              '--ambient-y': gauge.y,
              '--ambient-size': `${gauge.size}px`,
              '--ambient-delay': gauge.delay,
              '--ambient-duration': gauge.duration,
              '--ambient-rotate': gauge.rotate,
            } as React.CSSProperties
          }
        >
          <span className="theme-ambient__gauge-ring" />
          <span className="theme-ambient__gauge-needle" />
          <span className="theme-ambient__gauge-value">{gauge.value}</span>
        </div>
      ))}
      <div className="theme-ambient__rail theme-ambient__rail--1" />
      <div className="theme-ambient__rail theme-ambient__rail--2" />
      <div className="theme-ambient__gear theme-ambient__gear--1" />
      <div className="theme-ambient__gear theme-ambient__gear--2" />
      <div className="theme-ambient__train-wrap">
        <Train className="theme-ambient__item theme-ambient__train" />
        <span className="theme-ambient__steam theme-ambient__steam--1" />
        <span className="theme-ambient__steam theme-ambient__steam--2" />
        <span className="theme-ambient__steam theme-ambient__steam--3" />
      </div>
      <div className="theme-ambient__noise theme-ambient__noise--steampunk" />
      <div className="theme-ambient__vignette" />
    </>
  );
}

function renderCyberpunk() {
  return (
    <>
      <div className="theme-ambient__scene-shell theme-ambient__scene-shell--cyberpunk" />
      <div className="theme-ambient__cyber-grid" />
      <div className="theme-ambient__cyber-hud" />
      <div className="theme-ambient__scan-beam" />
      <div className="theme-ambient__horizon-glow" />
      <div className="theme-ambient__city theme-ambient__city--far" />
      <div className="theme-ambient__city theme-ambient__city--near" />
      {CYBER_TARGETS.map((target, index) => (
        <div
          key={`cyber-target-${index}`}
          className="theme-ambient__cyber-target"
          style={
            {
              '--ambient-x': target.x,
              '--ambient-y': target.y,
              '--ambient-delay': target.delay,
              '--ambient-duration': target.duration,
            } as React.CSSProperties
          }
        >
          <span className="theme-ambient__target-label">{target.label}</span>
          <span className="theme-ambient__target-state">TRACKING</span>
        </div>
      ))}
      {CYBER_RAIN_COLUMNS.map((column, index) => (
        <span
          key={`rain-${index}`}
          className="theme-ambient__rain"
          style={
            {
              '--ambient-x': column.x,
              '--ambient-delay': column.delay,
              '--ambient-duration': column.duration,
              '--ambient-alpha': column.alpha.toString(),
            } as React.CSSProperties
          }
        />
      ))}
      <div className="theme-ambient__noise theme-ambient__noise--cyberpunk" />
      <div className="theme-ambient__vignette" />
    </>
  );
}

function renderPostApocalyptic() {
  return (
    <>
      <div className="theme-ambient__slope" />
      <div className="theme-ambient__obstacle theme-ambient__obstacle--rock" />
      <div className="theme-ambient__obstacle theme-ambient__obstacle--log" />
      {DUST_PARTICLES.map((particle, index) => (
        <span
          key={`dust-${index}`}
          className="theme-ambient__dust"
          style={
            {
              '--ambient-x': particle.x,
              '--ambient-y': particle.y,
              '--ambient-delay': particle.delay,
              '--ambient-duration': particle.duration,
            } as React.CSSProperties
          }
        />
      ))}
      {APOCALYPSE_ITEMS.map((item, index) => {
        const Icon = POST_APOCALYPSE_ICONS[index % POST_APOCALYPSE_ICONS.length];
        return (
          <Icon
            key={`apoc-item-${index}`}
            className="theme-ambient__item theme-ambient__roll"
            style={
              {
                '--ambient-delay': item.delay,
                '--ambient-duration': item.duration,
                '--ambient-size': `${item.size}px`,
                '--ambient-y-start': item.yStart,
                '--ambient-y-end': item.yEnd,
                '--ambient-rotate': item.rotate,
              } as React.CSSProperties
            }
          />
        );
      })}
    </>
  );
}

function clampIntensity(value: number): number {
  return Math.min(1.5, Math.max(0, value));
}

export function ThemeAmbientEffects({
  theme,
  reducedMotion = false,
  motionIntensity = 1,
}: ThemeAmbientEffectsProps) {
  const intensity = clampIntensity(motionIntensity);
  const reducedMode = reducedMotion || intensity <= 0.01;
  const [cursor, setCursor] = useState({ x: 50, y: 50 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [clickBursts, setClickBursts] = useState<ClickBurst[]>([]);
  const burstIdRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const pendingPointerRef = useRef<{ x: number; y: number } | null>(null);
  const lastPointerMoveTsRef = useRef(0);
  const lastPointerDownTsRef = useRef(0);

  useEffect(() => {
    if (reducedMode) {
      setCursor({ x: 50, y: 50 });
      setScrollProgress(0);
      setClickBursts([]);
      return;
    }

    const updatePointer = () => {
      rafRef.current = null;
      const next = pendingPointerRef.current;
      if (next) {
        setCursor(next);
      }
    };

    const toPercentPoint = (clientX: number, clientY: number) => {
      const width = Math.max(window.innerWidth, 1);
      const height = Math.max(window.innerHeight, 1);
      return {
        x: Math.max(0, Math.min(100, (clientX / width) * 100)),
        y: Math.max(0, Math.min(100, (clientY / height) * 100)),
      };
    };

    const onPointerMove = (event: PointerEvent | MouseEvent) => {
      if (event.type === 'pointermove') {
        lastPointerMoveTsRef.current = performance.now();
      }
      pendingPointerRef.current = toPercentPoint(event.clientX, event.clientY);

      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(updatePointer);
      }
    };

    const onScroll = () => {
      const root = document.documentElement;
      const body = document.body;
      const scrollTop = root.scrollTop || body.scrollTop || 0;
      const scrollHeight = Math.max(
        root.scrollHeight,
        body.scrollHeight,
        window.innerHeight,
      );
      const track = Math.max(scrollHeight - window.innerHeight, 1);
      setScrollProgress(Math.max(0, Math.min(1, scrollTop / track)));
    };

    const onPointerDown = (event: PointerEvent | MouseEvent) => {
      if (event.type === 'pointerdown') {
        lastPointerDownTsRef.current = performance.now();
      }
      const next = toPercentPoint(event.clientX, event.clientY);
      const burst = {
        id: burstIdRef.current++,
        x: next.x,
        y: next.y,
      };
      setClickBursts((current) => [...current.slice(-5), burst]);
      window.setTimeout(() => {
        setClickBursts((current) => current.filter((item) => item.id !== burst.id));
      }, 820);
    };

    const supportsPointer = typeof window.PointerEvent !== 'undefined';
    const onMouseMove = (event: MouseEvent) => {
      if (
        supportsPointer &&
        lastPointerMoveTsRef.current > 0 &&
        performance.now() - lastPointerMoveTsRef.current < 40
      ) {
        return;
      }
      onPointerMove(event);
    };
    const onMouseDown = (event: MouseEvent) => {
      if (
        supportsPointer &&
        lastPointerDownTsRef.current > 0 &&
        performance.now() - lastPointerDownTsRef.current < 60
      ) {
        return;
      }
      onPointerDown(event);
    };

    onScroll();
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    if (supportsPointer) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerdown', onPointerDown, { passive: true });
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      if (supportsPointer) {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerdown', onPointerDown);
      }
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [reducedMode]);

  const ambientStyle = useMemo(
    () =>
      ({
        '--ambient-cursor-x': `${cursor.x}%`,
        '--ambient-cursor-y': `${cursor.y}%`,
        '--ambient-parallax-x': ((cursor.x - 50) / 50).toFixed(4),
        '--ambient-parallax-y': ((cursor.y - 50) / 50).toFixed(4),
        '--ambient-scroll-progress': scrollProgress.toFixed(4),
        '--ambient-intensity': intensity.toFixed(4),
      }) as React.CSSProperties,
    [cursor.x, cursor.y, intensity, scrollProgress],
  );
  const clickPulseSeed = clickBursts.length ? clickBursts[clickBursts.length - 1]!.id : -1;

  return (
    <div
      aria-hidden="true"
      className={`theme-ambient-layer theme-ambient--${theme}${reducedMode ? ' is-reduced-motion' : ''}`}
      style={ambientStyle}
    >
      <ThemeAmbientCanvas
        theme={theme}
        reducedMotion={reducedMode}
        motionIntensity={intensity}
        cursor={cursor}
        scrollProgress={scrollProgress}
        clickPulseSeed={clickPulseSeed}
      />
      {!reducedMode && (
        <>
          <div className="theme-ambient__cursor-glow" />
          <div className="theme-ambient__cursor-ring" />
          <div className="theme-ambient__scroll-trace" />
          {clickBursts.map((burst) => (
            <span
              key={`ambient-burst-${burst.id}`}
              className="theme-ambient__click-burst"
              style={
                {
                  '--ambient-x': `${burst.x}%`,
                  '--ambient-y': `${burst.y}%`,
                } as React.CSSProperties
              }
            />
          ))}
        </>
      )}
      {theme === 'minimalistic' && renderMinimalistic()}
      {theme === 'chibi' && renderFallingSet('heart')}
      {theme === 'royal' && renderFallingSet('crown')}
      {theme === 'steampunk' && renderSteampunk()}
      {theme === 'cyberpunk' && renderCyberpunk()}
      {theme === 'post-apocalyptic' && renderPostApocalyptic()}
      {theme === 'neo-brutalism' && (
        <>
          <div className="theme-ambient__scene-shell theme-ambient__scene-shell--neo" />
          <div className="theme-ambient__brutal-grid" />
          <div className="theme-ambient__brutal-hud" />
          <div className="theme-ambient__marquee" />
          {BRUTAL_TARGETS.map((target, index) => (
            <div
              key={`brutal-target-${index}`}
              className="theme-ambient__brutal-target"
              style={
                {
                  '--ambient-x': target.x,
                  '--ambient-y': target.y,
                  '--ambient-delay': target.delay,
                  '--ambient-duration': target.duration,
                } as React.CSSProperties
              }
            >
              {target.label}
            </div>
          ))}
          <div className="theme-ambient__block theme-ambient__block--1" />
          <div className="theme-ambient__block theme-ambient__block--2" />
          <div className="theme-ambient__block theme-ambient__block--3" />
          <div className="theme-ambient__line theme-ambient__line--1" />
          <div className="theme-ambient__line theme-ambient__line--2" />
          <div className="theme-ambient__noise theme-ambient__noise--neo" />
          <div className="theme-ambient__vignette" />
        </>
      )}
    </div>
  );
}
