import { Archive, Edit3, Pin, Trash2 } from 'lucide-react';
import {
  MarkdownRenderer,
  PrimitiveButton,
  PrimitiveDialog,
  PrimitiveDialogContent,
  PrimitiveDialogFooter,
  PrimitiveDialogHeader,
  PrimitiveDialogTitle,
  PrimitiveText,
} from '@/components';
import { formatDateTime, sanitizeHtml } from '@/lib/utils';
import type { Announcement } from '@/types';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

interface AnnouncementActionDialogsProps {
  t: TranslateFn;
  timezoneOffset: number;
  selectedAnnouncement: Announcement | null;
  deleteTargetId: string | null;
  canEdit: boolean;
  canPin: boolean;
  canArchive: boolean;
  canDelete: boolean;
  online: boolean;
  dialogPanelClassName: string;
  dialogBodyClassName: string;
  actionRowClassName: string;
  actionIconClassName: string;
  onCloseView: () => void;
  onEditSelected: () => void;
  onTogglePinSelected: () => Promise<void> | void;
  onToggleArchiveSelected: () => Promise<void> | void;
  onRequestDeleteSelected: () => void;
  onCloseDelete: () => void;
  onConfirmDelete: () => Promise<void> | void;
}

export function AnnouncementActionDialogs({
  t,
  timezoneOffset,
  selectedAnnouncement,
  deleteTargetId,
  canEdit,
  canPin,
  canArchive,
  canDelete,
  online,
  dialogPanelClassName,
  dialogBodyClassName,
  actionRowClassName,
  actionIconClassName,
  onCloseView,
  onEditSelected,
  onTogglePinSelected,
  onToggleArchiveSelected,
  onRequestDeleteSelected,
  onCloseDelete,
  onConfirmDelete,
}: AnnouncementActionDialogsProps) {
  return (
    <>
      <PrimitiveDialog
        open={Boolean(selectedAnnouncement)}
        onOpenChange={(open) => {
          if (!open) {
            onCloseView();
          }
        }}
      >
        <PrimitiveDialogContent
          data-testid="announcement-view-dialog"
          className={dialogPanelClassName}
          closeLabel={t('common.close')}
        >
          {selectedAnnouncement ? (
            <>
              <PrimitiveDialogHeader>
                <PrimitiveDialogTitle>{selectedAnnouncement.title}</PrimitiveDialogTitle>
                <PrimitiveText size="xs" color="tertiary">
                  {formatDateTime(selectedAnnouncement.created_at, timezoneOffset)}
                </PrimitiveText>
              </PrimitiveDialogHeader>

              <div className={dialogBodyClassName}>
                {selectedAnnouncement.content_html.trim().startsWith('<') ? (
                  <div dangerouslySetInnerHTML={sanitizeHtml(selectedAnnouncement.content_html)} />
                ) : (
                  <MarkdownRenderer>{selectedAnnouncement.content_html}</MarkdownRenderer>
                )}
              </div>

              {(canEdit || canPin || canArchive || canDelete) && (
                <PrimitiveDialogFooter className={actionRowClassName}>
                  {canEdit ? (
                    <PrimitiveButton type="button" variant="secondary" onClick={onEditSelected} disabled={!online}>
                      <span className={actionIconClassName} aria-hidden="true">
                        <Edit3 size={14} />
                      </span>
                      {t('announcements.edit')}
                    </PrimitiveButton>
                  ) : null}

                  {canPin ? (
                    <PrimitiveButton
                      type="button"
                      variant="secondary"
                      onClick={() => void onTogglePinSelected()}
                      disabled={!online}
                    >
                      <span className={actionIconClassName} aria-hidden="true">
                        <Pin size={14} />
                      </span>
                      {selectedAnnouncement.is_pinned ? t('announcements.unpin') : t('announcements.pin')}
                    </PrimitiveButton>
                  ) : null}

                  {canArchive ? (
                    <PrimitiveButton
                      type="button"
                      variant="secondary"
                      onClick={() => void onToggleArchiveSelected()}
                      disabled={!online}
                    >
                      <span className={actionIconClassName} aria-hidden="true">
                        <Archive size={14} />
                      </span>
                      {selectedAnnouncement.is_archived ? t('announcements.restore') : t('announcements.archive')}
                    </PrimitiveButton>
                  ) : null}

                  {canDelete ? (
                    <PrimitiveButton type="button" variant="ghost" onClick={onRequestDeleteSelected} disabled={!online}>
                      <span className={actionIconClassName} aria-hidden="true">
                        <Trash2 size={14} />
                      </span>
                      {t('announcements.delete')}
                    </PrimitiveButton>
                  ) : null}
                </PrimitiveDialogFooter>
              )}
            </>
          ) : null}
        </PrimitiveDialogContent>
      </PrimitiveDialog>

      <PrimitiveDialog open={Boolean(deleteTargetId)} onOpenChange={(open) => !open && onCloseDelete()}>
        <PrimitiveDialogContent
          data-testid="announcement-delete-dialog"
          className={dialogPanelClassName}
          closeLabel={t('common.close')}
        >
          <PrimitiveDialogHeader>
            <PrimitiveDialogTitle>{t('announcements.delete')}</PrimitiveDialogTitle>
          </PrimitiveDialogHeader>
          <PrimitiveText as="p" color="secondary">
            {t('common.delete_confirm')}
          </PrimitiveText>
          <PrimitiveDialogFooter>
            <PrimitiveButton type="button" variant="ghost" onClick={onCloseDelete}>
              {t('common.cancel')}
            </PrimitiveButton>
            <PrimitiveButton type="button" onClick={() => void onConfirmDelete()}>
              {t('common.delete')}
            </PrimitiveButton>
          </PrimitiveDialogFooter>
        </PrimitiveDialogContent>
      </PrimitiveDialog>
    </>
  );
}

export default AnnouncementActionDialogs;
