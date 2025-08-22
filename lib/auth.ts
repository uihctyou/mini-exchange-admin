/**
 * Authentication utilities for handling user sessions and tokens
 * Supports both BFF and Direct API modes
 */

import { env, cookieConfig } from './env';
import { User } from './rbac';

// Authentication response interface
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
  expiresIn: number;
}

// Login credentials interface
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

// Token payload interface (JWT)
export interface TokenPayload {
  sub: string; // user ID
  email: string;
  name: string;
  roles: string[];
  iat: number;
  exp: number;
}

/**
 * Decode JWT token (client-side only, for Direct mode)
 * Note: This is for reading token data, not for verification
 */
export function decodeToken(token: string): TokenPayload | null {
  if (typeof window === 'undefined') {
    // Server-side: don't decode tokens here
    return null;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as TokenPayload;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Get the remaining time until token expiration (in seconds)
 */
export function getTokenExpirationTime(token: string): number {
  const payload = decodeToken(token);
  if (!payload) return 0;

  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - now);
}

/**
 * Server-side: Get authentication token from cookies (for API routes only)
 * Note: This function can only be used in server components or API routes
 */
export async function getServerAuthToken(): Promise<string | null> {
  // This function should only be called from server-side API routes
  if (env.AUTH_MODE !== 'BFF') return null;
  
  // Server-side cookie access should be handled in API routes
  return null;
}

/**
 * Client-side: Get authentication token
 */
export function getClientAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  if (env.AUTH_MODE === 'BFF') {
    // In BFF mode, token is in HttpOnly cookie, not accessible from client
    return null;
  } else {
    // In Direct mode, get from storage
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }
}

/**
 * Client-side: Store authentication token
 */
export function setClientAuthToken(token: string, remember: boolean = false): void {
  if (typeof window === 'undefined') return;

  if (env.AUTH_MODE === 'DIRECT') {
    if (remember) {
      localStorage.setItem('access_token', token);
      sessionStorage.removeItem('access_token');
    } else {
      sessionStorage.setItem('access_token', token);
      localStorage.removeItem('access_token');
    }
  }
  // In BFF mode, token is managed by server via cookies
}

/**
 * Client-side: Remove authentication token
 */
export function removeClientAuthToken(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('access_token');
  sessionStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  sessionStorage.removeItem('refresh_token');
}

/**
 * Server-side: Set authentication cookie
 */
export function setServerAuthCookie(token: string): string {
  const maxAge = cookieConfig.maxAge;
  const expires = new Date(Date.now() + maxAge * 1000);

  return `${cookieConfig.name}=${token}; HttpOnly; Secure=${cookieConfig.secure}; SameSite=${cookieConfig.sameSite}; Path=${cookieConfig.path}; Max-Age=${maxAge}; Expires=${expires.toUTCString()}`;
}

/**
 * Server-side: Clear authentication cookie
 */
export function clearServerAuthCookie(): string {
  return `${cookieConfig.name}=; HttpOnly; Secure=${cookieConfig.secure}; SameSite=${cookieConfig.sameSite}; Path=${cookieConfig.path}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Extract user information from token
 */
export function getUserFromToken(token: string): User | null {
  const payload = decodeToken(token);
  if (!payload) return null;

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    roles: payload.roles as any[], // Convert string roles to UserRole enum
    isActive: true,
    createdAt: new Date(payload.iat * 1000),
  };
}

/**
 * Client-side: Get current user from stored token
 */
export function getCurrentUser(): User | null {
  const token = getClientAuthToken();
  if (!token || isTokenExpired(token)) {
    return null;
  }

  return getUserFromToken(token);
}

/**
 * Check if user is currently authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    // Server-side: check will be done by middleware
    return false;
  }

  const token = getClientAuthToken();
  return token !== null && !isTokenExpired(token);
}

/**
 * Logout utility - clears all auth data
 */
export async function logout(): Promise<void> {
  if (typeof window === 'undefined') return;

  // Clear client-side tokens
  removeClientAuthToken();

  // For BFF mode, call logout API to clear server-side session
  if (env.AUTH_MODE === 'BFF') {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
  }

  // Redirect to login page
  window.location.href = '/login';
}

/**
 * Calculate when to refresh the token (typically 75% of the way to expiration)
 */
export function getTokenRefreshTime(token: string): number {
  const payload = decodeToken(token);
  if (!payload) return 0;

  const totalTime = payload.exp - payload.iat;
  const refreshTime = payload.iat + (totalTime * 0.75);
  
  return Math.max(0, refreshTime - Math.floor(Date.now() / 1000));
}

/**
 * Check if token needs to be refreshed soon
 */
export function shouldRefreshToken(token: string): boolean {
  const timeToRefresh = getTokenRefreshTime(token);
  return timeToRefresh <= 0;
}
