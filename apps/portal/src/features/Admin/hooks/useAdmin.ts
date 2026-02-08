/**
 * Admin Hook
 * Manages admin operations with API integration
 */

import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../../lib/api';

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
