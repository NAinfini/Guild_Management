import {
  Box,
  Dialog,
  IconButton,
  Typography,
} from '@/ui-bridge/material';
import { Close as CloseIcon } from '@/ui-bridge/icons-material';
import type { GalleryImage } from '../../../lib/api/gallery';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

interface GalleryPreviewDialogProps {
  previewImage: GalleryImage;
  onClose: () => void;
  t: TranslateFn;
}

export default function GalleryPreviewDialog({ previewImage, onClose, t }: GalleryPreviewDialogProps) {
  const previewUrl = previewImage.r2_key ? `/api/media/${encodeURIComponent(previewImage.r2_key)}` : '';

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="xl"
      PaperProps={{
        sx: {
          bgcolor: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
          backgroundImage: 'none',
        },
      }}
      slotProps={{
        backdrop: {
          sx: { backdropFilter: 'blur(5px)', bgcolor: 'rgba(0,0,0,0.8)' },
        },
      }}
    >
      <Box sx={{ position: 'relative', outline: 'none' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: -40,
            right: 0,
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
          }}
        >
          <CloseIcon sx={{ fontSize: 24 }} />
        </IconButton>
        <Box sx={{ position: 'relative' }}>
          <img
            src={previewUrl}
            alt={previewImage.title || t('gallery.alt_image')}
            width={1600}
            height={1200}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: 8,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
            onContextMenu={(event) => event.preventDefault()}
          />
          <Box sx={{ position: 'absolute', bottom: -40, left: 0, right: 0, textAlign: 'center' }}>
            <Typography variant="subtitle1" fontWeight={700} color="white">
              {previewImage.title || t('gallery.untitled')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
