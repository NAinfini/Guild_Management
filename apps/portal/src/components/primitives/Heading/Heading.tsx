import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Heading.module.css';

export type PrimitiveHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type PrimitiveHeadingAlign = 'left' | 'center' | 'right';

export interface PrimitiveHeadingProps extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'children'> {
  level: PrimitiveHeadingLevel;
  align?: PrimitiveHeadingAlign;
  children: React.ReactNode;
}

/**
 * Primitive heading that maps semantic levels to shared typography tokens.
 * Feature pages compose this for titles and section headers without MUI Typography.
 */
export function Heading({ level, align = 'left', className, children, ...rest }: PrimitiveHeadingProps) {
  const Tag = `h${level}` as React.ElementType;

  return (
    <Tag className={cn(styles.heading, styles[`level-${level}`], styles[`align-${align}`], className)} {...rest}>
      {children}
    </Tag>
  );
}
