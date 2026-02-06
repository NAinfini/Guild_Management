/**
 * Bulk Action Toolbar
 * Fixed toolbar that appears at bottom of screen when items are selected
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Slide,
  Divider,
} from '@mui/material';
import { 
  X as CloseIcon, 
  Trash2 as DeleteIcon, 
  Archive as ArchiveIcon, 
  RefreshCcw as UnarchiveIcon, 
  Pin as PinIcon 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBulkSelection } from './BulkSelectionProvider';

interface BulkActionToolbarProps {
  entityType: 'announcements' | 'events' | 'members';
  onDelete?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  onPin?: () => void;
  onUnpin?: () => void;
  isLoading?: boolean;
}

export function BulkActionToolbar({
  entityType,
  onDelete,
  onArchive,
  onUnarchive,
  onPin,
  onUnpin,
  isLoading = false,
}: BulkActionToolbarProps) {
  const { t } = useTranslation();
  const { selectedCount, clearSelection } = useBulkSelection();

  return (
    <Slide direction="up" in={selectedCount > 0} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          p: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: 1200,
            mx: 'auto',
          }}
        >
          {/* Left: Selection count */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={clearSelection}
              sx={{ color: 'inherit' }}
              disabled={isLoading}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6">
              {t('common.items_selected', { count: selectedCount, type: t(`nav.${entityType}`).toLowerCase() })}
            </Typography>
          </Box>

          {/* Right: Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isLoading && <CircularProgress size={24} sx={{ color: 'inherit' }} />}

            {onPin && (
              <Button
                variant="contained"
                startIcon={<PinIcon />}
                onClick={onPin}
                disabled={isLoading}
                sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
              >
                {t('common.pin')}
              </Button>
            )}

            {onUnpin && (
              <Button
                variant="contained"
                startIcon={<PinIcon />}
                onClick={onUnpin}
                disabled={isLoading}
                sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
              >
                {t('common.unpin')}
              </Button>
            )}

            {onArchive && (
              <Button
                variant="contained"
                startIcon={<ArchiveIcon />}
                onClick={onArchive}
                disabled={isLoading}
                sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
              >
                {t('common.archive')}
              </Button>
            )}

            {onUnarchive && (
              <Button
                variant="contained"
                startIcon={<UnarchiveIcon />}
                onClick={onUnarchive}
                disabled={isLoading}
                sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
              >
                {t('common.unarchive')}
              </Button>
            )}

            {onDelete && (
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={onDelete}
                disabled={isLoading}
              >
                {t('common.delete')}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Slide>
  );
}
