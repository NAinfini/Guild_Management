import React from 'react';
import { motionDurations, motionEasings, motionPresets } from '@/design-system/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface PageTransitionProps extends React.HTMLAttributes<HTMLDivElement> {
  transitionKey?: string | number;
  disableViewTransitions?: boolean;
}

/**
 * PageTransition coordinates route-level entrance animation with reduced-motion safety.
 * It prefers native View Transitions when available and falls back to Motion One keyframes.
 */
export const PageTransition = React.forwardRef<HTMLDivElement, PageTransitionProps>(
  ({ transitionKey, disableViewTransitions = false, style, children, ...rest }, forwardedRef) => {
    const localRef = React.useRef<HTMLDivElement | null>(null);
    const prefersReducedMotion = useReducedMotion();

    React.useImperativeHandle(forwardedRef, () => localRef.current as HTMLDivElement, []);

    React.useEffect(() => {
      const node = localRef.current;
      if (!node || prefersReducedMotion) {
        return;
      }

      if (!disableViewTransitions && typeof document.startViewTransition === 'function') {
        document.startViewTransition(() => Promise.resolve());
        return;
      }

      let cancelled = false;
      let cancelAnimation: (() => void) | undefined;

      // Defer motion runtime load so the app shell is not blocked by animation code.
      void import('motion').then(({ animate }) => {
        if (cancelled || !localRef.current) {
          return;
        }

        const animation = animate(localRef.current, motionPresets.pageEnter, {
          duration: motionDurations.normal,
          ease: motionEasings.easeOut,
        });
        cancelAnimation = () => animation.cancel();
      });

      return () => {
        cancelled = true;
        cancelAnimation?.();
      };
    }, [disableViewTransitions, prefersReducedMotion, transitionKey]);

    return (
      <div ref={localRef} style={{ minHeight: '100%', ...style }} {...rest}>
        {children}
      </div>
    );
  },
);

PageTransition.displayName = 'PageTransition';
