import React, { useRef } from 'react';
import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import { UploadCloud } from 'lucide-react';

type MediaUploadProps = {
  label?: string;
  accept?: string;
  onSelect: (file: File) => void;
};

export function MediaUpload({ label = 'Upload', accept = 'image/*,audio/*', onSelect }: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const theme = useTheme();

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
        <Typography variant="body2" fontWeight={800}>{label}</Typography>
        <Typography variant="caption" color="text.secondary">PNG, WebP, or audio</Typography>
        <Button variant="contained" size="small" onClick={handleClick}>Choose File</Button>
      </Stack>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
        }}
      />
    </Box>
  );
}
