/**
 * War Analytics - Compare Selector Component
 *
 * Multi-select member list for Compare Mode with:
 * - Preset buttons (Top Damage, Top Heals, Top Credits)
 * - Selection controls (All, Clear, Invert)
 * - Warning at 10+ members
 * - Hard cap at 20 members
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PeopleIcon from "@/ui-bridge/icons-material/People";
import SearchIcon from "@/ui-bridge/icons-material/Search";
import WarningIcon from "@/ui-bridge/icons-material/Warning";
import ErrorIcon from "@/ui-bridge/icons-material/Error";

import { useAnalytics, useSelectionLimits } from './AnalyticsContext';
import { formatCompactNumber, getClassTint } from './types';
import type { MemberStats } from './types';

import { 
  Card, 
  CardContent,
  Button,
  Input,
  Checkbox,
  Avatar, 
  AvatarImage, 
  AvatarFallback,
  Badge,
  Alert, 
  AlertDescription
} from '@/components';
import { cn } from '@/lib/utils';

// ============================================================================
// Main Component
// ============================================================================

interface CompareSelectorProps {
  members: MemberStats[];
  isLoading?: boolean;
}

export function CompareSelector({ members, isLoading = false }: CompareSelectorProps) {
  const { t } = useTranslation();
  const { compareMode, toggleUserSelection, updateCompareMode } = useAnalytics();
  const { showSoftWarning, reachedHardCap, selectedCount, hardCap } = useSelectionLimits();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter members by search
  const filteredMembers = members.filter((m) =>
    m.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const applySelection = (nextSelectedUserIds: number[]) => {
    const limitedSelection = nextSelectedUserIds.slice(0, hardCap);
    const limitedSet = new Set(limitedSelection);

    updateCompareMode({
      selectedUserIds: limitedSelection,
      focusedUserId: limitedSelection.includes(compareMode.focusedUserId ?? -1)
        ? compareMode.focusedUserId
        : undefined,
      hiddenUserIds: new Set(
        [...compareMode.hiddenUserIds].filter((userId) => limitedSet.has(userId))
      ),
    });
  };

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

    const topUserIds = sorted.slice(0, Math.min(5, hardCap)).map((m) => m.user_id);
    applySelection(topUserIds);
  };

  // Selection controls
  const handleSelectAll = () => {
    applySelection(filteredMembers.map((m) => m.user_id));
  };

  const handleClear = () => {
    applySelection([]);
  };

  const handleInvert = () => {
    const filteredIds = filteredMembers.map((m) => m.user_id);
    const filteredSet = new Set(filteredIds);
    const currentSet = new Set(compareMode.selectedUserIds);

    const keepOutside = compareMode.selectedUserIds.filter((id) => !filteredSet.has(id));
    const invertedInside = filteredIds.filter((id) => !currentSet.has(id));

    applySelection([...keepOutside, ...invertedInside]);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <PeopleIcon sx={{ fontSize: 20, color: "primary.main" }} />
            <span>{t('guild_war.analytics_select_members')}</span>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-bold uppercase">
              {t('guild_war.analytics_quick_presets')}
            </span>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => handlePreset('damage')} className="flex-1">
                {t('guild_war.analytics_top_damage')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handlePreset('healing')} className="flex-1">
                {t('guild_war.analytics_top_heals')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handlePreset('credits')} className="flex-1">
                {t('guild_war.analytics_top_credits')}
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
             <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
             />
          </div>

          {/* Selection Controls */}
          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleSelectAll} disabled={filteredMembers.length === 0}>
                {t('common.all')}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleClear} disabled={selectedCount === 0}>
                {t('common.clear')}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleInvert} disabled={filteredMembers.length === 0}>
                {t('common.invert')}
              </Button>
            </div>
            <Badge variant={showSoftWarning ? "secondary" : "outline"}>
              {t('guild_war.analytics_selected_count', { count: selectedCount })}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Warning Messages */}
      {showSoftWarning && !reachedHardCap && (
        <Alert
          variant="default"
          style={{
            borderColor: 'color-mix(in srgb, var(--color-status-warning) 52%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--color-status-warning-bg) 78%, transparent)',
            color: 'var(--color-status-warning-fg)',
          }}
        >
          <WarningIcon className="h-4 w-4" />
          <AlertDescription>
             {t('guild_war.analytics_soft_limit_warning', { count: selectedCount })}
          </AlertDescription>
        </Alert>
      )}

      {reachedHardCap && (
        <Alert variant="destructive">
          <ErrorIcon className="h-4 w-4" />
          <AlertDescription>
            {t('guild_war.analytics_hard_limit_warning', { count: hardCap })}
          </AlertDescription>
        </Alert>
      )}

      {/* Member List */}
      <Card>
        <div className="max-h-[400px] overflow-auto p-1 space-y-0.5">
          {filteredMembers.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <p className="font-medium">{t('roster.empty_title')}</p>
              <p className="active:scale-[0.98]">
                  {searchQuery
                    ? t('guild_war.analytics_try_different_search')
                    : t('guild_war.analytics_no_members_available')}
              </p>
            </div>
          ) : (
            filteredMembers.map((member) => {
              const isSelected = compareMode.selectedUserIds.includes(member.user_id);
              const isFocused = compareMode.focusedUserId === member.user_id;
              const isHidden = compareMode.hiddenUserIds.has(member.user_id);

              return (
                <div
                  key={member.user_id}
                  onClick={() => toggleUserSelection(member.user_id)}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors relative",
                    "hover:bg-accent/50",
                    isSelected && "bg-accent",
                    !isSelected && reachedHardCap && "opacity-50 pointer-events-none",
                    isFocused && "ring-2 ring-primary ring-inset",
                    isHidden && "opacity-40"
                  )}
                  style={{
                    backgroundColor: isSelected ? undefined : getClassTint(member.class),
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    className="pointer-events-none"
                  />

                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar_url} alt={member.username} />
                    <AvatarFallback>{member.username[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                       <span className="font-semibold text-sm truncate">{member.username}</span>
                       {isFocused && (
                         <Badge variant="default" className="h-4 px-1 text-[10px]">
                            {t('guild_war.analytics_focused')}
                         </Badge>
                       )}
                       {isHidden && (
                         <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                            {t('guild_war.analytics_hidden')}
                         </Badge>
                       )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="h-[18px] px-1 text-[10px] font-normal">
                             {member.class}
                        </Badge>
                        <span>{t('guild_war.analytics_wars_count', { count: member.wars_participated })}</span>
                        <span className="font-mono ml-auto">
                            {formatCompactNumber(member.total_damage)} {t('guild_war.analytics_dmg_short')}
                        </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Info Box */}
      {selectedCount > 0 && (
        <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <strong>{t('common.tip')}:</strong>{' '}
          {t('guild_war.analytics_compare_tip')}
        </div>
      )}
    </div>
  );
}
