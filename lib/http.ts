/**
 * HTTP client utility for API requests
 * Supports both BFF and Direct API modes
 * Includes error handling, retries, and request/response interceptors
 */

import { env } from './env';

// API response interface
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  code?: number;
}

// API error interface
export interface ApiError {
  message: string;
  code?: number;
  details?: any;
}

// Request configuration interface
export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  skipAuth?: boolean;
}

// HTTP client class
class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;
  private defaultRetries: number;

  constructor() {
    // Set base URL based on auth mode
    this.baseUrl = env.NEXT_PUBLIC_AUTH_MODE === 'BFF' ? '/api' : env.NEXT_PUBLIC_EXCHANGE_API_BASE_URL;
    
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    
    this.defaultTimeout = 10000; // 10 seconds
    this.defaultRetries = 3;
  }

  /**
   * Get authentication token from cookies (BFF mode) or storage (Direct mode)
   */
  private async getAuthToken(): Promise<string | null> {
    if (typeof window === 'undefined') {
      // Server-side: return null, token should be handled by middleware
      return null;
    }

    if (env.NEXT_PUBLIC_AUTH_MODE === 'BFF') {
      // In BFF mode, token is in HttpOnly cookie, managed by server
      return null;
    } else {
      // In Direct mode, get token from localStorage or sessionStorage
      return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    }
  }

  /**
   * Create request headers with authentication
   */
  private async createHeaders(customHeaders?: Record<string, string>): Promise<Record<string, string>> {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    const token = await this.getAuthToken();
    if (token && env.NEXT_PUBLIC_AUTH_MODE === 'DIRECT') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    url: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      skipAuth = false,
    } = config;

    const headers = skipAuth 
      ? { ...this.defaultHeaders, ...config.headers }
      : await this.createHeaders(config.headers);

    const requestUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    
    const requestConfig: RequestInit = {
      method,
      headers,
      credentials: env.NEXT_PUBLIC_AUTH_MODE === 'BFF' ? 'include' : 'omit',
    };

    if (body && method !== 'GET') {
      requestConfig.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let lastError: Error = new Error('Request failed');

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(requestUrl, {
          ...requestConfig,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          
          // Handle authentication errors
          if (response.status === 401) {
            await this.handleAuthError();
            throw new Error('Authentication failed');
          }
          
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry on certain errors
        if (error instanceof Error && (
          error.name === 'AbortError' || 
          error.message.includes('Authentication failed')
        )) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, etc.
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    clearTimeout(timeoutId);
    throw lastError;
  }

  /**
   * Handle authentication errors (logout, redirect to login, etc.)
   */
  private async handleAuthError(): Promise<void> {
    if (typeof window !== 'undefined') {
      // Clear stored tokens
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');
      
      // Redirect to login page
      window.location.href = '/login';
    }
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(url: string, body?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T>(url: string, body?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, body?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'DELETE' });
  }
}

// Create and export a singleton instance
export const httpClient = new HttpClient();

// Export convenience methods
export const { get, post, put, patch, delete: del } = httpClient;
