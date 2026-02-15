import React from 'react';
import { motionDurations, motionEasings } from '@/design-system/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface StaggeredListProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
}

/**
 * StaggeredList runs a single stagger timeline for child items tagged with `data-stagger-item`.
 * Wrappers are rendered by default to keep integration simple for existing list markup.
 */
export const StaggeredList = React.forwardRef<HTMLDivElement, StaggeredListProps>(
  ({ delay = 0.05, children, ...rest }, forwardedRef) => {
    const localRef = React.useRef<HTMLDivElement | null>(null);
    const prefersReducedMotion = useReducedMotion();

    React.useImperativeHandle(forwardedRef, () => localRef.current as HTMLDivElement, []);

    React.useEffect(() => {
      const node = localRef.current;
      if (!node || prefersReducedMotion) {
        return;
      }

      const items = node.querySelectorAll('[data-stagger-item]');
      if (items.length === 0) {
        return;
      }

      let cancelled = false;
      let cancelAnimation: (() => void) | undefined;

      // Defer motion runtime load to keep list-only animations out of startup path.
      void import('motion').then(({ animate, stagger }) => {
        if (cancelled || !localRef.current) {
          return;
        }

        const animation = animate(
          Array.from(localRef.current.querySelectorAll('[data-stagger-item]')),
          {
            opacity: [0, 1],
            transform: ['translateX(-14px)', 'translateX(0px)'],
          },
          {
            duration: motionDurations.normal,
            delay: stagger(delay),
            ease: motionEasings.easeOut,
          },
        );
        cancelAnimation = () => animation.cancel();
      });

      return () => {
        cancelled = true;
        cancelAnimation?.();
      };
    }, [delay, prefersReducedMotion]);

    return (
      <div ref={localRef} {...rest}>
        {React.Children.map(children, (child, index) => (
          <div data-stagger-item key={index}>
            {child}
          </div>
        ))}
      </div>
    );
  },
);

StaggeredList.displayName = 'StaggeredList';
