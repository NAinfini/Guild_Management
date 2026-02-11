
import React from 'react';
import { Box, Typography, Paper, Button, Stack, styled } from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

const UploadZone = styled(Paper)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: theme.palette.action.hover,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.selected,
  },
}));

interface MediaUploadProps {
  label?: string;
  onUpload: (files: File[]) => void;
  onRemove: (index: number) => void;
  media: any[];
}

export const MediaUpload = ({ label, onUpload }: MediaUploadProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onUpload(Array.from(e.target.files));
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom fontWeight="bold">
        {label || 'Upload Media'}
      </Typography>
      <UploadZone elevation={0} onClick={handleClick}>
        <input
          type="file"
          hidden
          ref={inputRef}
          multiple
          accept="image/*,video/*"
          onChange={handleChange}
        />
        <Stack spacing={2} alignItems="center">
          <UploadIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
          <Box>
            <Typography variant="body1" fontWeight="medium">
              Click or drag files to upload
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supports images and video
            </Typography>
          </Box>
        </Stack>
      </UploadZone>
    </Box>
  );
};
