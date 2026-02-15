import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Skeleton.module.css';

export type PrimitiveSkeletonVariant = 'text' | 'circular' | 'rectangular';
export type PrimitiveSkeletonAnimation = 'pulse' | 'wave' | 'none';

export interface PrimitiveSkeletonProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: PrimitiveSkeletonVariant;
  animation?: PrimitiveSkeletonAnimation;
  width?: number | string;
  height?: number | string;
}

/**
 * Primitive skeleton provides shape-accurate loading placeholders.
 * Feature placeholders compose this to avoid layout shift during async states.
 */
export function Skeleton({
  variant = 'text',
  animation = 'pulse',
  width,
  height,
  className,
  style,
  ...rest
}: PrimitiveSkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(styles.skeleton, styles[variant], styles[animation], className)}
      style={{ width, height, ...style }}
      {...rest}
    />
  );
}

