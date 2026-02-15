import React from 'react';
import { cn } from '@/lib/utils';
import styles from './PageContainer.module.css';

export type PageContainerWidth = 'narrow' | 'comfortable' | 'standard' | 'wide' | 'full';
export type PageContainerSpacing = 'tight' | 'normal' | 'relaxed';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: PageContainerWidth;
  spacing?: PageContainerSpacing;
}

/**
 * PageContainer is the outer page shell used by feature screens.
 * It centralizes max-width and vertical rhythm so routes share a predictable layout baseline.
 */
export const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, width = 'standard', spacing = 'normal', ...rest }, ref) => (
    <div ref={ref} className={cn(styles.container, styles[width], styles[spacing], className)} {...rest} />
  ),
);

PageContainer.displayName = 'PageContainer';

