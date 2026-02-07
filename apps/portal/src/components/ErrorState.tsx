
import React from 'react';
import { Box, Typography, Button, Stack, Paper } from '@mui/material';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({ message, onRetry, title }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="300px" 
      width="100%"
      p={3}
    >
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 6, 
          textAlign: 'center', 
          maxWidth: 500, 
          borderRadius: 4, 
          bgcolor: 'background.paper',
          borderStyle: 'dashed',
          borderColor: 'error.main'
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'error.main', opacity: 0.1, color: 'error.main', display: 'flex' }}>
            <AlertCircle size={48} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={900} gutterBottom>
              {title || t('common.error_title', 'System Malfunction')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {message || t('common.error_message', 'The requested data could not be retrieved from the server core.')}
            </Typography>
          </Box>
          {onRetry && (
            <Button 
              variant="contained" 
              color="error" 
              startIcon={<RefreshCcw size={16} />} 
              onClick={onRetry}
              sx={{ borderRadius: 2, fontWeight: 800 }}
            >
              {t('common.retry', 'Attempt Resync')}
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
