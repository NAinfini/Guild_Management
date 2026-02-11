/**
 * Query Key Factory
 * Centralizes all query keys to prevent typos and ensure consistency.
 */

function normalizeIdArray(values?: Array<string | number>) {
  if (!values || values.length === 0) {
    return undefined;
  }

  return [...new Set(values.map((value) => String(value)))]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function normalizeAnalyticsParams(params?: any) {
  if (!params) {
    return undefined;
  }

  return {
    ...params,
    warIds: normalizeIdArray(params.warIds),
    userIds: normalizeIdArray(params.userIds),
    teamIds: normalizeIdArray(params.teamIds),
  };
}

export const queryKeys = {
  members: {
    all: ['members'] as const,
    list: (options?: any) => [...queryKeys.members.all, { options }] as const,
    detail: (id: string) => [...queryKeys.members.all, id] as const,
  },
  events: {
    all: ['events'] as const,
    list: (options?: any) => [...queryKeys.events.all, { options }] as const,
    detail: (id: string) => [...queryKeys.events.all, id] as const,
  },
  announcements: {
    all: ['announcements'] as const,
    list: (options?: any) => [...queryKeys.announcements.all, { options }] as const,
    detail: (id: string) => [...queryKeys.announcements.all, id] as const,
  },
  admin: {
    all: ['admin'] as const,
    auditLogs: (params?: any) => [...queryKeys.admin.all, 'audit-logs', { params }] as const,
  },
  wars: {
    all: ['wars'] as const,
    active: () => [...queryKeys.wars.all, 'active'] as const,
    history: (params?: any) => [...queryKeys.wars.all, 'history', { params }] as const,
    analytics: (params?: any) => [...queryKeys.wars.all, 'analytics', { params: normalizeAnalyticsParams(params) }] as const,
    list: (params?: any) => [...queryKeys.wars.all, 'list', { params }] as const,
    analyticsData: (params?: any) => [...queryKeys.wars.all, 'analytics-data', { params: normalizeAnalyticsParams(params) }] as const,
    analyticsFormulaPresets: () => [...queryKeys.wars.all, 'analytics-formula-presets'] as const,
  },
  war: {
    all: ['war'] as const,
    detail: (id: string) => [...queryKeys.war.all, id] as const,
    teams: (id: string) => [...queryKeys.war.detail(id), 'teams'] as const,
    memberStats: (id: string) => [...queryKeys.war.detail(id), 'member-stats'] as const,
  }
};
