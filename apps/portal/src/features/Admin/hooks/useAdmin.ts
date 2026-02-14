/**
 * Admin Hook
 * Manages admin operations with API integration
 */

import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../../lib/api';
import { apiDirect, APIError } from '../../../lib/api-client';
import { ENDPOINTS, buildPath, extractPathParams } from '@guild/shared-api/endpoints';

type EndpointProbeStatus = 'healthy' | 'degraded' | 'down' | 'skipped';

export type EndpointProbe = {
  key: string;
  group: string;
  name: string;
  method: string;
  path: string;
  resolvedPath?: string;
  status: EndpointProbeStatus;
  statusCode?: number;
  details: string;
};

export type EndpointHealthReport = {
  checkedAt: string;
  endpoints: EndpointProbe[];
  summary: Record<EndpointProbeStatus, number> & { total: number };
};

function firstId(value: any): string | undefined {
  const rows = Array.isArray(value)
    ? value
    : Array.isArray(value?.items)
    ? value.items
    : Array.isArray(value?.members)
    ? value.members
    : [];

  const item = rows[0];
  if (!item || typeof item !== 'object') return undefined;
  return (
    item.id ||
    item.user_id ||
    item.event_id ||
    item.announcement_id ||
    item.war_id ||
    item.history_id ||
    item.gallery_id
  );
}

async function buildEndpointSamples() {
  const [membersRes, eventsRes, announcementsRes, warsRes, galleryRes, historyRes] = await Promise.all([
    apiDirect.get<any>('/members', { includeInactive: true }).catch(() => null),
    apiDirect.get<any>('/events').catch(() => null),
    apiDirect.get<any>('/announcements').catch(() => null),
    apiDirect.get<any>('/wars').catch(() => null),
    apiDirect.get<any>('/gallery').catch(() => null),
    apiDirect.get<any>('/wars/history').catch(() => null),
  ]);

  const memberId = firstId(membersRes);
  const eventId = firstId(eventsRes);
  const announcementId = firstId(announcementsRes);
  const warId = firstId(warsRes);
  const galleryId = firstId(galleryRes);
  const warHistoryId = firstId(historyRes) || warId;

  let warTeamId: string | undefined;
  if (warId) {
    const teamsRes = await apiDirect.get<any>(`/wars/${encodeURIComponent(warId)}/teams`).catch(() => null);
    warTeamId = firstId(teamsRes);
  }

  return {
    memberId,
    eventId,
    announcementId,
    warId,
    warTeamId,
    warHistoryId,
    galleryId,
  };
}

function resolveParamValue(
  group: string,
  path: string,
  param: string,
  samples: Awaited<ReturnType<typeof buildEndpointSamples>>
): string | undefined {
  if (param === 'check') return 'd1';
  if (param === 'action') return undefined;
  if (param === 'key') return '__healthcheck__';
  if (param === 'entityId') return samples.memberId;
  if (param === 'teamId') return samples.warTeamId;
  if (param === 'videoId') return undefined;
  if (param === 'mediaId') return undefined;

  if (param === 'id') {
    if (group === 'members') return samples.memberId;
    if (group === 'events') return samples.eventId;
    if (group === 'announcements') return samples.announcementId;
    if (group === 'wars') {
      if (path.includes('/history/')) return samples.warHistoryId;
      return samples.warId;
    }
    if (group === 'gallery') return samples.galleryId;
    if (group === 'media') return samples.galleryId;
    if (group === 'admin') return samples.memberId;
    return undefined;
  }

  return undefined;
}

async function checkEndpoints(): Promise<EndpointHealthReport> {
  const samples = await buildEndpointSamples();
  const probes: EndpointProbe[] = [];

  for (const [group, endpointGroup] of Object.entries(ENDPOINTS)) {
    for (const [name, endpoint] of Object.entries(endpointGroup)) {
      const baseProbe = {
        key: `${group}.${name}`,
        group,
        name,
        method: endpoint.method,
        path: endpoint.path,
      };

      if (endpoint.method !== 'GET') {
        probes.push({
          ...baseProbe,
          status: 'skipped',
          details: 'Write endpoint not probed from health panel.',
        });
        continue;
      }

      if (endpoint.path === '/push') {
        probes.push({
          ...baseProbe,
          status: 'skipped',
          details: 'Streaming endpoint not probed.',
        });
        continue;
      }

      const paramKeys = extractPathParams(endpoint.path);
      const params: Record<string, string> = {};
      let unresolvedParam: string | undefined;

      for (const param of paramKeys) {
        const value = resolveParamValue(group, endpoint.path, param, samples);
        if (!value) {
          unresolvedParam = param;
          break;
        }
        params[param] = value;
      }

      if (unresolvedParam) {
        probes.push({
          ...baseProbe,
          status: 'skipped',
          details: `Missing sample value for :${unresolvedParam}`,
        });
        continue;
      }

      const resolvedPath = buildPath(endpoint.path, params);
      try {
        await apiDirect.get(resolvedPath);
        probes.push({
          ...baseProbe,
          resolvedPath,
          status: 'healthy',
          details: 'OK',
        });
      } catch (err: any) {
        if (err instanceof APIError) {
          const statusCode = err.status;
          const reachableStatusCodes = [400, 401, 403, 404, 405, 409, 422];
          const degraded = typeof statusCode === 'number' && reachableStatusCodes.includes(statusCode);
          probes.push({
            ...baseProbe,
            resolvedPath,
            status: degraded ? 'degraded' : 'down',
            statusCode,
            details: statusCode ? `HTTP ${statusCode}` : (err.message || 'Request failed'),
          });
          continue;
        }

        probes.push({
          ...baseProbe,
          resolvedPath,
          status: 'down',
          details: err?.message || 'Request failed',
        });
      }
    }
  }

  const summary = probes.reduce(
    (acc, probe) => {
      acc[probe.status] += 1;
      acc.total += 1;
      return acc;
    },
    { healthy: 0, degraded: 0, down: 0, skipped: 0, total: 0 } as Record<EndpointProbeStatus, number> & { total: number },
  );

  return {
    checkedAt: new Date().toISOString(),
    endpoints: probes,
    summary,
  };
}

export function useAuditLogs(params?: {
  entityType?: string;
  actorId?: string;
  startDate?: string;
  endDate?: string;
  cursor?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => adminAPI.getAuditLogs(params),
  });
}

export function useHealthStatus() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => adminAPI.getHealth(),
    refetchOnWindowFocus: false,
  });
}

export function useD1Health() {
  return useQuery({
    queryKey: ['health', 'd1'],
    queryFn: () => adminAPI.getD1Health(),
    refetchOnWindowFocus: false,
  });
}

export function useR2Health() {
  return useQuery({
    queryKey: ['health', 'r2'],
    queryFn: () => adminAPI.getR2Health(),
    refetchOnWindowFocus: false,
  });
}

export function useEndpointHealth() {
  return useQuery({
    queryKey: ['health', 'endpoints'],
    queryFn: checkEndpoints,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    meta: { errorMessage: false },
  });
}
