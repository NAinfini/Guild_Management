import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components';
import { TriangleAlert } from 'lucide-react';

type ConflictDialogState = { conflictingEvent: { title: string } } | null;
type KickDialogState = { username: string } | null;
type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

interface EventActionDialogsProps {
  t: TranslateFn;
  warningColor: string;
  conflictDialog: ConflictDialogState;
  withdrawDialog: string | null;
  kickDialog: KickDialogState;
  deleteDialog: string | null;
  onCloseConflict: () => void;
  onConfirmConflict: () => void;
  onCloseWithdraw: () => void;
  onConfirmWithdraw: () => void;
  onCloseKick: () => void;
  onConfirmKick: () => void;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;
}

export function EventActionDialogs({
  t,
  warningColor,
  conflictDialog,
  withdrawDialog,
  kickDialog,
  deleteDialog,
  onCloseConflict,
  onConfirmConflict,
  onCloseWithdraw,
  onConfirmWithdraw,
  onCloseKick,
  onConfirmKick,
  onCloseDelete,
  onConfirmDelete,
}: EventActionDialogsProps) {
  return (
    <>
      <Dialog open={!!conflictDialog} onOpenChange={(open: boolean) => !open && onCloseConflict()}>
        <DialogContent className="sm:max-w-[425px]" data-testid="events-conflict-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlert size={20} color={warningColor} aria-hidden />
              <span className="text-xs font-black uppercase tracking-[0.1em]">{t('events.conflict_detected')}</span>
            </DialogTitle>
            <DialogDescription>{t('events.conflict_warning')}</DialogDescription>
          </DialogHeader>
          {conflictDialog ? (
            <div className="rounded-md border border-border bg-accent p-2">
              <span className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground">
                {t('events.conflicting_event')}:
              </span>
              <p className="text-sm font-bold">{conflictDialog.conflictingEvent.title}</p>
            </div>
          ) : null}
          <DialogFooter>
            <Button onClick={onCloseConflict} variant="ghost">
              {t('common.cancel')}
            </Button>
            <Button
              onClick={onConfirmConflict}
              variant="default"
              className="bg-warning-main text-warning-contrastText hover:bg-warning-dark"
            >
              {t('events.join_anyway')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!withdrawDialog} onOpenChange={(open: boolean) => !open && onCloseWithdraw()}>
        <DialogContent data-testid="events-withdraw-dialog">
          <DialogHeader>
            <DialogTitle>
              <span className="text-xs font-black uppercase tracking-[0.1em]">{t('events.withdraw_title')}</span>
            </DialogTitle>
            <DialogDescription>{t('events.withdraw_confirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onCloseWithdraw} variant="ghost">
              {t('common.cancel')}
            </Button>
            <Button onClick={onConfirmWithdraw} variant="destructive">
              {t('events.withdraw')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!kickDialog} onOpenChange={(open: boolean) => !open && onCloseKick()}>
        <DialogContent data-testid="events-kick-dialog">
          <DialogHeader>
            <DialogTitle>
              <span className="text-xs font-black uppercase tracking-[0.1em]">{t('events.kick_title')}</span>
            </DialogTitle>
            <DialogDescription>
              {t('events.kick_confirm_message', { username: kickDialog?.username || '' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onCloseKick} variant="ghost">
              {t('common.cancel')}
            </Button>
            <Button onClick={onConfirmKick} variant="destructive">
              {t('events.kick')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteDialog} onOpenChange={(open: boolean) => !open && onCloseDelete()}>
        <DialogContent data-testid="events-delete-dialog">
          <DialogHeader>
            <DialogTitle>
              <span className="text-xs font-black uppercase tracking-[0.1em]">{t('events.delete_title')}</span>
            </DialogTitle>
            <DialogDescription>{t('events.delete_confirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onCloseDelete} variant="ghost">
              {t('common.cancel')}
            </Button>
            <Button onClick={onConfirmDelete} variant="destructive">
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default EventActionDialogs;
