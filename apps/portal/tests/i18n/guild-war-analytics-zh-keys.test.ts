import { describe, expect, it } from 'vitest';
import zh from '@/i18n/locales/zh.json';

describe('zh guild war analytics and history localization keys', () => {
  it('defines core analytics/history labels in Chinese locale', () => {
    const requiredKeys = [
      'active_member_search_placeholder',
      'history_search_placeholder',
      'history_ours_short',
      'history_enemy_short',
      'history_victories',
      'history_defeats',
      'history_draws',
      'history_win_loss_distribution',
      'history_total_wars',
      'history_participation_tiers',
      'history_total_members',
      'history_combat_roles',
      'history_metric_kills',
      'history_metric_credits',
      'history_metric_distance',
      'history_metric_towers',
      'history_incomplete_stats',
      'history_missing_stats_total',
      'history_missing_across_members',
      'history_missing_fields',
      'analytics_filter_header',
      'analytics_filter_subheader',
      'analytics_mode_title',
      'analytics_select_wars',
      'analytics_search_wars',
      'analytics_select_members',
      'analytics_no_compare_selection',
      'analytics_no_compare_data',
      'analytics_no_team_selection',
      'analytics_no_team_data',
      'analytics_no_members_available',
      'analytics_empty_no_wars_in_range',
      'analytics_empty_no_wars_selected',
      'analytics_empty_no_matching_members',
      'analytics_empty_no_matching_teams',
      'analytics_empty_no_stats_returned',
      'analytics_share_snapshot',
      'analytics_snapshot_copied',
      'analytics_snapshot_copy_failed',
      'analytics_snapshot_title',
      'analytics_table_no_data',
      'analytics_table_rows',
      'analytics_table_member',
      'analytics_table_class',
      'analytics_table_wars',
      'analytics_table_war',
      'analytics_table_date',
      'analytics_table_rank',
      'analytics_table_value',
      'analytics_team_fallback',
    ] as const;

    for (const key of requiredKeys) {
      expect(zh.guild_war).toHaveProperty(key);
    }
  });
});
