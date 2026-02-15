import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Button.module.css';

export type PrimitiveButtonVariant = 'primary' | 'secondary' | 'ghost';
export type PrimitiveButtonSize = 'sm' | 'md' | 'lg';

export interface PrimitiveButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: PrimitiveButtonVariant;
  size?: PrimitiveButtonSize;
  loading?: boolean;
}

/**
 * Primitive button used by the rework design system.
 * It keeps behavior minimal so composed feature components can layer domain logic on top.
 */
export const Button = React.forwardRef<HTMLButtonElement, PrimitiveButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...rest }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type="button"
        aria-busy={loading || undefined}
        disabled={isDisabled}
        className={cn(styles.button, styles[variant], styles[size], loading && styles.loading, className)}
        {...rest}
      >
        {loading && <span className={styles.spinner} aria-hidden="true" />}
        <span>{children}</span>
      </button>
    );
  },
);

Button.displayName = 'Button';
