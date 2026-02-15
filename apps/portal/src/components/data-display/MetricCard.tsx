import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@/ui-bridge/material';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const metricCardVariants = cva(
  'relative overflow-hidden transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-surface-default hover:bg-surface-elevated',
        elevated: 'bg-surface-elevated hover:shadow-lg',
        success: 'bg-status-success-bg border-l-4 border-status-success',
        warning: 'bg-status-warning-bg border-l-4 border-status-warning',
        error: 'bg-status-error-bg border-l-4 border-status-error',
        info: 'bg-status-info-bg border-l-4 border-status-info',
      },
      size: {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
      interactive: {
        true: 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        false: '',
      },
      loading: {
        true: 'pointer-events-none opacity-70',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      interactive: false,
      loading: false,
    },
  }
);

export interface MetricCardProps extends VariantProps<typeof metricCardVariants> {
  /** Main metric value */
  value: string | number;
  /** Label describing the metric */
  label: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Optional icon component */
  icon?: React.ReactNode;
  /** Optional trend indicator (+12%, -5%, etc.) */
  trend?: string;
  /** Trend direction affects color */
  trendDirection?: 'up' | 'down' | 'neutral';
  /** Click handler when interactive */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Show loading skeleton */
  loading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  subtitle,
  icon,
  trend,
  trendDirection = 'neutral',
  variant,
  size,
  interactive,
  onClick,
  className,
  loading,
}) => {
  const getTrendColor = () => {
    if (!trend) return 'text-text-tertiary';
    switch (trendDirection) {
      case 'up':
        return 'text-status-success';
      case 'down':
        return 'text-status-error';
      default:
        return 'text-text-tertiary';
    }
  };

  if (loading) {
    return (
      <Card
        className={cn(
          metricCardVariants({ variant, size, loading: true }),
          className
        )}
      >
        <CardContent>
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="text" width="60%" height={40} sx={{ mt: 1 }} />
          {subtitle && <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        metricCardVariants({ variant, size, interactive: interactive || !!onClick }),
        className
      )}
      onClick={onClick}
      sx={{
        '&:focus-visible': {
          outline: '2px solid var(--color-accent-primary)',
          outlineOffset: '2px',
        },
      }}
      tabIndex={interactive || onClick ? 0 : undefined}
      role={interactive || onClick ? 'button' : undefined}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
          <Box flex="1">
            <Typography
              variant="body2"
              sx={{
                color: 'var(--color-text-secondary)',
                fontWeight: 500,
                mb: 0.5,
              }}
            >
              {label}
            </Typography>

            <Typography
              variant="h4"
              sx={{
                color: 'var(--color-text-primary)',
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {value}
            </Typography>

            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  color: 'var(--color-text-tertiary)',
                  display: 'block',
                  mt: 0.5,
                }}
              >
                {subtitle}
              </Typography>
            )}

            {trend && (
              <Typography
                variant="body2"
                className={cn('font-medium mt-1', getTrendColor())}
              >
                {trend}
              </Typography>
            )}
          </Box>

          {icon && (
            <Box
              sx={{
                color: variant === 'default' ? 'var(--color-accent-primary)' : 'inherit',
                opacity: 0.8,
                fontSize: '2rem',
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
