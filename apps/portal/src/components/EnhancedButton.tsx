import React from 'react';
import { Button, ButtonProps, alpha, useTheme } from '@mui/material';

export type EnhancedButtonProps = ButtonProps & {
  shine?: boolean;
};

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  shine = true,
  children,
  sx,
  ...props
}) => {
  const theme = useTheme();
  return (
    <Button
      {...props}
      sx={{
        borderRadius: 3,
        fontWeight: 900,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        background: shine
          ? `linear-gradient(120deg, ${alpha(theme.palette.primary.main, 0.95)}, ${alpha(
              theme.palette.secondary.main,
              0.9,
            )})`
          : undefined,
        color: shine ? theme.palette.primary.contrastText : undefined,
        boxShadow: shine ? `0 12px 30px ${alpha(theme.palette.primary.main, 0.35)}` : undefined,
        '&:hover': {
          transform: 'translateY(-1px)',
        },
        transition: 'all 0.2s ease',
        ...sx,
      }}
    >
      {children}
    </Button>
  );
};
