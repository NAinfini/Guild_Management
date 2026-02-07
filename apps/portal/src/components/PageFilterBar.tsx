import React from 'react';
import {
  Box,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Tooltip,
  useTheme,
  alpha,
  Drawer,
  Button,
  Chip,
  Badge,
  Divider,
} from '@mui/material';
import { Search, X, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface FilterOption {
  value: string;
  label: string;
}

export interface PageFilterBarProps {
  // Search
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  
  // Categories
  category?: string;
  onCategoryChange?: (value: string) => void;
  categories?: FilterOption[];
  
  // Date Range
  startDate?: string;
  onStartDateChange?: (value: string) => void;
  endDate?: string;
  onEndDateChange?: (value: string) => void;
  
  // UI State
  onAdvancedClick?: () => void;
  advancedOpen?: boolean;
  hasAdvancedFilters?: boolean;
  
  // Results
  extraActions?: React.ReactNode;
  resultsCount?: number;
  isLoading?: boolean;
}

export function PageFilterBar({
  search,
  onSearchChange,
  searchPlaceholder,
  category,
  onCategoryChange,
  categories,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onAdvancedClick,
  advancedOpen = false,
  extraActions,
  resultsCount,
  isLoading,
}: PageFilterBarProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const activeFiltersCount = [
    search && search.length > 0,
    category && category !== 'all',
    startDate,
    endDate
  ].filter(Boolean).length;

  const handleClearAll = () => {
    onSearchChange?.('');
    onCategoryChange?.('all');
    onStartDateChange?.('');
    onEndDateChange?.('');
  };

  return (
    <Box 
      sx={{ 
        mb: 4, 
        p: 2, 
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(8px)',
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
        zIndex: 10,
      }}
    >
      <Stack spacing={2}>
        <Stack 
          direction="row" 
          spacing={2} 
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack 
            direction={{ xs: 'column', lg: 'row' }} 
            spacing={2} 
            alignItems={{ xs: 'stretch', lg: 'center' }}
            sx={{ flexGrow: 1 }}
          >
            {/* Search & Categories Group */}
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                size="small"
                placeholder={searchPlaceholder || t('common.search')}
                value={search || ''}
                onChange={(e) => onSearchChange?.(e.target.value)}
                autoComplete="off"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} opacity={0.5} />
                    </InputAdornment>
                  ),
                  endAdornment: search && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => onSearchChange?.('')} edge="end">
                        <X size={16} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3, bgcolor: 'background.paper' }
                }}
                sx={{ width: { xs: '100%', sm: 250 } }}
              />

              {categories && categories.length > 0 && (
                  <Stack 
                    direction="row" 
                    spacing={1} 
                    sx={{ 
                      flexWrap: 'nowrap', 
                      overflowX: 'auto', 
                      '&::-webkit-scrollbar': { display: 'none' } 
                    }}
                  >
                      {categories.map((cat) => (
                          <Chip
                              key={cat.value}
                              label={cat.label}
                              onClick={() => onCategoryChange?.(cat.value)}
                              color={category === cat.value ? "primary" : "default"}
                              variant={category === cat.value ? "filled" : "outlined"}
                              sx={{ 
                                  borderRadius: 2, 
                                  fontWeight: 800,
                                  fontSize: '0.75rem',
                                  transition: 'all 0.2s',
                                  '&:hover': { transform: 'translateY(-1px)' }
                              }}
                          />
                      ))}
                  </Stack>
              )}
            </Stack>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', lg: 'block' }, mx: 1 }} />

            {/* Date Range Selection (Now Persistent) */}
            {(onStartDateChange || onEndDateChange) && (
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ mr: 1, display: { xs: 'none', xl: 'block' } }}>
                        {t('common.time')}:
                    </Typography>
                    <TextField
                        type="date"
                        size="small"
                        value={startDate || ''}
                        onChange={(e) => onStartDateChange?.(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        label={t('common.date_from')}
                        InputProps={{ 
                            sx: {
                                borderRadius: 2,
                                fontSize: '0.75rem',
                                '& input[type="date"]::-webkit-calendar-picker-indicator': {
                                  opacity: 0.95,
                                },
                            },
                        }}
                        sx={{ width: 140 }}
                    />
                    <Typography variant="caption" color="text.secondary">—</Typography>
                    <TextField
                        type="date"
                        size="small"
                        value={endDate || ''}
                        onChange={(e) => onEndDateChange?.(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        label={t('common.date_to')}
                        InputProps={{ 
                            sx: {
                                borderRadius: 2,
                                fontSize: '0.75rem',
                                '& input[type="date"]::-webkit-calendar-picker-indicator': {
                                  opacity: 0.95,
                                },
                            }
                        }}
                        sx={{ width: 140 }}
                    />
                    {(startDate || endDate) && (
                        <IconButton size="small" onClick={() => { onStartDateChange?.(''); onEndDateChange?.(''); }}>
                            <X size={14} />
                        </IconButton>
                    )}
                </Stack>
            )}
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            {extraActions}
          </Stack>
        </Stack>

        {/* Status Line */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            {/* Results count removed per user request */}
          </Box>
        </Stack>
      </Stack>

    </Box>
  );
}
