import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Badge.module.css';

export type PrimitiveBadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
export type PrimitiveBadgeSize = 'sm' | 'md' | 'lg';

export interface PrimitiveBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: PrimitiveBadgeVariant;
  size?: PrimitiveBadgeSize;
}

/**
 * Primitive badge is a compact semantic status capsule.
 * Feature cards and lists compose this for state and metadata labels.
 */
export function Badge({ variant = 'default', size = 'md', className, children, ...rest }: PrimitiveBadgeProps) {
  return (
    <span className={cn(styles.badge, styles[variant], styles[size], className)} {...rest}>
      {children}
    </span>
  );
}

