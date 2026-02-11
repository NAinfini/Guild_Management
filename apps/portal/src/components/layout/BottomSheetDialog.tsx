import React from 'react';
import {
  Dialog,
  DialogProps,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from '@mui/material';
import { useMobileOptimizations } from '@/hooks';

type BottomSheetDialogProps = DialogProps & {
  title?: React.ReactNode;
  actions?: React.ReactNode;
};

export const BottomSheetDialog: React.FC<BottomSheetDialogProps> = ({
  title,
  actions,
  children,
  PaperProps,
  ...rest
}) => {
  const mobile = useMobileOptimizations();

  const mergedPaperProps = {
    ...mobile.modalProps.PaperProps,
    ...PaperProps,
    'data-testid': 'bottom-sheet-paper',
    'data-fullscreen': mobile.isSmallMobile ? 'true' : 'false',
    sx: {
      ...(mobile.modalProps.PaperProps?.sx as any),
      ...(PaperProps?.sx as any),
    },
  } as DialogProps['PaperProps'];

  return (
    <Dialog
      {...mobile.modalProps}
      {...rest}
      keepMounted
      PaperProps={mergedPaperProps}
    >
      {title && (
        <DialogTitle
          sx={{
            pb: 1,
            pt: 1.5,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {title}
        </DialogTitle>
      )}
      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          pt: title ? 0 : 3,
          pb: `calc(env(safe-area-inset-bottom) + 12px)`,
        }}
      >
        {children}
      </DialogContent>
      {actions && (
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            pb: `calc(env(safe-area-inset-bottom) + 12px)`,
          }}
        >
          <Box sx={{ width: '100%' }}>{actions}</Box>
        </DialogActions>
      )}
    </Dialog>
  );
};
