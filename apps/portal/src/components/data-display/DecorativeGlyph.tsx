import React from 'react';
import { Box, useTheme, alpha } from '@mui/material';
import { AutoAwesome } from "@mui/icons-material";

type DecorativeGlyphProps = {
  icon?: any; // MUI icon component
  color?: string;
  size?: number;
  opacity?: number;
  rotation?: number;
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
};

/**
 * Faint background icon overlay for cards/boxes.
 * Places a large, low-opacity glyph in a corner without intercepting pointer events.
 */
export const DecorativeGlyph: React.FC<DecorativeGlyphProps> = ({
  icon: Icon,
  color,
  size = 180,
  opacity = 0.08,
  rotation = -12,
  top,
  right = -12,
  bottom,
  left,
}) => {
  const theme = useTheme();
  const resolvedColor = color || theme.palette.text.secondary;

  // Use the provided Icon component if available, otherwise default to Sparkles
  const GlyphIcon = Icon || AutoAwesome;

  return (
    <Box
      aria-hidden
      data-testid="decorative-glyph"
      sx={{
        position: 'absolute',
        pointerEvents: 'none',
        top,
        right,
        bottom,
        left,
        opacity,
        transform: `rotate(${rotation}deg)`,
        filter: `drop-shadow(0 10px 20px ${alpha(theme.palette.common.black, 0.1)})`,
        color: resolvedColor,
      }}
    >
      <GlyphIcon sx={{ fontSize: size }} />
    </Box>
  );
};
