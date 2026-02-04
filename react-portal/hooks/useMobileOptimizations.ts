import { useTheme, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';

/**
 * Mobile optimization hook for responsive design
 * Based on Global.md requirements:
 * - 360-400px: small phones
 * - 768px: tablet portrait
 * - 1024px: tablet landscape
 * - 1280px+: desktop
 * - Touch targets >= 48x48 on mobile
 * - Bottom-sheet modals on phones
 */
export function useMobileOptimizations() {
  const theme = useTheme();

  // Breakpoint checks
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 640px
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 768px
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 768px - 1024px
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // >= 1024px
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('xl')); // >= 1280px
  const isUltraWide = useMediaQuery('(min-width:1440px)'); // 1440px+

  // Touch device detection
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Responsive values helper
  const responsive = <T,>(config: {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    default: T;
  }): T => {
    if (isSmallMobile && config.xs !== undefined) return config.xs;
    if (isMobile && config.sm !== undefined) return config.sm;
    if (isTablet && config.md !== undefined) return config.md;
    if (isDesktop && config.lg !== undefined) return config.lg;
    return config.default;
  };

  // Touch-optimized spacing (minimum 48x48 for touch targets)
  const touchTargetSize = isMobile ? 48 : 40;
  const touchTargetPadding = isMobile ? 12 : 8;

  // Modal presentation style (bottom sheet on mobile, dialog on desktop)
  const modalProps = {
    fullScreen: isSmallMobile,
    PaperProps: {
      sx: isSmallMobile ? {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        m: 0,
        maxHeight: '90vh',
        pb: 'env(safe-area-inset-bottom)',
      } : undefined,
    },
  };

  // Drawer props for mobile bottom sheet style
  const drawerProps = {
    anchor: isMobile ? 'bottom' as const : 'right' as const,
    PaperProps: {
      sx: isMobile ? {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85vh',
        pb: 'env(safe-area-inset-bottom)',
      } : {
        width: 400,
        maxWidth: '90vw',
      },
    },
  };

  return {
    // Breakpoints
    isSmallMobile,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isUltraWide,
    isTouchDevice,

    // Helpers
    responsive,
    touchTargetSize,
    touchTargetPadding,
    modalProps,
    drawerProps,

    // Spacing utilities
    spacing: {
      page: responsive({ xs: 1.5, sm: 2, md: 3, lg: 4, default: 4 }),
      section: responsive({ xs: 3, sm: 4, md: 6, lg: 8, default: 8 }),
      card: responsive({ xs: 2, sm: 2.5, md: 3, default: 3 }),
      inline: responsive({ xs: 1, sm: 1.5, md: 2, default: 2 }),
      pageWithSafeArea: responsive({ xs: 1.5, sm: 2, md: 3, lg: 4, default: 4 }),
    },

    // Font sizing
    fontSize: {
      display: responsive({ xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '3rem', default: '3rem' }),
      h1: responsive({ xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.5rem', default: '2.5rem' }),
      h2: responsive({ xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '2rem', default: '2rem' }),
      h3: responsive({ xs: '1.1rem', sm: '1.25rem', md: '1.5rem', default: '1.5rem' }),
      body: responsive({ xs: '0.875rem', sm: '1rem', default: '1rem' }),
      caption: responsive({ xs: '0.7rem', sm: '0.75rem', default: '0.75rem' }),
    },

    // Grid columns
    gridColumns: {
      roster: responsive({ xs: 1, sm: 2, md: 3, lg: 4, default: 4 }),
      dashboard: responsive({ xs: 1, lg: 12, default: 12 }),
      events: responsive({ xs: 1, sm: 1, md: 2, default: 2 }),
    },

    // Safe area insets
    safeArea: {
      top: 'env(safe-area-inset-top)',
      right: 'env(safe-area-inset-right)',
      bottom: 'env(safe-area-inset-bottom)',
      left: 'env(safe-area-inset-left)',
    },
  };
}
