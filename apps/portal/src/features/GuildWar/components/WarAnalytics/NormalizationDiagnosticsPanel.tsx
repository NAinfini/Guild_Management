
import { useMemo } from 'react';
import {
  TableBody,
  alpha 
} from "@mui/material";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
} from '@/components';
import { formatCompactNumber } from './types';
import type { MetricType, PerWarMemberStats } from './types';


interface NormalizationDiagnosticsPanelProps {
  rows: PerWarMemberStats[];
  metric: MetricType;
  maxRows?: number;
  onCopy?: (payload: string) => void;
  formulaVersion?: string | null;
  canCopy?: boolean;
  canViewFormulaVersion?: boolean;
}

function getMetricValue(row: PerWarMemberStats, metric: MetricType): number {
  const value = row[metric];
  return typeof value === 'number' ? value : 0;
}

function getRawMetricValue(row: PerWarMemberStats, metric: MetricType): number {
  const key = `raw_${metric}` as keyof PerWarMemberStats;
  const raw = row[key];
  if (typeof raw === 'number') return raw;
  return getMetricValue(row, metric);
}

export function NormalizationDiagnosticsPanel({
  rows,
  metric,
  maxRows = 30,
  onCopy,
  formulaVersion,
  canCopy = true,
  canViewFormulaVersion = true,
}: NormalizationDiagnosticsPanelProps) {
  const { t } = useTranslation();

  const diagnosticsRows = useMemo(
    () =>
      rows
        .filter((row) => typeof row.normalization_factor === 'number')
        .slice(0, maxRows),
    [rows, maxRows]
  );

  if (diagnosticsRows.length === 0) {
    return null;
  }

  const handleCopy = async () => {
    const header = canViewFormulaVersion
      ? 'war_id,war_date,user_id,username,metric,raw,normalized,factor,tier,formula_version'
      : 'war_id,war_date,user_id,username,metric,raw,normalized,factor,tier';
    const lines = diagnosticsRows.map((row) => {
      const raw = getRawMetricValue(row, metric);
      const normalized = getMetricValue(row, metric);
      const columns = [
        row.war_id,
        row.war_date,
        row.user_id,
        row.username,
        metric,
        raw,
        normalized,
        row.normalization_factor ?? '',
        row.enemy_strength_tier ?? '',
      ];

      if (canViewFormulaVersion) {
        columns.push(row.formula_version ?? formulaVersion ?? '');
      }

      return columns.join(',');
    });

    const payload = [header, ...lines].join('\n');
    if (onCopy) {
      onCopy(payload);
      return;
    }
    await navigator.clipboard.writeText(payload);
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm">
            {t('guild_war.analytics_normalization_diagnostics')}
          </h4>
          {canCopy && (
            <Button size="sm" variant="outline" onClick={handleCopy}>
              <WarningIcon sx={{ fontSize: 16, mr: 1 }} />
              {t('guild_war.analytics_copy_diagnostics')}
            </Button>
          )}
        </div>
        
        {canViewFormulaVersion && formulaVersion && (
          <Badge variant="outline" className="mb-2">
            {t('guild_war.analytics_formula_version')}: {formulaVersion}
          </Badge>
        )}

        <div className="max-h-[260px] overflow-auto rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0">
              <TableRow>
                <TableHead>{t('common.member')}</TableHead>
                <TableHead>{t('guild_war.analytics_metric')}</TableHead>
                <TableHead className="text-right">{t('guild_war.analytics_raw')}</TableHead>
                <TableHead className="text-right">{t('guild_war.analytics_normalized')}</TableHead>
                <TableHead className="text-right">{t('guild_war.analytics_factor')}</TableHead>
                <TableHead>{t('guild_war.analytics_tier')}</TableHead>
                {canViewFormulaVersion && (
                  <TableHead>{t('guild_war.analytics_formula_version')}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {diagnosticsRows.map((row) => {
                const raw = getRawMetricValue(row, metric);
                const normalized = getMetricValue(row, metric);
                return (
                  <TableRow key={`${row.war_id}_${row.user_id}`}>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <InfoIcon sx={{ fontSize: 16, mr: 0.5, opacity: 0.7 }} />
                          <span className="font-bold text-xs">{row.username}</span>
                        </div>
                        <span className="text-muted-foreground text-[10px]">#{row.war_id}</span>
                      </div>
                    </TableCell>
                    <TableCell>{metric}</TableCell>
                    <TableCell className="text-right font-mono">{formatCompactNumber(raw)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCompactNumber(normalized)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {typeof row.normalization_factor === 'number' ? row.normalization_factor.toFixed(3) : '-'}
                    </TableCell>
                    <TableCell>
                      {row.enemy_strength_tier ? (
                        <Badge
                          variant={
                            row.enemy_strength_tier === 'strong'
                              ? 'destructive' // specific color mapping needed? Destructive is red/orange usually. Warning is yellow.
                              : row.enemy_strength_tier === 'weak'
                                ? 'default' // Success usually green. Default is primary.
                                : 'secondary'
                          }
                          style={
                            row.enemy_strength_tier === 'strong'
                              ? {
                                  backgroundColor: 'color-mix(in srgb, var(--color-status-warning-bg) 75%, transparent)',
                                  color: 'var(--color-status-warning-fg)',
                                  borderColor: 'color-mix(in srgb, var(--color-status-warning) 45%, transparent)',
                                }
                              : row.enemy_strength_tier === 'weak'
                                ? {
                                    backgroundColor: 'color-mix(in srgb, var(--color-status-success-bg) 75%, transparent)',
                                    color: 'var(--color-status-success-fg)',
                                    borderColor: 'color-mix(in srgb, var(--color-status-success) 45%, transparent)',
                                  }
                                : undefined
                          }
                        >
                          {row.enemy_strength_tier}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    {canViewFormulaVersion && (
                      <TableCell>{row.formula_version ?? formulaVersion ?? '-'}</TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default NormalizationDiagnosticsPanel;
