/**
 * Home Page Component
 * Redirects authenticated users to dashboard, unauthenticated users to login
 */

'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function HomePage() {
  const { isAuthenticated, isLoading, initializeAuth } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  // Initialize authentication state on mount
  useEffect(() => {
    const init = async () => {
      await initializeAuth();
    };
    init();
  }, [initializeAuth]);

  // Handle redirects based on authentication status
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Redirect to dashboard if authenticated
        router.replace(`/${locale}/dashboard`);
      } else {
        // Redirect to login if not authenticated
        router.replace(`/${locale}/login`);
      }
    }
  }, [isAuthenticated, isLoading, router, locale]);

  // Show loading while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
