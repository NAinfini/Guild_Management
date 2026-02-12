import React, { useEffect, useMemo, useRef } from 'react';

type CanvasScheme = 'pipeline' | 'swirl' | 'coalesce' | 'floaters';

interface AmbientCanvasParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  ttl: number;
  size: number;
  hue: number;
  seed: number;
}

interface ThemeAmbientCanvasProps {
  theme: string;
  reducedMotion?: boolean;
  motionIntensity?: number;
  cursor: { x: number; y: number };
  scrollProgress: number;
  clickPulseSeed: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}

function wrap(value: number, max: number): number {
  if (value < 0) return max + value;
  if (value > max) return value - max;
  return value;
}

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function createParticle(
  width: number,
  height: number,
  scheme: CanvasScheme,
): AmbientCanvasParticle {
  if (scheme === 'pipeline') {
    return {
      x: randomRange(0, width),
      y: randomRange(height * 0.25, height * 0.75),
      vx: 0,
      vy: Math.random() > 0.5 ? 1 : -1,
      life: 0,
      ttl: randomRange(120, 420),
      size: randomRange(1.2, 3.8),
      hue: randomRange(180, 290),
      seed: Math.random() * Math.PI * 2,
    };
  }
  if (scheme === 'swirl') {
    return {
      x: randomRange(0, width),
      y: randomRange(0, height),
      vx: 0,
      vy: 0,
      life: 0,
      ttl: randomRange(80, 220),
      size: randomRange(0.8, 2.6),
      hue: randomRange(180, 320),
      seed: Math.random() * Math.PI * 2,
    };
  }
  if (scheme === 'coalesce') {
    return {
      x: randomRange(0, width),
      y: randomRange(0, height),
      vx: 0,
      vy: 0,
      life: 0,
      ttl: randomRange(180, 500),
      size: randomRange(2, 8),
      hue: randomRange(24, 64),
      seed: Math.random() * Math.PI * 2,
    };
  }
  return {
    x: randomRange(0, width),
    y: randomRange(height * 0.9, height * 1.15),
    vx: randomRange(-0.2, 0.2),
    vy: randomRange(-0.8, -0.2),
    life: 0,
    ttl: randomRange(240, 680),
    size: randomRange(2, 10),
    hue: randomRange(32, 58),
    seed: Math.random() * Math.PI * 2,
  };
}

export function resolveCanvasScheme(theme: string): CanvasScheme {
  if (theme === 'cyberpunk') return 'pipeline';
  if (theme === 'minimalistic') return 'swirl';
  if (theme === 'steampunk' || theme === 'post-apocalyptic') return 'coalesce';
  return 'floaters';
}

export function ThemeAmbientCanvas({
  theme,
  reducedMotion = false,
  motionIntensity = 1,
  cursor,
  scrollProgress,
  clickPulseSeed,
}: ThemeAmbientCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRef = useRef({ x: 0.5, y: 0.5 });
  const scrollRef = useRef(0);
  const pulseRef = useRef(0);
  const scheme = useMemo(() => resolveCanvasScheme(theme), [theme]);
  const intensity = clamp(motionIntensity, 0, 1.5);
  const reducedMode = reducedMotion || intensity <= 0.01;

  useEffect(() => {
    cursorRef.current = {
      x: cursor.x / 100,
      y: cursor.y / 100,
    };
  }, [cursor.x, cursor.y]);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    pulseRef.current = 1;
  }, [clickPulseSeed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let width = 0;
    let height = 0;
    let raf = 0;
    let frame = 0;
    let isVisible = typeof document === 'undefined' ? true : document.visibilityState !== 'hidden';
    const particles: AmbientCanvasParticle[] = [];
    const saveDataEnabled =
      typeof navigator !== 'undefined' && Boolean((navigator as any).connection?.saveData);
    const densityScale = saveDataEnabled ? 0.58 : 1;
    const count = Math.round(
      (scheme === 'pipeline' ? 160 : scheme === 'swirl' ? 280 : scheme === 'coalesce' ? 180 : 130) *
        (0.5 + intensity * 0.65) *
        densityScale,
    );

    const resize = () => {
      const nextWidth = Math.max(1, Math.floor(canvas.clientWidth || window.innerWidth));
      const nextHeight = Math.max(1, Math.floor(canvas.clientHeight || window.innerHeight));
      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.round(nextWidth * dpr);
      canvas.height = Math.round(nextHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!particles.length) {
        for (let i = 0; i < count; i += 1) {
          particles.push(createParticle(width, height, scheme));
        }
      }
    };

    const drawBackground = () => {
      if (scheme === 'pipeline') {
        ctx.fillStyle = reducedMode ? 'rgba(3,8,18,0.45)' : 'rgba(3,8,18,0.18)';
      } else if (scheme === 'swirl') {
        ctx.fillStyle = reducedMode ? 'rgba(7,8,14,0.3)' : 'rgba(7,8,14,0.12)';
      } else if (scheme === 'coalesce') {
        ctx.fillStyle = reducedMode ? 'rgba(17,11,7,0.34)' : 'rgba(17,11,7,0.15)';
      } else {
        ctx.fillStyle = reducedMode ? 'rgba(9,12,20,0.26)' : 'rgba(9,12,20,0.1)';
      }
      ctx.fillRect(0, 0, width, height);
    };

    const drawPulse = () => {
      const pulse = pulseRef.current;
      if (pulse <= 0.02) return;
      const px = cursorRef.current.x * width;
      const py = cursorRef.current.y * height;
      const radius = 80 + pulse * (160 + intensity * 120);
      const gradient = ctx.createRadialGradient(px, py, 0, px, py, radius);
      gradient.addColorStop(0, 'rgba(255,255,255,0.22)');
      gradient.addColorStop(0.35, scheme === 'coalesce' ? 'rgba(240,180,90,0.2)' : 'rgba(70,220,255,0.22)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
      pulseRef.current *= 0.92;
    };

    const drawFrame = () => {
      if (!isVisible) {
        raf = 0;
        return;
      }
      frame += 1;
      const time = frame * (0.9 + intensity * 0.35);
      const cursorX = cursorRef.current.x * width;
      const cursorY = cursorRef.current.y * height;
      const scrollBoost = 1 + scrollRef.current * 0.8;

      drawBackground();

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.life += 1;
        const alpha = 1 - p.life / Math.max(1, p.ttl);
        if (alpha <= 0) {
          particles[i] = createParticle(width, height, scheme);
          continue;
        }

        if (scheme === 'pipeline') {
          if (Math.random() < 0.03) {
            const turn = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
            const angle = Math.atan2(p.vy, p.vx || 0.001) + turn;
            p.vx = Math.cos(angle);
            p.vy = Math.sin(angle);
          }
          const attractX = (cursorX - p.x) * 0.0002 * intensity;
          const attractY = (cursorY - p.y) * 0.0002 * intensity;
          p.x += (p.vx * (0.9 + intensity) + attractX) * scrollBoost;
          p.y += (p.vy * (0.9 + intensity) + attractY) * scrollBoost;
          p.x = wrap(p.x, width);
          p.y = wrap(p.y, height);
          ctx.beginPath();
          ctx.strokeStyle = `hsla(${p.hue + Math.sin(time * 0.01 + p.seed) * 24}, 88%, 62%, ${alpha * 0.28})`;
          ctx.lineWidth = p.size;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.stroke();
          ctx.closePath();
        } else if (scheme === 'swirl') {
          const startX = p.x;
          const startY = p.y;
          const angle =
            Math.sin((p.x * 0.0023) + (time * 0.008) + p.seed) +
            Math.cos((p.y * 0.0032) - (time * 0.007));
          p.vx = lerp(p.vx, Math.cos(angle * Math.PI), 0.08);
          p.vy = lerp(p.vy, Math.sin(angle * Math.PI), 0.08);
          p.x += p.vx * (1.2 + intensity * 1.8);
          p.y += p.vy * (1.2 + intensity * 1.8);
          if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
            particles[i] = createParticle(width, height, scheme);
            continue;
          }
          ctx.beginPath();
          ctx.strokeStyle = `hsla(${p.hue}, 96%, 66%, ${alpha * 0.34})`;
          ctx.lineWidth = p.size;
          ctx.moveTo(startX, startY);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          ctx.closePath();
        } else if (scheme === 'coalesce') {
          const cx = width * 0.5 + (cursorX - width * 0.5) * 0.06 * intensity;
          const cy = height * 0.55 + (cursorY - height * 0.5) * 0.06 * intensity;
          const radius = 40 + (p.seed * 120) + Math.sin(time * 0.007 + p.seed) * 26;
          const orbit = time * 0.006 * (0.5 + intensity * 0.5) + p.seed * 3;
          p.x = cx + Math.cos(orbit) * radius;
          p.y = cy + Math.sin(orbit * 1.1) * radius * 0.6;
          const size = p.size * (0.7 + intensity * 0.35);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(orbit);
          ctx.strokeStyle = `hsla(${p.hue}, 82%, 62%, ${alpha * 0.32})`;
          ctx.lineWidth = 1.2;
          ctx.strokeRect(-size * 0.5, -size * 0.5, size, size);
          ctx.restore();
        } else {
          p.y += p.vy * (0.8 + intensity * 0.8) * scrollBoost;
          p.x += Math.sin((time * 0.01) + p.seed) * 0.35 + (cursorX - p.x) * 0.00005 * intensity;
          if (p.y < -12) {
            particles[i] = createParticle(width, height, scheme);
            continue;
          }
          ctx.beginPath();
          ctx.fillStyle = `hsla(${p.hue}, 92%, 76%, ${alpha * 0.26})`;
          ctx.arc(p.x, p.y, p.size * (0.8 + intensity * 0.25), 0, Math.PI * 2);
          ctx.fill();
          ctx.closePath();
        }
      }

      drawPulse();
      raf = window.requestAnimationFrame(drawFrame);
    };

    resize();
    const onResize = () => resize();
    const onVisibilityChange = () => {
      isVisible = document.visibilityState !== 'hidden';
      if (!isVisible) {
        if (raf) {
          window.cancelAnimationFrame(raf);
          raf = 0;
        }
        return;
      }

      if (!reducedMode && !raf) {
        raf = window.requestAnimationFrame(drawFrame);
      }
    };

    window.addEventListener('resize', onResize, { passive: true });
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibilityChange);
    }

    if (reducedMode) {
      drawBackground();
      drawPulse();
    } else if (isVisible) {
      drawFrame();
    }

    return () => {
      window.removeEventListener('resize', onResize);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilityChange);
      }
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [clickPulseSeed, intensity, reducedMode, scheme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`theme-ambient__canvas theme-ambient__canvas--${scheme}`}
      data-scheme={scheme}
    />
  );
}

export default ThemeAmbientCanvas;

