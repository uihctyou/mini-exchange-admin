/**
 * Global Navigation Bar Component
 * Provides consistent navigation across all protected pages
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Users,
  BarChart3,
  Shield,
  FileText,
  Globe,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  onMenuToggle?: (isOpen: boolean) => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const { user, logout, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push(`/${locale}/login`);
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      router.push(`/${locale}/login`);
    }
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    onMenuToggle?.(newState);
  };

  const navigation = [
    {
      name: t('nav.dashboard', { default: 'Dashboard' }),
      href: `/${locale}/dashboard`,
      icon: Home,
    },
    {
      name: t('nav.users', { default: 'Users' }),
      href: `/${locale}/users`,
      icon: Users,
    },
    {
      name: t('nav.orders', { default: 'Orders' }),
      href: `/${locale}/orders`,
      icon: FileText,
    },
    {
      name: t('nav.markets', { default: 'Markets' }),
      href: `/${locale}/markets`,
      icon: BarChart3,
    },
    {
      name: t('nav.system', { default: 'System' }),
      href: `/${locale}/system`,
      icon: Settings,
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 mr-3">
                <span className="text-sm font-bold text-white">ME</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
                Mini Exchange Admin
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                    onClick={() => router.push(item.href)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                );
              })}
            </nav>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative" ref={langMenuRef}>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              >
                <Globe className="h-4 w-4 mr-1" />
                <span className="uppercase">{locale}</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
              
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      router.push('/en/dashboard');
                      setIsLangMenuOpen(false);
                    }}
                  >
                    English
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      router.push('/zh-TW/dashboard');
                      setIsLangMenuOpen(false);
                    }}
                  >
                    繁體中文
                  </button>
                </div>
              )}
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2 p-2"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10 border">
                  <div className="px-4 py-2 border-b">
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      router.push(`/${locale}/profile`);
                      setIsUserMenuOpen(false);
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {t('nav.profile', { default: 'Profile' })}
                  </button>
                  <button
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      router.push(`/${locale}/settings`);
                      setIsUserMenuOpen(false);
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {t('nav.settings', { default: 'Settings' })}
                  </button>
                  <button
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      router.push(`/${locale}/security`);
                      setIsUserMenuOpen(false);
                    }}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {t('nav.security', { default: 'Security' })}
                  </button>
                  <div className="border-t">
                    <button
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        handleLogout();
                        setIsUserMenuOpen(false);
                      }}
                      disabled={isLoading}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('nav.logout', { default: 'Logout' })}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className="w-full justify-start text-gray-600 hover:text-gray-900"
                    onClick={() => {
                      router.push(item.href);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </Button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
