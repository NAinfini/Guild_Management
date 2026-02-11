
/**
 * War Analytics - Mode Strip Component
 *
 * Tab strip for switching between analytics modes:
 * - Compare: Multi-member comparison
 * - Rankings: Top N performers
 * - Teams: Team aggregates
 */

import React from 'react';
import ShowChartIcon from "@mui/icons-material/ShowChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import { useTranslation } from 'react-i18next';
import { useAnalytics } from './AnalyticsContext';
import type { AnalyticsMode } from './types';
import { Tabs, TabsList, TabsTrigger, Badge, Alert } from '@/components';
import { cn } from '@/lib/utils';

// ============================================================================
// Mode Configuration
// ============================================================================

interface ModeConfig {
  id: AnalyticsMode;
  labelKey: string;
  icon: React.ElementType;
  descriptionKey: string;
}

const MODES: ModeConfig[] = [
  {
    id: 'compare',
    labelKey: 'guild_war.analytics_mode_compare',
    icon: ShowChartIcon,
    descriptionKey: 'guild_war.analytics_mode_compare_desc',
  },
  {
    id: 'rankings',
    labelKey: 'guild_war.analytics_mode_rankings',
    icon: BarChartIcon,
    descriptionKey: 'guild_war.analytics_mode_rankings_desc',
  },
  {
    id: 'teams',
    labelKey: 'guild_war.analytics_mode_teams',
    icon: SettingsIcon,
    descriptionKey: 'guild_war.analytics_mode_teams_desc',
  },
];

// ============================================================================
// Main Component
// ============================================================================

export function ModeStrip() {
  const { t } = useTranslation();
  const { filters, updateFilters, compareMode, teamsMode } = useAnalytics();

  const handleModeChange = (newMode: string) => {
    updateFilters({ mode: newMode as AnalyticsMode });
  };

  // Get badge count for each mode
  const getBadgeCount = (mode: AnalyticsMode): number | undefined => {
    switch (mode) {
      case 'compare':
        return compareMode.selectedUserIds.length || undefined;
      case 'rankings':
        return undefined; // No badge for rankings
      case 'teams':
        return teamsMode.selectedTeamIds.length || undefined;
      default:
        return undefined;
    }
  };

  return (
    <div className="border-b border-border">
      <Tabs 
        value={filters.mode} 
        onValueChange={handleModeChange} 
        className="w-full"
      >
        <TabsList className="bg-transparent p-0 gap-6 h-auto">
            {MODES.map((mode) => {
                const Icon = mode.icon;
                const badgeCount = getBadgeCount(mode.id);
                const isActive = filters.mode === mode.id;

                return (
                    <TabsTrigger 
                        key={mode.id} 
                        value={mode.id}
                        className={cn(
                            "relative h-14 rounded-none border-b-2 border-transparent px-2 pb-3 pt-3 font-semibold text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-none",
                            "hover:border-border/50"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Icon sx={{ fontSize: 20 }} className={isActive ? "text-primary" : "text-muted-foreground"} />
                            <span>{t(mode.labelKey)}</span>
                            {badgeCount !== undefined && badgeCount > 0 && (
                                <Badge variant="default" className="ml-1 h-5 px-1.5 text-[10px]">
                                    {badgeCount}
                                </Badge>
                            )}
                        </div>
                    </TabsTrigger>
                );
            })}
        </TabsList>
      </Tabs>
    </div>
  );
}

// ============================================================================
// Mode Description Helper (Optional)
// ============================================================================

/**
 * Show description of current mode (can be used in a tooltip or info box)
 */
export function ModeDescription() {
  const { t } = useTranslation();
  const { filters } = useAnalytics();
  const currentMode = MODES.find((m) => m.id === filters.mode);

  if (!currentMode) return null;

  return (
    <Alert className="bg-muted/50 border-none">
        <div className="flex items-center gap-3">
            <currentMode.icon className="w-4 h-4 text-primary" />
            <div>
                <h4 className="font-bold text-sm leading-none mb-1">
                    {t('guild_war.analytics_mode_title', { mode: t(currentMode.labelKey) })}
                </h4>
                <p className="text-xs text-muted-foreground">
                    {t(currentMode.descriptionKey)}
                </p>
            </div>
        </div>
    </Alert>
  );
}
