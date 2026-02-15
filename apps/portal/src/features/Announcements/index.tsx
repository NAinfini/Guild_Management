import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { useFilteredList } from '@/hooks/useFilteredList';
import { useAuthStore, useUIStore } from '@/store';
import { useTranslation } from 'react-i18next';
import { useOnline } from '@/hooks/useOnline';
import type { Announcement } from '@/types';
import {
  Grid,
  PageContainer,
  PageFilterBar,
  PrimitiveBadge,
  PrimitiveButton,
  PrimitiveCard,
  PrimitiveCardContent,
  PrimitiveCardHeader,
  PrimitiveHeading,
  PrimitiveSkeleton,
  PrimitiveText,
  type FilterOption,
} from '@/components';
import {
  useAnnouncements,
  useArchiveAnnouncement,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useTogglePinAnnouncement,
  useUpdateAnnouncement,
} from '@/hooks/useServerState';
import { useLastSeen } from '@/hooks/useLastSeen';
import { STORAGE_KEYS } from '@/lib/storage';
import {
  canArchiveAnnouncement,
  canCreateAnnouncement,
  canDeleteAnnouncement,
  canEditAnnouncement,
  canPinAnnouncement,
  getEffectiveRole,
} from '@/lib/permissions';
import type { EditorPayload } from './components/AnnouncementEditorDialog';
import styles from './Announcements.module.css';

type FilterType = 'all' | 'pinned' | 'archived';

const AnnouncementEditorDialog = lazy(() => import('./components/AnnouncementEditorDialog'));
const AnnouncementActionDialogs = lazy(() => import('./components/AnnouncementActionDialogs'));

function getAnnouncementPreview(contentHtml: string): string {
  if (!contentHtml) return '';

  if (contentHtml.trim().startsWith('<')) {
    return contentHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  return contentHtml.trim();
}

function AnnouncementListSkeleton() {
  return (
    <div data-testid="announcement-list-skeleton">
      <Grid cols={{ mobile: 1, desktop: 2 }} gap="normal">
        {Array.from({ length: 3 }).map((_, index) => (
          <PrimitiveCard key={`announcement-skeleton-${index}`} variant="outlined" className={styles.skeletonCard}>
            <PrimitiveCardHeader className={styles.skeletonHeader}>
              <PrimitiveSkeleton variant="text" width="65%" />
              <PrimitiveSkeleton variant="text" width="35%" />
            </PrimitiveCardHeader>
            <PrimitiveCardContent className={styles.skeletonBody}>
              <PrimitiveSkeleton variant="text" width="100%" />
              <PrimitiveSkeleton variant="text" width="92%" />
              <PrimitiveSkeleton variant="text" width="78%" />
            </PrimitiveCardContent>
          </PrimitiveCard>
        ))}
      </Grid>
    </div>
  );
}

export function Announcements() {
  const { user, viewRole } = useAuthStore();
  const { timezoneOffset, setPageTitle } = useUIStore();
  const { t } = useTranslation();
  const online = useOnline();

  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { data: announcements = [], isLoading, isError, refetch } = useAnnouncements({
    includeArchived: filter === 'archived',
    search,
    startDate: filter === 'all' ? startDate : undefined,
    endDate: filter === 'all' ? endDate : undefined,
  });

  const createAnnouncementMutation = useCreateAnnouncement();
  const updateAnnouncementMutation = useUpdateAnnouncement();
  const deleteAnnouncementMutation = useDeleteAnnouncement();
  const togglePinMutation = useTogglePinAnnouncement();
  const archiveAnnouncementMutation = useArchiveAnnouncement();

  const effectiveRole = getEffectiveRole(user?.role, viewRole);
  const canCreate = canCreateAnnouncement(effectiveRole);
  const canEdit = canEditAnnouncement(effectiveRole);
  const canDelete = canDeleteAnnouncement(effectiveRole);
  const canPin = canPinAnnouncement(effectiveRole);
  const canArchive = canArchiveAnnouncement(effectiveRole);

  const { markAsSeen, hasNewContent } = useLastSeen(
    STORAGE_KEYS.ANNOUNCEMENTS_LAST_SEEN,
    'last_seen_announcements_at',
  );

  useEffect(() => {
    setPageTitle(t('nav.announcements'));
  }, [setPageTitle, t]);

  useEffect(() => {
    return () => markAsSeen();
  }, [markAsSeen]);

  const announcementFilterFn = useMemo(
    () => (filter === 'pinned' ? (announcement: Announcement) => announcement.is_pinned : undefined),
    [filter],
  );

  const announcementSortFn = useMemo(
    () => (a: Announcement, b: Announcement) => {
      if (a.is_pinned !== b.is_pinned && filter !== 'archived') {
        return a.is_pinned ? -1 : 1;
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    },
    [filter],
  );

  const filteredAnnouncements = useFilteredList({
    items: announcements,
    searchText: '',
    searchFields: [],
    filterFn: announcementFilterFn,
    sortFn: announcementSortFn,
  });

  const categories: FilterOption[] = [
    { id: 'all', value: 'all', label: t('announcements.filter_all') },
    { id: 'pinned', value: 'pinned', label: t('announcements.filter_pinned') },
    { id: 'archived', value: 'archived', label: t('announcements.filter_archived') },
  ];
  const hasActiveFilters = Boolean(search.trim() || startDate || endDate || filter !== 'all');
  const hasAnyActionDialogOpen = Boolean(selectedAnnouncement || deleteTargetId);

  const handleClearFilters = () => {
    // Reset all filter inputs so the list returns to the default all-announcements query state.
    setSearch('');
    setStartDate('');
    setEndDate('');
    setFilter('all');
  };

  const handleCreateOrUpdate = async (payload: EditorPayload) => {
    if (editTarget) {
      await updateAnnouncementMutation.mutateAsync({
        id: editTarget.id,
        data: {
          title: payload.title,
          bodyHtml: payload.content_html,
        },
      });
    } else {
      await createAnnouncementMutation.mutateAsync({
        title: payload.title,
        bodyHtml: payload.content_html,
      });
    }

    setIsEditorOpen(false);
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTargetId || !canDelete) return;

    await deleteAnnouncementMutation.mutateAsync(deleteTargetId);
    setDeleteTargetId(null);
    setSelectedAnnouncement(null);
  };

  if (isLoading && announcements.length === 0) {
    return (
      <PageContainer width="wide" spacing="normal">
        <AnnouncementListSkeleton />
      </PageContainer>
    );
  }

  if (isError && announcements.length === 0) {
    return (
      <PageContainer width="wide" spacing="normal">
        <PrimitiveCard variant="flat" className={styles.emptyState} data-testid="announcement-error-state">
          <PrimitiveCardContent>
            <PrimitiveHeading level={4} align="center">
              {t('announcements.signal_silence')}
            </PrimitiveHeading>
            <PrimitiveText as="p" align="center" color="secondary">
              {t('common.placeholder_msg')}
            </PrimitiveText>
            <div className={`${styles.actionRow} ${styles.stateActions}`} data-testid="announcement-error-actions">
              {/* Retry replays the announcement list query so users can recover from transient failures in place. */}
              <PrimitiveButton type="button" variant="secondary" onClick={() => void refetch()}>
                {t('common.retry')}
              </PrimitiveButton>
              {canCreate ? (
                <PrimitiveButton
                  type="button"
                  onClick={() => {
                    setEditTarget(null);
                    setIsEditorOpen(true);
                  }}
                  disabled={!online}
                >
                  {t('announcements.new_broadcast')}
                </PrimitiveButton>
              ) : null}
            </div>
          </PrimitiveCardContent>
        </PrimitiveCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer width="wide" spacing="normal">
      <PageFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('announcements.search_placeholder')}
        category={filter}
        onCategoryChange={(value) => setFilter(value as FilterType)}
        categories={categories}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        resultsCount={filteredAnnouncements.length}
        isLoading={isLoading}
        extraActions={
          canCreate ? (
            <PrimitiveButton
              data-testid="announcement-create-button"
              size="sm"
              onClick={() => {
                setEditTarget(null);
                setIsEditorOpen(true);
              }}
              disabled={!online}
            >
              <span className={styles.actionIcon} aria-hidden="true">
                <Plus size={14} />
              </span>
              {t('announcements.new_broadcast')}
            </PrimitiveButton>
          ) : null
        }
      />

      {filteredAnnouncements.length > 0 ? (
        <Grid cols={{ mobile: 1, desktop: 2 }} gap="normal">
          {filteredAnnouncements.map((announcement) => {
            const previewText = getAnnouncementPreview(announcement.content_html);
            const isNew = hasNewContent(announcement.created_at);

            return (
              <PrimitiveCard
                key={announcement.id}
                variant="outlined"
                className={styles.card}
                data-testid={`announcement-card-${announcement.id}`}
                onClick={() => setSelectedAnnouncement(announcement)}
              >
                <PrimitiveCardHeader className={styles.cardHeader}>
                  <div className={styles.cardTitleRow}>
                    {/* Heading anchors the announcement card title hierarchy for dense feeds. */}
                    <PrimitiveHeading level={3} className={styles.cardTitle} data-testid={`announcement-card-title-${announcement.id}`}>
                      {announcement.title}
                    </PrimitiveHeading>
                    {announcement.is_pinned ? (
                      <PrimitiveBadge
                        variant="info"
                        size="sm"
                        data-testid={`announcement-card-badge-pinned-${announcement.id}`}
                      >
                        {t('announcements.status_priority')}
                      </PrimitiveBadge>
                    ) : null}
                    {isNew ? (
                      <PrimitiveBadge variant="error" size="sm">
                        {t('common.label_new')}
                      </PrimitiveBadge>
                    ) : null}
                  </div>

                  <PrimitiveText
                    as="span"
                    size="xs"
                    color="tertiary"
                    data-testid={`announcement-card-timestamp-${announcement.id}`}
                  >
                    {formatDateTime(announcement.created_at, 0, true)}
                  </PrimitiveText>
                </PrimitiveCardHeader>

                <PrimitiveCardContent>
                  {/* Body text keeps to 3 lines so card heights remain stable in the grid. */}
                  <PrimitiveText
                    as="p"
                    size="sm"
                    color="secondary"
                    className={styles.cardBody}
                    data-testid={`announcement-card-body-${announcement.id}`}
                  >
                    {previewText}
                  </PrimitiveText>
                </PrimitiveCardContent>
              </PrimitiveCard>
            );
          })}
        </Grid>
      ) : (
        <PrimitiveCard variant="flat" className={styles.emptyState}>
          <PrimitiveCardContent>
            <PrimitiveHeading level={4} align="center">
              {t('announcements.signal_silence')}
            </PrimitiveHeading>
            <PrimitiveText as="p" align="center" color="secondary">
              {t('common.no_data')}
            </PrimitiveText>
            <div className={`${styles.actionRow} ${styles.stateActions}`} data-testid="announcement-empty-actions">
              {canCreate ? (
                <PrimitiveButton
                  type="button"
                  onClick={() => {
                    setEditTarget(null);
                    setIsEditorOpen(true);
                  }}
                  disabled={!online}
                >
                  {t('announcements.new_broadcast')}
                </PrimitiveButton>
              ) : null}
              {hasActiveFilters ? (
                // Clear filters returns to baseline feed visibility when search/date/category excludes all records.
                <PrimitiveButton type="button" variant="secondary" onClick={handleClearFilters}>
                  {t('common.clear_filters')}
                </PrimitiveButton>
              ) : null}
            </div>
          </PrimitiveCardContent>
        </PrimitiveCard>
      )}

      {hasAnyActionDialogOpen ? (
        <Suspense fallback={null}>
          <AnnouncementActionDialogs
            t={t}
            timezoneOffset={timezoneOffset}
            selectedAnnouncement={selectedAnnouncement}
            deleteTargetId={deleteTargetId}
            canEdit={canEdit}
            canPin={canPin}
            canArchive={canArchive}
            canDelete={canDelete}
            online={online}
            dialogPanelClassName={styles.dialogPanel}
            dialogBodyClassName={styles.dialogBody}
            actionRowClassName={styles.actionRow}
            actionIconClassName={styles.actionIcon}
            onCloseView={() => setSelectedAnnouncement(null)}
            onEditSelected={() => {
              if (!selectedAnnouncement) return;
              setEditTarget(selectedAnnouncement);
              setIsEditorOpen(true);
              setSelectedAnnouncement(null);
            }}
            onTogglePinSelected={async () => {
              if (!selectedAnnouncement) return;
              await togglePinMutation.mutateAsync({
                id: selectedAnnouncement.id,
                isPinned: !selectedAnnouncement.is_pinned,
              });
              setSelectedAnnouncement(null);
            }}
            onToggleArchiveSelected={async () => {
              if (!selectedAnnouncement) return;
              await archiveAnnouncementMutation.mutateAsync({
                id: selectedAnnouncement.id,
                isArchived: !selectedAnnouncement.is_archived,
              });
              setSelectedAnnouncement(null);
            }}
            onRequestDeleteSelected={() => {
              if (!selectedAnnouncement) return;
              setDeleteTargetId(selectedAnnouncement.id);
            }}
            onCloseDelete={() => setDeleteTargetId(null)}
            onConfirmDelete={handleDelete}
          />
        </Suspense>
      ) : null}

      {isEditorOpen ? (
        <Suspense fallback={null}>
          <AnnouncementEditorDialog
            open={isEditorOpen}
            onOpenChange={(open) => {
              setIsEditorOpen(open);
              if (!open) {
                setEditTarget(null);
              }
            }}
            initialData={editTarget}
            onSubmit={handleCreateOrUpdate}
          />
        </Suspense>
      ) : null}
    </PageContainer>
  );
}
