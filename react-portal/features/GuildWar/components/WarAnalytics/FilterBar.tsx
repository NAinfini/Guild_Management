/**
 * War Analytics - Filter Bar Component
 *
 * Global filters that apply across all modes:
 * - Date range (presets + custom)
 * - War selector (multi-select)
 * - Participation filter (toggle)
 */

import { useState } from 'react';
import {
  Stack,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Button,
  Box,
  Popover,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Calendar, ChevronDown, Search, X } from 'lucide-react';
import { useAnalytics } from './AnalyticsContext';
import { DATE_RANGE_PRESETS } from './types';
import type { WarSummary } from './types';

// ============================================================================
// Main Component
// ============================================================================

interface FilterBarProps {
  wars: WarSummary[];
  isLoading?: boolean;
}

export function FilterBar({ wars, isLoading = false }: FilterBarProps) {
  const { filters, updateFilters } = useAnalytics();
  const [dateRangePreset, setDateRangePreset] = useState('30d');

  const handleDateRangeChange = (presetValue: string) => {
    setDateRangePreset(presetValue);
    const preset = DATE_RANGE_PRESETS.find((p) => p.value === presetValue);
    if (preset) {
      const { startDate, endDate } = preset.getDates();
      updateFilters({ startDate, endDate });
    }
  };

  const selectedWarsCount = filters.selectedWars.length;
  const totalWarsCount = wars?.length || 0;

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
        {/* Date Range Selector */}
        <DateRangeSelector value={dateRangePreset} onChange={handleDateRangeChange} />

        {/* War Multi-Selector */}
        <WarMultiSelector
          wars={wars}
          selected={filters.selectedWars}
          onChange={(warIds) => updateFilters({ selectedWars: warIds })}
          isLoading={isLoading}
        />

        {/* Participation Toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={filters.participationOnly}
              onChange={(e) => updateFilters({ participationOnly: e.target.checked })}
              size="small"
            />
          }
          label={
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
              Only participated
            </Typography>
          }
        />

        {/* Selection Summary */}
        <Box sx={{ ml: 'auto' }}>
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {selectedWarsCount > 0 ? (
              <>
                <strong>{selectedWarsCount}</strong> of {totalWarsCount} wars selected
              </>
            ) : (
              <>Select wars to analyze</>
            )}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

// ============================================================================
// Date Range Selector
// ============================================================================

interface DateRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      startAdornment={
        <InputAdornment position="start">
          <Calendar size={16} />
        </InputAdornment>
      }
      sx={{ minWidth: 150 }}
    >
      {DATE_RANGE_PRESETS.map((preset) => (
        <MenuItem key={preset.value} value={preset.value}>
          {preset.label}
        </MenuItem>
      ))}
    </Select>
  );
}

// ============================================================================
// War Multi-Selector
// ============================================================================

interface WarMultiSelectorProps {
  wars: WarSummary[];
  selected: number[];
  onChange: (warIds: number[]) => void;
  isLoading?: boolean;
}

function WarMultiSelector({ wars, selected, onChange, isLoading }: WarMultiSelectorProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchQuery('');
  };

  const handleToggle = (warId: number) => {
    if (selected.includes(warId)) {
      onChange(selected.filter((id) => id !== warId));
    } else {
      onChange([...selected, warId]);
    }
  };

  const handleSelectAll = () => {
    onChange(filteredWars.map((w) => w.war_id));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  // Filter wars by search query
  const filteredWars = wars.filter((war) =>
    war.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={handleOpen}
        endIcon={<ChevronDown size={16} />}
        disabled={isLoading}
        sx={{ minWidth: 150 }}
      >
        {selected.length > 0 ? `${selected.length} wars` : 'Select wars'}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: { width: 320, maxHeight: 480 },
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search wars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <Button size="small" onClick={() => setSearchQuery('')}>
                    <X size={16} />
                  </Button>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />

          {/* Actions */}
          <Stack direction="row" spacing={1} mb={1}>
            <Button size="small" onClick={handleSelectAll} disabled={filteredWars.length === 0}>
              Select All
            </Button>
            <Button size="small" onClick={handleClearAll} disabled={selected.length === 0}>
              Clear
            </Button>
            <Chip
              label={`${selected.length} / ${wars.length}`}
              size="small"
              sx={{ ml: 'auto' }}
            />
          </Stack>
        </Box>

        {/* War List */}
        <List dense sx={{ maxHeight: 320, overflow: 'auto' }}>
          {filteredWars.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No wars found"
                secondary={searchQuery ? 'Try a different search' : 'No wars available'}
                sx={{ textAlign: 'center' }}
              />
            </ListItem>
          ) : (
            filteredWars.map((war) => (
              <ListItemButton key={war.war_id} onClick={() => handleToggle(war.war_id)}>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selected.includes(war.war_id)}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText
                  primary={war.title}
                  secondary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {new Date(war.war_date).toLocaleDateString()}
                      </Typography>
                      <Chip
                        label={war.result.toUpperCase()}
                        size="small"
                        color={war.result === 'win' ? 'success' : war.result === 'loss' ? 'error' : 'default'}
                        sx={{ height: 16, fontSize: '0.625rem' }}
                      />
                      {war.missing_stats_count > 0 && (
                        <Chip
                          label={`Missing: ${war.missing_stats_count}`}
                          size="small"
                          color="warning"
                          sx={{ height: 16, fontSize: '0.625rem' }}
                        />
                      )}
                    </Stack>
                  }
                />
              </ListItemButton>
            ))
          )}
        </List>
      </Popover>
    </>
  );
}

// ============================================================================
// Export
// ============================================================================

export { DateRangeSelector, WarMultiSelector };
