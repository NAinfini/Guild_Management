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
              Select Members
            </Stack>
          </Typography>

          {/* Preset Buttons */}
          <Stack spacing={1} mb={2}>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={700}>
              Quick Presets
            </Typography>
            <ButtonGroup size="small" fullWidth>
              <Button onClick={() => handlePreset('damage')}>Top 5 Damage</Button>
              <Button onClick={() => handlePreset('healing')}>Top 5 Heals</Button>
              <Button onClick={() => handlePreset('credits')}>Top 5 Credits</Button>
            </ButtonGroup>
          </Stack>

          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search members..."
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
                All
              </Button>
              <Button onClick={handleClear} disabled={selectedCount === 0}>
                Clear
              </Button>
              <Button onClick={handleInvert}>Invert</Button>
            </ButtonGroup>
            <Chip
              label={`${selectedCount} selected`}
              size="small"
              color={showSoftWarning ? 'warning' : 'default'}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Warning Messages */}
      {showSoftWarning && !reachedHardCap && (
        <Alert severity="warning" sx={{ mb: 2 }} icon={<AlertTriangle size={20} />}>
          You've selected {selectedCount} members. Consider using Rankings mode for better
          performance with large selections.
        </Alert>
      )}

      {reachedHardCap && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Maximum {hardCap} members can be selected. Please remove some members or use Rankings
          mode.
        </Alert>
      )}

      {/* Member List */}
      <Card>
        <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredMembers.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No members found"
                secondary={searchQuery ? 'Try a different search' : 'No members available'}
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
                          <Chip label="Focused" size="small" color="primary" sx={{ height: 16, fontSize: '0.625rem' }} />
                        )}
                        {isHidden && (
                          <Chip label="Hidden" size="small" sx={{ height: 16, fontSize: '0.625rem' }} />
                        )}
                      </Stack>
                    }
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={member.class} size="small" sx={{ height: 18, fontSize: '0.625rem' }} />
                        <Typography variant="caption" color="text.secondary">
                          {member.wars_participated} wars
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                          {formatCompactNumber(member.total_damage)} dmg
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
            <strong>Tip:</strong> Click legend items to focus members. Alt+Click to hide/show series.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
