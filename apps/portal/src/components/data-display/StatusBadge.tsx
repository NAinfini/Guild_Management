import React from 'react';
import { Chip } from '@mui/material';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'transition-all duration-200 font-medium',
  {
    variants: {
      variant: {
        success: 'bg-status-success-bg text-status-success border-status-success',
        warning: 'bg-status-warning-bg text-status-warning border-status-warning',
        error: 'bg-status-error-bg text-status-error border-status-error',
        info: 'bg-status-info-bg text-status-info border-status-info',
        neutral: 'bg-surface-elevated text-text-primary border-border-default',
        primary: 'bg-accent-primary-subtle text-accent-primary border-accent-primary',
      },
      size: {
        sm: 'h-5 text-xs px-2',
        md: 'h-6 text-sm px-3',
        lg: 'h-8 text-base px-4',
      },
      interactive: {
        true: 'cursor-pointer hover:opacity-80 hover:scale-105 active:scale-95',
        false: '',
      },
      outlined: {
        true: 'border-2 bg-transparent',
        false: '',
      },
      pulse: {
        true: 'animate-pulse',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
      interactive: false,
      outlined: false,
      pulse: false,
    },
  }
);

export interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  /** Badge label text */
  label: string;
  /** Optional icon (left side) */
  icon?: React.ReactNode;
  /** Optional delete handler */
  onDelete?: () => void;
  /** Click handler when interactive */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Show with pulsing animation (for live/active states) */
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  icon,
  variant,
  size,
  interactive,
  outlined,
  onDelete,
  onClick,
  className,
  pulse,
}) => {
  return (
    <Chip
      label={label}
      icon={icon ? <span className="flex items-center">{icon}</span> : undefined}
      onDelete={onDelete}
      onClick={onClick}
      className={cn(
        statusBadgeVariants({
          variant,
          size,
          interactive: interactive || !!onClick,
          outlined,
          pulse,
        }),
        className
      )}
      sx={{
        '&:focus-visible': {
          outline: '2px solid var(--color-accent-primary)',
          outlineOffset: '2px',
        },
        '& .MuiChip-icon': {
          marginLeft: '8px',
          marginRight: '-4px',
        },
        '& .MuiChip-deleteIcon': {
          color: 'inherit',
          opacity: 0.7,
          '&:hover': {
            opacity: 1,
          },
        },
      }}
    />
  );
};

// Preset variants for common statuses
export const ActiveBadge: React.FC<Omit<StatusBadgeProps, 'variant'>> = (props) => (
  <StatusBadge {...props} variant="success" />
);

export const InactiveBadge: React.FC<Omit<StatusBadgeProps, 'variant'>> = (props) => (
  <StatusBadge {...props} variant="neutral" />
);

export const PendingBadge: React.FC<Omit<StatusBadgeProps, 'variant' | 'pulse'>> = (props) => (
  <StatusBadge {...props} variant="warning" pulse />
);

export const ErrorBadge: React.FC<Omit<StatusBadgeProps, 'variant'>> = (props) => (
  <StatusBadge {...props} variant="error" />
);

export const LiveBadge: React.FC<Omit<StatusBadgeProps, 'variant' | 'pulse'>> = (props) => (
  <StatusBadge {...props} variant="error" pulse label={props.label || 'LIVE'} />
);
