import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Card.module.css';

export type PrimitiveCardVariant = 'elevated' | 'outlined' | 'flat';

export interface PrimitiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: PrimitiveCardVariant;
}

export type PrimitiveCardSectionProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Primitive card surface used by composed widgets.
 * It defines shared shell styling and small section helpers for layout consistency.
 */
export const Card = React.forwardRef<HTMLDivElement, PrimitiveCardProps>(
  ({ className, variant = 'elevated', ...rest }, ref) => (
    <div ref={ref} className={cn(styles.card, styles[variant], className)} {...rest} />
  ),
);

Card.displayName = 'Card';

/**
 * Card header is a semantic top section for titles/actions.
 */
export const CardHeader = React.forwardRef<HTMLDivElement, PrimitiveCardSectionProps>(
  ({ className, ...rest }, ref) => <div ref={ref} className={cn(styles.header, className)} {...rest} />,
);

CardHeader.displayName = 'CardHeader';

/**
 * Card content holds the main body payload for the composed feature block.
 */
export const CardContent = React.forwardRef<HTMLDivElement, PrimitiveCardSectionProps>(
  ({ className, ...rest }, ref) => <div ref={ref} className={cn(styles.content, className)} {...rest} />,
);

CardContent.displayName = 'CardContent';

/**
 * Card footer is reserved for trailing metadata and action rows.
 */
export const CardFooter = React.forwardRef<HTMLDivElement, PrimitiveCardSectionProps>(
  ({ className, ...rest }, ref) => <div ref={ref} className={cn(styles.footer, className)} {...rest} />,
);

CardFooter.displayName = 'CardFooter';
