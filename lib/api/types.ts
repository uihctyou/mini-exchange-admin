/**
 * API type definitions
**/

// API response structure
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  body?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Paginated data structure
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Common query parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export type QueryParams = PaginationParams & SortParams & FilterParams;

// ===== Request body type definitions =====

// Authentication related requests
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// User management requests
export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  roles: string[];
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  roles?: string[];
  isActive?: boolean;
}

export interface UserFilters extends FilterParams {
  role?: string;
  isActive?: boolean;
}

// Order management requests
export interface CreateOrderRequest {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
}

export interface UpdateOrderRequest {
  quantity?: number;
  price?: number;
  stopPrice?: number;
}

export interface OrderFilters extends FilterParams {
  userId?: string;
  symbol?: string;
  side?: 'buy' | 'sell';
  status?: 'pending' | 'filled' | 'cancelled' | 'rejected';
  type?: 'market' | 'limit' | 'stop' | 'stop_limit';
}

// System management requests
export interface SystemSettings {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  defaultUserRole: string;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
}

export interface UpdateSystemSettingsRequest extends Partial<SystemSettings> {}

export interface AuditLogFilters extends FilterParams {
  userId?: string;
  action?: string;
  resource?: string;
}

export interface MaintenanceRequest {
  enabled: boolean;
  message?: string;
  startTime?: string;
  endTime?: string;
}

// Market data requests
export interface KlineParams {
  symbol: string;
  interval: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';
  limit?: number;
  startTime?: number;
  endTime?: number;
}

// ===== Response body data models (used in body) =====

// User related data (using unified types from rbac)
export type { User, Permission } from '@/lib/rbac';
import type { User, Permission } from '@/lib/rbac';

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

// Authentication related data
export interface LoginData {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  kycLevel: number;
  roles: string[];
  permissions: string[] | null;
  lastLoginAt: string;
}

export interface RefreshTokenData {
  token: string;
  expiresIn: number;
}

// Order related data
export interface Order {
  id: string;
  userId: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  quantity: number;
  price?: number;
  stopPrice?: number;
  filledQuantity: number;
  averagePrice?: number;
  timeInForce: 'GTC' | 'IOC' | 'FOK';
  createdAt: string;
  updatedAt: string;
  filledAt?: string;
}

// Market data
export interface Symbol {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: 'trading' | 'suspended' | 'delisted';
  minQty: number;
  maxQty: number;
  stepSize: number;
  minPrice: number;
  maxPrice: number;
  tickSize: number;
  minNotional: number;
}

export interface Ticker {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  lastUpdate: string;
}

export interface OrderBook {
  symbol: string;
  bids: [number, number][]; // [price, quantity]
  asks: [number, number][]; // [price, quantity]
  lastUpdate: string;
}

export interface Trade {
  id: string;
  symbol: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  timestamp: string;
}

export interface Kline {
  openTime: number;
  closeTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  trades: number;
}

// System related data
export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface SystemStatus {
  service: string;
  status: 'online' | 'offline' | 'maintenance';
  uptime: number;
  lastCheck: string;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  todayOrders: number;
  totalVolume: number;
  todayVolume: number;
}
