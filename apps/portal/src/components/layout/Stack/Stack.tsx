import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Stack.module.css';

export type StackGap = '1' | '2' | '3' | '4' | '6' | '8' | '12';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: StackGap;
  align?: StackAlign;
}

/**
 * Stack is the default vertical rhythm primitive for sections and forms.
 * It replaces ad-hoc margin chains with explicit spacing + alignment tokens.
 */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, gap = '4', align = 'stretch', ...rest }, ref) => (
    <div ref={ref} className={cn(styles.stack, styles[`gap-${gap}`], styles[`align-${align}`], className)} {...rest} />
  ),
);

Stack.displayName = 'Stack';

