
import React from 'react';
import { Box, Typography, ImageList, ImageListItem, IconButton, Paper, alpha } from '@mui/material';
import { Delete as DeleteIcon, DragIndicator } from '@mui/icons-material';

interface MediaReorderProps {
  media: any[];
  onReorder: (media: any[]) => void;
  onRemove: (index: number) => void;
}

export const MediaReorder = ({ media, onRemove }: MediaReorderProps) => {
  if (!media || media.length === 0) return null;

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom fontWeight="bold" sx={{ mt: 2 }}>
        Media Gallery
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <ImageList sx={{ m: 0 }} cols={3} gap={8}>
          {media.map((item, index) => (
            <ImageListItem key={item.id || index}>
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                />
              ) : (
                <img
                  src={item.url}
                  alt={`Media ${index}`}
                  loading="lazy"
                  style={{ borderRadius: 4 }}
                />
              )}
              <Box
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  bgcolor: (theme) => alpha(theme.palette.common.black, 0.5),
                  borderRadius: '50%',
                }}
              >
                <IconButton size="small" onClick={() => onRemove(index)} sx={{ color: 'common.white' }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </ImageListItem>
          ))}
        </ImageList>
      </Paper>
    </Box>
  );
};
