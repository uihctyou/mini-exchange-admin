/**
 * API client base class
 * Provides unified HTTP request methods and error handling
 */

import { env } from '@/lib/env';
import { getClientAuthToken } from '@/lib/auth';
import { ApiResponse } from './types';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  skipAuth?: boolean;
  signal?: AbortSignal;
}

export class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number = 10000;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || this.getBaseUrl();
  }

  private getBaseUrl(): string {
    return env.NEXT_PUBLIC_AUTH_MODE === 'BFF' ? '/api' : env.NEXT_PUBLIC_EXCHANGE_API_BASE_URL;
  }

  private getDefaultHeaders(skipAuth: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (!skipAuth && env.NEXT_PUBLIC_AUTH_MODE === 'DIRECT') {
      const token = getClientAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let data: any;
    
    try {
      data = await response.json();
    } catch (error) {
      return {
        status: 'error',
        error: {
          code: 'PARSE_ERROR',
          message: 'Failed to parse response as JSON'
        }
      };
    }

    if (!response.ok) {
      return {
        status: 'error',
        error: {
          code: data.code || 'HTTP_ERROR',
          message: data.message || `HTTP ${response.status} ${response.statusText}`,
          details: data.errors || data.details
        }
      };
    }

    return {
      status: 'success',
      body: data,
      message: data.message
    };
  }

  private async request<T>(
    method: string,
    endpoint: string,
    options: RequestOptions & { body?: any } = {}
  ): Promise<ApiResponse<T>> {
    const { headers = {}, timeout = this.defaultTimeout, skipAuth = false, body, signal } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const requestHeaders = {
      ...this.getDefaultHeaders(skipAuth),
      ...headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: signal || controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError(408, 'TIMEOUT', 'Request timeout');
        }
        throw new ApiError(0, 'NETWORK_ERROR', error.message);
      }

      throw new ApiError(0, 'UNKNOWN_ERROR', 'Unknown error occurred');
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>, options?: RequestOptions): Promise<ApiResponse<T>> {
    let url = endpoint;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    
    return this.request<T>('GET', url, options);
  }

  async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, { ...options, body });
  }

  async put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, { ...options, body });
  }

  async patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, { ...options, body });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, options);
  }

  // upload file
  async upload<T>(
    endpoint: string, 
    file: File, 
    additionalData?: Record<string, any>,
    options?: Omit<RequestOptions, 'skipAuth'>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const { headers = {}, timeout = this.defaultTimeout, signal } = options || {};
    const url = `${this.baseUrl}${endpoint}`;
    
    const requestHeaders = {
      ...this.getDefaultHeaders(false),
      ...headers,
    };

    // remove Content-Type to let the browser set it automatically with the boundary
    delete requestHeaders['Content-Type'];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: requestHeaders,
        body: formData,
        signal: signal || controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError(408, 'TIMEOUT', 'Request timeout');
        }
        throw new ApiError(0, 'NETWORK_ERROR', error.message);
      }

      throw new ApiError(0, 'UNKNOWN_ERROR', 'Unknown error occurred');
    }
  }
}

// create default API client instance
export const apiClient = new ApiClient();
