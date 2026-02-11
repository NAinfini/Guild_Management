
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAnalytics } from './AnalyticsContext';
import { Card, CardContent } from '@/components/layout/Card';
import { Select, SelectItem } from '@/components/input/Select';
import { Slider } from '@/components/input/Slider';
import { Badge } from '@/components/data-display/Badge';
import { Label } from '@/components/input/Label';
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import { cn } from '../../../../lib/utils';
import { SelectChangeEvent, alpha, useTheme } from '@mui/material';

interface RankingsFiltersProps {
  availableClasses?: string[];
  maxWars?: number;
}

export function RankingsFilters({
  availableClasses = ['DPS', 'Tank', 'Healer', 'Support'],
  maxWars = 50,
}: RankingsFiltersProps) {
  const { t } = useTranslation();
  const { rankingsMode, updateRankingsMode } = useAnalytics();

  const handleClassFilterChange = (event: any) => {
    const value = event.target.value;
    updateRankingsMode({
      classFilter: typeof value === 'string' ? value.split(',') : value as string[],
    });
  };

  const handleMinParticipationChange = (_event: Event, value: number | number[]) => {
    updateRankingsMode({ minParticipation: value as number });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <EmojiEventsIcon sx={{ fontSize: 20, color: "primary.main" }} />
            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {t('guild_war.analytics_rankings_filters')}
            </span>
          </div>

          {/* Class Filter */}
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold text-muted-foreground">
              {t('guild_war.analytics_filter_by_class')}
            </Label>
            <Select
              multiple
              value={rankingsMode.classFilter}
              onChange={handleClassFilterChange}
              renderValue={(selected: any) =>
                selected.length === 0 ? (
                  <span className="flex items-center gap-1 text-muted-foreground not-italic">
                    <FilterListIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                    {t('guild_war.analytics_all_classes')}
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {selected.map((value: string) => (
                      <Badge key={value} variant="secondary" className="px-1.5 py-0 text-[10px] uppercase">
                        {value}
                      </Badge>
                    ))}
                  </div>
                )
              }
            >
              {availableClasses.map((className) => (
                <SelectItem key={className} value={className}>
                  {className}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Min Participation Slider */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase font-bold text-muted-foreground">
                {t('guild_war.analytics_min_wars_participated')}
              </Label>
              <Badge variant="default" className="font-mono">
                {rankingsMode.minParticipation}
              </Badge>
            </div>
            <div className="px-1">
              <Slider
                value={rankingsMode.minParticipation}
                onChange={handleMinParticipationChange}
                min={1}
                max={Math.min(maxWars, 20)}
                step={1}
              />
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground font-mono">
                <span>1</span>
                <span>{Math.min(maxWars, 20)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters Summary */}
      {(rankingsMode.classFilter.length > 0 || rankingsMode.minParticipation > 1) && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <FilterListIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t('guild_war.analytics_active_filters')}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {rankingsMode.classFilter.length > 0 && (
                <Badge 
                  variant="outline" 
                  className="gap-1 pl-2 pr-1 py-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors cursor-pointer group"
                  onClick={() => updateRankingsMode({ classFilter: [] })}
                >
                  {t('guild_war.analytics_classes')}: {rankingsMode.classFilter.join(', ')}
                  <CloseIcon sx={{ fontSize: 12, opacity: 0.5, "&:hover": { opacity: 1 } }} />
                </Badge>
              )}
              {rankingsMode.minParticipation > 1 && (
                <Badge 
                  variant="outline"
                  className="gap-1 pl-2 pr-1 py-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors cursor-pointer group"
                  onClick={() => updateRankingsMode({ minParticipation: 1 })}
                >
                  {t('guild_war.analytics_min_wars_label', { count: rankingsMode.minParticipation })}
                  <CloseIcon sx={{ fontSize: 12, opacity: 0.5, "&:hover": { opacity: 1 } }} />
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground font-bold uppercase">{t('common.tip')}:</strong> {t('guild_war.analytics_rankings_tip')}
        </p>
      </div>
    </div>
  );
}
