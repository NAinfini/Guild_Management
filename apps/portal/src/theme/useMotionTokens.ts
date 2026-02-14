import * as React from 'react';
import { onThemeChange, useThemeController } from './ThemeController';

export interface MotionTokens {
  fastMs: number;
  mediumMs: number;
  slowMs: number;
  ease: string;
  liftPx: number;
  pressScale: number;
  pressYPx: number;
}

const DEFAULT_MOTION_TOKENS: MotionTokens = {
  fastMs: 150,
  mediumMs: 220,
  slowMs: 300,
  ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
  liftPx: -1,
  pressScale: 0.985,
  pressYPx: 1,
};

const MOTION_DEBUG_STORAGE_KEY = 'baiye_motion_debug';

function parseTimeMs(raw: string, fallback: number): number {
  const normalized = raw.trim();
  if (!normalized) return fallback;

  if (normalized.endsWith('ms')) {
    const parsed = Number.parseFloat(normalized.slice(0, -2));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  if (normalized.endsWith('s')) {
    const parsed = Number.parseFloat(normalized.slice(0, -1));
    return Number.isFinite(parsed) ? parsed * 1000 : fallback;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parsePx(raw: string, fallback: number): number {
  const normalized = raw.trim();
  if (!normalized) return fallback;

  if (normalized.endsWith('px')) {
    const parsed = Number.parseFloat(normalized.slice(0, -2));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseScale(raw: string, fallback: number): number {
  const parsed = Number.parseFloat(raw.trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readMotionTokensFromDom(): MotionTokens {
  if (typeof window === 'undefined') return DEFAULT_MOTION_TOKENS;

  const root = document.documentElement;
  const computed = window.getComputedStyle(root);
  const easingRaw = computed.getPropertyValue('--interaction-ease').trim();

  return {
    fastMs: parseTimeMs(
      computed.getPropertyValue('--interaction-fast'),
      DEFAULT_MOTION_TOKENS.fastMs,
    ),
    mediumMs: parseTimeMs(
      computed.getPropertyValue('--interaction-med'),
      DEFAULT_MOTION_TOKENS.mediumMs,
    ),
    slowMs: parseTimeMs(
      computed.getPropertyValue('--interaction-slow'),
      DEFAULT_MOTION_TOKENS.slowMs,
    ),
    ease: easingRaw || DEFAULT_MOTION_TOKENS.ease,
    liftPx: parsePx(
      computed.getPropertyValue('--interaction-hover-lift'),
      DEFAULT_MOTION_TOKENS.liftPx,
    ),
    pressScale: parseScale(
      computed.getPropertyValue('--interaction-press-scale'),
      DEFAULT_MOTION_TOKENS.pressScale,
    ),
    pressYPx: parsePx(
      computed.getPropertyValue('--interaction-press-y'),
      DEFAULT_MOTION_TOKENS.pressYPx,
    ),
  };
}

function isMotionDebugEnabled(): boolean {
  if (!import.meta.env.DEV || typeof window === 'undefined') return false;
  if (import.meta.env.VITE_THEME_MOTION_DEBUG === '1') return true;

  try {
    return window.localStorage.getItem(MOTION_DEBUG_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function useMotionTokens(): MotionTokens {
  const { currentTheme, currentColor, motionIntensity, motionMode, effectiveMotionMode } = useThemeController();
  const [tokens, setTokens] = React.useState<MotionTokens>(() => readMotionTokensFromDom());

  const refreshTokens = React.useCallback(() => {
    setTokens(readMotionTokensFromDom());
  }, []);

  React.useEffect(() => {
    refreshTokens();
  }, [refreshTokens, currentTheme, currentColor, motionIntensity, motionMode, effectiveMotionMode]);

  React.useEffect(() => onThemeChange(() => refreshTokens()), [refreshTokens]);

  React.useEffect(() => {
    if (!isMotionDebugEnabled()) return;

    console.info('[motion-tokens]', {
      theme: currentTheme,
      color: currentColor,
      motionIntensity,
      motionMode,
      effectiveMotionMode,
      ...tokens,
    });
  }, [tokens, currentTheme, currentColor, motionIntensity, motionMode, effectiveMotionMode]);

  return tokens;
}
