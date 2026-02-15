import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Image, Play, X, Zap } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogTitle, MarkdownContent } from '@/components';
import type { User } from '@/types';
import { getOptimizedMediaUrl, getAvatarInitial } from '@/lib/media-conversion';
import { sanitizeHtml, formatPower } from '@/lib/utils';

interface RosterProfileDialogProps {
  member: User;
  onClose: () => void;
}

export function RosterProfileDialog({ member, onClose }: RosterProfileDialogProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useTranslation();

  const mediaList = useMemo(() => {
    if (member.media && member.media.length > 0) return member.media;
    return [] as any[];
  }, [member]);

  const activeItem = mediaList.length > 0 ? mediaList[activeIndex] : null;

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (mediaList.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % mediaList.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (mediaList.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  return (
    <Dialog open onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent
        data-testid="roster-member-detail-panel"
        hideCloseButton
        maxWidth={false}
        fullWidth
        className="MuiDialog-paper w-[min(1800px,calc(100vw-1rem))] max-w-none h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] p-0 overflow-hidden rounded-2xl border border-[color:var(--cmp-dialog-border)]"
      >
        <DialogTitle className="sr-only">Profile of {member.username}</DialogTitle>
        <div className="relative flex h-full w-full flex-col">
          <section
            className="shrink-0 border-b p-4 sm:p-6"
            style={{
              backgroundColor: 'var(--cmp-dialog-bg)',
              borderColor: 'var(--cmp-dialog-border)',
              color: 'var(--sys-text-primary)',
            }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-4 min-w-0">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border shrink-0"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--sys-text-primary) 14%, transparent)',
                    backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 72%, transparent)',
                  }}
                >
                  {member.avatar_url ? (
                    <img
                      src={getOptimizedMediaUrl(member.avatar_url, 'image')}
                      className="w-full h-full object-cover"
                      alt={member.username}
                      width={80}
                      height={80}
                      loading="eager"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary font-black text-2xl">
                      {getAvatarInitial(member.username)}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-black leading-tight truncate">{member.username}</h2>
                  <div
                    className="font-semibold text-primary mt-1 text-sm sm:text-base"
                    dangerouslySetInnerHTML={sanitizeHtml(member.title_html || t('roster.operative_title'))}
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full shrink-0"
                aria-label={t('common.close')}
              >
                <X size={18} aria-hidden />
              </Button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div
                className="flex items-center gap-1 px-2 py-1 border rounded-full"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 68%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--sys-text-primary) 14%, transparent)',
                }}
              >
                <Zap size={14} color="#f59e0b" aria-hidden />
                <span className="text-xs font-mono font-bold text-[color:var(--sys-text-primary)]">
                  {formatPower(member.power)}
                </span>
              </div>

              <div
                className="px-2 py-1 rounded-full text-[0.65rem] font-black border uppercase"
                style={
                  member.active_status === 'active'
                    ? {
                        backgroundColor: 'color-mix(in srgb, var(--color-status-success-bg) 84%, transparent)',
                        color: 'var(--color-status-success-fg)',
                        borderColor: 'color-mix(in srgb, var(--color-status-success) 36%, transparent)',
                      }
                    : {
                        backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 74%, transparent)',
                        color: 'var(--sys-text-secondary)',
                        borderColor: 'color-mix(in srgb, var(--sys-text-primary) 18%, transparent)',
                      }
                }
              >
                {member.active_status}
              </div>
            </div>

            <div
              className="rounded-xl border p-4 sm:p-4"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--sys-surface-raised) 72%, transparent)',
                borderColor: 'color-mix(in srgb, var(--sys-text-primary) 12%, transparent)',
              }}
            >
              <MarkdownContent
                content={member.bio}
                fallback={t('roster.no_bio')}
                className="text-sm text-[color:var(--sys-text-secondary)] leading-relaxed"
              />
            </div>
          </section>

          <div
            className="relative flex-1 min-w-0 flex items-center justify-center p-4 sm:p-6 lg:p-8"
            style={{ backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 62%, transparent)' }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-3 sm:left-5 z-20 rounded-full h-10 w-10 sm:h-12 sm:w-12"
              onClick={handlePrev}
              disabled={mediaList.length === 0}
              aria-label={t('common.prev')}
            >
              <ChevronLeft size={30} aria-hidden />
            </Button>

            {activeItem ? (
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="relative max-w-full max-h-full flex items-center justify-center"
              >
                <img
                  src={getOptimizedMediaUrl(activeItem.url || activeItem.thumbnail, activeItem.type)}
                  className="max-w-full max-h-[78vh] object-contain rounded-xl border"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--sys-text-primary) 14%, transparent)',
                    boxShadow: '0 22px 40px color-mix(in srgb, var(--sys-surface-sunken) 80%, transparent)',
                  }}
                  alt=""
                />
                {activeItem.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border flex items-center justify-center backdrop-blur-sm"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--sys-surface-raised) 54%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--sys-text-primary) 30%, transparent)',
                      }}
                    >
                      <Play size={40} className="ml-1" aria-hidden />
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div
                className="w-full max-w-2xl h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4"
                style={{
                  borderColor: 'color-mix(in srgb, var(--sys-text-primary) 20%, transparent)',
                  color: 'var(--sys-text-secondary)',
                  backgroundColor: 'color-mix(in srgb, var(--sys-surface-raised) 40%, transparent)',
                }}
              >
                <Image size={56} aria-hidden />
                <span className="font-semibold">{t('gallery.empty')}</span>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 sm:right-5 z-20 rounded-full h-10 w-10 sm:h-12 sm:w-12"
              onClick={handleNext}
              disabled={mediaList.length === 0}
              aria-label={t('common.next')}
            >
              <ChevronRight size={30} aria-hidden />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RosterProfileDialog;
