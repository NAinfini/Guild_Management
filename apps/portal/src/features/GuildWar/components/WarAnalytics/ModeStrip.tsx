/**
 * War Analytics - Mode Strip Component
 *
 * Tab strip for switching between analytics modes:
 * - Compare: Multi-member comparison
 * - Rankings: Top N performers
 * - Teams: Team aggregates
 */

import { Tabs, Tab, Box, Chip } from '@mui/material';
import { Users, Trophy, Shield } from 'lucide-react';
import { useAnalytics } from './AnalyticsContext';
import type { AnalyticsMode } from './types';

// ============================================================================
// Mode Configuration
// ============================================================================

interface ModeConfig {
  id: AnalyticsMode;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  description: string;
}

const MODES: ModeConfig[] = [
  {
    id: 'compare',
    label: 'Compare',
    icon: Users,
    description: 'Compare multiple members side-by-side',
  },
  {
    id: 'rankings',
    label: 'Rankings',
    icon: Trophy,
    description: 'View top performers by metric',
  },
  {
    id: 'teams',
    label: 'Teams',
    icon: Shield,
    description: 'Compare team performance',
  },
];

// ============================================================================
// Main Component
// ============================================================================

export function ModeStrip() {
  const { filters, updateFilters, compareMode, teamsMode } = useAnalytics();

  const handleModeChange = (_event: React.SyntheticEvent, newMode: AnalyticsMode) => {
    updateFilters({ mode: newMode });
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
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={filters.mode}
        onChange={handleModeChange}
        aria-label="Analytics mode selector"
        sx={{
          '& .MuiTab-root': {
            minHeight: 64,
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
          },
        }}
      >
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const badgeCount = getBadgeCount(mode.id);

          return (
            <Tab
              key={mode.id}
              value={mode.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {mode.label}
                  {badgeCount !== undefined && badgeCount > 0 && (
                    <Chip
                      label={badgeCount}
                      size="small"
                      color="primary"
                      sx={{
                        height: 20,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    />
                  )}
                </Box>
              }
              icon={<Icon size={18} />}
              iconPosition="start"
              aria-label={mode.description}
            />
          );
        })}
      </Tabs>
    </Box>
  );
}

// ============================================================================
// Mode Description Helper (Optional)
// ============================================================================

/**
 * Show description of current mode (can be used in a tooltip or info box)
 */
export function ModeDescription() {
  const { filters } = useAnalytics();
  const currentMode = MODES.find((m) => m.id === filters.mode);

  if (!currentMode) return null;

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'info.lighter',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <currentMode.icon size={16} />
      <Box>
        <Box sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{currentMode.label} Mode</Box>
        <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
          {currentMode.description}
        </Box>
      </Box>
    </Box>
  );
}
