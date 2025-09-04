/**
 * Enhanced Authentication hook using Zustand for state management
 * Handles user authentication state, login, logout, and token management
 * with improved error handling and type safety
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/lib/rbac';
import {
  getCurrentUser,
  logout as authLogout,
  isAuthenticated,
  isTokenExpired,
  setClientAuthToken,
  removeClientAuthToken,
} from '@/lib/auth';
import { API } from '@/lib/api';

// Authentication error types
export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

// Authentication result types
export interface LoginResult {
  success: boolean;
  error?: AuthError;
}

// Authentication state interface
interface AuthState {
  // State
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  initialized: boolean;

  // Actions
  login: (
    usernameOrEmail: string,
    password: string,
    remember?: boolean
  ) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  checkAuth: () => boolean;
}

// Create the authentication store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      initialized: false,

      // Login action with better error handling
      login: async (
        usernameOrEmail: string,
        password: string,
        remember = false
      ): Promise<LoginResult> => {
        set({ isLoading: true, error: null });

        try {
          const response = await API.auth.login({ usernameOrEmail, password });

          if (response.status === 'error') {
            const error: AuthError = {
              code: response.error?.code || 'LOGIN_FAILED',
              message: response.error?.message || 'Login failed',
              details: response.error?.details,
            };
            set({ isLoading: false, error });
            return { success: false, error };
          }

          if (!response.body) {
            const error: AuthError = {
              code: 'NO_DATA',
              message: 'No data received from login',
            };
            set({ isLoading: false, error });
            return { success: false, error };
          }

          const { user, token } = response.body;

          // Store token (client-side for Direct mode)
          setClientAuthToken(token, remember);

          // Update state
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const authError: AuthError = {
            code: 'NETWORK_ERROR',
            message: error instanceof Error ? error.message : 'Network error occurred',
          };
          set({ isLoading: false, error: authError });
          return { success: false, error: authError };
        }
      },

      // Improved logout action
      logout: async () => {
        set({ isLoading: true, error: null });

        try {
          // Call logout API (don't wait for response)
          authLogout().catch(console.error);
        } catch (error) {
          console.error('Logout API error:', error);
        } finally {
          // Always clear state and tokens
          removeClientAuthToken();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Enhanced user refresh with better error handling
      refreshUser: async () => {
        const { initialized } = get();
        if (!initialized) return;

        set({ isLoading: true, error: null });

        try {
          // Check for stored token
          const stored =
            localStorage.getItem('access_token') ||
            sessionStorage.getItem('access_token');

          if (!stored || isTokenExpired(stored)) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          // Try to get current user from API
          const response = await API.auth.getCurrentUser();

          if (response.status === 'error') {
            // If API fails, try to get user from token
            const user = getCurrentUser();
            if (user) {
              set({
                user,
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              throw new Error(response.error?.message || 'Failed to get user');
            }
          } else {
            set({
              user: response.body,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Error refreshing user:', error);
          // Clear invalid tokens and state
          removeClientAuthToken();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: {
              code: 'REFRESH_FAILED',
              message: 'Failed to refresh user session',
            },
          });
        }
      },

      // Initialize authentication state
      initialize: async () => {
        if (typeof window === 'undefined') return;
        
        set({ isLoading: true });
        
        try {
          const stored =
            localStorage.getItem('access_token') ||
            sessionStorage.getItem('access_token');

          if (stored && !isTokenExpired(stored)) {
            // Try to get user info
            try {
              const response = await API.auth.getCurrentUser();
              if (response.status === 'success' && response.body) {
                set({
                  user: response.body,
                  isAuthenticated: true,
                  initialized: true,
                  isLoading: false,
                });
                return;
              }
            } catch (error) {
              console.error('Failed to get user from API:', error);
            }

            // Fallback to token-based user
            const user = getCurrentUser();
            if (user) {
              set({
                user,
                isAuthenticated: true,
                initialized: true,
                isLoading: false,
              });
              return;
            }
          }

          // No valid authentication found
          removeClientAuthToken();
          set({
            user: null,
            isAuthenticated: false,
            initialized: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({
            user: null,
            isAuthenticated: false,
            initialized: true,
            isLoading: false,
          });
        }
      },

      // Clear error state
      clearError: () => {
        set({ error: null });
      },

      // Set user manually
      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: user !== null,
        });
      },

      // Check authentication status
      checkAuth: () => {
        const state = get();
        return state.isAuthenticated && state.user !== null;
      },
    }),
    {
      name: 'auth-storage',
      // Only persist minimal state
      partialize: (state) => ({
        initialized: state.initialized,
      }),
    }
  )
);

// Enhanced custom hook for easier usage
export function useAuth() {
  const auth = useAuthStore();
  
  return {
    // State
    user: auth.user,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    error: auth.error,
    initialized: auth.initialized,
    
    // Actions
    login: auth.login,
    logout: auth.logout,
    refreshUser: auth.refreshUser,
    initialize: auth.initialize,
    clearError: auth.clearError,
    setUser: auth.setUser,
    checkAuth: auth.checkAuth,
    
    // Computed properties
    isReady: auth.initialized && !auth.isLoading,
  };
}

// Hook for checking specific permissions with better type safety
export function usePermission(permission: string) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return false;

  // Enhanced permission checking logic
  const hasPermission = user.roles.some((role) => {
    // Super admin has all permissions
    if (role === UserRole.SUPER_ADMIN) return true;
    
    // Check if role matches the permission (for simple permission model)
    // This should be enhanced based on your actual RBAC system
    return role === permission;
  });

  return hasPermission;
}

// Hook for checking specific roles with better type safety
export function useRole(role: UserRole | UserRole[]) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return false;

  const rolesToCheck = Array.isArray(role) ? role : [role];
  const hasRole = rolesToCheck.some((r) => user.roles.includes(r));

  return hasRole;
}

// Hook for admin check
export function useIsAdmin() {
  return useRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);
}

// Enhanced hook that provides authentication status with better UX
export function useAuthGuard() {
  const { isAuthenticated, isLoading, initialized, error } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    initialized,
    error,
    isReady: initialized && !isLoading,
    shouldRedirect: initialized && !isLoading && !isAuthenticated,
  };
}

// Hook for components that require authentication
export function useRequireAuth() {
  const auth = useAuthGuard();
  
  return {
    ...auth,
    // Additional helper properties
    canRender: auth.isAuthenticated && auth.isReady,
    showLoading: !auth.isReady,
  };
}
