
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
} from '@/components';
import type { NormalizationWeights } from './types';
import { DEFAULT_NORMALIZATION_WEIGHTS } from './types';

interface MetricFormulaEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (weights: NormalizationWeights) => void;
}

function toNonNegativeNumber(value: string): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.round(num);
}

export function MetricFormulaEditor({
  open,
  onClose,
  onSave,
}: MetricFormulaEditorProps) {
  const { t } = useTranslation();
  const [kda, setKda] = useState(String(DEFAULT_NORMALIZATION_WEIGHTS.kda));
  const [towers, setTowers] = useState(String(DEFAULT_NORMALIZATION_WEIGHTS.towers));
  const [distance, setDistance] = useState(String(DEFAULT_NORMALIZATION_WEIGHTS.distance));

  useEffect(() => {
    if (!open) return;
    const source = DEFAULT_NORMALIZATION_WEIGHTS;
    setKda(String(source.kda));
    setTowers(String(source.towers));
    setDistance(String(source.distance));
  }, [open]);

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

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('guild_war.analytics_formula_editor_title')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('guild_war.analytics_formula_kda_weight')}</Label>
            <Input
              type="number"
              inputProps={{ min: 0, max: 100 }}
              value={kda}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKda(e.target.value)}
            />
          </div>

          <div className="space-y-2">
             <Label>{t('guild_war.analytics_formula_tower_weight')}</Label>
             <Input
               type="number"
               inputProps={{ min: 0, max: 100 }}
               value={towers}
               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTowers(e.target.value)}
             />
          </div>

          <div className="space-y-2">
             <Label>{t('guild_war.analytics_formula_distance_weight')}</Label>
             <Input
               type="number"
               inputProps={{ min: 0, max: 100 }}
               value={distance}
               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDistance(e.target.value)}
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
          <div />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
            <Button
              onClick={() => onSave(parsed)}
              disabled={!isValid}
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
