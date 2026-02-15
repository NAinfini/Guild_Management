import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useTheme,
} from '@/ui-bridge/material';
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
} from '@/ui-bridge/icons-material';

type GalleryUploadDialogProps = {
  open: boolean;
  onClose: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  isDragOver: boolean;
};

export default function GalleryUploadDialog({
  open,
  onClose,
  fileInputRef,
  onFileSelect,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragOver,
}: GalleryUploadDialogProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: 4, border: `1px solid ${theme.palette.divider}` } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="overline" fontWeight={900} letterSpacing="0.1em">
          {t('gallery.upload_title')}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            p: 4,
            border: '2px dashed',
            borderColor: isDragOver ? 'primary.main' : 'divider',
            borderRadius: 3,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            bgcolor: isDragOver ? 'action.hover' : 'transparent',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <UploadIcon sx={{ fontSize: 48, opacity: 0.5, mb: 2, color: isDragOver ? theme.palette.primary.main : 'inherit' }} />
          <Typography variant="body2" fontWeight={700} mb={1}>
            {t('gallery.drop_files')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('gallery.file_types')}
          </Typography>
        </Box>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={onFileSelect}
        />
      </DialogContent>
    </Dialog>
  );
}
