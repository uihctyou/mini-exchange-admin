/**
 * system API service
 */

import { ApiClient } from '../client';
import type {
  ApiResponse,
  PaginatedData,
  SystemSettings,
  UpdateSystemSettingsRequest,
  AuditLogFilters,
  MaintenanceRequest,
  QueryParams,
  AuditLog,
  SystemStatus,
  SystemStats
} from '../types';

const client = new ApiClient();

export class SystemService {
  // get system settings
  static async getSettings(): Promise<ApiResponse<SystemSettings>> {
    return client.get<SystemSettings>('/system/settings');
  }

  // update system settings
  static async updateSettings(data: UpdateSystemSettingsRequest): Promise<ApiResponse<SystemSettings>> {
    return client.put<SystemSettings>('/system/settings', data);
  }

  // get system status
  static async getStatus(): Promise<ApiResponse<SystemStatus[]>> {
    return client.get<SystemStatus[]>('/system/status');
  }

  // get system stats
  static async getStats(): Promise<ApiResponse<SystemStats>> {
    return client.get<SystemStats>('/system/stats');
  }

  // get audit logs
  static async getAuditLogs(params?: AuditLogFilters & QueryParams): Promise<ApiResponse<PaginatedData<AuditLog>>> {
    return client.get<PaginatedData<AuditLog>>('/system/audit-logs', params);
  }

  // cleanup audit logs
  static async cleanupAuditLogs(olderThanDays: number): Promise<ApiResponse<{ deletedCount: number }>> {
    return client.post<{ deletedCount: number }>('/system/audit-logs/cleanup', { olderThanDays });
  }

  // maintenance mode
  static async setMaintenanceMode(data: MaintenanceRequest): Promise<ApiResponse<void>> {
    return client.post<void>('/system/maintenance', data);
  }

  // get maintenance status
  static async getMaintenanceStatus(): Promise<ApiResponse<{
    enabled: boolean;
    message?: string;
    startTime?: string;
    endTime?: string;
  }>> {
    return client.get('/system/maintenance');
  }

  // create system backup
  static async createBackup(): Promise<ApiResponse<{ backupId: string; downloadUrl: string }>> {
    return client.post<{ backupId: string; downloadUrl: string }>('/system/backup');
  }

  // get backup list
  static async getBackups(): Promise<ApiResponse<Array<{
    id: string;
    createdAt: string;
    size: number;
    downloadUrl: string;
  }>>> {
    return client.get('/system/backups');
  }

  // restore system backup
  static async restoreBackup(backupId: string): Promise<ApiResponse<void>> {
    return client.post<void>(`/system/backups/${backupId}/restore`);
  }

  // cleanup system cache
  static async clearCache(): Promise<ApiResponse<void>> {
    return client.post<void>('/system/cache/clear');
  }

  // restart system service
  static async restartService(serviceName: string): Promise<ApiResponse<void>> {
    return client.post<void>(`/system/services/${serviceName}/restart`);
  }
}
