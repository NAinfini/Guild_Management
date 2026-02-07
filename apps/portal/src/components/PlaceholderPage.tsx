import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { LucideIcon } from 'lucide-react';

type PlaceholderPageProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
};

export function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <Stack spacing={2} alignItems="center">
        {Icon && <Icon size={48} opacity={0.2} />}
        <Typography variant="h5" fontWeight={900}>{title}</Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480 }}>
            {description}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
