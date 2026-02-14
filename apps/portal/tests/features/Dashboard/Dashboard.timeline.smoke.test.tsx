import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { Timeline } from '@/features/Dashboard/components/Timeline';
import type { Event } from '@/types';
import { format } from 'date-fns';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => {
        const map: Record<string, string> = {
          'dashboard.my_signups.title': 'My Signups',
          'dashboard.my_signups.event': 'event',
          'dashboard.my_signups.events': 'events',
          'dashboard.my_signups.now': 'Now',
          'dashboard.my_signups.no_events': 'No events',
          'dashboard.my_signups.participants': 'participants',
          'dashboard.my_signups.markers.midnight': '00:00',
          'dashboard.my_signups.markers.six': '06:00',
          'dashboard.my_signups.markers.eighteen': '18:00',
          'dashboard.my_signups.markers.noon': '12:00',
          'dashboard.my_signups.types.war': 'war',
          'dashboard.my_signups.types.mission': 'mission',
          'dashboard.my_signups.types.event': 'event',
          'common.day_sunday': 'Sun',
          'common.day_monday': 'Mon',
          'common.day_tuesday': 'Tue',
          'common.day_wednesday': 'Wed',
          'common.day_thursday': 'Thu',
          'common.day_friday': 'Fri',
          'common.day_saturday': 'Sat',
        };
        return map[key] ?? key;
      },
      i18n: {
        language: 'en',
        changeLanguage: vi.fn(),
      },
    }),
  };
});

function createEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: overrides.id ?? 'event-1',
    type: overrides.type ?? 'guild_war',
    title: overrides.title ?? 'Alpha War',
    description: overrides.description ?? 'Description',
    start_time: overrides.start_time ?? '2026-02-13T12:00:00.000Z',
    end_time: overrides.end_time,
    capacity: overrides.capacity,
    participants: overrides.participants ?? [{ id: 'u1', username: 'user1', role: 'member', power: 100, classes: [], active_status: 'active' }],
    is_locked: overrides.is_locked ?? false,
    is_pinned: overrides.is_pinned ?? false,
    is_archived: overrides.is_archived ?? false,
    updated_at: overrides.updated_at ?? '2026-02-13T10:00:00.000Z',
  };
}

describe('Dashboard timeline smoke', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders timeline header and signed event entry', () => {
    vi.setSystemTime(new Date('2026-02-13T10:00:00.000Z'));

    render(<Timeline events={[createEvent()]} userId="u1" />);

    expect(screen.getByTestId('dashboard-timeline')).toBeInTheDocument();
    expect(screen.getByText('My Signups')).toBeInTheDocument();
    expect(screen.getByText('Alpha War')).toBeInTheDocument();
  });

  it('shows now marker while current time is within timeline window', () => {
    vi.setSystemTime(new Date('2026-02-13T10:00:00.000Z'));

    render(<Timeline events={[createEvent()]} userId="u1" />);

    expect(screen.getByTestId('dashboard-timeline-now-marker')).toBeInTheDocument();
  });

  it('maps now marker position to fixed day-width pixels', () => {
    vi.setSystemTime(new Date(2026, 1, 13, 14, 0, 0));

    render(<Timeline events={[createEvent()]} userId="u1" />);

    const nowMarker = screen.getByTestId('dashboard-timeline-now-marker');
    expect(nowMarker.style.left.endsWith('px')).toBe(true);
    expect(Number.parseFloat(nowMarker.style.left)).toBeCloseTo(70, 1);
  });

  it('does not show now marker at the exact window boundary', () => {
    vi.setSystemTime(new Date(2026, 1, 13, 0, 0, 0));

    render(<Timeline events={[createEvent()]} userId="u1" />);

    expect(screen.queryByTestId('dashboard-timeline-now-marker')).not.toBeInTheDocument();
  });

  it('shows 00:00, 06:00, 12:00, and 18:00 labels with even 6-hour rail spacing', () => {
    vi.setSystemTime(new Date('2026-02-13T10:00:00.000Z'));

    render(<Timeline events={[createEvent()]} userId="u1" />);

    const dayRail = screen.getByTestId('dashboard-timeline-day-rail');
    expect(dayRail).toHaveClass('gap-0');

    const midnightMarker = screen.getAllByTestId(/dashboard-timeline-midnight-label-/)[0];
    expect(midnightMarker).toBeInTheDocument();
    expect(midnightMarker).toHaveClass('top-0');
    expect(screen.getAllByText('06:00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('12:00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('18:00').length).toBeGreaterThan(0);

    const dayMarkerRows = screen.getAllByTestId(/dashboard-timeline-day-markers-/);
    expect(dayMarkerRows[0]?.querySelector('[data-testid^="dashboard-timeline-midnight-tick-"]')).not.toBeNull();
    expect(dayMarkerRows[0]?.querySelector('[data-testid^="dashboard-timeline-six-tick-"]')).not.toBeNull();
    expect(dayMarkerRows[0]?.querySelector('[data-testid^="dashboard-timeline-noon-tick-"]')).not.toBeNull();
    expect(dayMarkerRows[0]?.querySelector('[data-testid^="dashboard-timeline-eighteen-tick-"]')).not.toBeNull();
  });

  it('shows current time text on now marker instead of static now/present label', () => {
    vi.setSystemTime(new Date('2026-02-13T10:00:00.000Z'));

    render(<Timeline events={[createEvent()]} userId="u1" />);

    const nowLabel = screen.getByTestId('dashboard-timeline-now-label');
    const nowLabelContainer = screen.getByTestId('dashboard-timeline-now-label-container');
    expect(nowLabel).toHaveTextContent(format(new Date('2026-02-13T10:00:00.000Z'), 'h:mm a'));
    expect(nowLabel).not.toHaveTextContent('Now');
    expect(nowLabel).not.toHaveTextContent('Present');
    expect(nowLabelContainer).toHaveClass('left-full');
    expect(nowLabelContainer).toHaveClass('ml-1');
  });

  it('anchors each event card to start time without compressing event box width', () => {
    vi.setSystemTime(new Date('2026-02-13T10:00:00.000Z'));

    render(<Timeline events={[createEvent({ id: 'event-2', start_time: '2026-02-13T06:00:00' })]} userId="u1" />);

    const dayColumn = screen.getByTestId('dashboard-timeline-day-2026-02-13');
    expect(dayColumn).toHaveClass('w-[120px]');
    expect(dayColumn).toHaveClass('shrink-0');
    expect(dayColumn).not.toHaveClass('min-w-[120px]');

    const eventAnchor = screen.getByTestId('dashboard-timeline-event-event-2');
    expect(eventAnchor).toHaveStyle({ marginLeft: '25%' });
    expect(eventAnchor).not.toHaveClass('w-fit');

    const eventCard = eventAnchor.querySelector('.group\\/event');
    expect(eventCard).not.toBeNull();
    expect(eventCard).toHaveClass('min-w-[140px]');
    expect(eventCard).toHaveClass('max-w-[220px]');
    expect(eventCard).not.toHaveClass('w-full');

    const typeBadge = screen.getByText('war');
    expect(typeBadge).toHaveClass('whitespace-nowrap');
    expect(typeBadge).toHaveClass('shrink-0');
  });

  it('keeps no-event placeholders away from the event lane and renders day boundary bands', () => {
    vi.setSystemTime(new Date('2026-02-13T10:00:00.000Z'));

    render(<Timeline events={[createEvent()]} userId="u1" />);

    const dayBand = screen.getByTestId('dashboard-timeline-day-band-2026-02-13');
    expect(dayBand).toBeInTheDocument();

    const emptyPrompt = screen.getByTestId('dashboard-timeline-empty-2026-02-14');
    expect(emptyPrompt).toHaveClass('absolute');
    expect(emptyPrompt).toHaveClass('bottom-1');
  });
});
