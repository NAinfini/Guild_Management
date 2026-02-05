/**
 * War Analytics - Share Button Component
 *
 * Generates and copies analytics snapshot to clipboard
 */

import { useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import { Share2, Check } from 'lucide-react';
import { useAnalytics } from './AnalyticsContext';
import { generateAnalyticsSnapshot, copyToClipboard } from './utils';
import type { WarSummary, MemberStats } from './types';

// ============================================================================
// Main Component
// ============================================================================

interface ShareButtonProps {
  wars?: WarSummary[];
  analyticsData?: {
    memberStats: MemberStats[];
    [key: string]: any;
  };
}

export function ShareButton({ wars = [], analyticsData }: ShareButtonProps) {
  const { filters, playerMode, compareMode, rankingsMode } = useAnalytics();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  // Check if there's data to share
  const hasSelection =
    filters.selectedWars.length > 0 &&
    (filters.mode === 'player'
      ? playerMode.selectedUserId !== null
      : filters.mode === 'compare'
      ? compareMode.selectedUserIds.length > 0
      : filters.mode === 'rankings'
      ? true
      : false);

  const handleShare = async () => {
    if (!hasSelection || !analyticsData) return;

    try {
      // Prepare data for snapshot
      const data: any = {};

      if (filters.mode === 'player' && playerMode.selectedUserId) {
        data.selectedUser = analyticsData.memberStats.find(
          (m) => m.user_id === playerMode.selectedUserId
        );
      } else if (filters.mode === 'compare') {
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
        setTimeout(() => setCopied(false), 3000);
      } else {
        setError(true);
        setTimeout(() => setError(false), 3000);
      }
    } catch (err) {
      console.error('Failed to generate snapshot:', err);
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        fullWidth
        startIcon={copied ? <Check size={16} /> : <Share2 size={16} />}
        onClick={handleShare}
        disabled={!hasSelection || copied}
        color={copied ? 'success' : 'primary'}
      >
        {copied ? 'Copied!' : 'Share Snapshot'}
      </Button>

      {/* Success Snackbar */}
      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Analytics snapshot copied to clipboard!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={error}
        autoHideDuration={3000}
        onClose={() => setError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled">
          Failed to copy snapshot. Please try again.
        </Alert>
      </Snackbar>
    </>
  );
}
