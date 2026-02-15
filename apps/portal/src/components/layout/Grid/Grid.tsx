import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Grid.module.css';

export type GridCols = 1 | 2 | 3 | 4 | 6 | 12;
export type GridGap = 'tight' | 'normal' | 'relaxed';

export interface GridResponsiveCols {
  mobile?: GridCols;
  tablet?: GridCols;
  desktop?: GridCols;
  wide?: GridCols;
}

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: GridCols | GridResponsiveCols;
  gap?: GridGap;
}

interface NormalizedGridCols {
  mobile: GridCols;
  tablet: GridCols;
  desktop: GridCols;
  wide: GridCols;
}

function normalizeCols(cols: GridCols | GridResponsiveCols): NormalizedGridCols {
  if (typeof cols === 'number') {
    return { mobile: cols, tablet: cols, desktop: cols, wide: cols };
  }

  const mobile = cols.mobile ?? 1;
  const tablet = cols.tablet ?? mobile;
  const desktop = cols.desktop ?? tablet;
  const wide = cols.wide ?? desktop;

  return { mobile, tablet, desktop, wide };
}

/**
 * Grid applies responsive, token-driven column layouts without page-specific breakpoint logic.
 * Features can declare intent via props while this primitive resolves mobile-to-wide fallbacks.
 */
export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, gap = 'normal', ...rest }, ref) => {
    const resolved = normalizeCols(cols);

    return (
      <div
        ref={ref}
        className={cn(
          styles.grid,
          styles[`gap-${gap}`],
          styles[`cols-mobile-${resolved.mobile}`],
          styles[`cols-tablet-${resolved.tablet}`],
          styles[`cols-desktop-${resolved.desktop}`],
          styles[`cols-wide-${resolved.wide}`],
          className,
        )}
        {...rest}
      />
    );
  },
);

Grid.displayName = 'Grid';

