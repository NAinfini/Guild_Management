import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { List as VirtualList } from 'react-window';

import { 

  useTheme,
  alpha,
} from './events-material-compat';
import { 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent, 
  TooltipProvider,
  Button,
  Card, 
  CardContent,
  DecorativeGlyph, 
  EnhancedButton, 
  MarkdownContent, 
  CardGridSkeleton, 
  Badge, 
  PageFilterBar, 
  PrimitiveButton,
  PrimitiveHeading,
  PrimitiveText,
  type PageFilterOption,
  type MarkdownRenderer,
  TeamMemberCard
} from "@/components";
import {
  Archive,
  BookPlus,
  CalendarDays,
  Check,
  ChevronUp,
  Clock3,
  Copy,
  Filter,
  Lock,
  LockOpen,
  LogOut,
  Pencil,
  Pin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TriangleAlert as TriangleAlertIconRaw,
  Trophy,
  UserMinus,
  UserPlus,
  Users,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { formatDateTime, formatPower, formatClassDisplayName, getMemberCardAccentColors, getClassPillTone, cn } from '../../lib/utils';
import { useAuthStore, useUIStore } from '../../store';
import { useTranslation } from 'react-i18next';
import { User, Event, ClassType } from '../../types';
import { useMobileOptimizations, useOnline } from '../../hooks';

import { storage, STORAGE_KEYS } from '../../lib/storage';
import { filterEventsByCategory, type EventFilter } from './Events.filtering';
import { getVisibleParticipants } from './Events.participants';
import {
  canArchiveEvent,
  canCreateEvent,
  canCopyEventSignup,
  canDeleteEvent,
  canEditEvent,
  canJoinEvents,
  canLockEvent,
  canManageEventParticipants,
  canPinEvent,
  getEffectiveRole,
} from '../../lib/permissions';
import {
  useEvents,
  useMembers,
  useJoinEvent,
  useLeaveEvent,
  useArchiveEvent,
  useTogglePinEvent,
  useToggleLockEvent,
  useDeleteEvent,
  usePrefetchEvent,
} from '../../hooks/useServerState';
import { useFilteredList } from '../../hooks/useFilteredList';

type LegacyIconProps = React.SVGProps<SVGSVGElement> & { sx?: Record<string, unknown> };

function toLegacyIcon(Icon: LucideIcon) {
  return function LegacyIcon({ sx, style, ...rest }: LegacyIconProps) {
    const nextStyle: React.CSSProperties = { ...(style ?? {}) };
    if (sx && typeof sx === 'object') {
      for (const [key, value] of Object.entries(sx)) {
        if (value == null || typeof value === 'object') {
          continue;
        }
        if (key === 'fontSize') {
          nextStyle.width = value as React.CSSProperties['width'];
          nextStyle.height = value as React.CSSProperties['height'];
          continue;
        }
        if (key === 'mb') {
          nextStyle.marginBottom = value as React.CSSProperties['marginBottom'];
          continue;
        }
        (nextStyle as Record<string, unknown>)[key] = value;
      }
    }
    return <Icon {...rest} style={nextStyle} aria-hidden={rest['aria-hidden'] ?? true} />;
  };
}

const AccessTimeIcon = toLegacyIcon(Clock3);
const GroupsIcon = toLegacyIcon(Users);
const ContentCopyIcon = toLegacyIcon(Copy);
const LockIcon = toLegacyIcon(Lock);
const PushPinIcon = toLegacyIcon(Pin);
const ArchiveIcon = toLegacyIcon(Archive);
const LibraryAddIcon = toLegacyIcon(BookPlus);
const DeleteIcon = toLegacyIcon(Trash2);
const PersonAddIcon = toLegacyIcon(UserPlus);
const PersonRemoveIcon = toLegacyIcon(UserMinus);
const WarningIcon = toLegacyIcon(TriangleAlertIconRaw);
const RefreshIcon = toLegacyIcon(RefreshCw);
const CheckIcon = toLegacyIcon(Check);
const FlashOnIcon = toLegacyIcon(Zap);
const SearchIcon = toLegacyIcon(Search);
const CloseIcon = toLegacyIcon(X);
const AddIcon = toLegacyIcon(Plus);
const LogoutIcon = toLegacyIcon(LogOut);
const EditIcon = toLegacyIcon(Pencil);
const MilitaryTechIcon = toLegacyIcon(Trophy);
const CalendarDaysIcon = toLegacyIcon(CalendarDays);
const FilterIcon = toLegacyIcon(Filter);
const LockOpenIcon = toLegacyIcon(LockOpen);
const ExpandLessIcon = toLegacyIcon(ChevronUp);
const InviteMemberDialog = lazy(() => import('./components/InviteMemberDialog'));
const EventEditorDialog = lazy(() => import('./components/EventEditorDialog'));
const EventActionDialogs = lazy(() => import('./components/EventActionDialogs'));

export function shouldUseVirtualEventList(eventCount: number): boolean {
  return eventCount > 50;
}

function withThemeFallback(theme: any) {
  const nextTheme = theme ?? {};
  nextTheme.palette = nextTheme.palette ?? {};
  nextTheme.palette.primary = nextTheme.palette.primary ?? { main: '#7c3aed', contrastText: '#ffffff' };
  nextTheme.palette.secondary = nextTheme.palette.secondary ?? { main: '#2563eb', contrastText: '#ffffff' };
  nextTheme.palette.warning = nextTheme.palette.warning ?? { main: '#f59e0b', contrastText: '#111827' };
  nextTheme.palette.error = nextTheme.palette.error ?? { main: '#ef4444', contrastText: '#ffffff' };
  nextTheme.palette.text = nextTheme.palette.text ?? { primary: '#e2e8f0', secondary: '#94a3b8' };
  nextTheme.palette.divider = nextTheme.palette.divider ?? '#334155';
  nextTheme.palette.background = nextTheme.palette.background ?? { paper: '#0f172a', default: '#020617' };
  nextTheme.palette.getContrastText = nextTheme.palette.getContrastText ?? (() => '#ffffff');
  nextTheme.custom = nextTheme.custom ?? {};
  return nextTheme;
}

type ResponsiveValue<T> = T | { xs?: T; sm?: T; md?: T; lg?: T; xl?: T };

function resolveResponsiveValue<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value == null) {
    return undefined;
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    const responsive = value as { xs?: T; sm?: T; md?: T; lg?: T; xl?: T };
    return responsive.md ?? responsive.sm ?? responsive.xs ?? responsive.lg ?? responsive.xl;
  }
  return value as T;
}

function resolveSpacingValue(value: unknown): string | number | undefined {
  const resolved = resolveResponsiveValue(value as ResponsiveValue<unknown>);
  if (typeof resolved === 'number') {
    return `${resolved * 8}px`;
  }
  if (typeof resolved === 'string') {
    return resolved;
  }
  return undefined;
}

function resolveThemeToken(value: unknown, theme: any): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  switch (value) {
    case 'divider':
      return theme.palette?.divider ?? value;
    case 'background.paper':
      return theme.palette?.background?.paper ?? value;
    case 'background.default':
      return theme.palette?.background?.default ?? value;
    case 'action.hover':
      return theme.palette?.action?.hover ?? value;
    case 'text.primary':
      return theme.palette?.text?.primary ?? value;
    case 'text.secondary':
      return theme.palette?.text?.secondary ?? value;
    case 'error.main':
      return theme.palette?.error?.main ?? value;
    case 'primary.main':
      return theme.palette?.primary?.main ?? value;
    case 'secondary.main':
      return theme.palette?.secondary?.main ?? value;
    default:
      return value;
  }
}

function applySxStyle(
  style: React.CSSProperties,
  sx: Record<string, unknown> | undefined,
  theme: any,
) {
  if (!sx || typeof sx !== 'object') {
    return;
  }

  for (const [key, rawValue] of Object.entries(sx)) {
    if (rawValue == null) {
      continue;
    }

    const resolvedValue = resolveResponsiveValue(rawValue as ResponsiveValue<unknown>);

    switch (key) {
      case 'p':
        style.padding = resolveSpacingValue(resolvedValue);
        break;
      case 'px':
        style.paddingInline = resolveSpacingValue(resolvedValue);
        break;
      case 'py':
        style.paddingBlock = resolveSpacingValue(resolvedValue);
        break;
      case 'pt':
        style.paddingTop = resolveSpacingValue(resolvedValue);
        break;
      case 'pb':
        style.paddingBottom = resolveSpacingValue(resolvedValue);
        break;
      case 'pl':
        style.paddingLeft = resolveSpacingValue(resolvedValue);
        break;
      case 'pr':
        style.paddingRight = resolveSpacingValue(resolvedValue);
        break;
      case 'm':
        style.margin = resolveSpacingValue(resolvedValue);
        break;
      case 'mx':
        style.marginInline = resolveSpacingValue(resolvedValue);
        break;
      case 'my':
        style.marginBlock = resolveSpacingValue(resolvedValue);
        break;
      case 'mt':
        style.marginTop = resolveSpacingValue(resolvedValue);
        break;
      case 'mb':
        style.marginBottom = resolveSpacingValue(resolvedValue);
        break;
      case 'ml':
        style.marginLeft = resolveSpacingValue(resolvedValue);
        break;
      case 'mr':
        style.marginRight = resolveSpacingValue(resolvedValue);
        break;
      case 'bgcolor':
        style.backgroundColor = resolveThemeToken(resolvedValue, theme) as React.CSSProperties['backgroundColor'];
        break;
      case 'borderColor':
        style.borderColor = resolveThemeToken(resolvedValue, theme) as React.CSSProperties['borderColor'];
        break;
      case 'gap':
        style.gap = resolveSpacingValue(resolvedValue);
        break;
      default:
        (style as Record<string, unknown>)[key] = resolveThemeToken(resolvedValue, theme);
    }
  }
}

interface EventBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  component?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'span';
  display?: React.CSSProperties['display'];
  flex?: React.CSSProperties['flex'];
  gap?: number | string;
  gridTemplateColumns?: React.CSSProperties['gridTemplateColumns'];
  mb?: number | string;
  mt?: number | string;
  sx?: Record<string, unknown>;
}

function EventBox({
  children,
  component = 'div',
  display,
  flex,
  gap,
  gridTemplateColumns,
  mb,
  mt,
  style,
  sx,
  ...rest
}: EventBoxProps) {
  const theme = withThemeFallback(useTheme());
  const nextStyle: React.CSSProperties = { ...(style ?? {}) };
  const Tag = component as React.ElementType;

  if (display) {
    nextStyle.display = display;
  }
  if (flex != null) {
    nextStyle.flex = flex;
  }
  if (gridTemplateColumns) {
    nextStyle.gridTemplateColumns = gridTemplateColumns;
  }
  if (gap != null) {
    nextStyle.gap = resolveSpacingValue(gap);
  }
  if (mb != null) {
    nextStyle.marginBottom = resolveSpacingValue(mb);
  }
  if (mt != null) {
    nextStyle.marginTop = resolveSpacingValue(mt);
  }

  applySxStyle(nextStyle, sx, theme);

  return (
    <Tag style={nextStyle} {...rest}>
      {children}
    </Tag>
  );
}

interface EventStackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: ResponsiveValue<React.CSSProperties['flexDirection']>;
  spacing?: ResponsiveValue<number | string>;
  alignItems?: ResponsiveValue<React.CSSProperties['alignItems']>;
  justifyContent?: ResponsiveValue<React.CSSProperties['justifyContent']>;
  flexWrap?: ResponsiveValue<React.CSSProperties['flexWrap']>;
  gap?: ResponsiveValue<number | string>;
  mb?: number | string;
  mt?: number | string;
  sx?: Record<string, unknown>;
}

function EventStack({
  children,
  direction = 'column',
  spacing,
  alignItems,
  justifyContent,
  flexWrap,
  gap,
  mb,
  mt,
  style,
  sx,
  ...rest
}: EventStackProps) {
  const theme = withThemeFallback(useTheme());
  const nextStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: resolveResponsiveValue(direction) ?? 'column',
    ...(style ?? {}),
  };

  const resolvedGap = spacing ?? gap;
  if (resolvedGap != null) {
    nextStyle.gap = resolveSpacingValue(resolvedGap);
  }

  const resolvedAlignItems = resolveResponsiveValue(alignItems);
  if (resolvedAlignItems) {
    nextStyle.alignItems = resolvedAlignItems;
  }

  const resolvedJustifyContent = resolveResponsiveValue(justifyContent);
  if (resolvedJustifyContent) {
    nextStyle.justifyContent = resolvedJustifyContent;
  }

  const resolvedFlexWrap = resolveResponsiveValue(flexWrap);
  if (resolvedFlexWrap) {
    nextStyle.flexWrap = resolvedFlexWrap;
  }
  if (mb != null) {
    nextStyle.marginBottom = resolveSpacingValue(mb);
  }
  if (mt != null) {
    nextStyle.marginTop = resolveSpacingValue(mt);
  }

  applySxStyle(nextStyle, sx, theme);

  return (
    <div style={nextStyle} {...rest}>
      {children}
    </div>
  );
}

type EventTypographyVariant = 'h5' | 'h6' | 'body2' | 'caption' | 'overline';
type EventTypographyElement = 'p' | 'span' | 'div' | 'label';

interface EventTypographyProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color' | 'children'> {
  children: React.ReactNode;
  color?: string;
  component?: EventTypographyElement;
  display?: React.CSSProperties['display'];
  fontFamily?: React.CSSProperties['fontFamily'];
  fontStyle?: React.CSSProperties['fontStyle'];
  fontWeight?: React.CSSProperties['fontWeight'];
  letterSpacing?: React.CSSProperties['letterSpacing'];
  sx?: Record<string, unknown>;
  textTransform?: React.CSSProperties['textTransform'];
  variant?: EventTypographyVariant;
}

function mapTypographyColor(color: string | undefined, theme: any): string | undefined {
  if (!color) {
    return undefined;
  }
  if (color === 'text.primary') {
    return theme.palette?.text?.primary;
  }
  if (color === 'text.secondary') {
    return theme.palette?.text?.secondary;
  }
  if (color === 'error.main') {
    return theme.palette?.error?.main;
  }
  return color;
}

function mapTypographyWeight(weight: React.CSSProperties['fontWeight']) {
  const numeric = typeof weight === 'number' ? weight : Number.parseInt(String(weight ?? ''), 10);
  if (Number.isFinite(numeric)) {
    if (numeric >= 700) {
      return 'bold' as const;
    }
    if (numeric >= 600) {
      return 'semibold' as const;
    }
    if (numeric >= 500) {
      return 'medium' as const;
    }
  }
  return 'normal' as const;
}

function mapTypographySpacing(value: unknown): string | number | undefined {
  if (typeof value === 'number') {
    return `${value * 8}px`;
  }
  if (typeof value === 'string') {
    return value;
  }
  return undefined;
}

function EventTypography({
  children,
  className,
  color,
  component,
  display,
  fontFamily,
  fontStyle,
  fontWeight,
  letterSpacing,
  style,
  sx,
  textTransform,
  variant = 'body2',
  ...rest
}: EventTypographyProps) {
  const theme = withThemeFallback(useTheme());
  const sxStyle: React.CSSProperties = {};

  if (sx && typeof sx === 'object') {
    for (const [key, value] of Object.entries(sx)) {
      if (value == null || typeof value === 'object') {
        continue;
      }
      if (key === 'mb') {
        sxStyle.marginBottom = mapTypographySpacing(value);
        continue;
      }
      if (key === 'mt') {
        sxStyle.marginTop = mapTypographySpacing(value);
        continue;
      }
      (sxStyle as Record<string, unknown>)[key] = value;
    }
  }

  const nextStyle: React.CSSProperties = {
    ...sxStyle,
    ...(style ?? {}),
  };

  const resolvedColor = mapTypographyColor(color, theme);
  if (resolvedColor) {
    nextStyle.color = resolvedColor;
  }
  if (display) {
    nextStyle.display = display;
  }
  if (fontFamily) {
    nextStyle.fontFamily = fontFamily;
  }
  if (fontStyle) {
    nextStyle.fontStyle = fontStyle;
  }
  if (fontWeight) {
    nextStyle.fontWeight = fontWeight;
  }
  if (letterSpacing) {
    nextStyle.letterSpacing = letterSpacing;
  }
  if (textTransform) {
    nextStyle.textTransform = textTransform;
  }

  if (variant === 'h5' || variant === 'h6') {
    return (
      <PrimitiveHeading
        level={variant === 'h5' ? 5 : 6}
        className={className}
        style={nextStyle}
        {...rest}
      >
        {children}
      </PrimitiveHeading>
    );
  }

  return (
    <PrimitiveText
      as={(component ?? (variant === 'body2' ? 'p' : 'span')) as EventTypographyElement}
      size={variant === 'body2' ? 'sm' : 'xs'}
      weight={mapTypographyWeight(fontWeight)}
      className={className}
      style={nextStyle}
      {...rest}
    >
      {children}
    </PrimitiveText>
  );
}

function VirtualEventRow({
  index,
  style,
  events,
  renderEventCard,
}: {
  index: number;
  style: React.CSSProperties;
  events: Event[];
  renderEventCard: (event: Event) => React.ReactNode;
}) {
  const event = events[index];
  if (!event) {
    return null;
  }

  return (
    <div style={style} className="pb-4">
      {renderEventCard(event)}
    </div>
  );
}

export function isArchivedEventFilter(filter: EventFilter): boolean {
  return filter === 'archived';
}

export function getEventFilterCategories(t: (key: string) => string): PageFilterOption[] {
  return [
    { value: 'all', label: t('events.filter_all') },
    { value: 'weekly_mission', label: t('events.filter_weekly') },
    { value: 'guild_war', label: t('events.filter_guild') },
    { value: 'other', label: t('events.filter_other') },
    { value: 'archived', label: t('events.filter_archived') },
  ];
}

export function getEventTypeLabel(eventType: Event['type'], t: (key: string) => string): string {
  switch (eventType) {
    case 'weekly_mission':
      return t('events.filter_weekly');
    case 'guild_war':
      return t('events.filter_guild');
    case 'other':
    default:
      return t('events.filter_other');
  }
}

export function getEventTypeFallbackTone(eventType: Event['type']) {
  switch (eventType) {
    case 'weekly_mission':
      return { bg: 'info.main', text: 'info.contrastText', border: 'info.dark' } as const;
    case 'guild_war':
      return { bg: 'error.main', text: 'error.contrastText', border: 'error.dark' } as const;
    case 'other':
    default:
      return { bg: 'secondary.main', text: 'secondary.contrastText', border: 'secondary.dark' } as const;
  }
}

function buildMemberAccentGradient(accentColors: string[]): string {
  const [first, second, third] = accentColors;
  const opacity = 0.5;

  if (third) {
    // Three colors: diagonal sections with sharp cuts
    return `
      linear-gradient(135deg, ${alpha(first, opacity)} 0%, ${alpha(first, opacity)} 33.33%, transparent 33.33%),
      linear-gradient(225deg, ${alpha(second, opacity)} 0%, ${alpha(second, opacity)} 33.33%, transparent 33.33%),
      linear-gradient(315deg, ${alpha(third, opacity)} 0%, ${alpha(third, opacity)} 33.33%, transparent 33.33%)
    `.replace(/\s+/g, ' ').trim();
  }
  if (second) {
    // Two colors: diagonal split with sharp cut at 50%
    return `linear-gradient(135deg, ${alpha(first, opacity)} 0%, ${alpha(first, opacity)} 50%, ${alpha(second, opacity)} 50%, ${alpha(second, opacity)} 100%)`;
  }
  // Single color
  return alpha(first, opacity);
}

export function Events() {
  const { user, viewRole } = useAuthStore();
  const { timezoneOffset, setPageTitle } = useUIStore();
  const { t } = useTranslation();
  const theme = withThemeFallback(useTheme());
  const mobile = useMobileOptimizations();
  const online = useOnline();

  const [filter, setFilter] = useState<EventFilter>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const includeArchived = isArchivedEventFilter(filter);

  // 閴?TanStack Query: Server state with automatic caching and refetching
  const { data: events = [], isLoading: isLoadingEvents, isError: isEventsError, refetch: refetchEvents } = useEvents({ 
    includeArchived,
    type: filter === 'all' || filter === 'archived' ? undefined : filter,
    search,
    startDate,
    endDate
  });
  const { data: members = [], isLoading: isLoadingMembers } = useMembers();
  const isLoading = isLoadingEvents || isLoadingMembers;

  // 閴?TanStack Query: Mutations with automatic cache invalidation
  const joinEventMutation = useJoinEvent();
  const leaveEventMutation = useLeaveEvent();
  const archiveEventMutation = useArchiveEvent();
  const togglePinMutation = useTogglePinEvent();
  const toggleLockMutation = useToggleLockEvent();
  const deleteEventMutation = useDeleteEvent();
  const prefetchEvent = usePrefetchEvent();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  // Wrapper functions to match existing API
  const joinEvent = async (eventId: string, userId: string) => {
    await joinEventMutation.mutateAsync({ eventId, userId });
  };
  const leaveEvent = async (eventId: string, userId: string) => {
    await leaveEventMutation.mutateAsync({ eventId, userId });
  };
  const archiveEvent = async (id: string, isArchived: boolean) => {
    await archiveEventMutation.mutateAsync({ id, isArchived });
  };
  const togglePinEvent = async (id: string) => {
    await togglePinMutation.mutateAsync(id);
  };
  const toggleLockEvent = async (id: string) => {
    await toggleLockMutation.mutateAsync(id);
  };
  const deleteEvent = async (id: string) => {
    await deleteEventMutation.mutateAsync(id);
  };

  useEffect(() => {
    setPageTitle(t('nav.events'));
  }, [setPageTitle, t]);
  
  const [addMemberModalOpen, setAddMemberModalOpen] = useState<string | null>(null); // Event ID if open
  const [editorMode, setEditorMode] = useState<'create' | 'edit' | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  // Confirmation dialog states
  const [conflictDialog, setConflictDialog] = useState<{ event: Event; conflictingEvent: Event } | null>(null);
  const [withdrawDialog, setWithdrawDialog] = useState<string | null>(null); // Event ID
  const [kickDialog, setKickDialog] = useState<{ eventId: string; userId: string; username: string } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null); // Event ID

  const effectiveRole = getEffectiveRole(user?.role, viewRole);
  const canCreate = canCreateEvent(effectiveRole);
  const canJoin = canJoinEvents(effectiveRole);
  const canCopy = canCopyEventSignup(effectiveRole);
  const canEdit = canEditEvent(effectiveRole);
  const canDelete = canDeleteEvent(effectiveRole);
  const canPin = canPinEvent(effectiveRole);
  const canLock = canLockEvent(effectiveRole);
  const canArchive = canArchiveEvent(effectiveRole);
  const canManageParticipants = canManageEventParticipants(effectiveRole);
  
  const lastSeenKey = STORAGE_KEYS.EVENTS_LAST_SEEN;
  const lastSeen = storage.get<string>(
    lastSeenKey,
    storage.get<string>('last_seen_events_at', new Date(0).toISOString())
  );

  useEffect(() => {
    storage.set(lastSeenKey, lastSeen);
    storage.remove('last_seen_events_at');
  }, [lastSeen, lastSeenKey]);

  const eventSortFn = useMemo(
    () => (a: any, b: any) => {
      if (!includeArchived && a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    },
    [includeArchived]
  );

  const filteredEvents = useFilteredList({
    items: filterEventsByCategory(events, filter),
    searchText: '',
    searchFields: [],
    sortFn: eventSortFn,
  });

  const categories: PageFilterOption[] = getEventFilterCategories(t);
  const useVirtualList = shouldUseVirtualEventList(filteredEvents.length);
  const hasActiveFilters = Boolean(filter !== 'all' || searchInput.trim() || search.trim() || startDate || endDate);
  const hasAnyActionDialogOpen = Boolean(conflictDialog || withdrawDialog || kickDialog || deleteDialog);

  const handleClearFilters = () => {
    // Reset filter + search/date controls so users can recover the default event feed in one action.
    setFilter('all');
    setSearchInput('');
    setSearch('');
    setStartDate('');
    setEndDate('');
  };

  const getConflictingEvent = React.useCallback((event: Event) => {
    if (!user) return undefined;
    const myJoinedEvents = events.filter(e => e.participants?.some(p => p.id === user.id));
    const start = new Date(event.start_time).getTime();
    const end = event.end_time ? new Date(event.end_time).getTime() : start + (3600 * 1000);
    
    return myJoinedEvents.find(e => {
      if (e.id === event.id) return false;
      const eStart = new Date(e.start_time).getTime();
      const eEnd = e.end_time ? new Date(e.end_time).getTime() : eStart + (3600 * 1000);
      return (start < eEnd && end > eStart);
    });
  }, [events, user]);

  // Handle join with conflict check
  const handleJoin = (event: Event) => {
    if (!canJoin) return;
    const conflict = getConflictingEvent(event);
    if (conflict) {
      setConflictDialog({ event, conflictingEvent: conflict });
    } else {
      joinEvent(event.id, user!.id);
    }
  };

  const confirmJoinWithConflict = () => {
    if (canJoin && conflictDialog && user) {
      joinEvent(conflictDialog.event.id, user.id);
      setConflictDialog(null);
    }
  };

  const confirmWithdraw = () => {
    if (withdrawDialog && user) {
      leaveEvent(withdrawDialog, user.id);
      setWithdrawDialog(null);
    }
  };

  const confirmKick = () => {
    if (canManageParticipants && kickDialog) {
      leaveEvent(kickDialog.eventId, kickDialog.userId);
      setKickDialog(null);
    }
  };

  const confirmDelete = () => {
    if (canDelete && deleteDialog) {
      deleteEvent(deleteDialog);
      setDeleteDialog(null);
    }
  };

  const openCreateEditor = () => {
    setEditingEvent(null);
    setEditorMode('create');
  };

  const openEditEditor = (event: Event) => {
    setEditingEvent(event);
    setEditorMode('edit');
  };

  const closeEditor = () => {
    setEditorMode(null);
    setEditingEvent(null);
  };

  const renderEventOperationCard = React.useCallback(
    (event: Event) => {
      const isUpdated = !!event.updated_at && new Date(event.updated_at) > new Date(lastSeen);
      const conflict = getConflictingEvent(event);

      return (
        <EventOperationCard
          key={event.id}
          event={event}
          user={user}
          isUpdated={isUpdated}
          conflict={conflict}
          canJoin={canJoin}
          canCopy={canCopy}
          canManageParticipants={canManageParticipants}
          canEdit={canEdit}
          canDelete={canDelete}
          canPin={canPin}
          canLock={canLock}
          canArchive={canArchive}
          onJoin={() => handleJoin(event)}
          onLeave={() => setWithdrawDialog(event.id)}
          onKick={(userId: string, username: string) => setKickDialog({ eventId: event.id, userId, username })}
          onAdd={() => setAddMemberModalOpen(event.id)}
          onToggleArchive={() => archiveEvent(event.id, !event.is_archived)}
          onTogglePin={() => togglePinEvent(event.id)}
          onToggleLock={() => toggleLockEvent(event.id)}
          onDelete={() => setDeleteDialog(event.id)}
          onPrefetch={() => prefetchEvent(event.id)}
          onEdit={() => openEditEditor(event)}
        />
      );
    },
    [
      archiveEvent,
      canArchive,
      canCopy,
      canDelete,
      canEdit,
      canJoin,
      canLock,
      canManageParticipants,
      canPin,
      getConflictingEvent,
      handleJoin,
      lastSeen,
      openEditEditor,
      prefetchEvent,
      setAddMemberModalOpen,
      setDeleteDialog,
      setKickDialog,
      setWithdrawDialog,
      toggleLockEvent,
      togglePinEvent,
      user,
    ],
  );

  return (
    <EventBox
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        pb: { xs: 'calc(96px + env(safe-area-inset-bottom))', md: 10 },
        px: { xs: 1.5, sm: 2.5 },
      }}
      data-testid="events-root"
    >
      <PageFilterBar
        search={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder={t('events.search_placeholder') || 'Search events...'}
        category={filter}
        onCategoryChange={(val) => setFilter(val as EventFilter)}
        categories={categories}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        resultsCount={filteredEvents.length}
        isLoading={isLoading}
        extraActions={
          <EventStack direction="row" spacing={1}>
             {canCreate && (
              <Button
                size="sm"
                onClick={openCreateEditor}
                disabled={!online}
                className="font-black rounded-lg"
                data-testid="event-create-button"
              >
                <AddIcon sx={{ fontSize: 14 }} className="mr-2" />
                {t('events.new_deployment')}
              </Button>
            )}
          </EventStack>
        }
      />

      {(isEventsError && filteredEvents.length === 0) ? (
        <EventBox
          data-testid="events-error-state"
          sx={{ py: 8, textAlign: 'center', border: '2px dashed', borderColor: 'divider', borderRadius: 4, bgcolor: 'action.hover' }}
        >
          <EventBox sx={{ p: 4, mb: 2, borderRadius: '50%', bgcolor: 'background.paper', display: 'inline-flex' }}>
            <WarningIcon sx={{ fontSize: 48, opacity: 0.3 }} />
          </EventBox>
          <EventTypography variant="overline" display="block" color="text.secondary" fontWeight={900} letterSpacing="0.2em">
            {t('events.no_operations')}
          </EventTypography>
          <EventTypography variant="body2" color="text.secondary">
            {t('common.placeholder_msg')}
          </EventTypography>
          <EventStack
            data-testid="events-error-actions"
            direction="row"
            spacing={1.5}
            justifyContent="center"
            sx={{ mt: 3, flexWrap: 'wrap', rowGap: 1 }}
          >
            {/* Retry re-runs the events list query so network recoveries do not require route reloads. */}
            <PrimitiveButton type="button" variant="secondary" onClick={() => void refetchEvents()}>
              {t('common.retry')}
            </PrimitiveButton>
            {canCreate ? (
              <PrimitiveButton type="button" onClick={openCreateEditor} disabled={!online}>
                {t('events.new_deployment')}
              </PrimitiveButton>
            ) : null}
          </EventStack>
        </EventBox>
      ) : (isLoading && filteredEvents.length === 0) ? (
        <CardGridSkeleton count={3} aspectRatio="16/9" />
      ) : (
        <>
          {useVirtualList ? (
            <EventBox data-testid="events-virtual-list" sx={{ height: '70vh', minHeight: 560 }}>
              <AutoSizer
                renderProp={({ height, width }) => (
                  <VirtualList
                    rowCount={filteredEvents.length}
                    rowHeight={390}
                    rowComponent={VirtualEventRow as any}
                    rowProps={{ events: filteredEvents, renderEventCard: renderEventOperationCard } as any}
                    style={{ height: height ?? 0, width: width ?? 0 }}
                  />
                )}
              />
            </EventBox>
          ) : (
            <EventStack spacing={4}>
              {filteredEvents.map((event) => renderEventOperationCard(event))}
            </EventStack>
          )}

          {filteredEvents.length === 0 && (
            <EventBox sx={{ py: 8, textAlign: 'center', border: '2px dashed', borderColor: 'divider', borderRadius: 4, bgcolor: 'action.hover' }}>
              <EventBox sx={{ p: 4, mb: 2, borderRadius: '50%', bgcolor: 'background.paper', display: 'inline-flex' }}>
                <GroupsIcon sx={{ fontSize: 48, opacity: 0.2, mb: 2 }} />
              </EventBox>
              <EventTypography variant="overline" display="block" color="text.secondary" fontWeight={900} letterSpacing="0.2em">
                {t('events.no_operations')}
              </EventTypography>
              <EventStack
                data-testid="events-empty-actions"
                direction="row"
                spacing={1.5}
                justifyContent="center"
                sx={{ mt: 3, flexWrap: 'wrap', rowGap: 1 }}
              >
                {canCreate ? (
                  <PrimitiveButton type="button" onClick={openCreateEditor} disabled={!online}>
                    {t('events.new_deployment')}
                  </PrimitiveButton>
                ) : null}
                {hasActiveFilters ? (
                  // Clear filters returns users to the default event feed when the current filter set yields zero rows.
                  <PrimitiveButton type="button" variant="secondary" onClick={handleClearFilters}>
                    {t('common.clear_filters')}
                  </PrimitiveButton>
                ) : null}
              </EventStack>
            </EventBox>
          )}
        </>
      )}

      {addMemberModalOpen ? (
        <Suspense fallback={null}>
          <InviteMemberDialog
            open={!!addMemberModalOpen}
            onClose={() => setAddMemberModalOpen(null)}
            members={members}
            currentUserId={user?.id}
            currentParticipants={events.find((e) => e.id === addMemberModalOpen)?.participants || []}
            onAdd={(userId: string) => joinEvent(addMemberModalOpen, userId)}
          />
        </Suspense>
      ) : null}

      {hasAnyActionDialogOpen ? (
        <Suspense fallback={null}>
          <EventActionDialogs
            t={t}
            warningColor={theme.palette?.warning?.main || 'var(--color-status-warning)'}
            conflictDialog={conflictDialog}
            withdrawDialog={withdrawDialog}
            kickDialog={kickDialog}
            deleteDialog={deleteDialog}
            onCloseConflict={() => setConflictDialog(null)}
            onConfirmConflict={confirmJoinWithConflict}
            onCloseWithdraw={() => setWithdrawDialog(null)}
            onConfirmWithdraw={confirmWithdraw}
            onCloseKick={() => setKickDialog(null)}
            onConfirmKick={confirmKick}
            onCloseDelete={() => setDeleteDialog(null)}
            onConfirmDelete={confirmDelete}
          />
        </Suspense>
      ) : null}

      {editorMode ? (
        <Suspense fallback={null}>
          <EventEditorDialog
            open={!!editorMode}
            editorMode={editorMode}
            editingEventTitle={editingEvent?.title}
            onClose={closeEditor}
            onSubmit={closeEditor}
          />
        </Suspense>
      ) : null}
    </EventBox>
  );
}

function EventDetails({
  event,
  canManageParticipants,
  onKick,
}: {
  event: Event;
  canManageParticipants: boolean;
  onKick: (userId: string, username: string) => void;
}) {
  const { t } = useTranslation();
  const [showAllParticipants, setShowAllParticipants] = useState(false);

  const limit = 10;
  const participantCount = event.participants?.length || 0;
  const isOverflowing = participantCount > limit;
  const showOverflowCard = isOverflowing && !showAllParticipants;
  const displayLimit = showOverflowCard ? limit - 1 : limit;
  const { visibleParticipants } = getVisibleParticipants(event.participants, showAllParticipants, displayLimit);
  const overflowCount = participantCount - displayLimit;

  return (
    <EventBox data-testid={`event-details-${event.id}`}>
      <EventBox mb={3}>
        <EventTypography variant="h5" sx={{ fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', mb: 1 }}>
          {event.title}
        </EventTypography>
        <MarkdownContent
          content={event.description}
          maxLines={2}
          variant="body2"
          color="text.secondary"
        />
      </EventBox>

      <EventBox data-testid={`event-details-participant-grid-${event.id}`}>
        <EventBox
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
            gap: 1.5,
          }}
          data-testid="participant-grid"
        >
          {visibleParticipants.map((participant) => (
            <TeamMemberCard
              key={participant.id}
              member={participant}
              canManage={canManageParticipants}
              onKick={() => onKick(participant.id, participant.username)}
            />
          ))}

          {showOverflowCard && (
            <Button
              variant="outline"
              onClick={() => setShowAllParticipants(true)}
              className="flex-col gap-1 rounded-lg text-muted-foreground border-dashed border-border hover:border-solid hover:bg-accent/50"
              sx={{
                p: 0,
                borderRadius: 2,
                height: '100%',
                minHeight: 60,
                aspectRatio: 'unset',
              }}
            >
              <EventTypography variant="h6" fontWeight={900}>+{overflowCount}</EventTypography>
              <EventTypography variant="caption" fontWeight={700}>{t('common.more')}</EventTypography>
            </Button>
          )}
          {showAllParticipants && participantCount > limit && (
            <Button
              variant="outline"
              onClick={() => setShowAllParticipants(false)}
              className="flex-col gap-1 rounded-lg text-muted-foreground border-dashed border-border hover:border-solid hover:bg-accent/50"
              sx={{
                p: 0,
                borderRadius: 2,
                height: '100%',
                minHeight: 60,
              }}
            >
              <ExpandLessIcon sx={{ fontSize: 20 }} />
              <EventTypography variant="caption" fontWeight={700}>{t('common.show_less')}</EventTypography>
            </Button>
          )}
        </EventBox>
      </EventBox>
    </EventBox>
  );
}

const EventOperationCard = React.memo(function EventOperationCard({
  event,
  user,
  isUpdated,
  conflict,
  canJoin,
  canCopy,
  canManageParticipants,
  canEdit,
  canDelete,
  canPin,
  canLock,
  canArchive,
  onJoin,
  onLeave,
  onKick,
  onAdd,
  onToggleArchive,
  onTogglePin,
  onToggleLock,
  onDelete,
  onPrefetch,
  onEdit,
}: any) {
  const { t } = useTranslation();
  const { timezoneOffset } = useUIStore();
  const theme = withThemeFallback(useTheme());
  const mobile = useMobileOptimizations();
  const online = useOnline();
  
  const isJoined = user && event.participants?.some((p: any) => p.id === user.id);
  const isFull = event.capacity && (event.participants?.length || 0) >= event.capacity;
  
  const totalPower = event.participants?.reduce((acc: number, p: User) => acc + (p.power || 0), 0) || 0;
  const glyphIcon = event.type === 'guild_war' ? MilitaryTechIcon : CalendarDaysIcon;
  const glyphColor = event.type === 'guild_war'
    ? alpha(theme.palette?.primary?.main || '#7c3aed', 0.5)
    : alpha(theme.palette?.secondary?.main || '#2563eb', 0.5);
  const eventTypeFallbackTone = getEventTypeFallbackTone(event.type);

  const handleCopyRoster = () => {
    const names = event.participants
      .map((p: any) => `@${p.wechat_name || p.username}`)
      .join(', ');
    const text = `${event.title} Roster:\n${names}`;
    navigator.clipboard.writeText(text);
  };
  
  return (
    <Card sx={{ 
        position: 'relative', 
        overflow: 'hidden',
        opacity: event.is_archived ? 0.6 : 1,
        borderStyle: event.is_archived ? 'dashed' : 'solid',
        transition: 'all 0.3s'
    }}
      onMouseEnter={onPrefetch}
    >
      <DecorativeGlyph icon={glyphIcon} color={glyphColor} size={190} opacity={0.06} right={-30} top={-30} />
      <CardContent className="p-6">
         <EventStack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            
            <EventBox flex={1}>
               <EventStack direction="row" flexWrap="wrap" alignItems="center" justifyContent="space-between" mb={2} gap={2}>
                  <EventStack direction="row" alignItems="center" spacing={1}>
                     <Badge
                        variant="outline"
                        sx={{
                          height: 20,
                          fontSize: '0.6rem',
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          bgcolor:
                            theme.custom?.eventTypes?.[event.type as keyof typeof theme.custom.eventTypes]?.bg
                            || eventTypeFallbackTone.bg,
                          color:
                            theme.custom?.eventTypes?.[event.type as keyof typeof theme.custom.eventTypes]?.text
                            || eventTypeFallbackTone.text,
                          borderColor:
                            theme.custom?.eventTypes?.[event.type as keyof typeof theme.custom.eventTypes]?.main
                            || eventTypeFallbackTone.border,
                         }}
                     >
                        {getEventTypeLabel(event.type, t)}
                     </Badge>
                     {event.is_pinned && <PushPinIcon sx={{ fontSize: 14, color: theme.palette?.primary?.main || '#7c3aed' }} />}
                     {isUpdated && (
                        <Badge
                            variant="outline"
                            className="h-[18px] text-[0.55rem] font-black"
                            sx={{
                              height: 18,
                              fontSize: '0.55rem',
                              fontWeight: 900,
                              bgcolor: theme.custom?.chips?.updated?.bg || 'rgba(0,255,255,0.1)',
                              color: theme.custom?.chips?.updated?.text || theme.palette.text.secondary,
                              borderColor: theme.custom?.chips?.updated?.main || theme.palette.divider
                            }}
                        >
                            {t('common.label_updated')}
                        </Badge>
                     )}
                  </EventStack>
                  
                  <EventStack direction="row" flexWrap="wrap" gap={2} alignItems="center">
                      {canCopy && (
                        <Tooltip content={t('dashboard.copy_roster')}>
                          <Button 
                              size="icon"
                              variant="outline"
                              onClick={handleCopyRoster} 
                              aria-label={t('dashboard.copy_roster')}
                              className="h-7 w-7 rounded-md bg-background border-border"
                          >
                              <ContentCopyIcon sx={{ fontSize: 14 }} />
                          </Button>
                        </Tooltip>
                      )}

                      <EventBox sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                          <FlashOnIcon sx={{ fontSize: 12, color: theme.palette?.primary?.main || '#7c3aed' }} />
                          <EventTypography variant="caption" fontWeight={900}>{formatPower(totalPower)}</EventTypography>
                      </EventBox>
                      
                      <EventBox sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                          <GroupsIcon sx={{ fontSize: 12 }} />
                          <EventTypography variant="caption" fontWeight={900} color={isFull ? 'error.main' : 'text.primary'}>
                              {event.participants?.length || 0} / {event.capacity || '-'}
                          </EventTypography>
                      </EventBox>

                      <EventBox sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 12 }} />
                          <EventTypography variant="caption" fontWeight={900} textTransform="uppercase">
                              {formatDateTime(event.start_time, timezoneOffset)}
                          </EventTypography>
                      </EventBox>
                  </EventStack>
               </EventStack>
               
               <EventDetails
                 event={event}
                 canManageParticipants={canManageParticipants}
                 onKick={onKick}
               />
            </EventBox>
            
            <EventStack 
                spacing={2} 
                justifyContent="center" 
                sx={{ 
                    minWidth: { md: 160 }, 
                    borderLeft: { md: `1px solid ${theme.palette.divider}` }, 
                    borderTop: { xs: `1px solid ${theme.palette.divider}`, md: 'none' },
                    pl: { md: 3 }, 
                    pt: { xs: 3, md: 0 } 
                }}
            >
               {user && canJoin && !event.is_archived && (
                  <Button 
                     className={cn("w-full h-14 font-black rounded-xl tracking-widest", isJoined ? "border-destructive text-destructive hover:bg-destructive/10" : "")}
                     size="lg"
                     variant={isJoined ? "outline" : "default"}
                     onClick={isJoined ? onLeave : onJoin}
                     disabled={!online || event.is_locked || (!isJoined && isFull)}
                  >
                     {isJoined ? <PersonRemoveIcon sx={{ fontSize: 18 }} className="mr-2" /> : <PersonAddIcon sx={{ fontSize: 18 }} className="mr-2" />}
                     {isJoined ? t('events.withdraw') : t('events.enlist')}
                  </Button>
               )}
               {(canManageParticipants || canEdit || canPin || canLock || canArchive || canDelete) && (
                   <EventBox 
                      display="grid" 
                      gridTemplateColumns="repeat(3, 1fr)" 
                      gap={1}
                      sx={{ width: '100%' }}
                   >
                      {canManageParticipants && (
                        <Tooltip content={t('events.add_operative')}>
                          <Button 
                             size="icon" 
                             variant="outline"
                             onClick={onAdd}
                             aria-label={t('events.add_operative')}
                             data-testid={`event-invite-button-${event.id}`}
                             className="h-9 w-full bg-accent/50 border-border"
                           >
                              <AddIcon sx={{ fontSize: 16 }} />
                           </Button>
                        </Tooltip>
                      )}
                       {canEdit && (
                         <Tooltip content={t('common.edit')}>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-9 w-full bg-accent/50 border-border"
                            onClick={onEdit}
                            aria-label={t('common.edit')}
                            data-testid="event-edit-button"
                          >
                             <EditIcon sx={{ fontSize: 16 }} />
                          </Button>
                        </Tooltip>
                       )}
                      {canPin && (
                        <Tooltip content={event.is_pinned ? t('common.unpin') : t('common.pin')}>
                          <Button 
                             size="icon" 
                             variant="outline"
                             onClick={onTogglePin}
                             aria-label={event.is_pinned ? t('common.unpin') : t('common.pin')}
                             className={cn("h-9 w-full border", event.is_pinned ? "bg-primary/20 border-primary/50 text-primary" : "bg-accent/50 border-border text-muted-foreground")}
                           >
                              <PushPinIcon sx={{ fontSize: 16 }} />
                           </Button>
                        </Tooltip>
                      )}
                      {canLock && (
                        <Tooltip content={event.is_locked ? t('common.unlock') : t('common.lock')}>
                          <Button 
                             size="icon" 
                             variant="outline"
                             onClick={onToggleLock}
                             aria-label={event.is_locked ? t('common.unlock') : t('common.lock')}
                             className={cn("h-9 w-full border", event.is_locked ? "bg-destructive/20 border-destructive/50 text-destructive" : "bg-accent/50 border-border text-muted-foreground")}
                           >
                              {event.is_locked ? <LockIcon sx={{ fontSize: 16 }} /> : <LockOpenIcon sx={{ fontSize: 16 }} />}
                           </Button>
                        </Tooltip>
                      )}
                      {canArchive && (
                        <Tooltip content={event.is_archived ? t('announcements.restore') : t('announcements.archive')}>
                          <Button 
                             size="icon" 
                             variant="outline"
                             onClick={onToggleArchive}
                             aria-label={event.is_archived ? t('announcements.restore') : t('announcements.archive')}
                             className={cn("h-9 w-full border", event.is_archived ? "bg-warning-main/18 border-warning-main/50 text-warning-main" : "bg-accent/50 border-border text-muted-foreground")}
                           >
                              <ArchiveIcon sx={{ fontSize: 16 }} />
                           </Button>
                        </Tooltip>
                      )}
                      {canDelete && (
                        <Tooltip content={t('common.delete')}>
                          <Button 
                             size="icon" 
                             variant="outline"
                             onClick={onDelete}
                             aria-label={t('common.delete')}
                             className="h-9 w-full bg-destructive/5 border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive"
                           >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                           </Button>
                        </Tooltip>
                      )}
                   </EventBox>
               )}
            </EventStack>
         </EventStack>
      </CardContent>
    </Card>
  );
}, (prevProps: any, nextProps: any) => {
  const prevEvent = prevProps.event;
  const nextEvent = nextProps.event;
  return (
    prevEvent?.id === nextEvent?.id &&
    prevEvent?.updated_at === nextEvent?.updated_at &&
    prevEvent?.participants?.length === nextEvent?.participants?.length &&
    prevProps.isUpdated === nextProps.isUpdated &&
    prevProps.canJoin === nextProps.canJoin &&
    prevProps.canManageParticipants === nextProps.canManageParticipants &&
    prevProps.canDelete === nextProps.canDelete
  );
});



