import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMembers, useEvents, useAnnouncements } from '@/hooks/useServerState';
import { useWarHistory } from '@/features/GuildWar/hooks/useWars';
import { useAuthStore, useUIStore } from '@/store';
import { Grid, PageContainer, PageTransition, Stack, StaggeredList } from '@/components/layout';
import { Skeleton } from '@/components/primitives';
import { Button } from '@/components/button';
import { Card, CardContent } from '@/components/layout/Card';
import { Notifications } from './components/Notifications';
import { RecentWars } from './components/RecentWars';
import { Timeline } from './components/Timeline';
import { UpcomingEvents } from './components/UpcomingEvents';
import { getDashboardRecentEvents } from './notifications';

/**
 * Default dashboard implementation.
 * Keeps the migrated layout primitives and recoverable query-error behavior as the baseline route.
 */
export function DashboardNew() {
  const { t } = useTranslation();
  const {
    data: members = [],
    isLoading: membersLoading,
    isError: isMembersError = false,
    refetch: refetchMembers,
  } = useMembers();
  const {
    data: events = [],
    isLoading: eventsLoading,
    isError: isEventsError = false,
    refetch: refetchEvents,
  } = useEvents();
  const {
    data: announcements = [],
    isLoading: announcementsLoading,
    isError: isAnnouncementsError = false,
    refetch: refetchAnnouncements,
  } = useAnnouncements();
  const {
    data: warHistory = [],
    isLoading: warsLoading,
    isError: isWarHistoryError = false,
    refetch: refetchWarHistory,
  } = useWarHistory();
  const currentUser = useAuthStore((state) => state.user);
  const setPageTitle = useUIStore((state) => state.setPageTitle);

  React.useEffect(() => {
    setPageTitle(t('dashboard.overview'));
  }, [setPageTitle, t]);

  const newMembers = React.useMemo(
    () =>
      [...members]
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        .slice(0, 5),
    [members],
  );

  const recentEvents = React.useMemo(() => getDashboardRecentEvents(events, new Date().toISOString(), 5), [events]);

  const hasDashboardError = isMembersError || isEventsError || isAnnouncementsError || isWarHistoryError;
  const hasDashboardData =
    members.length > 0 || events.length > 0 || announcements.length > 0 || warHistory.length > 0;

  if (hasDashboardError && !hasDashboardData) {
    return (
      <PageTransition transitionKey="dashboard-new">
        <PageContainer width="standard" spacing="normal" data-testid="dashboard-new-root">
          <Card data-testid="dashboard-new-error-state">
            <CardContent className="p-8 text-center space-y-3">
              <p className="text-sm font-semibold">{t('dashboard.overview')}</p>
              <p className="text-sm text-muted-foreground">{t('common.placeholder_msg')}</p>
              <div data-testid="dashboard-new-error-actions" className="flex justify-center">
                {/* Retry fans out all dashboard-new queries so transient API failures recover without route reload. */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void Promise.all([
                      refetchMembers(),
                      refetchEvents(),
                      refetchAnnouncements(),
                      refetchWarHistory(),
                    ]);
                  }}
                >
                  {t('common.retry')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </PageContainer>
      </PageTransition>
    );
  }

  return (
    <PageTransition transitionKey="dashboard-new">
      <PageContainer width="standard" spacing="normal" data-testid="dashboard-new-root">
        <Stack gap="6">
          <Timeline events={events} userId={currentUser?.id || ''} />

          <Grid cols={{ mobile: 1, tablet: 2, wide: 3 }} gap="normal">
            <div className="min-w-0 lg:col-span-2">
              {eventsLoading ? (
                <Skeleton variant="rectangular" className="min-h-[22rem] w-full rounded-xl" />
              ) : (
                <UpcomingEvents events={events} />
              )}
            </div>

            <StaggeredList className="min-w-0">
              <div>
                {announcementsLoading || membersLoading ? (
                  <Skeleton variant="rectangular" className="min-h-[18rem] w-full rounded-xl" />
                ) : (
                  <Notifications
                    announcements={announcements}
                    newMembers={newMembers}
                    recentEvents={recentEvents}
                  />
                )}
              </div>
              <div>
                {warsLoading ? (
                  <Skeleton variant="rectangular" className="min-h-[22rem] w-full rounded-xl" />
                ) : (
                  <RecentWars history={warHistory} />
                )}
              </div>
            </StaggeredList>
          </Grid>
        </Stack>
      </PageContainer>
    </PageTransition>
  );
}

