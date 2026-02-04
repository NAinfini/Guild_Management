/**
 * War Analytics - Rankings Filters Component
 *
 * Filter controls for Rankings Mode:
 * - Class filter (multi-select)
 * - Min participation threshold
 * - Top N selector
 */

import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Stack,
  Chip,
  SelectChangeEvent,
  OutlinedInput,
} from '@mui/material';
import { Trophy, Filter } from 'lucide-react';
import { useAnalytics } from './AnalyticsContext';

// ============================================================================
// Main Component
// ============================================================================

interface RankingsFiltersProps {
  availableClasses?: string[];
  maxWars?: number;
}

export function RankingsFilters({
  availableClasses = ['DPS', 'Tank', 'Healer', 'Support'],
  maxWars = 50,
}: RankingsFiltersProps) {
  const { rankingsMode, updateRankingsMode } = useAnalytics();

  const handleClassFilterChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    updateRankingsMode({
      classFilter: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleTopNChange = (event: SelectChangeEvent) => {
    updateRankingsMode({ topN: parseInt(event.target.value) });
  };

  const handleMinParticipationChange = (_event: Event, value: number | number[]) => {
    updateRankingsMode({ minParticipation: value as number });
  };

  return (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={700} mb={2}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Trophy size={18} />
              Rankings Filters
            </Stack>
          </Typography>

          {/* Top N Selector */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Show Top N</InputLabel>
            <Select
              value={rankingsMode.topN.toString()}
              onChange={handleTopNChange}
              label="Show Top N"
            >
              <MenuItem value="5">Top 5</MenuItem>
              <MenuItem value="10">Top 10</MenuItem>
              <MenuItem value="20">Top 20</MenuItem>
              <MenuItem value="50">Top 50</MenuItem>
            </Select>
          </FormControl>

          {/* Class Filter */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Filter by Class</InputLabel>
            <Select
              multiple
              value={rankingsMode.classFilter}
              onChange={handleClassFilterChange}
              input={<OutlinedInput label="Filter by Class" />}
              renderValue={(selected) =>
                selected.length === 0 ? (
                  <em>All Classes</em>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )
              }
            >
              {availableClasses.map((className) => (
                <MenuItem key={className} value={className}>
                  {className}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Min Participation Slider */}
          <Box sx={{ px: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={700}>
                Min Wars Participated
              </Typography>
              <Chip
                label={rankingsMode.minParticipation}
                size="small"
                color="primary"
              />
            </Stack>
            <Slider
              value={rankingsMode.minParticipation}
              onChange={handleMinParticipationChange}
              min={1}
              max={Math.min(maxWars, 20)}
              marks={[
                { value: 1, label: '1' },
                { value: 5, label: '5' },
                { value: 10, label: '10' },
                { value: Math.min(maxWars, 20), label: `${Math.min(maxWars, 20)}` },
              ]}
              valueLabelDisplay="auto"
              size="small"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Active Filters Summary */}
      {(rankingsMode.classFilter.length > 0 || rankingsMode.minParticipation > 1) && (
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" gap={1} mb={1}>
              <Filter size={16} />
              <Typography variant="caption" textTransform="uppercase" fontWeight={700}>
                Active Filters
              </Typography>
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={1}>
              {rankingsMode.classFilter.length > 0 && (
                <Chip
                  label={`Classes: ${rankingsMode.classFilter.join(', ')}`}
                  size="small"
                  variant="outlined"
                  onDelete={() => updateRankingsMode({ classFilter: [] })}
                />
              )}
              {rankingsMode.minParticipation > 1 && (
                <Chip
                  label={`Min ${rankingsMode.minParticipation} wars`}
                  size="small"
                  variant="outlined"
                  onDelete={() => updateRankingsMode({ minParticipation: 1 })}
                />
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Tip:</strong> Rankings show the top performers based on the selected metric.
          Adjust filters to focus on specific classes or participation levels.
        </Typography>
      </Box>
    </Box>
  );
}
