import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

type ToastProps = {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
  autoHideDuration?: number;
};

export function Toast({ open, message, severity = 'info', onClose, autoHideDuration = 3000 }: ToastProps) {
  return (
    <Snackbar
      open={open}
      onClose={onClose}
      autoHideDuration={autoHideDuration}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ fontWeight: 800 }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
