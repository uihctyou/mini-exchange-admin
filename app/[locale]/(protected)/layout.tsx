/**
 * Protected Layout Component
 * Handles authentication check and provides common layout for protected pages
 */

'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Navbar } from '@/components/layout/navbar';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { isAuthenticated, isLoading, initialized, initialize } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  // Initialize authentication state on mount
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  // Redirect to login if not authenticated after initialization
  useEffect(() => {
    if (initialized && !isLoading && !isAuthenticated) {
      router.replace(`/${locale}/login`);
    }
  }, [initialized, isAuthenticated, isLoading, router, locale]);

  // Show loading while initializing or checking authentication
  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Render children for authenticated users with global navbar
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
