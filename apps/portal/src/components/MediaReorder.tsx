import React from 'react';
import { Box, IconButton, Stack, Typography, Card, CardMedia } from '@mui/material';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

type MediaItem = {
  url: string;
  type: 'image' | 'audio';
};

type MediaReorderProps = {
  items: MediaItem[];
  onReorder: (from: number, to: number) => void;
  onDelete?: (index: number) => void;
};

export function MediaReorder({ items, onReorder, onDelete }: MediaReorderProps) {
  return (
    <Stack spacing={2}>
      {items.map((item, idx) => (
        <Card key={idx} sx={{ display: 'flex', alignItems: 'center', p: 1.5 }}>
          <CardMedia
            component={item.type === 'image' ? 'img' : 'audio'}
            src={item.url}
            controls={item.type === 'audio'}
            sx={{ width: item.type === 'image' ? 80 : '100%', height: item.type === 'image' ? 80 : 'auto', borderRadius: 2, mr: 2 }}
          />
          <Typography variant="body2" sx={{ flexGrow: 1 }} noWrap>{item.url}</Typography>
          <Stack direction="row" spacing={1}>
            <IconButton size="small" disabled={idx === 0} onClick={() => onReorder(idx, idx - 1)}><ArrowUp size={16} /></IconButton>
            <IconButton size="small" disabled={idx === items.length - 1} onClick={() => onReorder(idx, idx + 1)}><ArrowDown size={16} /></IconButton>
            {onDelete && <IconButton size="small" color="error" onClick={() => onDelete(idx)}><Trash2 size={16} /></IconButton>}
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}
