import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Cluster.module.css';

export type ClusterGap = '1' | '2' | '3' | '4' | '6';
export type ClusterJustify = 'start' | 'center' | 'end' | 'between';
export type ClusterAlign = 'start' | 'center' | 'end';

export interface ClusterProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: ClusterGap;
  justify?: ClusterJustify;
  align?: ClusterAlign;
}

/**
 * Cluster arranges inline groups that wrap naturally across lines.
 * It is used for chips, action rows, and compact metadata groups.
 */
export const Cluster = React.forwardRef<HTMLDivElement, ClusterProps>(
  ({ className, gap = '2', justify = 'start', align = 'center', ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(styles.cluster, styles[`gap-${gap}`], styles[`justify-${justify}`], styles[`align-${align}`], className)}
      {...rest}
    />
  ),
);

Cluster.displayName = 'Cluster';

