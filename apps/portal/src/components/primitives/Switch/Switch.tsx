import React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';
import styles from './Switch.module.css';

export interface PrimitiveSwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: boolean | string;
  containerClassName?: string;
}

/**
 * Switch primitive provides a token-driven toggle control with optional field metadata.
 * Screens can compose it directly without recreating label/error accessibility wiring.
 */
export const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, PrimitiveSwitchProps>(
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
          <SwitchPrimitive.Root
            ref={ref}
            id={inputId}
            className={cn(styles.root, className)}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            {...props}
          >
            <SwitchPrimitive.Thumb className={styles.thumb} />
          </SwitchPrimitive.Root>

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

Switch.displayName = 'Switch';
