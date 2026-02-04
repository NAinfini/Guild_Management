import React from 'react';
import { Box, useTheme } from '@mui/material';
import { useMobileOptimizations } from '../hooks';

type ResponsiveTableProps = {
  children: React.ReactNode;
  minWidth?: number;
  maxHeight?: number | string;
  stickyFirstColumn?: boolean;
};

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  children,
  minWidth = 720,
  maxHeight,
  stickyFirstColumn = false,
}) => {
  const theme = useTheme();
  const mobile = useMobileOptimizations();

  return (
    <Box
      data-testid="responsive-table"
      data-sticky-first-column={stickyFirstColumn ? 'true' : 'false'}
      sx={{
        position: 'relative',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        boxShadow: theme.custom?.cardShadow,
        px: mobile.isMobile ? 1.5 : 2,
        py: 1.5,
        maxHeight,
        '& table': {
          minWidth,
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: 0,
        },
        '& th, & td': {
          padding: mobile.responsive({
            xs: '10px 12px',
            sm: '12px 14px',
            md: '14px 16px',
            default: '14px 16px',
          }),
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        },
        ...(stickyFirstColumn && {
          '& th:first-of-type, & td:first-of-type': {
            position: 'sticky',
            left: 0,
            zIndex: 2,
            boxShadow: `4px 0 8px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.08)'}`,
          },
        }),
        '&::-webkit-scrollbar': {
          height: 8,
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme.palette.action.hover,
          borderRadius: 999,
        },
      }}
    >
      {/* Gradient edges as scroll cues */}
      <Box
        aria-hidden
        sx={{
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          width: 12,
          height: '100%',
          background: `linear-gradient(to right, ${theme.palette.background.paper}, transparent)`,
        }}
      />
      <Box
        aria-hidden
        sx={{
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          right: 0,
          width: 12,
          height: '100%',
          background: `linear-gradient(to left, ${theme.palette.background.paper}, transparent)`,
        }}
      />
      {children}
    </Box>
  );
};
