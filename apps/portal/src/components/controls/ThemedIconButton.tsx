import React from 'react';
import { IconButton, type IconButtonProps } from '@mui/material';
import { useTheme } from '@mui/material/styles';

type ThemedIconButtonVariant = 'default' | 'overlay' | 'overlayDanger';

export interface ThemedIconButtonProps extends IconButtonProps {
  variant?: ThemedIconButtonVariant;
}

export const ThemedIconButton: React.FC<ThemedIconButtonProps> = ({
  variant = 'default',
  sx,
  ...props
}) => {
  const theme = useTheme();
  const custom = (theme as any)?.custom;
  const token = custom?.components?.iconButton ?? {};

  const overlayBg =
    token.overlayBg ??
    token.bg ??
    custom?.semantic?.surface?.overlay ??
    custom?.semantic?.surface?.scrim ??
    'var(--cmp-icon-button-overlay-bg)';

  const overlayHoverBg =
    token.overlayHoverBg ??
    token.hoverBg ??
    custom?.semantic?.surface?.overlayHover ??
    'var(--cmp-icon-button-overlay-hover-bg)';

  const dangerColor = token.dangerText ?? 'var(--color-status-error)';
  const defaultColor = token.text ?? 'var(--cmp-icon-button-overlay-text)';

  const variantSx =
    variant === 'overlay'
      ? {
          bgcolor: overlayBg,
          color: defaultColor,
          '&:hover': { bgcolor: overlayHoverBg },
        }
      : variant === 'overlayDanger'
      ? {
          bgcolor: overlayBg,
          color: dangerColor,
          '&:hover': { bgcolor: overlayHoverBg },
        }
      : {};

  return <IconButton {...props} sx={{ ...variantSx, ...(sx as any) }} />;
};

export default ThemedIconButton;
