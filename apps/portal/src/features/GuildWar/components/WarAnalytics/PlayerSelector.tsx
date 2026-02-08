/**
 * War Analytics - Player Selector Component
 *
 * Used in Player Mode to search and select a single member
 */

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Autocomplete,
  TextField,
  Avatar,
  Stack,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Alert,
} from '@mui/material';
import { User, TrendingUp, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAnalytics } from './AnalyticsContext';
import type { MemberStats, MetricType } from './types';
import { formatMetricName, formatNumber, formatCompactNumber } from './types';

// ============================================================================
// Main Component
// ============================================================================

interface PlayerSelectorProps {
  members: MemberStats[];
  isLoading?: boolean;
}

export function PlayerSelector({ members, isLoading = false }: PlayerSelectorProps) {
  const { t } = useTranslation();
  const { playerMode, updatePlayerMode, filters } = useAnalytics();

  const selectedMember = members.find((m) => m.user_id === playerMode.selectedUserId);

  const handleMemberSelect = (_event: any, member: MemberStats | null) => {
    updatePlayerMode({ selectedUserId: member?.user_id || null });
  };

  const handleSecondaryMetricChange = (metric: MetricType | '') => {
    updatePlayerMode({ secondaryMetric: metric || undefined });
  };

  const handleMovingAverageToggle = (checked: boolean) => {
    updatePlayerMode({ showMovingAverage: checked });
  };

  return (
    <Box>
      {/* Member Search */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={700} mb={2}>
            <Stack direction="row" alignItems="center" gap={1}>
              <User size={18} />
              {t('guild_war.analytics_select_member')}
            </Stack>
          </Typography>

          <Autocomplete
            options={members}
            value={selectedMember || null}
            onChange={handleMemberSelect}
            getOptionLabel={(member) => member.username}
            loading={isLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={t('guild_war.analytics_search_by_username')}
                size="small"
              />
            )}
            renderOption={(props, member) => (
              <Box component="li" {...props}>
                <Stack direction="row" spacing={1.5} alignItems="center" width="100%">
                  <Avatar
                    src={member.avatar_url}
                    alt={member.username}
                    sx={{ width: 32, height: 32 }}
                  >
                    {member.username[0]}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight={600}>
                      {member.username}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Chip label={member.class} size="small" sx={{ height: 18, fontSize: '0.625rem' }} />
                      <Typography variant="caption" color="text.secondary">
                        {t('guild_war.analytics_wars_count', { count: member.wars_participated })}
                      </Typography>
                    </Stack>
                  </Box>
                  <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                    {`${formatCompactNumber(member.total_damage)} ${t('guild_war.analytics_dmg_short')}`}
                  </Typography>
                </Stack>
              </Box>
            )}
            noOptionsText={t('roster.empty_title')}
          />
        </CardContent>
      </Card>

      {/* Selected Member Info */}
      {selectedMember && (
        <>
          <SelectedMemberCard member={selectedMember} wars={filters.selectedWars} />

          {/* Chart Options */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={700} mb={2}>
                Chart Options
              </Typography>

              <Stack spacing={2}>
                {/* Secondary Metric */}
                <FormControl fullWidth size="small">
                  <InputLabel>Secondary Metric (overlay)</InputLabel>
                  <Select
                    value={playerMode.secondaryMetric || ''}
                    onChange={(e) => handleSecondaryMetricChange(e.target.value as MetricType | '')}
                    label="Secondary Metric (overlay)"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="damage">Damage</MenuItem>
                    <MenuItem value="healing">Healing</MenuItem>
                    <MenuItem value="building_damage">Building Damage</MenuItem>
                    <MenuItem value="credits">Credits</MenuItem>
                    <MenuItem value="kills">Kills</MenuItem>
                    <MenuItem value="deaths">Deaths</MenuItem>
                    <MenuItem value="assists">Assists</MenuItem>
                  </Select>
                </FormControl>

                {/* Moving Average */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={playerMode.showMovingAverage}
                      onChange={(e) => handleMovingAverageToggle(e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Show 3-war moving average
                    </Typography>
                  }
                />
              </Stack>
            </CardContent>
          </Card>
        </>
      )}

      {/* No Selection Message */}
      {!selectedMember && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Select a member to view their performance timeline across wars
        </Alert>
      )}
    </Box>
  );
}

// ============================================================================
// Selected Member Card
// ============================================================================

interface SelectedMemberCardProps {
  member: MemberStats;
  wars: number[];
}

function SelectedMemberCard({ member, wars }: SelectedMemberCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={member.avatar_url} alt={member.username} sx={{ width: 48, height: 48 }}>
              {member.username[0]}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" fontWeight={700}>
                {member.username}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={member.class} size="small" />
                <Typography variant="caption" color="text.secondary">
                  {member.wars_participated} wars participated
                </Typography>
              </Stack>
            </Box>
          </Stack>

          {/* Quick Stats */}
          <Stack direction="row" spacing={2}>
            <StatBox
              label="Total Damage"
              value={formatNumber(member.total_damage)}
              icon={<TrendingUp size={16} />}
            />
            <StatBox
              label="Avg Damage"
              value={formatNumber(member.avg_damage)}
              icon={<Award size={16} />}
            />
            <StatBox
              label="K/D/A"
              value={`${member.total_kills}/${member.total_deaths}/${member.total_assists}`}
            />
          </Stack>

          {/* Participation Info */}
          {wars.length > 0 && (
            <Box
              sx={{
                p: 1,
                bgcolor: 'action.hover',
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Showing data for {member.wars_participated} of {wars.length} selected wars
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Stat Box Helper
// ============================================================================

interface StatBoxProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

function StatBox({ label, value, icon }: StatBoxProps) {
  return (
    <Box flex={1}>
      <Stack direction="row" spacing={0.5} alignItems="center" mb={0.5}>
        {icon}
        <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={700}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="h6" fontWeight={700} fontFamily="monospace">
        {value}
      </Typography>
    </Box>
  );
}

// ============================================================================
// Export
// ============================================================================

export { SelectedMemberCard, StatBox };
