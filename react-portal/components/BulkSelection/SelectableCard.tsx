/**
 * Selectable Card Wrapper
 * Wraps any card component with checkbox selection functionality
 */

import React, { ReactNode } from 'react';
import { Box, Checkbox, Card } from '@mui/material';
import { useBulkSelection } from './BulkSelectionProvider';

interface SelectableCardProps {
  id: string;
  children: ReactNode;
  disabled?: boolean;
}

export function SelectableCard({ id, children, disabled = false }: SelectableCardProps) {
  const { isSelected, toggleSelection } = useBulkSelection();
  const selected = isSelected(id);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    toggleSelection(id);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Checkbox overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 10,
        }}
      >
        <Checkbox
          checked={selected}
          onClick={handleCheckboxClick}
          disabled={disabled}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 1,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        />
      </Box>

      {/* Card with selection highlight */}
      <Box
        sx={{
          transition: 'all 0.2s',
          border: selected ? 2 : 0,
          borderColor: 'primary.main',
          borderRadius: 1,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
