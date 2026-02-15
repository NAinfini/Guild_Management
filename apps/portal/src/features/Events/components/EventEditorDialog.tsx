import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  PrimitiveButton,
} from '@/components';

type EventEditorMode = 'create' | 'edit';

type EventEditorDialogProps = {
  open: boolean;
  editorMode: EventEditorMode;
  editingEventTitle?: string;
  onClose: () => void;
  onSubmit: () => void;
};

export default function EventEditorDialog({
  open,
  editorMode,
  editingEventTitle,
  onClose,
  onSubmit,
}: EventEditorDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(nextOpen: boolean) => !nextOpen && onClose()}>
      <DialogContent data-testid="event-editor-dialog" className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {editorMode === 'create' ? t('events.new_deployment') : editingEventTitle || t('common.edit')}
          </DialogTitle>
          <DialogDescription>
            {editorMode === 'create' ? t('events.new_deployment') : t('common.edit')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <PrimitiveButton variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </PrimitiveButton>
          <PrimitiveButton data-testid="event-editor-submit" onClick={onSubmit}>
            {editorMode === 'create' ? t('common.create') : t('common.save')}
          </PrimitiveButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
