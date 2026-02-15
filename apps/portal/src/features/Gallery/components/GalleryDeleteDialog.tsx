import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@/ui-bridge/material';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

interface GalleryDeleteDialogProps {
  open: boolean;
  dividerColor: string;
  t: TranslateFn;
  onClose: () => void;
  onConfirm: () => void;
}

export function GalleryDeleteDialog({ open, dividerColor, t, onClose, onConfirm }: GalleryDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: 4, border: `1px solid ${dividerColor}` } }}
    >
      <DialogTitle>
        <Typography variant="overline" fontWeight={900} letterSpacing="0.1em">
          {t('gallery.delete_title')}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{t('gallery.delete_confirm')}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          {t('common.cancel')}
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          {t('common.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default GalleryDeleteDialog;
