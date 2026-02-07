import React, { useRef } from 'react';
import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import { UploadCloud } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type MediaUploadProps = {
  label?: string;
  accept?: string;
  onSelect: (file: File) => void;
};

import { convertToWebP } from '../lib/media-conversion';

export function MediaUpload({ label, accept = 'image/*,audio/*', onSelect }: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const theme = useTheme();
  const { t } = useTranslation();

  const displayLabel = label || t('media.upload_label');

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <Box
      sx={{
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 3,
        p: 2.5,
        textAlign: 'center',
        cursor: 'pointer',
        '&:hover': { borderColor: theme.palette.primary.main, bgcolor: 'action.hover' },
      }}
      onClick={handleClick}
    >
      <Stack spacing={1.5} alignItems="center" justifyContent="center">
        <UploadCloud size={28} />
        <Typography variant="body2" fontWeight={800}>{displayLabel}</Typography>
        <Typography variant="caption" color="text.secondary">{t('media.upload_formats')}</Typography>
        <Button variant="contained" size="small" onClick={handleClick}>{t('media.choose_file')}</Button>
      </Stack>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            try {
              // Convert media
              let processedFile = file;
              if (file.type.startsWith('image/')) {
                processedFile = await convertToWebP(file);
              } else if (file.type.startsWith('audio/')) {
                const { convertToOpus } = await import('../lib/media-conversion');
                processedFile = await convertToOpus(file);
              }
              
              onSelect(processedFile);
            } catch (error) {
              console.error('File processing error:', error);
              onSelect(file); // Fallback to original
            }
          }
        }}
      />
    </Box>
  );
}
