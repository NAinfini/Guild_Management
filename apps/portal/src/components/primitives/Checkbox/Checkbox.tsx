import React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '@/lib/utils';
import styles from './Checkbox.module.css';

export interface PrimitiveCheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: boolean | string;
  containerClassName?: string;
}

/**
 * Checkbox primitive handles baseline semantics plus optional field copy.
 * Feature forms reuse this to keep label, description, and error behavior consistent.
 */
export const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, PrimitiveCheckboxProps>(
  (
    {
      id,
      className,
      containerClassName,
      label,
      description,
      error,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const generatedDescriptionId = React.useId();
    const generatedErrorId = React.useId();
    const inputId = id ?? generatedId;
    const hasError = Boolean(error);
    const errorMessage = typeof error === 'string' ? error : undefined;
    const describedBy =
      [ariaDescribedBy, description ? generatedDescriptionId : undefined, errorMessage ? generatedErrorId : undefined]
        .filter(Boolean)
        .join(' ') || undefined;

    return (
      <div className={cn(styles.field, containerClassName)}>
        <div className={styles.control}>
          <CheckboxPrimitive.Root
            ref={ref}
            id={inputId}
            className={cn(styles.root, className)}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            {...props}
          >
            <CheckboxPrimitive.Indicator className={styles.indicator}>✓</CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>

          {label ? (
            <label htmlFor={inputId} className={styles.label}>
              {label}
            </label>
          ) : null}
        </div>

        {description ? (
          <p id={generatedDescriptionId} className={styles.description}>
            {description}
          </p>
        ) : null}

        {errorMessage ? (
          <p id={generatedErrorId} className={styles.error} role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
