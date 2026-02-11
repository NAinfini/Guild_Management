
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
  extraActions,
  resultsCount,
  isLoading,
  className,
}: PageFilterBarProps) {
  const { t } = useTranslation();
  const selectedCategoryStyle: React.CSSProperties = {
    color: 'var(--sys-text-primary)',
    borderColor: 'var(--sys-interactive-accent)',
    backgroundColor: 'color-mix(in srgb, var(--sys-interactive-accent) 20%, transparent)',
  };

  return (
    <div 
      className={cn(
        "mb-4 p-2 bg-background/80 backdrop-blur-md rounded-xl border border-border/50 shadow-sm relative z-10",
        className
      )}
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
                  className="pl-9 pr-8 bg-background"
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
                      size="sm"
                      variant="outline"
                      onClick={() => onCategoryChange?.(cat.value)}
                      style={isSelected ? selectedCategoryStyle : undefined}
                      sx={{
                        flexShrink: 0,
                        '&:hover': { transform: 'none' },
                        '&:active': { transform: 'none' },
                      }}
                      className={cn(
                        "rounded-lg text-xs font-extrabold h-9 px-3 transition-all duration-200",
                        isSelected
                          ? "shadow-md shadow-primary/20"
                          : "text-muted-foreground border-transparent bg-muted/30 hover:bg-muted/50"
                      )}
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

          <div className="flex flex-row gap-2 items-center">
            {extraActions}
          </div>
        </div>
      </div>
    </div>
  );
}
