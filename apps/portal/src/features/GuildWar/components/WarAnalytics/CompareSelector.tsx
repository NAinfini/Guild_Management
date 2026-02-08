/**
 * War Analytics - Compare Selector Component
 *
 * Multi-select member list for Compare Mode with:
 * - Preset buttons (Top Damage, Top Heals, Top Credits)
 * - Selection controls (All, Clear, Invert)
 * - Warning at 10+ members
 * - Hard cap at 20 members
 */

import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Avatar,
  Stack,
  Chip,
  ButtonGroup,
  Button,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Users, Search, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAnalytics, useSelectionLimits } from './AnalyticsContext';
import { formatCompactNumber, getClassTint } from './types';
import type { MemberStats } from './types';

// ============================================================================
// Main Component
// ============================================================================

interface CompareSelectorProps {
  members: MemberStats[];
  isLoading?: boolean;
}

export function CompareSelector({ members, isLoading = false }: CompareSelectorProps) {
  const { t } = useTranslation();
  const { compareMode, toggleUserSelection } = useAnalytics();
  const { showSoftWarning, reachedHardCap, selectedCount, softCap, hardCap } = useSelectionLimits();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter members by search
  const filteredMembers = members.filter((m) =>
    m.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Preset selections
  const handlePreset = (type: 'damage' | 'healing' | 'credits') => {
    const sorted = [...members].sort((a, b) => {
      switch (type) {
        case 'damage':
          return b.total_damage - a.total_damage;
        case 'healing':
          return b.total_healing - a.total_healing;
        case 'credits':
          return b.total_credits - a.total_credits;
        default:
          return 0;
      }
    });

    const topUserIds = sorted.slice(0, 5).map((m) => m.user_id);
    topUserIds.forEach((id) => {
      if (!compareMode.selectedUserIds.includes(id)) {
        toggleUserSelection(id);
      }
    });
  };

  // Selection controls
  const handleSelectAll = () => {
    filteredMembers.slice(0, hardCap).forEach((m) => {
      if (!compareMode.selectedUserIds.includes(m.user_id)) {
        toggleUserSelection(m.user_id);
      }
    });
  };

  const handleClear = () => {
    compareMode.selectedUserIds.forEach((id) => toggleUserSelection(id));
  };

  const handleInvert = () => {
    filteredMembers.forEach((m) => toggleUserSelection(m.user_id));
  };

  return (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={700} mb={2}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Users size={18} />
              {t('guild_war.analytics_select_members')}
            </Stack>
          </Typography>

          {/* Preset Buttons */}
          <Stack spacing={1} mb={2}>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={700}>
              {t('guild_war.analytics_quick_presets')}
            </Typography>
            <ButtonGroup size="small" fullWidth>
              <Button onClick={() => handlePreset('damage')}>
                {t('guild_war.analytics_top_damage')}
              </Button>
              <Button onClick={() => handlePreset('healing')}>
                {t('guild_war.analytics_top_heals')}
              </Button>
              <Button onClick={() => handlePreset('credits')}>
                {t('guild_war.analytics_top_credits')}
              </Button>
            </ButtonGroup>
          </Stack>

          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />

          {/* Selection Controls */}
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <ButtonGroup size="small">
              <Button onClick={handleSelectAll} disabled={reachedHardCap}>
                {t('common.all')}
              </Button>
              <Button onClick={handleClear} disabled={selectedCount === 0}>
                {t('common.clear')}
              </Button>
              <Button onClick={handleInvert}>{t('common.invert')}</Button>
            </ButtonGroup>
            <Chip
              label={t('guild_war.analytics_selected_count', { count: selectedCount })}
              size="small"
              color={showSoftWarning ? 'warning' : 'default'}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Warning Messages */}
      {showSoftWarning && !reachedHardCap && (
        <Alert severity="warning" sx={{ mb: 2 }} icon={<AlertTriangle size={20} />}>
          {t('guild_war.analytics_soft_limit_warning', { count: selectedCount })}
        </Alert>
      )}

      {reachedHardCap && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('guild_war.analytics_hard_limit_warning', { count: hardCap })}
        </Alert>
      )}

      {/* Member List */}
      <Card>
        <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredMembers.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={t('roster.empty_title')}
                secondary={
                  searchQuery
                    ? t('guild_war.analytics_try_different_search')
                    : t('guild_war.analytics_no_members_available')
                }
                sx={{ textAlign: 'center', py: 4 }}
              />
            </ListItem>
          ) : (
            filteredMembers.map((member) => {
              const isSelected = compareMode.selectedUserIds.includes(member.user_id);
              const isFocused = compareMode.focusedUserId === member.user_id;
              const isHidden = compareMode.hiddenUserIds.has(member.user_id);

              return (
                <ListItemButton
                  key={member.user_id}
                  onClick={() => toggleUserSelection(member.user_id)}
                  selected={isSelected}
                  disabled={!isSelected && reachedHardCap}
                  sx={{
                    bgcolor: getClassTint(member.class),
                    ...(isFocused && {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                    }),
                    ...(isHidden && {
                      opacity: 0.4,
                    }),
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={isSelected}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>

                  <Avatar
                    src={member.avatar_url}
                    alt={member.username}
                    sx={{ width: 32, height: 32, mr: 1.5 }}
                  >
                    {member.username[0]}
                  </Avatar>

                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight={600}>
                          {member.username}
                        </Typography>
                        {isFocused && (
                          <Chip
                            label={t('guild_war.analytics_focused')}
                            size="small"
                            color="primary"
                            sx={{ height: 16, fontSize: '0.625rem' }}
                          />
                        )}
                        {isHidden && (
                          <Chip
                            label={t('guild_war.analytics_hidden')}
                            size="small"
                            sx={{ height: 16, fontSize: '0.625rem' }}
                          />
                        )}
                      </Stack>
                    }
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={member.class} size="small" sx={{ height: 18, fontSize: '0.625rem' }} />
                        <Typography variant="caption" color="text.secondary">
                          {t('guild_war.analytics_wars_count', { count: member.wars_participated })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                          {`${formatCompactNumber(member.total_damage)} ${t('guild_war.analytics_dmg_short')}`}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItemButton>
              );
            })
          )}
        </List>
      </Card>

      {/* Info Box */}
      {selectedCount > 0 && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>{t('common.tip')}:</strong>{' '}
            {t('guild_war.analytics_compare_tip')}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
