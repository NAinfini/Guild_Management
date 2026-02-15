import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Text.module.css';

export type PrimitiveTextSize = 'xs' | 'sm' | 'base' | 'lg';
export type PrimitiveTextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type PrimitiveTextColor = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'error';
export type PrimitiveTextAlign = 'left' | 'center' | 'right';
export type PrimitiveTextElement = 'p' | 'span' | 'div' | 'label';

export interface PrimitiveTextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color' | 'children'> {
  size?: PrimitiveTextSize;
  weight?: PrimitiveTextWeight;
  color?: PrimitiveTextColor;
  align?: PrimitiveTextAlign;
  as?: PrimitiveTextElement;
  children: React.ReactNode;
}

/**
 * Primitive text enforces the approved size/weight/color matrix from the rework plan.
 * Composed UI should use this instead of one-off body/label typography classes.
 */
export function Text({
  size = 'base',
  weight = 'normal',
  color = 'primary',
  align = 'left',
  as = 'span',
  className,
  children,
  ...rest
}: PrimitiveTextProps) {
  const Tag = as as React.ElementType;

  return (
    <Tag className={cn(styles.text, styles[`size-${size}`], styles[`weight-${weight}`], styles[`color-${color}`], styles[`align-${align}`], className)} {...rest}>
      {children}
    </Tag>
  );
}

