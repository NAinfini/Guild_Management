import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@/ui-bridge/material';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

interface GuildWarActionDialogsProps {
  conflictOpen: boolean;
  kickPoolConfirmOpen: boolean;
  t: TranslateFn;
  onCloseConflict: () => void;
  onRefreshConflict: () => void;
  onOverrideConflict: () => void;
  onCloseKickFromPool: () => void;
  onConfirmKickFromPool: () => void | Promise<void>;
}

export default function GuildWarActionDialogs({
  conflictOpen,
  kickPoolConfirmOpen,
  t,
  onCloseConflict,
  onRefreshConflict,
  onOverrideConflict,
  onCloseKickFromPool,
  onConfirmKickFromPool,
}: GuildWarActionDialogsProps) {
  return (
    <>
      <Dialog open={conflictOpen} onClose={onCloseConflict}>
        <DialogTitle>{t('guild_war.conflict_title')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{t('guild_war.conflict_body')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onRefreshConflict}>{t('common.refresh')}</Button>
          <Button variant="contained" color="warning" onClick={onOverrideConflict}>
            {t('guild_war.override')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={kickPoolConfirmOpen} onClose={onCloseKickFromPool} maxWidth="xs" fullWidth>
        <DialogTitle>{t('guild_war.remove_from_pool')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{t('guild_war.remove_confirm')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseKickFromPool}>{t('common.cancel')}</Button>
          <Button color="error" variant="contained" onClick={() => void onConfirmKickFromPool()}>
            {t('common.remove')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
