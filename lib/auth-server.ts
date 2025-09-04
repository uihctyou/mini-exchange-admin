/**
 * Server-side authentication utilities for API routes
 * This file can only be used in API routes and server components
 */

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { env, cookieConfig } from './env';

/**
 * Get authentication token from cookies (Server-side only)
 * Use this in API routes or server components
 */
export async function getServerAuthToken(): Promise<string | null> {
  if (env.NEXT_PUBLIC_AUTH_MODE !== 'BFF') return null;

  try {
    const cookieStore = cookies();
    const token = cookieStore.get(cookieConfig.name);
    return token?.value || null;
  } catch (error) {
    console.error('Failed to get server auth token:', error);
    return null;
  }
}

/**
 * Get authentication token from request headers or cookies
 * Use this in API routes
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Try cookies (BFF mode)
  if (env.NEXT_PUBLIC_AUTH_MODE === 'BFF') {
    const token = request.cookies.get(cookieConfig.name);
    return token?.value || null;
  }

  return null;
}

/**
 * Set authentication cookie (Server-side only)
 * Use this in API routes
 */
export function setServerAuthCookie(token: string, remember: boolean = false): ResponseInit {
  const maxAge = remember ? cookieConfig.maxAge * 7 : cookieConfig.maxAge; // 7 days if remember

  return {
    headers: {
      'Set-Cookie': `${cookieConfig.name}=${token}; HttpOnly; Secure=${cookieConfig.secure}; SameSite=${cookieConfig.sameSite}; Max-Age=${maxAge}; Path=/`,
    },
  };
}

/**
 * Clear authentication cookie (Server-side only)
 * Use this in API routes
 */
export function clearServerAuthCookie(): ResponseInit {
  return {
    headers: {
      'Set-Cookie': `${cookieConfig.name}=; HttpOnly; Secure=${cookieConfig.secure}; SameSite=${cookieConfig.sameSite}; Max-Age=0; Path=/`,
    },
  };
}
