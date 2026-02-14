import React, { CSSProperties, ElementType, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type DecorativeVariant = 'default' | 'war-room' | 'arcane' | 'minimal' | 'neon';
type DecorativeLayerType = 'icon' | 'orb' | 'ring';
type DecorativeMotion = 'none' | 'drift' | 'parallax' | 'reactive';
type DecorativeIconProps = {
  sx?: Record<string, unknown>;
  className?: string;
  style?: CSSProperties;
};

interface DecorativeLayer {
  id?: string;
  type?: DecorativeLayerType;
  icon?: ElementType<DecorativeIconProps>;
  color?: string;
  size?: number;
  opacity?: number;
  rotation?: number;
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  blur?: number;
  blendMode?: CSSProperties['mixBlendMode'];
}

interface DecorativeBackgroundProps {
  variant?: DecorativeVariant;
  layers?: DecorativeLayer[];
  motion?: DecorativeMotion;
  motionStrength?: number;
  icon?: ElementType<DecorativeIconProps>;
  color?: string; // legacy single-layer API
  size?: number;
  opacity?: number;
  rotation?: number;
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  className?: string;
  animate?: boolean;
}

interface MotionContext {
  mode: DecorativeMotion;
  strength: number;
  pointer: { x: number; y: number };
  isHovered: boolean;
  driftTick: number;
}

const VARIANT_STYLES: Record<
  DecorativeVariant,
  {
    gradient: string;
    glowColor: string;
    noiseOpacity: number;
  }
> = {
  default: {
    gradient:
      'radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--color-accent-primary) 18%, transparent), transparent 60%)',
    glowColor: 'var(--color-accent-primary)',
    noiseOpacity: 0.04,
  },
  'war-room': {
    gradient:
      'radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--color-status-warning) 22%, transparent), transparent 62%), radial-gradient(circle at 85% 30%, color-mix(in srgb, var(--color-status-error) 16%, transparent), transparent 56%)',
    glowColor: 'var(--color-status-warning)',
    noiseOpacity: 0.08,
  },
  arcane: {
    gradient:
      'radial-gradient(circle at 18% 25%, color-mix(in srgb, var(--color-status-info) 22%, transparent), transparent 60%), radial-gradient(circle at 80% 22%, color-mix(in srgb, var(--color-accent-primary) 16%, transparent), transparent 52%)',
    glowColor: 'var(--color-status-info)',
    noiseOpacity: 0.06,
  },
  minimal: {
    gradient:
      'radial-gradient(circle at 25% 25%, color-mix(in srgb, var(--sys-surface-elevated) 26%, transparent), transparent 62%)',
    glowColor: 'var(--sys-border-default)',
    noiseOpacity: 0.02,
  },
  neon: {
    gradient:
      'radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--color-status-info) 30%, transparent), transparent 58%), radial-gradient(circle at 80% 28%, color-mix(in srgb, var(--color-status-success) 24%, transparent), transparent 54%)',
    glowColor: 'var(--color-status-info)',
    noiseOpacity: 0.1,
  },
};

function renderLayer(layer: DecorativeLayer, animate: boolean, index: number, motion: MotionContext) {
  const layerId = layer.id || `layer-${index}`;
  const type = layer.type || (layer.icon ? 'icon' : 'orb');
  const size = layer.size ?? 180;
  const color = layer.color || 'var(--color-accent-primary)';
  const opacity = layer.opacity ?? 0.08;
  const blur = layer.blur ?? (type === 'orb' ? 16 : 0);
  const rotation = layer.rotation ?? -12;
  const depth = (index + 1) * motion.strength;

  let translateX = 0;
  let translateY = 0;
  let scale = 1;

  if (motion.mode === 'drift') {
    translateX = Math.cos(motion.driftTick / 9 + index * 1.4) * (1.8 * depth);
    translateY = Math.sin(motion.driftTick / 11 + index) * (2.2 * depth);
  } else if (motion.mode === 'parallax') {
    translateX = motion.pointer.x * (2.4 * depth);
    translateY = motion.pointer.y * (1.8 * depth);
  } else if (motion.mode === 'reactive' && motion.isHovered) {
    translateX = motion.pointer.x * (3.8 * depth);
    translateY = motion.pointer.y * (2.8 * depth);
    scale = 1 + 0.01 + index * 0.003;
  }

  const transformParts = [
    `translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, 0)`,
    type === 'icon' ? `rotate(${rotation}deg)` : '',
    scale !== 1 ? `scale(${scale.toFixed(3)})` : '',
  ].filter(Boolean);

  const layerStyle: CSSProperties = {
    position: 'absolute',
    top: layer.top,
    right: layer.right,
    bottom: layer.bottom,
    left: layer.left,
    opacity,
    mixBlendMode: layer.blendMode,
    filter: blur > 0 ? `blur(${blur}px)` : undefined,
    transition: animate ? 'transform 0.5s ease-out, opacity 0.35s ease-out' : undefined,
    transform: transformParts.join(' '),
  };

  if (type === 'icon' && layer.icon) {
    const IconComponent = layer.icon;
    return (
      <div key={layerId} data-ui-layer={layerId} style={layerStyle}>
        <IconComponent
          sx={{
            fontSize: size,
            color,
            opacity: 1,
            display: 'block',
          }}
        />
      </div>
    );
  }

  if (type === 'ring') {
    return (
      <div
        key={layerId}
        data-ui-layer={layerId}
        style={{
          ...layerStyle,
          width: size,
          height: size,
          borderRadius: '9999px',
          border: `1px solid color-mix(in srgb, ${color} 62%, transparent)`,
          boxShadow: `0 0 ${Math.round(size * 0.25)}px color-mix(in srgb, ${color} 28%, transparent)`,
        }}
      />
    );
  }

  return (
    <div
      key={layerId}
      data-ui-layer={layerId}
      style={{
        ...layerStyle,
        width: size,
        height: size,
        borderRadius: '9999px',
        background:
          `radial-gradient(circle at 30% 30%, color-mix(in srgb, ${color} 58%, transparent), color-mix(in srgb, ${color} 8%, transparent) 65%, transparent 100%)`,
      }}
    />
  );
}

export function DecorativeBackground({
  variant = 'default',
  layers = [],
  motion = 'none',
  motionStrength = 1,
  icon: IconComponent,
  color,
  size = 180,
  opacity = 0.08,
  rotation = -12,
  top,
  right,
  bottom,
  left,
  className,
  animate = true,
}: DecorativeBackgroundProps) {
  const variantStyle = VARIANT_STYLES[variant];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [driftTick, setDriftTick] = useState(0);
  const effectiveMotion: DecorativeMotion = prefersReducedMotion ? 'none' : motion;

  const normalizedLayers = useMemo(() => {
    const legacyLayer: DecorativeLayer[] = IconComponent
      ? [
          {
            id: 'legacy-icon',
            type: 'icon',
            icon: IconComponent,
            color,
            size,
            opacity,
            rotation,
            top,
            right,
            bottom,
            left,
          },
        ]
      : [];

    return [...legacyLayer, ...layers];
  }, [IconComponent, color, size, opacity, rotation, top, right, bottom, left, layers]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    handleChange();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  useEffect(() => {
    if (effectiveMotion !== 'drift') return;
    const interval = window.setInterval(() => {
      setDriftTick((tick) => tick + 1);
    }, 80);

    return () => window.clearInterval(interval);
  }, [effectiveMotion]);

  useEffect(() => {
    if (effectiveMotion !== 'parallax' && effectiveMotion !== 'reactive') {
      setPointer({ x: 0, y: 0 });
      setIsHovered(false);
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const root = containerRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const withinBounds =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!withinBounds) {
        setPointer({ x: 0, y: 0 });
        setIsHovered(false);
        return;
      }

      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      setPointer({ x, y });
      setIsHovered(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [effectiveMotion]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn('absolute pointer-events-none z-0', className)}
      data-ui="decorative-background"
      data-variant={variant}
      data-motion={effectiveMotion}
      style={{
        top,
        right,
        bottom,
        left,
        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))',
      }}
    >
      <div
        data-ui-overlay="gradient"
        className="absolute inset-0"
        style={{
          background: variantStyle.gradient,
          opacity: 1,
        }}
      />
      <div
        data-ui-overlay="glow"
        className="absolute inset-0"
        style={{
          boxShadow: `inset 0 0 120px color-mix(in srgb, ${variantStyle.glowColor} 20%, transparent)`,
        }}
      />
      <div
        data-ui-overlay="noise"
        className="absolute inset-0"
        style={{
          opacity: variantStyle.noiseOpacity,
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0.5px, transparent 1px), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.28) 0.5px, transparent 1px)',
          backgroundSize: '3px 3px, 4px 4px',
          mixBlendMode: 'soft-light',
        }}
      />
      {normalizedLayers.map((layer, index) =>
        renderLayer(layer, animate, index, {
          mode: effectiveMotion,
          strength: motionStrength,
          pointer,
          isHovered,
          driftTick,
        }),
      )}
    </div>
  );
}
