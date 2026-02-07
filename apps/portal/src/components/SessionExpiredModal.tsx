
import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button, 
  Typography,
  Box,
  useTheme
} from '@mui/material';
import { LogOut } from 'lucide-react';
import { useAuth } from '../hooks';
import { useTranslation } from 'react-i18next';

interface SessionExpiredModalProps {
  open: boolean;
  onLogin: () => void;
}

export function SessionExpiredModal({ open, onLogin }: SessionExpiredModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Dialog 
      open={open} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          backgroundImage: 'none',
          boxShadow: theme.shadows[10]
        }
      }}
    >
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Box 
          sx={{ 
            width: 64, 
            height: 64, 
            borderRadius: '50%', 
            bgcolor: 'action.hover', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 2,
            color: 'warning.main'
          }}
        >
          <LogOut size={32} />
        </Box>
        
        <Typography variant="h6" fontWeight={900} gutterBottom textTransform="uppercase">
          {t('auth.session_expired_title', 'Session Expired')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('auth.session_expired_message', 'Your security clearance has timed out. Please re-authenticate to continue operations.')}
        </Typography>
        
        <Button 
          variant="contained" 
          fullWidth 
          size="large"
          onClick={onLogin}
          sx={{ fontWeight: 800, mt: 2, borderRadius: 3 }}
        >
          {t('auth.login', 'Login')}
        </Button>
      </Box>
    </Dialog>
  );
}
