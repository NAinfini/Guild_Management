/**
 * Canonical motion timing tokens for the rework design system.
 * Components should consume named tokens instead of arbitrary durations/easing curves.
 */
export const motionDurations = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.25,
  slow: 0.35,
  slower: 0.5,
} as const;

export type MotionDurationName = keyof typeof motionDurations;

export const motionEasings = {
  linear: [0, 0, 1, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
} as const;

export type MotionEasingName = keyof typeof motionEasings;

