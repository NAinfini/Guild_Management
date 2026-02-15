import React from 'react';
import { Box } from '@/ui-bridge/material';
import { ArrowDownward, ArrowUpward } from '@/ui-bridge/icons-material';
import { useTheme } from '@/ui-bridge/material/styles';
import type { SxProps, Theme } from '@/ui-bridge/material/styles';

type Direction = 'asc' | 'desc' | null | undefined;

export interface SortArrowsProps {
  active?: boolean;
  isActive?: boolean;
  direction?: Direction;
  order?: Direction;
  sortDirection?: Direction;
  size?: 'small' | 'medium' | 'large';
  sx?: SxProps<Theme>;
}

const iconSizeByProp = {
  small: 12,
  medium: 14,
  large: 16,
} as const;

export const SortArrows: React.FC<SortArrowsProps> = ({
  active,
  isActive,
  direction,
  order,
  sortDirection,
  size = 'small',
  sx,
}) => {
  const theme = useTheme();
  const custom = (theme as any)?.custom;
  const token = custom?.components?.sortArrows ?? {};

  const resolvedActive = Boolean(active ?? isActive);
  const resolvedDirection = (direction ?? order ?? sortDirection ?? null) as
    | 'asc'
    | 'desc'
    | null;

  const activeColor =
    token.active ?? 'var(--cmp-sort-arrow-active, var(--color-accent-primary, currentColor))';
  const inactiveColor = token.inactive ?? 'var(--cmp-sort-arrow-inactive, var(--sys-text-secondary, currentColor))';
  const iconSize = iconSizeByProp[size] ?? iconSizeByProp.small;

  return (
    <Box
      component="span"
      sx={
        sx
          ? [
              {
                display: 'inline-flex',
                flexDirection: 'column',
                lineHeight: 0.8,
                ml: 0.5,
              },
              sx,
            ]
          : {
              display: 'inline-flex',
              flexDirection: 'column',
              lineHeight: 0.8,
              ml: 0.5,
            }
      }
    >
      <ArrowUpward
        sx={{
          fontSize: iconSize,
          color: resolvedActive && resolvedDirection === 'asc' ? activeColor : inactiveColor,
        }}
      />
      <ArrowDownward
        sx={{
          fontSize: iconSize,
          mt: '-2px',
          color: resolvedActive && resolvedDirection === 'desc' ? activeColor : inactiveColor,
        }}
      />
    </Box>
  );
};

export default SortArrows;
