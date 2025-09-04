/**
 * users API service
 */

import { ApiClient } from '../client';
import type {
  ApiResponse,
  PaginatedData,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  QueryParams,
  User
} from '../types';

const client = new ApiClient();

export class UserService {
  // get users list
  static async getUsers(params?: UserFilters & QueryParams): Promise<ApiResponse<PaginatedData<User>>> {
    return client.get<PaginatedData<User>>('/users', params);
  }

  // get single user
  static async getUser(id: string): Promise<ApiResponse<User>> {
    return client.get<User>(`/users/${id}`);
  }

  // create user
  static async createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
    return client.post<User>('/users', data);
  }

  // update user
  static async updateUser(id: string, data: UpdateUserRequest): Promise<ApiResponse<User>> {
    return client.put<User>(`/users/${id}`, data);
  }

  // delete user
  static async deleteUser(id: string): Promise<ApiResponse<void>> {
    return client.delete<void>(`/users/${id}`);
  }

  // batch delete users
  static async batchDeleteUsers(userIds: string[]): Promise<ApiResponse<void>> {
    return client.post<void>('/users/batch-delete', { userIds });
  }

  // reset user password
  static async resetUserPassword(id: string, newPassword: string): Promise<ApiResponse<void>> {
    return client.post<void>(`/users/${id}/reset-password`, { newPassword });
  }

  // enable/disable user
  static async toggleUserStatus(id: string, isActive: boolean): Promise<ApiResponse<User>> {
    return client.patch<User>(`/users/${id}/status`, { isActive });
  }

  // get user stats
  static async getUserStats(): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
  }>> {
    return client.get('/users/stats');
  }
}
