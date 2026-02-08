import React from 'react';
import { Box, Typography, type SxProps, type Theme } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content?: string | null;
  fallback?: string;
  variant?: 'body2' | 'caption';
  color?: string;
  maxLines?: number;
  sx?: SxProps<Theme>;
}

export function MarkdownContent({
  content,
  fallback = '',
  variant = 'body2',
  color = 'text.secondary',
  maxLines,
  sx,
}: MarkdownContentProps) {
  const text = (content ?? '').trim() || fallback;

  return (
    <Box
      sx={{
        '& p': {
          m: 0,
          lineHeight: 1.6,
        },
        '& p + p': {
          mt: 0.75,
        },
        '& ul, & ol': {
          m: 0,
          pl: 2.5,
        },
        '& li': {
          mb: 0.25,
        },
        '& a': {
          color: 'inherit',
        },
        ...(maxLines
          ? {
              '& p': {
                display: '-webkit-box',
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              },
            }
          : {}),
        ...sx,
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, ...props }) => <Typography variant={variant} color={color} {...props} />,
          ul: ({ node, ...props }) => <Box component="ul" sx={{ typography: variant, color }} {...props} />,
          ol: ({ node, ...props }) => <Box component="ol" sx={{ typography: variant, color }} {...props} />,
          li: ({ node, ...props }) => <Box component="li" sx={{ typography: variant, color }} {...props} />,
          a: ({ node, ...props }) => <Box component="a" target="_blank" rel="noopener noreferrer" {...props} />,
        }}
      >
        {text}
      </ReactMarkdown>
    </Box>
  );
}
