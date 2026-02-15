import React from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  InputAdornment,
} from '@/ui-bridge/material';
import { Search as SearchIcon, Clear as ClearIcon, FilterList as FilterIcon } from '@/ui-bridge/icons-material';
import { cn } from '@/lib/utils';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
  multiple?: boolean;
}

export interface FilterBarProps {
  /** Search query value */
  searchQuery?: string;
  /** Search query change handler */
  onSearchChange?: (query: string) => void;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Filter configurations */
  filters?: FilterConfig[];
  /** Active filter values (filterId 鈫?value(s)) */
  activeFilters?: Record<string, string | string[]>;
  /** Filter change handler */
  onFilterChange?: (filterId: string, value: string | string[]) => void;
  /** Clear all filters handler */
  onClearAll?: () => void;
  /** Show filter count badge */
  showFilterCount?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Compact mode (single row) */
  compact?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearAll,
  showFilterCount = true,
  className,
  compact = false,
}) => {
  const activeFilterCount = Object.values(activeFilters).filter((v) =>
    Array.isArray(v) ? v.length > 0 : Boolean(v)
  ).length;

  const handleClearSearch = () => {
    onSearchChange?.('');
  };

  const handleClearFilter = (filterId: string) => {
    onFilterChange?.(filterId, []);
  };

  return (
    <Box
      className={cn(
        'flex gap-3 p-4 bg-surface-elevated rounded-lg border border-border-default',
        'transition-all duration-200',
        compact ? 'flex-row items-center' : 'flex-col sm:flex-row sm:items-end',
        className
      )}
    >
      {/* Search Input */}
      <TextField
        fullWidth
        value={searchQuery}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange?.(e.target.value)}
        placeholder={searchPlaceholder}
        variant="outlined"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'var(--color-text-tertiary)' }} />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClearSearch}
                sx={{
                  color: 'var(--color-text-tertiary)',
                  '&:hover': { color: 'var(--color-text-secondary)' },
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          flex: compact ? '1 1 300px' : '1 1 auto',
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'var(--color-surface-default)',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: 'var(--color-surface-elevated)',
            },
            '&:focus-within': {
              backgroundColor: 'var(--color-surface-default)',
              boxShadow: '0 0 0 2px var(--color-accent-primary-subtle)',
            },
          },
        }}
      />

      {/* Filter Dropdowns */}
      {filters.map((filter) => (
        <FormControl
          key={filter.id}
          size="small"
          sx={{
            minWidth: 150,
            flex: compact ? '0 1 200px' : '0 1 auto',
          }}
        >
          <InputLabel>{filter.label}</InputLabel>
          <Select
            multiple={filter.multiple}
            value={activeFilters[filter.id] || (filter.multiple ? [] : '')}
            onChange={(e: { target: { value: string | string[] } }) => onFilterChange?.(filter.id, e.target.value)}
            label={filter.label}
            renderValue={(selected: string | string[]) => {
              if (filter.multiple && Array.isArray(selected)) {
                return (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const option = filter.options.find((o) => o.value === value);
                      return (
                        <Chip
                          key={value}
                          label={option?.label || value}
                          size="small"
                          onDelete={() => {
                            const newValues = selected.filter((v) => v !== value);
                            onFilterChange?.(filter.id, newValues);
                          }}
                          onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                        />
                      );
                    })}
                  </Box>
                );
              }
              const option = filter.options.find((o) => o.value === selected);
              return option?.label || selected;
            }}
            sx={{
              backgroundColor: 'var(--color-surface-default)',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: 'var(--color-surface-elevated)',
              },
              '&.Mui-focused': {
                boxShadow: '0 0 0 2px var(--color-accent-primary-subtle)',
              },
            }}
          >
            {filter.options.map((option) => (
              <MenuItem key={option.id} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}

      {/* Clear All Button */}
      {activeFilterCount > 0 && onClearAll && (
        <Box display="flex" alignItems="center" gap={1}>
          {showFilterCount && (
            <Chip
              icon={<FilterIcon />}
              label={activeFilterCount}
              size="small"
              sx={{
                backgroundColor: 'var(--color-accent-primary-subtle)',
                color: 'var(--color-accent-primary)',
                fontWeight: 600,
              }}
            />
          )}
          <IconButton
            size="small"
            onClick={onClearAll}
            sx={{
              color: 'var(--color-text-tertiary)',
              '&:hover': {
                color: 'var(--color-accent-primary)',
                backgroundColor: 'var(--color-accent-primary-subtle)',
              },
            }}
            title="Clear all filters"
          >
            <ClearIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

