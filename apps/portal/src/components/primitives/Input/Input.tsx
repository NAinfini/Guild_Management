import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Input.module.css';

export interface PrimitiveInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: boolean | string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Primitive input used by feature-level forms.
 * It centralizes baseline field chrome, icon slots, and error semantics.
 */
export const Input = React.forwardRef<HTMLInputElement, PrimitiveInputProps>(
  (
    {
      className,
      error,
      leftIcon,
      rightIcon,
      disabled,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref,
  ) => {
    const generatedErrorId = React.useId();
    const hasError = Boolean(error);
    const errorMessage = typeof error === 'string' ? error : undefined;
    // Keep upstream aria-describedby and append our error message id when present.
    const describedBy = [ariaDescribedBy, errorMessage ? generatedErrorId : undefined].filter(Boolean).join(' ') || undefined;

    return (
      <div className={cn(styles.field, className)}>
        <div
          className={cn(
            styles.control,
            leftIcon && styles.withLeftIcon,
            rightIcon && styles.withRightIcon,
            hasError && styles.error,
            disabled && styles.disabled,
          )}
        >
          {leftIcon ? (
            <span className={cn(styles.icon, styles.leftIcon)} aria-hidden="true">
              {leftIcon}
            </span>
          ) : null}

          <input
            ref={ref}
            className={styles.input}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            {...rest}
          />

          {rightIcon ? (
            <span className={cn(styles.icon, styles.rightIcon)} aria-hidden="true">
              {rightIcon}
            </span>
          ) : null}
        </div>

        {errorMessage ? (
          <p id={generatedErrorId} className={styles.errorText} role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';

