type MotionKeyframeValue = string | number;
type MotionKeyframes = Record<string, readonly MotionKeyframeValue[]>;

/**
 * Shared keyframe presets used by page transitions, entrances, and micro-interactions.
 * Keep this list intentionally small so motion language stays consistent across screens.
 */
export const motionPresets: Record<string, MotionKeyframes> = {
  pageEnter: {
    opacity: [0, 1],
    y: [8, 0],
    filter: ['blur(4px)', 'blur(0px)'],
  },
  pageExit: {
    opacity: [1, 0],
    y: [0, -4],
    filter: ['blur(0px)', 'blur(2px)'],
  },
  fadeInUp: {
    opacity: [0, 1],
    y: [16, 0],
  },
  fadeIn: {
    opacity: [0, 1],
  },
  scaleOnHover: {
    scale: [1, 1.02],
  },
  scaleOnPress: {
    scale: [1, 0.98],
  },
  pulse: {
    opacity: [0.5, 1, 0.5],
  },
  shimmer: {
    x: ['-100%', '100%'],
  },
  spin: {
    rotate: [0, 360],
  },
};

export type MotionPresetName = keyof typeof motionPresets;

