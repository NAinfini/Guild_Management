import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Split.module.css';

export type SplitGap = '4' | '6' | '8';
export type SplitRatio = '1:1' | '1:2' | '2:1' | '1:3' | '3:1';

const ratioClassMap: Record<SplitRatio, string> = {
  '1:1': 'ratio-1-1',
  '1:2': 'ratio-1-2',
  '2:1': 'ratio-2-1',
  '1:3': 'ratio-1-3',
  '3:1': 'ratio-3-1',
};

export interface SplitProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  gap?: SplitGap;
  ratio?: SplitRatio;
  children: [React.ReactNode, React.ReactNode];
}

/**
 * Split is a two-pane layout primitive with responsive stacking on mobile.
 * It preserves semantic left/right ownership while normalizing ratio variants.
 */
export const Split = React.forwardRef<HTMLDivElement, SplitProps>(
  ({ className, gap = '6', ratio = '1:1', children, ...rest }, ref) => {
    const [left, right] = children;

    return (
      <div ref={ref} className={cn(styles.split, styles[`gap-${gap}`], styles[ratioClassMap[ratio]], className)} {...rest}>
        <div className={styles.panel}>{left}</div>
        <div className={styles.panel}>{right}</div>
      </div>
    );
  },
);

Split.displayName = 'Split';

