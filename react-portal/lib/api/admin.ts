/**
 * Admin API Service
 * Typed methods for admin operations with Domain Mapping
 */

import { api } from '../api-client';
import type { AuditLogEntry } from '../../types';

// ============================================================================
// Backend Types
// ============================================================================

interface AuditLogEntryDTO {
  audit_id: string;
  entity_type: string;
  action: string;
  actor_id: string;
  actor_username: string; // aggregated
  entity_id: string;
  diff_title: string | null;
  detail_text: string | null;
  created_at_utc: string;
  metadata?: string; // JSON string
}

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  error?: string;
}

// ============================================================================
// Mappers
// ============================================================================

const mapLogToDomain = (dto: AuditLogEntryDTO): AuditLogEntry => {
  let meta: any = undefined;
  if (dto.metadata) {
    try { meta = JSON.parse(dto.metadata); } catch(e) {}
  }

  return {
    id: dto.audit_id,
    entity_type: dto.entity_type,
    action: dto.action,
    actor_id: dto.actor_id || 'system',
    actor_username: dto.actor_username || 'System',
    entity_id: dto.entity_id,
    timestamp: dto.created_at_utc,
    detail_text: dto.detail_text || '',
    diff_summary: dto.diff_title || undefined,
    metadata: meta
  };
};

// ============================================================================
// API Service
// ============================================================================

export const adminAPI = {
  listAuditLogs: async (params?: {
    entityType?: string;
    actorId?: string;
    startDate?: string;
    endDate?: string;
    cursor?: string;
    limit?: number;
  }): Promise<{ logs: AuditLogEntry[]; nextCursor?: string }> => {
    const queryParams: any = {};
    if (params?.entityType) queryParams.entity_type = params.entityType;
    if (params?.actorId) queryParams.actor_id = params.actorId;
    if (params?.startDate) queryParams.start_date = params.startDate;
    if (params?.endDate) queryParams.end_date = params.endDate;
    if (params?.cursor) queryParams.cursor = params.cursor;
    if (params?.limit) queryParams.limit = String(params.limit);

    // Using untyped api.get temporarily if typedAPI definitions lag, or typedAPI
    // typedAPI.admin.listAuditLogs<{ logs: AuditLogEntryDTO[]; next_cursor?: string }...>
    // Assuming typedAPI is available and updated (which we define in endpoints.ts)
    // However, I need to check if 'typedAPI' is imported. It's not in the original file.
    // I will stick to 'api' client for now to avoid breaking imports unless I add the import.
    // But better to use typedAPI if possible. Let's try to import it.
    
    // For now, mirroring previous behavior but with new method name
    const response = await api.get<{ logs: AuditLogEntryDTO[]; next_cursor?: string }>('/admin/audit-logs', queryParams);
    
    return {
        logs: (response.logs || []).map(mapLogToDomain),
        nextCursor: response.next_cursor
    };
  },

  // Alias for backward compatibility if needed, or just remove
  getAuditLogs: async (params?: any) => {
      return adminAPI.listAuditLogs(params);
  },

  addAuditLog: async (data: { entityType: string; action: string; entityId: string; diffTitle?: string; detailText?: string }) => {
      // NOTE: This endpoint might not exist in backend yet or might be restrictive (system only?)
      // The user requested "addAuditLog" key in endpoints.
      return api.post('/admin/audit-logs', {
          entity_type: data.entityType,
          action: data.action,
          entity_id: data.entityId,
          diff_title: data.diffTitle,
          detail_text: data.detailText
      });
  },

  deleteAuditLog: async (id: string) => {
      return api.delete(`/admin/audit-logs/${id}`);
  },

  getHealth: async () => {
    return api.get<HealthStatus>('/health');
  },

  getD1Health: async () => {
    return api.get<HealthStatus>('/health/d1');
  },

  getR2Health: async () => {
    return api.get<HealthStatus>('/health/r2');
  },
};
