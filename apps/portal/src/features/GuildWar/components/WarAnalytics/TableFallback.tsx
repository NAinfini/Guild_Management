
/**
 * War Analytics - Table Fallback Component
 *
 * Sortable, searchable table as fallback for all charts
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { formatNumber } from './utils';
import { ArrowUpward, ArrowDownward, UnfoldMore, Search, ErrorOutline } from '@mui/icons-material';
import { cn } from '../../../../lib/utils'; // Assuming this utility exists

import { Input } from '@/components/input/Input';
import { Button } from '@/components/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/data-display/Table';
import { Card } from '@/components/layout/Card';

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
  const { t } = useTranslation();
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
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border m-4">
        <ErrorOutline className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-sm font-medium">{t('guild_war.analytics_table_no_data')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      {searchable && (
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={column.id} 
                  className={cn(
                    "whitespace-nowrap",
                    column.numeric ? "text-right" : "text-left"
                  )}
                >
                  <Button
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                        "-ml-3 h-8 data-[state=open]:bg-accent hover:bg-transparent px-3",
                        column.numeric && "flex-row-reverse -mr-3 ml-0"
                    )}
                    onClick={() => handleRequestSort(column.id)}
                  >
                    <span>{column.label}</span>
                    {orderBy === column.id ? (
                        order === 'desc' ? (
                            <ArrowDownward className="ml-2 h-3 w-3" />
                        ) : (
                            <ArrowUpward className="ml-2 h-3 w-3" />
                        )
                    ) : (
                        <UnfoldMore className="ml-2 h-3 w-3 opacity-30 group-hover:opacity-100" />
                    )}
                  </Button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedData.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                        {t('common.no_results')}
                    </TableCell>
                </TableRow>
            ) : (
                processedData.map((row, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                    {columns.map((column) => {
                    const value = row[column.id];
                    const formatted = column.format
                        ? column.format(value)
                        : value !== null && value !== undefined
                        ? value
                        : t('common.unknown');

                    return (
                        <TableCell 
                            key={column.id} 
                            className={cn(
                                "py-2",
                                column.numeric ? "text-right font-mono" : "text-left",
                                column.numeric && "tabular-nums"
                            )}
                        >
                            {formatted}
                        </TableCell>
                    );
                    })}
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <div className="mt-2 text-center">
        <p className="text-xs text-muted-foreground">
          {t('guild_war.analytics_table_rows', { shown: processedData.length, total: data.length })}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Helper: Create columns for common data types
// ============================================================================

export function createTimelineColumns(): Column[] {
  return [
    { id: 'war_date', label: i18next.t('guild_war.analytics_table_date') },
    { id: 'war_title', label: i18next.t('guild_war.analytics_table_war') },
    {
      id: 'value',
      label: i18next.t('guild_war.analytics_table_value'),
      numeric: true,
      format: (value) => (value !== null ? formatNumber(value) : i18next.t('guild_war.analytics_missing')),
    },
  ];
}

export function createCompareColumns(userIds: number[], userNames: Record<number, string>): Column[] {
  return [
    { id: 'war_date', label: i18next.t('guild_war.analytics_table_date') },
    { id: 'war_title', label: i18next.t('guild_war.analytics_table_war') },
    ...userIds.map((id) => ({
      id: `user_${id}`,
      label: userNames[id] || i18next.t('guild_war.analytics_user_fallback', { id }),
      numeric: true,
      format: (value: any) => (value !== null && value !== undefined ? formatNumber(value) : i18next.t('guild_war.analytics_missing')),
    })),
  ];
}

export function createRankingsColumns(): Column[] {
  return [
    { id: 'rank', label: i18next.t('guild_war.analytics_table_rank'), numeric: true },
    { id: 'username', label: i18next.t('guild_war.analytics_table_member') },
    { id: 'class', label: i18next.t('guild_war.analytics_table_class') },
    {
      id: 'value',
      label: i18next.t('guild_war.analytics_table_value'),
      numeric: true,
      format: formatNumber,
    },
    { id: 'wars_participated', label: i18next.t('guild_war.analytics_table_wars'), numeric: true },
  ];
}
