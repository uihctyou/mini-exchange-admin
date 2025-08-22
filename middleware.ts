/**
 * Next.js Middleware
 * Handles internationalization routing, authentication, and route protection
 */

import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n';

// Create the internationalization middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/users',
  '/trading',
  '/analytics',
  '/settings',
  '/reports',
  '/orders',
  '/transactions',
  '/audit',
  '/markets',
  '/risk',
];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/forgot-password',
  '/reset-password',
];

// API routes that should be excluded from middleware processing
const API_ROUTES = [
  '/api',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

/**
 * Check if the user is authenticated by looking for auth tokens
 */
function isAuthenticated(request: NextRequest): boolean {
  const authMode = process.env.AUTH_MODE || 'BFF';
  
  if (authMode === 'DIRECT') {
    // In DIRECT mode, we can't reliably check localStorage from middleware
    // But we can check if there's an Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader?.includes('mock-jwt-token') || authHeader?.startsWith('Bearer ')) {
      return true;
    }
    
    // For DIRECT mode, we'll be more permissive and let client handle auth
    // But we should still protect routes properly
    return false;
  }
  
  // BFF mode: Check for tokens in cookies
  const cookieToken = request.cookies.get('access_token')?.value;
  const sessionToken = request.cookies.get('session_token')?.value;
  
  // For mock implementation, check for our mock token pattern
  if (cookieToken?.startsWith('mock-jwt-token') || 
      sessionToken?.startsWith('mock-jwt-token')) {
    return true;
  }
  
  // In production, you would validate the JWT token here
  return Boolean(cookieToken || sessionToken);
}

/**
 * Check if a pathname is a protected route
 */
function isProtectedRoute(pathname: string): boolean {
  // Remove locale prefix to check against route patterns
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/';
  
  // Root path is also protected (should redirect to dashboard)
  if (pathWithoutLocale === '/') {
    return true;
  }
  
  return PROTECTED_ROUTES.some(route => {
    return pathWithoutLocale.startsWith(route);
  });
}

/**
 * Check if a pathname is a public route
 */
function isPublicRoute(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/';
  
  return PUBLIC_ROUTES.some(route => {
    return pathWithoutLocale.startsWith(route);
  });
}

/**
 * Check if a pathname should be excluded from middleware processing
 */
function shouldExclude(pathname: string): boolean {
  return API_ROUTES.some(route => pathname.startsWith(route)) ||
         Boolean(pathname.match(/\.(png|jpg|jpeg|svg|gif|ico|css|js|woff|woff2|ttf|eot)$/));
}

/**
 * Get the locale from the pathname
 */
function getLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/');
  const localeSegment = segments[1];
  
  // Check if it's a valid locale
  if (locales.includes(localeSegment as any)) {
    return localeSegment;
  }
  
  return defaultLocale;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes, static files, etc.
  if (shouldExclude(pathname)) {
    return NextResponse.next();
  }
  
  const authMode = process.env.AUTH_MODE || 'BFF';
  
  // In DIRECT mode, skip server-side auth checks
  // Let client-side components handle authentication
  if (authMode === 'DIRECT') {
    return intlMiddleware(request);
  }
  
  // BFF mode: Handle authentication logic
  const locale = getLocaleFromPathname(pathname);
  const authenticated = isAuthenticated(request);
  
  if (isProtectedRoute(pathname) && !authenticated) {
    // Redirect to login page if accessing protected route without authentication
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  if (isPublicRoute(pathname) && authenticated) {
    // Redirect to dashboard if accessing public route while authenticated
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  // Handle root path redirect to dashboard for authenticated users
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/';
  if (pathWithoutLocale === '/' && authenticated) {
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  // Apply internationalization middleware for all other cases
  return intlMiddleware(request);
}

export const config = {
  // Match all paths except static files and API routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, etc. (static files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.gif$|.*\\.ico$|.*\\.css$|.*\\.js$).*)',
  ],
};
