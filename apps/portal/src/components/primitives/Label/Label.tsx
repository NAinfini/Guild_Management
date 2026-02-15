import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Label.module.css';

export interface PrimitiveLabelProps extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'children'> {
  required?: boolean;
  children: React.ReactNode;
}

/**
 * Primitive label standardizes field caption styling and required indicator rendering.
 * Form-level primitives compose this to keep consistent semantics and spacing.
 */
export function Label({ required = false, className, children, ...rest }: PrimitiveLabelProps) {
  return (
    <label className={cn(styles.label, className)} {...rest}>
      {children}
      {required ? (
        <span className={styles.required} aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}

