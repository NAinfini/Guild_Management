/**
 * War Analytics - Table Fallback Component
 *
 * Sortable, searchable table as fallback for all charts
 */

import { useState, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  InputAdornment,
  Typography,
  Paper,
} from '@mui/material';
import { Search } from 'lucide-react';
import { formatNumber } from './utils';

// ============================================================================
// Types
// ============================================================================

type Order = 'asc' | 'desc';

interface Column {
  id: string;
  label: string;
  numeric?: boolean;
  format?: (value: any) => string;
}

interface TableFallbackProps {
  data: any[];
  columns: Column[];
  defaultOrderBy?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}

// ============================================================================
// Main Component
// ============================================================================

export function TableFallback({
  data,
  columns,
  defaultOrderBy,
  searchable = true,
  searchPlaceholder = 'Search...',
}: TableFallbackProps) {
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<string>(defaultOrderBy || columns[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle sort
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Sort and filter data
  const processedData = useMemo(() => {
    let result = [...data];

    // Filter by search
    if (searchQuery) {
      result = result.filter((row) =>
        columns.some((column) => {
          const value = row[column.id];
          return value?.toString().toLowerCase().includes(searchQuery.toLowerCase());
        })
      );
    }

    // Sort
    if (orderBy) {
      result.sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];

        // Handle null/undefined
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        // Compare
        if (bValue < aValue) {
          return order === 'asc' ? 1 : -1;
        }
        if (bValue > aValue) {
          return order === 'asc' ? -1 : 1;
        }
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, order, orderBy, columns]);

  if (data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Search */}
      {searchable && (
        <TextField
          fullWidth
          size="small"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
      )}

      {/* Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.numeric ? 'right' : 'left'}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : 'asc'}
                    onClick={() => handleRequestSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {processedData.map((row, index) => (
              <TableRow key={index} hover>
                {columns.map((column) => {
                  const value = row[column.id];
                  const formatted = column.format
                    ? column.format(value)
                    : value !== null && value !== undefined
                    ? value
                    : 'N/A';

                  return (
                    <TableCell key={column.id} align={column.numeric ? 'right' : 'left'}>
                      <Typography
                        variant="body2"
                        fontFamily={column.numeric ? 'monospace' : 'inherit'}
                      >
                        {formatted}
                      </Typography>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Results count */}
      <Box sx={{ mt: 1, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Showing {processedData.length} of {data.length} rows
        </Typography>
      </Box>
    </Box>
  );
}

// ============================================================================
// Helper: Create columns for common data types
// ============================================================================

export function createTimelineColumns(): Column[] {
  return [
    { id: 'war_date', label: 'Date' },
    { id: 'war_title', label: 'War' },
    {
      id: 'value',
      label: 'Value',
      numeric: true,
      format: (value) => (value !== null ? formatNumber(value) : 'Missing'),
    },
  ];
}

export function createCompareColumns(userIds: number[], userNames: Record<number, string>): Column[] {
  return [
    { id: 'war_date', label: 'Date' },
    { id: 'war_title', label: 'War' },
    ...userIds.map((id) => ({
      id: `user_${id}`,
      label: userNames[id] || `User ${id}`,
      numeric: true,
      format: (value: any) => (value !== null && value !== undefined ? formatNumber(value) : 'Missing'),
    })),
  ];
}

export function createRankingsColumns(): Column[] {
  return [
    { id: 'rank', label: 'Rank', numeric: true },
    { id: 'username', label: 'Member' },
    { id: 'class', label: 'Class' },
    {
      id: 'value',
      label: 'Value',
      numeric: true,
      format: formatNumber,
    },
    { id: 'wars_participated', label: 'Wars', numeric: true },
  ];
}
