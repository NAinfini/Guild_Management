
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Typography, Link, Box, useTheme, alpha } from '@mui/material';

interface MarkdownRendererProps {
  children: string;
}

export function MarkdownRenderer({ children }: MarkdownRendererProps) {
  const theme = useTheme();

  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }) => <Typography variant="h4" fontWeight={900} gutterBottom {...props} sx={{ mt: 3, mb: 2, ...props.style }} />,
        h2: ({ node, ...props }) => <Typography variant="h5" fontWeight={800} gutterBottom {...props} sx={{ mt: 3, mb: 1.5, ...props.style }} />,
        h3: ({ node, ...props }) => <Typography variant="h6" fontWeight={700} gutterBottom {...props} sx={{ mt: 2, mb: 1, ...props.style }} />,
        p: ({ node, ...props }) => <Typography variant="body2" color="text.secondary" paragraph {...props} sx={{ lineHeight: 1.7, ...props.style }} />,
        a: ({ node, ...props }) => <Link color="primary" underline="hover" {...props} target="_blank" rel="noopener noreferrer" />,
        ul: ({ node, ...props }) => <Box component="ul" sx={{ pl: 2, my: 1, color: 'text.secondary' }} {...props} />,
        ol: ({ node, ...props }) => <Box component="ol" sx={{ pl: 2, my: 1, color: 'text.secondary' }} {...props} />,
        li: ({ node, ...props }) => <Box component="li" sx={{ mb: 0.5, typography: 'body2' }} {...props} />,
        blockquote: ({ node, ...props }) => (
          <Box 
            component="blockquote" 
            sx={{ 
              borderLeft: `4px solid ${theme.palette.primary.main}`, 
              pl: 2, 
              py: 1, 
              my: 2, 
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: '0 8px 8px 0',
              fontStyle: 'italic',
              color: 'text.primary'
            }} 
            {...props} 
          />
        ),
        code: ({ className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match && !String(children).includes('\n');
          return isInline ? (
            <Box 
              component="code" 
              sx={{ 
                bgcolor: 'action.hover', 
                color: 'primary.main', 
                fontWeight: 'bold', 
                px: 0.5, 
                py: 0.25, 
                borderRadius: 1, 
                fontFamily: 'monospace',
                fontSize: '0.85em'
              }} 
              {...props}
            >
              {children}
            </Box>
          ) : (
            <Box 
              component="pre" 
              sx={{ 
                bgcolor: 'action.hover', 
                color: 'text.primary', 
                p: 2, 
                borderRadius: 2, 
                overflowX: 'auto', 
                my: 2,
                fontFamily: 'monospace',
                fontSize: '0.85em'
              }}
            >
              <code className={className} {...props}>
                {children}
              </code>
            </Box>
          );
        },
        img: ({ node, ...props }) => (
            <Box 
                component="img" 
                sx={{ 
                    maxWidth: '100%', 
                    height: 'auto', 
                    borderRadius: 2, 
                    my: 2,
                    display: 'block' 
                }} 
                {...props} 
            />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
