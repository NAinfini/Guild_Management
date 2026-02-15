import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Center.module.css';

export type CenterWidth = 'narrow' | 'comfortable' | 'standard';

export interface CenterProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: CenterWidth;
}

/**
 * Center constrains readable content blocks while preserving horizontal padding.
 * It is intended for prose, empty states, and focused form sections.
 */
export const Center = React.forwardRef<HTMLDivElement, CenterProps>(
  ({ className, maxWidth = 'comfortable', ...rest }, ref) => (
    <div ref={ref} className={cn(styles.center, styles[maxWidth], className)} {...rest} />
  ),
);

Center.displayName = 'Center';

