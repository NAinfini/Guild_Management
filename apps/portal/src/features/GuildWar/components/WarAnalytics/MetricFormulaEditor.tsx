
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Select,
  SelectItem,
  Alert,
  AlertDescription,
} from '@/components';
import {
  FormControl,
  FormHelperText
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { NormalizationFormulaPreset, NormalizationWeights } from './types';

interface MetricFormulaEditorProps {
  open: boolean;
  initialWeights: NormalizationWeights;
  presets?: NormalizationFormulaPreset[];
  selectedPresetId?: string | null;
  onSelectPreset?: (presetId: string) => void;
  onDeletePreset?: (presetId: string) => void;
  onClose: () => void;
  onSave: (payload: { weights: NormalizationWeights; presetName?: string }) => void;
  isSyncing?: boolean;
  syncError?: boolean;
  onRetrySync?: () => void;
  syncStatusText?: string;
  syncErrorText?: string;
  retrySyncLabel?: string;
}

function toNonNegativeNumber(value: string): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.round(num);
}

export function MetricFormulaEditor({
  open,
  initialWeights,
  presets = [],
  selectedPresetId,
  onSelectPreset,
  onDeletePreset,
  onClose,
  onSave,
  isSyncing = false,
  syncError = false,
  onRetrySync,
  syncStatusText,
  syncErrorText,
  retrySyncLabel,
}: MetricFormulaEditorProps) {
  const { t } = useTranslation();
  const [kda, setKda] = useState(String(initialWeights.kda));
  const [towers, setTowers] = useState(String(initialWeights.towers));
  const [distance, setDistance] = useState(String(initialWeights.distance));
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    if (!open) return;
    const selectedPreset = presets.find((preset) => preset.id === selectedPresetId);
    const source = selectedPreset?.weights ?? initialWeights;
    setKda(String(source.kda));
    setTowers(String(source.towers));
    setDistance(String(source.distance));
    setPresetName('');
  }, [open, initialWeights, presets, selectedPresetId]);

  const parsed = useMemo(
    () => ({
      kda: toNonNegativeNumber(kda),
      towers: toNonNegativeNumber(towers),
      distance: toNonNegativeNumber(distance),
    }),
    [kda, towers, distance]
  );

  const total = parsed.kda + parsed.towers + parsed.distance;
  const isValid = total === 100;
  const selectedPreset = presets.find((preset) => preset.id === selectedPresetId);

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('guild_war.analytics_formula_editor_title')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {isSyncing && (
            <div className="text-xs text-muted-foreground">
              {syncStatusText || t('common.loading')}
            </div>
          )}
          
          {syncError && (
            <Alert variant="destructive">
              <InfoIcon sx={{ fontSize: 16 }} />
              <AlertDescription className="flex items-center justify-between">
                <span>{syncErrorText || t('common.no_intel')}</span>
                {onRetrySync && (
                   <Button variant="ghost" size="sm" onClick={onRetrySync} className="h-auto p-0 px-2 text-inherit hover:bg-transparent hover:underline">
                      {retrySyncLabel || t('common.retry')}
                   </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>{t('guild_war.analytics_formula_preset')}</Label>
            <Select
              value={selectedPresetId || ''} // MUI Select expects a controlled value, use '' for null/undefined
              onChange={(e) => onSelectPreset?.(e.target.value as string)}
              displayEmpty
              renderValue={(selected: any) => {
                if (!selected) return <span className="text-muted-foreground">{t('guild_war.analytics_formula_preset_placeholder')}</span>; // Using t() for placeholder
                const preset = presets.find(p => p.id === selected);
                return preset ? preset.name : selected;
              }}
              // Added sx for basic styling to match previous appearance if needed, or rely on global MUI styles
              sx={{ width: '100%' }} 
            >
              {presets.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.name}
                </SelectItem>
              ))}
            </Select>
            {selectedPreset && (
              <div className="text-xs text-muted-foreground">
                {t('guild_war.analytics_formula_version')}: v{selectedPreset.version}
                <ChevronRightIcon sx={{ fontSize: 14, opacity: 0.5, ml: 0.5 }} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t('guild_war.analytics_formula_kda_weight')}</Label>
            <Input
              type="number"
              inputProps={{ min: 0, max: 100 }}
              value={kda}
              onChange={(e) => setKda(e.target.value)}
            />
          </div>

          <div className="space-y-2">
             <Label>{t('guild_war.analytics_formula_tower_weight')}</Label>
             <Input
               type="number"
               inputProps={{ min: 0, max: 100 }}
               value={towers}
               onChange={(e) => setTowers(e.target.value)}
             />
          </div>

          <div className="space-y-2">
             <Label>{t('guild_war.analytics_formula_distance_weight')}</Label>
             <Input
               type="number"
               inputProps={{ min: 0, max: 100 }}
               value={distance}
               onChange={(e) => setDistance(e.target.value)}
             />
          </div>

          <div className="space-y-2">
             <Label>{t('guild_war.analytics_formula_preset_name')}</Label>
             <Input
               value={presetName}
               onChange={(e) => setPresetName(e.target.value)}
               placeholder={t('guild_war.analytics_formula_preset_name_placeholder')}
             />
          </div>

          <div
            className="text-xs"
            style={{ color: isValid ? 'var(--color-status-success-fg)' : 'var(--color-status-error-fg)' }}
          >
             {isValid
               ? t('guild_war.analytics_formula_total_ok', { total })
               : t('guild_war.analytics_formula_total_invalid')}
          </div>
          
          <div className="text-xs text-muted-foreground">
            {t('guild_war.analytics_formula_hint')}
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <div>
            {selectedPresetId &&
              !presets.find((preset) => preset.id === selectedPresetId)?.isDefault && (
                <Button variant="destructive" onClick={() => onDeletePreset?.(selectedPresetId)}>
                  {t('common.delete')}
                </Button>
              )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
            <Button
              onClick={() => onSave({ weights: parsed, presetName: presetName.trim() || undefined })}
              disabled={!isValid || isSyncing}
            >
              {t('common.save')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MetricFormulaEditor;
