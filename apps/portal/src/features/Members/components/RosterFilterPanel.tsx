/**
 * Advanced filter panel for Roster page
 * Supports multi-select filtering by role, class, power range, status, and media
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { X, Filter, Save, Trash2 } from 'lucide-react';
import { RosterFilterState, useFilterPresets } from '../../../hooks/useFilterPresets';
import { formatClassDisplayName, formatPower } from '../../../lib/utils';

interface RosterFilterPanelProps {
  open: boolean;
  onClose: () => void;
  filters: RosterFilterState;
  onChange: (filters: RosterFilterState) => void;
  availableRoles: string[];
  availableClasses: string[];
}

export function RosterFilterPanel({
  open,
  onClose,
  filters,
  onChange,
  availableRoles,
  availableClasses,
}: RosterFilterPanelProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { presets, savePreset, deletePreset } = useFilterPresets();
  
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState('');

  const handleClearAll = () => {
    onChange({
      roles: [],
      classes: [],
      powerRange: [0, 999999999],
      status: 'all',
      hasMedia: false,
    });
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      savePreset(presetName.trim(), filters);
      setPresetName('');
      setSaveDialogOpen(false);
    }
  };

  const handleLoadPreset = (presetFilters: RosterFilterState) => {
    onChange(presetFilters);
  };

  const activeFilterCount = 
    filters.roles.length +
    filters.classes.length +
    (filters.status !== 'all' ? 1 : 0) +
    (filters.hasMedia ? 1 : 0) +
    (filters.powerRange[0] > 0 || filters.powerRange[1] < 999999999 ? 1 : 0);

  const content = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Filter size={20} />
          <Typography variant="h6" fontWeight={700}>Filters</Typography>
          {activeFilterCount > 0 && (
            <Chip 
              label={activeFilterCount} 
              size="small" 
              color="primary" 
              sx={{ fontWeight: 900, fontSize: '0.7rem' }}
            />
          )}
        </Stack>
        <IconButton size="small" onClick={onClose}>
          <X size={18} />
        </IconButton>
      </Box>

      {/* Filters Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Stack spacing={3}>
          {/* Presets */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Quick Presets
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {presets.map((preset) => (
                <Chip
                  key={preset.id}
                  label={preset.name}
                  onClick={() => handleLoadPreset(preset.filters)}
                  onDelete={!preset.isDefault ? () => deletePreset(preset.id) : undefined}
                  deleteIcon={<Trash2 size={14} />}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* Role Filter */}
          <FormControl fullWidth>
            <Autocomplete
              multiple
              options={availableRoles}
              value={filters.roles}
              onChange={(_, newValue) => onChange({ ...filters, roles: newValue })}
              renderInput={(params) => (
                <TextField {...params} label="Roles" placeholder="Select roles..." />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    size="small"
                    color="primary"
                    sx={{ textTransform: 'capitalize' }}
                  />
                ))
              }
              size="small"
            />
          </FormControl>

          {/* Class Filter */}
          <FormControl fullWidth>
            <Autocomplete
              multiple
              options={availableClasses}
              value={filters.classes}
              onChange={(_, newValue) => onChange({ ...filters, classes: newValue })}
              getOptionLabel={(option) => formatClassDisplayName(option)}
              renderInput={(params) => (
                <TextField {...params} label="Classes" placeholder="Select classes..." />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={formatClassDisplayName(option)}
                    {...getTagProps({ index })}
                    size="small"
                    color="secondary"
                  />
                ))
              }
              renderOption={(props, option) => (
                <li {...props}>{formatClassDisplayName(option)}</li>
              )}
              size="small"
            />
          </FormControl>

          {/* Power Range */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Power Range
            </Typography>
            <Box sx={{ px: 2 }}>
              <Slider
                value={filters.powerRange}
                onChange={(_, newValue) => onChange({ ...filters, powerRange: newValue as [number, number] })}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => formatPower(value)}
                min={0}
                max={50000000}
                step={1000000}
                marks={[
                  { value: 0, label: '0' },
                  { value: 10000000, label: '10M' },
                  { value: 25000000, label: '25M' },
                  { value: 50000000, label: '50M' },
                ]}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" textAlign="center" display="block" mt={1}>
              {formatPower(filters.powerRange[0])} - {formatPower(filters.powerRange[1])}
            </Typography>
          </Box>

          {/* Status Filter */}
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => onChange({ ...filters, status: e.target.value as any })}
            >
              <MenuItem value="all">All Members</MenuItem>
              <MenuItem value="active">Active Only</MenuItem>
              <MenuItem value="inactive">Inactive Only</MenuItem>
            </Select>
          </FormControl>

          {/* Has Media Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={filters.hasMedia}
                onChange={(e) => onChange({ ...filters, hasMedia: e.target.checked })}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" fontWeight={600}>
                Only show members with media
              </Typography>
            }
          />
        </Stack>
      </Box>

      {/* Footer Actions */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Stack spacing={1}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<Save size={16} />}
            onClick={() => setSaveDialogOpen(true)}
            disabled={activeFilterCount === 0}
          >
            Save as Preset
          </Button>
          <Button
            variant="text"
            fullWidth
            onClick={handleClearAll}
            disabled={activeFilterCount === 0}
          >
            Clear All Filters
          </Button>
        </Stack>
      </Box>

      {/* Save Preset Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Filter Preset</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Preset Name"
            fullWidth
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSavePreset()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSavePreset} variant="contained" disabled={!presetName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  return (
    <Drawer
      anchor={isMobile ? 'bottom' : 'right'}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : 360,
          height: isMobile ? '85vh' : '100%',
          borderTopLeftRadius: isMobile ? 16 : 0,
          borderTopRightRadius: isMobile ? 16 : 0,
        },
      }}
    >
      {content}
    </Drawer>
  );
}
