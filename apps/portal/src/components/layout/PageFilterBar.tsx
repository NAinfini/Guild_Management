
import { cn } from "@/lib/utils";
import React from 'react';
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useTranslation } from 'react-i18next';
import { Input } from '../input/Input';
import { Button } from '../button/Button';

export interface PageFilterOption {
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
  categories?: PageFilterOption[];
  
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
  
  className?: string;
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
  hasAdvancedFilters = false,
  extraActions,
  resultsCount,
  isLoading,
  className,
}: PageFilterBarProps) {
  const { t } = useTranslation();
  const hasSearch = Boolean(search && search.trim().length > 0);
  const hasDateRange = Boolean(startDate || endDate);
  const hasCategory = Boolean(category && category !== 'all');
  const hasAnyFilter = hasSearch || hasDateRange || hasCategory || hasAdvancedFilters;
  const activeFilterCount = [hasSearch, hasDateRange, hasCategory, hasAdvancedFilters].filter(Boolean).length;

  const resetAllFilters = () => {
    onSearchChange?.('');
    onStartDateChange?.('');
    onEndDateChange?.('');
    if (categories?.some((item) => item.value === 'all')) {
      onCategoryChange?.('all');
    }
  };

  const selectedCategoryStyle: React.CSSProperties = {
    color: 'var(--sys-text-primary)',
    borderColor: 'var(--sys-interactive-accent)',
    backgroundColor: 'color-mix(in srgb, var(--sys-interactive-accent) 20%, transparent)',
  };

  return (
    <div 
      className={cn(
        "page-filter-bar mb-4 p-2 bg-background/84 backdrop-blur-md rounded-xl border border-border/50 shadow-sm relative z-10",
        className
      )}
      data-active-filters={hasAnyFilter ? 'true' : 'false'}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-col lg:flex-row gap-2 lg:items-center justify-between">
          <div className="flex flex-col lg:flex-row gap-2 flex-grow items-stretch lg:items-center">
            
            {/* Search & Categories Group */}
            <div className="flex flex-row gap-2 items-center w-full lg:w-auto">
              <div className="relative w-full lg:w-[250px]">
                <Input
                  placeholder={searchPlaceholder || t('common.search')}
                  value={search || ''}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  autoComplete="off"
                  className="pl-9 pr-8 bg-background/88"
                  startAdornment={
                    <SearchIcon sx={{ fontSize: 18 }} className="text-muted-foreground opacity-50" />
                  }
                  endAdornment={search && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                      onClick={() => onSearchChange?.('')}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </Button>
                  )}
                />
              </div>

              {categories && categories.length > 0 && (
                <div className="flex flex-row gap-1 flex-nowrap overflow-x-auto lg:overflow-x-visible overflow-y-visible no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pt-0.5 pb-1 sm:pb-0">
                  {categories.map((cat) => {
                    const isSelected = category === cat.value;
                    return (
                    <Button
                      key={cat.value}
                      className={cn(
                        "filter-category-pill rounded-lg text-xs font-extrabold h-9 px-3 transition-all duration-200",
                        isSelected
                          ? "shadow-md shadow-primary/20"
                          : "text-muted-foreground border-transparent bg-muted/30 hover:bg-muted/50"
                      )}
                      data-active={isSelected ? 'true' : 'false'}
                      size="sm"
                      variant="outline"
                      onClick={() => onCategoryChange?.(cat.value)}
                      style={isSelected ? selectedCategoryStyle : undefined}
                      sx={{
                        flexShrink: 0,
                        '&:hover': { transform: 'none' },
                        '&:active': { transform: 'none' },
                      }}
                    >
                      {cat.label}
                    </Button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="hidden lg:block w-px h-6 bg-border mx-1" />

            {/* Date Range Selection */}
            {(onStartDateChange || onEndDateChange) && (
              <div className="flex flex-row gap-2 items-center">
                <span className="hidden xl:block text-xs font-extrabold text-muted-foreground mr-1">
                  {t('common.time')}:
                </span>
                <Input
                  type="date"
                  value={startDate || ''}
                  onChange={(e) => onStartDateChange?.(e.target.value)}
                  className="w-[140px] text-xs h-9 rounded-lg"
                />
                <span className="text-xs text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={endDate || ''}
                  onChange={(e) => onEndDateChange?.(e.target.value)}
                  className="w-[140px] text-xs h-9 rounded-lg"
                />
                {(startDate || endDate) && (
                  <Button 
                    variant="ghost"
                    size="icon" 
                    onClick={() => { onStartDateChange?.(''); onEndDateChange?.(''); }}
                    className="ml-1 h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-row gap-2 items-center flex-wrap justify-end">
            {onAdvancedClick && (
              <Button
                variant={advancedOpen ? 'default' : 'outline'}
                size="sm"
                onClick={onAdvancedClick}
                aria-pressed={advancedOpen}
                className={cn(
                  "h-9 px-3 text-xs font-extrabold uppercase tracking-wide",
                  advancedOpen && "shadow-md shadow-primary/20"
                )}
                startIcon={<FilterListIcon sx={{ fontSize: 16 }} />}
              >
                {t('common.active_filters')}
              </Button>
            )}
            {hasAnyFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetAllFilters}
                className="h-9 px-3 text-xs font-extrabold text-muted-foreground hover:text-foreground"
              >
                {t('common.clear_filters')}
              </Button>
            )}
            {extraActions}
          </div>
        </div>

        <div className="page-filter-meta flex flex-wrap items-center justify-between gap-2 px-1 pb-0.5">
          <span className="inline-flex items-center rounded-md border border-border/50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">
            {activeFilterCount} {t('common.active_filters')}
          </span>
          {typeof resultsCount === 'number' && (
            <span className="inline-flex items-center rounded-md border border-border/50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">
              {isLoading ? t('common.searching') : `${resultsCount} ${t('common.results_found')}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
