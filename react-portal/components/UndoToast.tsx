/**
 * Undo Toast Component
 * Shows a toast notification with undo button after destructive operations
 */

import React, { useEffect, useState } from 'react';
import { Snackbar, Alert, Button, LinearProgress, Box } from '@mui/material';

interface UndoToastProps {
  open: boolean;
  message: string;
  onUndo: () => void;
  onClose: () => void;
  duration?: number;
}

export function UndoToast({
  open,
  message,
  onUndo,
  onClose,
  duration = 30000,
}: UndoToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!open) {
      setProgress(100);
      return;
    }

    const interval = 100;
    const decrement = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - decrement;
        if (next <= 0) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [open, duration, onClose]);

  const handleUndo = () => {
    onUndo();
    onClose();
  };

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: 80 }} // Above bulk action toolbar
    >
      <Alert
        severity="info"
        action={
          <Button color="inherit" size="small" onClick={handleUndo}>
            UNDO
          </Button>
        }
        sx={{ width: '100%', minWidth: 300 }}
      >
        <Box>
          {message}
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ mt: 1, height: 3 }}
          />
        </Box>
      </Alert>
    </Snackbar>
  );
}
