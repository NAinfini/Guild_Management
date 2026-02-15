
import React from 'react';
import { Box, Typography, Stack, Paper, useTheme, alpha } from '@/ui-bridge/material';
import { SvgIconComponent } from '@/ui-bridge/icons-material';

interface EmptyStateProps {
  icon: SvgIconComponent;
  message: string;
  action?: React.ReactNode;
  description?: string;
}

export function EmptyState({ icon: Icon, message, action, description }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      width="100%"
      py={6}
    >
      <Paper 
        elevation={0}
        sx={{ 
          p: 6, 
          textAlign: 'center', 
          maxWidth: 400, 
          borderRadius: 4, 
          bgcolor: 'action.hover',
          border: '1px dashed',
          borderColor: 'divider'
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'primary.main', opacity: 0.1, color: 'primary.main', display: 'flex' }}>
            <Icon sx={{ fontSize: 48 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={900} textTransform="uppercase" gutterBottom>
              {message}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>
          {action && (
            <Box mt={1}>
              {action}
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
