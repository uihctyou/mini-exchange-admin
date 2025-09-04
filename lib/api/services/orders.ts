/**
 * orders API service
 */

import { ApiClient } from '../client';
import type {
  ApiResponse,
  PaginatedData,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderFilters,
  QueryParams,
  Order
} from '../types';

const client = new ApiClient();

export class OrderService {
  // get orders list
  static async getOrders(params?: OrderFilters & QueryParams): Promise<ApiResponse<PaginatedData<Order>>> {
    return client.get<PaginatedData<Order>>('/orders', params);
  }

  // get single order
  static async getOrder(id: string): Promise<ApiResponse<Order>> {
    return client.get<Order>(`/orders/${id}`);
  }

  // create order
  static async createOrder(data: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return client.post<Order>('/orders', data);
  }

  // update order
  static async updateOrder(id: string, data: UpdateOrderRequest): Promise<ApiResponse<Order>> {
    return client.put<Order>(`/orders/${id}`, data);
  }

  // cancel order
  static async cancelOrder(id: string): Promise<ApiResponse<Order>> {
    return client.post<Order>(`/orders/${id}/cancel`);
  }

  // batch cancel orders
  static async batchCancelOrders(orderIds: string[]): Promise<ApiResponse<void>> {
    return client.post<void>('/orders/batch-cancel', { orderIds });
  }

  // get order history
  static async getOrderHistory(params?: QueryParams): Promise<ApiResponse<PaginatedData<Order>>> {
    return client.get<PaginatedData<Order>>('/orders/history', params);
  }

  // get user orders
  static async getUserOrders(userId: string, params?: QueryParams): Promise<ApiResponse<PaginatedData<Order>>> {
    return client.get<PaginatedData<Order>>(`/users/${userId}/orders`, params);
  }

  // get order stats
  static async getOrderStats(): Promise<ApiResponse<{
    total: number;
    pending: number;
    filled: number;
    cancelled: number;
    todayVolume: number;
    todayCount: number;
  }>> {
    return client.get('/orders/stats');
  }

  // export orders data
  static async exportOrders(params?: OrderFilters): Promise<ApiResponse<{ downloadUrl: string }>> {
    return client.post<{ downloadUrl: string }>('/orders/export', params);
  }
}
