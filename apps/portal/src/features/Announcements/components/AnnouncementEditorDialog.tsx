import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sanitizeHtml } from '@/lib/utils';
import type { Announcement } from '@/types';
import {
  PrimitiveButton,
  PrimitiveDialog,
  PrimitiveDialogContent,
  PrimitiveDialogFooter,
  PrimitiveDialogHeader,
  PrimitiveDialogTitle,
  PrimitiveInput,
  PrimitiveText,
} from '@/components';
import styles from '../Announcements.module.css';

const TiptapEditor = lazy(() =>
  import('@/components/input/TiptapEditor').then((module) => ({ default: module.TiptapEditor })),
);

export type EditorPayload = {
  title: string;
  content_html: string;
};

interface AnnouncementEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: Announcement | null;
  onSubmit: (payload: EditorPayload) => Promise<void> | void;
}

export default function AnnouncementEditorDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: AnnouncementEditorDialogProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(initialData?.title ?? '');
    setContent(initialData?.content_html ?? '');
    setShowPreview(false);
  }, [initialData, open]);

  const titleTrimmed = title.trim();
  const contentTrimmed = content.trim();
  const canSubmit = titleTrimmed.length > 0 && contentTrimmed.length > 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    await onSubmit({
      title: titleTrimmed,
      content_html: content,
    });
  };

  return (
    <PrimitiveDialog open={open} onOpenChange={onOpenChange}>
      <PrimitiveDialogContent data-testid="announcement-editor-dialog" className={styles.dialogPanel} closeLabel={t('common.close')}>
        <PrimitiveDialogHeader>
          <PrimitiveDialogTitle>
            {initialData ? t('announcements.edit_signal') : t('announcements.broadcast_signal')}
          </PrimitiveDialogTitle>
        </PrimitiveDialogHeader>

        <form data-testid="announcement-editor-form" className={styles.editorForm} onSubmit={handleSubmit}>
          <div className={styles.editorField}>
            {/* This title field feeds announcement create/update payload title. */}
            <label htmlFor="announcement-title" className={styles.editorLabel}>
              <PrimitiveText as="span" size="sm" weight="semibold">
                {t('announcements.subject_line')}
              </PrimitiveText>
            </label>
            <PrimitiveInput
              id="announcement-title"
              data-testid="announcement-title-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t('announcements.subject_line')}
            />
          </div>

          <div className={styles.editorField}>
            {/* Toggle editor/preview to keep rich text intent visible before submit. */}
            <div className={styles.editorModeToggle}>
              <PrimitiveButton
                type="button"
                variant={!showPreview ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                {t('common.edit')}
              </PrimitiveButton>
              <PrimitiveButton
                type="button"
                variant={showPreview ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowPreview(true)}
              >
                {t('tools.preview_label')}
              </PrimitiveButton>
            </div>

            {showPreview ? (
              <div className={styles.previewPanel} dangerouslySetInnerHTML={sanitizeHtml(content)} />
            ) : (
              <Suspense
                fallback={
                  <div className={styles.previewPanel}>
                    <PrimitiveText as="p" color="secondary">
                      {t('common.loading')}
                    </PrimitiveText>
                  </div>
                }
              >
                <TiptapEditor
                  content={content}
                  onChange={setContent}
                  placeholder={t('announcements.tx_body')}
                  className="min-h-[260px]"
                />
              </Suspense>
            )}
          </div>

          <PrimitiveDialogFooter>
            <PrimitiveButton type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </PrimitiveButton>
            {/* Submit dispatches normalized editor payload back to feature mutation handlers. */}
            <PrimitiveButton type="submit" disabled={!canSubmit}>
              {t('announcements.transmit')}
            </PrimitiveButton>
          </PrimitiveDialogFooter>
        </form>
      </PrimitiveDialogContent>
    </PrimitiveDialog>
  );
}
