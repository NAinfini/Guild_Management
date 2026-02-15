
/**
 * War Analytics - Share Button Component
 *
 * Generates and copies analytics snapshot to clipboard
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAnalytics } from './AnalyticsContext';
import { generateAnalyticsSnapshot, copyToClipboard } from './utils';
import type { WarSummary, MemberStats } from './types';
import { Button } from '@/components/button';
import { toast } from '@/lib/toast';
import { Share, ContentCopy, Check } from '@/ui-bridge/icons-material';

// ============================================================================
// Main Component
// ============================================================================

interface ShareButtonProps {
  wars?: WarSummary[];
  analyticsData?: {
    memberStats: MemberStats[];
    [key: string]: any;
  };
  disabled?: boolean;
}

export function ShareButton({ wars = [], analyticsData, disabled = false }: ShareButtonProps) {
  const { t } = useTranslation();
  const { filters, compareMode, rankingsMode, teamsMode } = useAnalytics();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if there's data to share
  const hasSelection =
    filters.selectedWars.length > 0 &&
    (filters.mode === 'compare'
      ? compareMode.selectedUserIds.length > 0
      : filters.mode === 'rankings'
      ? true
      : filters.mode === 'teams'
      ? teamsMode.selectedTeamIds.length > 0
      : false);

  const handleShare = async () => {
    if (disabled || !hasSelection || !analyticsData) return;

    setLoading(true);
    try {
      // Prepare data for snapshot
      const data: any = {};

      if (filters.mode === 'compare') {
        data.members = analyticsData.memberStats.filter((m) =>
          compareMode.selectedUserIds.includes(m.user_id)
        );
      } else if (filters.mode === 'rankings') {
        // Get top members for rankings
        const metricKey = `total_${filters.primaryMetric}` as keyof MemberStats;
        data.rankings = [...analyticsData.memberStats]
          .sort((a, b) => ((b[metricKey] as number) || 0) - ((a[metricKey] as number) || 0))
          .slice(0, rankingsMode.topN)
          .map((m, i) => ({
            rank: i + 1,
            userId: m.user_id,
            username: m.username,
            class: m.class,
            value: (m[metricKey] as number) || 0,
          }));
      } else if (filters.mode === 'teams') {
        data.teams = (analyticsData.teamStats || []).filter((row: any) =>
          teamsMode.selectedTeamIds.includes(row.team_id)
        );
      }

      // Generate snapshot text
      const snapshot = generateAnalyticsSnapshot(
        filters.mode,
        filters.primaryMetric,
        wars,
        data
      );

      // Copy to clipboard
      const success = await copyToClipboard(snapshot);

      if (success) {
        setCopied(true);
        toast.success(`${t('guild_war.analytics_snapshot_copied')} ${t('guild_war.analytics_snapshot_ready_paste')}`);
        setTimeout(() => setCopied(false), 3000);
      } else {
        toast.error(t('guild_war.analytics_snapshot_copy_failed'));
      }
    } catch (err) {
      console.error('Failed to generate snapshot:', err);
      toast.error(t('guild_war.analytics_snapshot_copy_failed'));
    } finally {
        setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full gap-2 transition-all duration-200"
      onClick={handleShare}
      disabled={disabled || !hasSelection || copied || loading}
    >
      {copied ? (
        <>
            <Check className="w-4 h-4" sx={{ color: 'var(--color-status-success)' }} />
            <span className="font-medium" style={{ color: 'var(--color-status-success-fg)' }}>{t('common.copied')}</span>
        </>
      ) : (
        <>
            <Share className="w-4 h-4" />
            <span>{t('guild_war.analytics_share_snapshot')}</span>
        </>
      )}
    </Button>
  );
}
