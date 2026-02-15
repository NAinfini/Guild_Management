
/**
 * War Analytics - Unified Filter Header
 *
 * Single control surface for analytics:
 * - Mode tabs (Compare / Rankings / Teams)
 * - Date range + war selection
 * - Participation filter
 * - Metric controls (mode-aware)
 * - Rankings/Teams mode-specific controls
 */

import { useMemo, useState, type CSSProperties, type ChangeEvent, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import PeopleIcon from '@/ui-bridge/icons-material/People';
import EmojiEventsIcon from '@/ui-bridge/icons-material/EmojiEvents';
import ShieldIcon from '@/ui-bridge/icons-material/Shield';
import BarChartIcon from '@/ui-bridge/icons-material/BarChart';
import SettingsIcon from '@/ui-bridge/icons-material/Settings';
import CalendarMonthIcon from '@/ui-bridge/icons-material/CalendarMonth';
import KeyboardArrowDownIcon from '@/ui-bridge/icons-material/KeyboardArrowDown';
import SearchIcon from '@/ui-bridge/icons-material/Search';
import CloseIcon from '@/ui-bridge/icons-material/Close';

import { useAnalytics } from './AnalyticsContext';
import { MetricFormulaEditor } from './MetricFormulaEditor';
import {
  DATE_RANGE_PRESETS,
  DEFAULT_NORMALIZATION_WEIGHTS,
  METRICS,
} from './types';
import type {
  AggregationType,
  MetricType,
  WarSummary,
  AnalyticsMode,
  MemberStats,
} from './types';
import { formatMetricName } from './types';
import { useAuthStore } from '@/store';
import { canManageGuildWarFormula, getEffectiveRole } from '@/lib/permissions';

// Nexus Primitives
import {
  Card,
  Button,
  Input,
  Label,
  Switch,
  Checkbox,
  Badge,
  Select,
  SelectItem,
  Tabs,
  TabsList,
  TabsTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components';
import { cn } from '@/lib/utils';

// ============================================================================
// Constants & Types
// ============================================================================

interface FilterBarProps {
  wars: WarSummary[];
  members?: MemberStats[];
  isLoading?: boolean;
}

interface ModeConfig {
  id: AnalyticsMode;
  labelKey: string;
  descriptionKey: string;
  icon: React.ElementType<{ sx?: { fontSize?: number } }>;
}

const MODES: ModeConfig[] = [
  {
    id: 'compare',
    labelKey: 'guild_war.analytics_mode_compare',
    descriptionKey: 'guild_war.analytics_mode_compare_desc',
    icon: PeopleIcon,
  },
  {
    id: 'rankings',
    labelKey: 'guild_war.analytics_mode_rankings',
    descriptionKey: 'guild_war.analytics_mode_rankings_desc',
    icon: EmojiEventsIcon,
  },
  {
    id: 'teams',
    labelKey: 'guild_war.analytics_mode_teams',
    descriptionKey: 'guild_war.analytics_mode_teams_desc',
    icon: ShieldIcon,
  },
];

const ANALYTICS_SELECTED_ROW_STYLE: CSSProperties = {
  backgroundColor: 'color-mix(in srgb, var(--color-status-success-bg) 76%, transparent)',
  border: '1px solid color-mix(in srgb, var(--color-status-success) 45%, transparent)',
};

const ANALYTICS_SELECTED_BADGE_STYLE: CSSProperties = {
  backgroundColor: 'color-mix(in srgb, var(--color-status-success-bg) 78%, transparent)',
  borderColor: 'color-mix(in srgb, var(--color-status-success) 42%, transparent)',
  color: 'var(--color-status-success-fg)',
};

const ANALYTICS_SWITCH_ON_BADGE_STYLE: CSSProperties = {
  backgroundColor: 'color-mix(in srgb, var(--color-status-success-bg) 78%, transparent)',
  borderColor: 'color-mix(in srgb, var(--color-status-success) 45%, transparent)',
  color: 'var(--color-status-success-fg)',
};

const ANALYTICS_CHECKBOX_SELECTED_SX = {
  '&.Mui-checked': {
    color: 'var(--color-status-success)',
  },
};

type SelectChangeLikeEvent = {
  target: {
    value: unknown;
  };
};

// ============================================================================
// Main Component
// ============================================================================

export function FilterBar({ wars, members = [], isLoading = false }: FilterBarProps) {
  const { t } = useTranslation();
  const { user, viewRole } = useAuthStore();
  const canManageFormula = canManageGuildWarFormula(getEffectiveRole(user?.role, viewRole));
  
  const {
    filters,
    updateFilters,
    compareMode,
    updateCompareMode,
    rankingsMode,
    updateRankingsMode,
    teamsMode,
    updateTeamsMode,
  } = useAnalytics();

  const [dateRangePreset, setDateRangePreset] = useState('30d');
  const [formulaEditorOpen, setFormulaEditorOpen] = useState(false);

  const handleDateRangeChange = (presetValue: string) => {
    setDateRangePreset(presetValue);
    const preset = DATE_RANGE_PRESETS.find((p) => p.value === presetValue);
    if (preset) {
      const { startDate, endDate } = preset.getDates();
      updateFilters({ startDate, endDate });
    }
  };

  const handleModeChange = (value: string) => {
    if (!value) return;
    updateFilters({ mode: value as AnalyticsMode });
  };

  const handleMetricChange = (metric: MetricType) => {
    updateFilters({ primaryMetric: metric });
  };

  // For multi-select metrics in Compare mode
  // Note: Nexus Select typically handles single values. For multi-select, we might need a custom approach
  // or use multiple checkboxes in a Popover if Nexus Select doesn't support 'multiple' prop directly.
  // Assuming Nexus Select is a wrapper around Radix Select, which is single-value.
  // We'll use a Popover with Checkboxes for multi-metric selection to be safe and consistent.
  
  const handleCompareMetricsToggle = (metric: MetricType) => {
    const current = compareMode.selectedMetrics;
    const next = current.includes(metric)
      ? current.filter(m => m !== metric)
      : [...current, metric];
    
    // Ensure at least one metric is selected
    if (next.length === 0) return;

    updateCompareMode({ selectedMetrics: next });
    updateFilters({ primaryMetric: next[0] });
  };

  const selectedCompareMetrics = useMemo(
    () => (compareMode.selectedMetrics.length > 0 ? compareMode.selectedMetrics : [filters.primaryMetric]),
    [compareMode.selectedMetrics, filters.primaryMetric],
  );

  return (
    <Card className="p-4 space-y-4 bg-gradient-to-br from-card/90 to-background border-border/50">
      <div className="space-y-4">
        {/* Mode Tabs */}
        <Tabs value={filters.mode} onValueChange={handleModeChange} className="w-full">
          <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 !rounded-full">
            {MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <TabsTrigger
                  key={mode.id}
                  value={mode.id}
                  className="flex-1 !rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm py-2"
                >
                  <div className="flex items-center gap-2">
                    <Icon sx={{ fontSize: 16 }} />
                    <span>{t(mode.labelKey)}</span>
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center flex-wrap">
          
          {/* Date Range */}
          <DateRangeSelector value={dateRangePreset} onChange={handleDateRangeChange} />

          {/* War Selector */}
          <WarMultiSelector
             wars={wars}
             selected={filters.selectedWars}
             onChange={(warIds) => updateFilters({ selectedWars: warIds })}
             isLoading={isLoading}
          />

          {/* Filters */}
          <div className="flex items-center gap-4 px-2 py-1.5 bg-muted/30 rounded-md border border-border/50">
            <div className="flex items-center gap-2">
              <Switch
                id="participation-only"
                checked={filters.participationOnly}
                onChange={(_event: ChangeEvent<HTMLInputElement>, checked: boolean) =>
                  updateFilters({ participationOnly: checked })
                }
              />
              <Label htmlFor="participation-only" className="cursor-pointer text-xs font-medium">
                {t('guild_war.analytics_participated_only')}
              </Label>
              <Badge
                variant={filters.participationOnly ? 'secondary' : 'outline'}
                className="h-5 px-1.5 text-[10px]"
                style={filters.participationOnly ? ANALYTICS_SWITCH_ON_BADGE_STYLE : undefined}
              >
                {filters.participationOnly ? t('common.on') : t('common.off')}
              </Badge>
            </div>

            <div className="h-4 w-px bg-border" />

            <div className="flex items-center gap-2">
              <Switch
                id="opponent-normalized"
                checked={filters.opponentNormalized}
                onChange={(_event: ChangeEvent<HTMLInputElement>, checked: boolean) =>
                  updateFilters({ opponentNormalized: checked })
                }
              />
              <Label htmlFor="opponent-normalized" className="cursor-pointer text-xs font-medium">
                {t('guild_war.analytics_opponent_normalized')}
              </Label>
              <Badge
                variant={filters.opponentNormalized ? 'secondary' : 'outline'}
                className="h-5 px-1.5 text-[10px]"
                style={filters.opponentNormalized ? ANALYTICS_SWITCH_ON_BADGE_STYLE : undefined}
              >
                {filters.opponentNormalized ? t('common.on') : t('common.off')}
              </Badge>
              {canManageFormula && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 min-w-8 rounded-md p-0"
                  onClick={() => setFormulaEditorOpen(true)}
                  title={t('guild_war.analytics_formula_editor_title')}
                  aria-label={t('guild_war.analytics_formula_editor_title')}
                >
                  <SettingsIcon sx={{ fontSize: 16 }} />
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1" />

          {/* Metrics & Mode Specific Controls */}
          <div className="flex flex-wrap gap-2 items-center">
            
            {filters.mode === 'compare' ? (
              <MetricMultiSelector 
                selected={selectedCompareMetrics}
                onChange={handleCompareMetricsToggle}
              />
            ) : (
                <div className="min-w-[180px]">
                  <Select
                    value={filters.primaryMetric}
                    onChange={(e: SelectChangeLikeEvent) => handleMetricChange(e.target.value as MetricType)}
                    displayEmpty
                    renderValue={(selected: unknown) => {
                      if (!selected) return <span className="text-muted-foreground">{t('guild_war.analytics_primary_metric')}</span>;
                      return formatMetricName(selected as MetricType);
                    }}
                  >
                    {Object.keys(METRICS).map((metric) => (
                      <SelectItem key={metric} value={metric}>
                        {formatMetricName(metric as MetricType)}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
            )}

            {filters.mode === 'rankings' && (
              <>
                <div className="min-w-[130px]">
                  <Select
                    value={filters.aggregation}
                    onChange={(e: SelectChangeLikeEvent) =>
                      updateFilters({ aggregation: e.target.value as AggregationType })
                    }
                    displayEmpty
                    renderValue={(selected: unknown) => {
                       if (!selected) return <span className="text-muted-foreground">{t('guild_war.analytics_aggregation')}</span>;
                       // Simplified label update
                       const labels: Record<string, string> = {
                         total: t('common.total'),
                         average: t('common.average'),
                         best: t('common.best'),
                         median: t('common.median')
                       };
                       return labels[selected as string] || selected;
                    }}
                  >
                    <SelectItem value="total">{t('common.total')}</SelectItem>
                    <SelectItem value="average">{t('common.average')}</SelectItem>
                    <SelectItem value="best">{t('common.best')}</SelectItem>
                    <SelectItem value="median">{t('common.median')}</SelectItem>
                  </Select>
                </div>

                <div className="min-w-[110px]">
                  <Select
                    value={String(rankingsMode.topN)}
                    onChange={(e: SelectChangeLikeEvent) =>
                      updateRankingsMode({ topN: parseInt(e.target.value as string, 10) })
                    }
                    displayEmpty
                    renderValue={(selected: unknown) => {
                       if (!selected) return <span className="text-muted-foreground">{t('guild_war.analytics_show_top_n')}</span>;
                       const labels: Record<string, string> = {
                          "5": t('guild_war.analytics_top_n_5'),
                          "10": t('guild_war.analytics_top_n_10'),
                          "20": t('guild_war.analytics_top_n_20'),
                          "50": t('guild_war.analytics_top_n_50')
                       };
                       return labels[String(selected)] || selected;
                    }}
                  >
                    <SelectItem value="5">{t('guild_war.analytics_top_n_5')}</SelectItem>
                    <SelectItem value="10">{t('guild_war.analytics_top_n_10')}</SelectItem>
                    <SelectItem value="20">{t('guild_war.analytics_top_n_20')}</SelectItem>
                    <SelectItem value="50">{t('guild_war.analytics_top_n_50')}</SelectItem>
                  </Select>
                </div>
              </>
            )}

            {filters.mode === 'teams' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-md border border-border/50">
                <Switch
                  id="show-total"
                  checked={teamsMode.showTotal}
                  onChange={(_event: ChangeEvent<HTMLInputElement>, checked: boolean) =>
                    updateTeamsMode({ showTotal: checked })
                  }
                />
                <Label htmlFor="show-total" className="cursor-pointer text-xs font-medium">
                  {teamsMode.showTotal ? t('common.total') : t('common.average')}
                </Label>
              </div>
            )}
          </div>
          
           {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateFilters({
                  selectedWars: [],
                  participationOnly: true,
                  opponentNormalized: false,
                  normalizationWeights: DEFAULT_NORMALIZATION_WEIGHTS,
                  primaryMetric: 'damage',
                  aggregation: 'total',
                });
                updateCompareMode({ selectedMetrics: ['damage'] });
                updateRankingsMode({ topN: 10 });
                setDateRangePreset('30d');
                const preset = DATE_RANGE_PRESETS.find((p) => p.value === '30d');
                if (preset) {
                  const { startDate, endDate } = preset.getDates();
                  updateFilters({ startDate, endDate });
                }
              }}
              title={t('common.reset')}
            >
              <BarChartIcon sx={{ fontSize: 16 }} className="mr-1" />
              {t('common.reset')}
            </Button>

          </div>

        </div>
      </div>

      <MetricFormulaEditor
        open={formulaEditorOpen}
        onClose={() => setFormulaEditorOpen(false)}
        onSave={(weights) => {
          updateFilters({ normalizationWeights: weights });
          setFormulaEditorOpen(false);
        }}
      />
    </Card>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

interface DateRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const { t } = useTranslation();
  
  const presetOptions = DATE_RANGE_PRESETS.map(preset => ({
     value: preset.value,
     label: t(`guild_war.analytics_range_${preset.value}`) || preset.label
  }));

  return (
    <div className="min-w-[140px]">
      <Select 
        value={value} 
        onChange={(e: SelectChangeLikeEvent) => onChange(e.target.value as string)}
        renderValue={(selected: unknown) => {
             const label = presetOptions.find(p => p.value === selected)?.label ?? String(selected ?? '');
             return (
               <div className="flex items-center gap-2">
                 <CalendarMonthIcon sx={{ fontSize: 16 }} className="opacity-50" />
                 <span>{label}</span>
               </div>
             );
        }}
      >
          {presetOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
      </Select>
    </div>
  );
}

interface WarMultiSelectorProps {
  wars: WarSummary[];
  selected: number[];
  onChange: (warIds: number[]) => void;
  isLoading?: boolean;
}

export function WarMultiSelector({ wars, selected, onChange, isLoading }: WarMultiSelectorProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWars = wars.filter((war) =>
    war.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (warId: number) => {
    if (selected.includes(warId)) {
      onChange(selected.filter((id) => id !== warId));
    } else {
      onChange([...selected, warId]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          size="sm"
          className="h-9 min-w-[160px] justify-between"
          disabled={isLoading}
        >
          <span className="truncate">
            {selected.length > 0
              ? t('guild_war.analytics_wars_count', { count: selected.length })
              : t('guild_war.analytics_select_wars')}
          </span>
          <KeyboardArrowDownIcon sx={{ fontSize: 16 }} className="ml-2 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <SearchIcon sx={{ fontSize: 16 }} className="absolute left-2 top-2.5 text-muted-foreground" />
            <Input
              placeholder={t('guild_war.analytics_search_wars')}
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </button>
            )}
          </div>
        </div>
        
        <div className="p-2 border-b flex items-center justify-between bg-muted/30">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onChange(filteredWars.map((w) => w.war_id))}
              disabled={filteredWars.length === 0}
            >
              {t('common.all')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onChange([])}
              disabled={selected.length === 0}
            >
              {t('common.clear')}
            </Button>
          </div>
          <Badge variant="outline" className="text-[10px] font-normal">
            {selected.length} / {wars.length}
          </Badge>
        </div>

        <div className="max-h-[300px] overflow-auto py-1">
          {filteredWars.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {t('guild_war.analytics_no_wars_found')}
            </div>
          ) : (
            filteredWars.map((war) => {
               const isSelected = selected.includes(war.war_id);
               return (
                <div
                  key={war.war_id}
                  className={cn(
                    "flex items-start space-x-2 px-3 py-2 cursor-pointer hover:bg-accent transition-colors",
                    isSelected && "bg-accent/50"
                  )}
                  style={isSelected ? ANALYTICS_SELECTED_ROW_STYLE : undefined}
                  onClick={() => handleToggle(war.war_id)}
                >
                  <Checkbox
                    id={`war-${war.war_id}`}
                    checked={isSelected}
                    onChange={() => handleToggle(war.war_id)}
                    onClick={(event: MouseEvent<HTMLButtonElement>) => event.stopPropagation()}
                    className="mt-1"
                    sx={isSelected ? ANALYTICS_CHECKBOX_SELECTED_SX : undefined}
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={`war-${war.war_id}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {war.title}
                    </Label>
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                       <span className="text-xs text-muted-foreground">
                         {new Date(war.war_date).toLocaleDateString()}
                       </span>
                       <Badge 
                          variant={war.result === 'win' ? 'outline' : war.result === 'loss' ? 'destructive' : 'secondary'}
                          className="h-5 px-1 text-[10px] uppercase border"
                          style={
                            war.result === 'win'
                              ? {
                                  borderColor: 'color-mix(in srgb, var(--color-status-success) 50%, transparent)',
                                  color: 'var(--color-status-success-fg)',
                                  backgroundColor: 'color-mix(in srgb, var(--color-status-success-bg) 80%, transparent)',
                                }
                              : war.result === 'loss'
                                ? {
                                    borderColor: 'color-mix(in srgb, var(--color-status-error) 50%, transparent)',
                                    color: 'var(--color-status-error-fg)',
                                    backgroundColor: 'color-mix(in srgb, var(--color-status-error-bg) 80%, transparent)',
                                  }
                                : undefined
                          }
                        >
                          {war.result === 'win' ? t('dashboard.victory') : war.result === 'loss' ? t('dashboard.defeat') : t('dashboard.pending')}
                       </Badge>
                       {war.missing_stats_count > 0 && (
                          <Badge variant="destructive" className="h-5 px-1 text-[10px]">
                            {t('guild_war.analytics_missing_count', { count: war.missing_stats_count })}
                          </Badge>
                       )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Helper component for multi-metric selection
function MetricMultiSelector({ 
  selected, 
  onChange 
}: { 
  selected: MetricType[], 
  onChange: (m: MetricType) => void 
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button variant="outline" className="h-9 min-w-[200px] justify-between">
           <div className="flex gap-1 overflow-hidden">
              {selected.length > 0 ? (
                 selected.slice(0, 2).map(m => (
                    <Badge
                      key={m}
                      variant="secondary"
                      className="px-1 py-0 h-5 text-[10px]"
                      style={ANALYTICS_SELECTED_BADGE_STYLE}
                    >
                      {formatMetricName(m)}
                    </Badge>
                 ))
              ) : (
                 <span>{t('guild_war.analytics_primary_metric')}</span>
              )}
              {selected.length > 2 && (
                 <Badge variant="secondary" className="px-1 py-0 h-5 text-[10px]">
                   +{selected.length - 2}
                 </Badge>
              )}
           </div>
           <KeyboardArrowDownIcon sx={{ fontSize: 16 }} className="ml-2 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
         <div className="p-2 space-y-1">
            {Object.keys(METRICS).map((metricKey) => {
               const metric = metricKey as MetricType;
               const isSelected = selected.includes(metric);
               return (
                  <div 
                    key={metric}
                    className={cn(
                      "flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer border border-transparent",
                      isSelected && "bg-accent/50"
                    )}
                    style={isSelected ? ANALYTICS_SELECTED_ROW_STYLE : undefined}
                    onClick={() => onChange(metric)}
                  >
                     <Checkbox
                       checked={isSelected}
                       id={`metric-${metric}`}
                       onClick={(event: MouseEvent<HTMLButtonElement>) => event.stopPropagation()}
                       sx={isSelected ? ANALYTICS_CHECKBOX_SELECTED_SX : undefined}
                     />
                     <Label htmlFor={`metric-${metric}`} className="flex-1 cursor-pointer">
                        {formatMetricName(metric)}
                     </Label>
                  </div>
               );
            })}
         </div>
      </PopoverContent>
    </Popover>
  );
}
