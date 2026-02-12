import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Badge,
  ScrollArea
} from '@/components';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LockIcon from '@mui/icons-material/Lock';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { useQueryClient } from '@tanstack/react-query';
import { useWarHistory } from '../../features/GuildWar/hooks/useWars';
import { useAuthStore, useUIStore } from '@/store';
import { useMembers, useEvents, useAnnouncements, useJoinEvent, useLeaveEvent } from '../../hooks/useServerState';
import { Link } from '@tanstack/react-router';
import { parseISO, isAfter, isValid, isBefore } from 'date-fns';
import { Tooltip, IconButton } from '@mui/material';

import { IntelFeed } from './components/IntelFeed';
import { RecentWars } from './components/RecentWars';
import { UpcomingEvents } from './components/UpcomingEvents';
import { MySignups } from './components/MySignups';

export function Dashboard() {
  const { t } = useTranslation();
  const { data: members = [] } = useMembers();
  const { data: events = [] } = useEvents();
  const { data: announcements = [] } = useAnnouncements();
  const { data: warHistory = [] } = useWarHistory();

  const { mutate: joinEvent } = useJoinEvent();
  const { mutate: leaveEvent } = useLeaveEvent();
  const currentUser = useAuthStore(state => state.user);

  const newMembers = useMemo(() => {
      // Sort by created_at descending (newest first)
      return [...members]
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        .slice(0, 5);
  }, [members]);
  
  const recentEvents = useMemo(() => {
     return getDashboardRecentEvents(events, new Date().toISOString(), 5);
  }, [events]);

  const isSmallMobile = window.innerWidth < 400;

  const setPageTitle = useUIStore(state => state.setPageTitle);

  React.useEffect(() => {
    setPageTitle(t('dashboard.overview'));
  }, [t, setPageTitle]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 relative min-h-screen overflow-x-hidden">
      {/* Main Grid: 2 Columns */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)]">
        
        {/* Left Column: My Signups + Upcoming Events */}
        <div className="flex flex-col gap-6 min-w-0">
            {/* My Signups Timeline */}
            <div className="h-[280px] shrink-0">
                <MySignups events={events} userId={currentUser?.id || ''} />
            </div>
            
            {/* Upcoming Events (Detailed) */}
            <div className="flex-1 min-h-0">
                <UpcomingEvents events={events} />
            </div>
        </div>

        {/* Right Column: Sidebar (Notifications, Stats, History) */}
        <div className="flex flex-col gap-6 lg:justify-self-end w-full">
           {/* Notifications / Intel Feed */}
           <div className="h-[280px] shrink-0">
               <IntelFeed announcements={announcements} newMembers={newMembers} recentEvents={recentEvents} />
           </div>

           {/* War History - Last 4 Wars */}
           <div className="h-[730px] shrink-0">
               <RecentWars history={warHistory} />
           </div>
        </div>
      </div>
    </div>
  );
}

// Utility functions required by tests
export const applyNotificationSeen = (
  current: { events: string; announcements: string },
  type: 'event' | 'announcement',
  timestamp: string
) => {
  return {
    ...current,
    [type === 'event' ? 'events' : 'announcements']: timestamp
  };
};

export const getDashboardRecentEvents = (events: any[], now: string, limit: number) => {
  const nowDate = parseISO(now);
  const eligible = events.filter((e) => {
    if (e.is_archived) return false;
    const start = parseISO(e.start_time);
    return isValid(start);
  });

  const activeOrUpcoming = eligible.filter((event) => {
    const start = parseISO(event.start_time);
    const end = event.end_time ? parseISO(event.end_time) : null;
    const hasValidEnd = !!end && isValid(end);
    const isUpcoming = isAfter(start, nowDate);
    const isActive =
      !isAfter(start, nowDate) &&
      hasValidEnd &&
      !isBefore(end, nowDate);
    return isUpcoming || isActive;
  });

  if (activeOrUpcoming.length > 0) {
    return activeOrUpcoming
      .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime())
      .slice(0, limit);
  }

  return eligible
    .sort((a, b) => parseISO(b.start_time).getTime() - parseISO(a.start_time).getTime())
    .slice(0, limit);
};

export const getLatestCompletedWar = (wars: any[], now: string) => {
  const nowDate = parseISO(now);
  return wars
    .filter(w => w.result !== 'pending' && !isAfter(parseISO(w.date), nowDate))
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())[0];
};

export const getRecentCompletedWars = (wars: any[], events: any[], limit: number, now: string) => {
  const nowDate = parseISO(now);
  return wars
    .filter(w => w.result !== 'pending' && !isAfter(parseISO(w.date), nowDate))
    .sort((a, b) => {
      const eventA = events.find(e => e.id === a.event_id);
      const eventB = events.find(e => e.id === b.event_id);
      const timeA = eventA ? parseISO(eventA.start_time).getTime() : parseISO(a.date).getTime();
      const timeB = eventB ? parseISO(eventB.start_time).getTime() : parseISO(b.date).getTime();
      return timeB - timeA;
    })
    .slice(0, limit);
};
