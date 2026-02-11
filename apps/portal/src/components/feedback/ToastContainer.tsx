import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useToastStore } from '@/lib/toast';

/**
 * Global toast notification container
 * Should be placed at the root of the app
 */
export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <>
      {toasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open={true}
          autoHideDuration={toast.duration}
          onClose={() => removeToast(toast.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            // Stack multiple toasts vertically
            bottom: `${24 + index * 76}px !important`,
          }}
        >
          <Alert
            onClose={() => removeToast(toast.id)}
            severity={toast.severity}
            variant="filled"
            sx={{
              width: '100%',
              boxShadow: 3,
            }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};
