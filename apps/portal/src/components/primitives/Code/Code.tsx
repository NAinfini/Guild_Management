import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Code.module.css';

export interface PrimitiveCodeProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  children: React.ReactNode;
}

/**
 * Primitive inline code for technical tokens, identifiers, and command snippets.
 * Feature text can embed this to get a consistent monospace capsule treatment.
 */
export function Code({ className, children, ...rest }: PrimitiveCodeProps) {
  return (
    <code className={cn(styles.code, className)} {...rest}>
      {children}
    </code>
  );
}

