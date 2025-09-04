/**
 * Authentication hook using Zustand for state management
 * Handles user authentication state, login, logout, and token management
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

// Authentication state interface
interface AuthState {
  // State
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (usernameOrEmail: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
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

      // Login action
      login: async (usernameOrEmail: string, password: string, remember = false) => {
        set({ isLoading: true });
        
        try {
          const response = await API.auth.login({ usernameOrEmail, password });
          
          if (response.status === 'error') {
            throw new Error(response.error?.message || 'Login failed');
          }
          
          if (!response.body) {
            throw new Error('No data received from login');
          }
          
          const { user, token } = response.body;
          
          // Store token (client-side for Direct mode)
          setClientAuthToken(token, remember);
          
          // Update state
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });
        
        try {
          // Clear tokens
          removeClientAuthToken();
          
          // Call logout API
          await authLogout();
        } catch (error) {
          console.error('Logout error:', error);
        }
        
        // Clear state regardless of API call result
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Refresh user data from stored token
      refreshUser: async () => {
        set({ isLoading: true });
        
        try {
          // Check if we have a stored token
          const stored = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
          
          if (stored && !isTokenExpired(stored)) {
            try {
              // Try to get current user info from API
              const response = await API.auth.getCurrentUser();
              
              if (response.status === 'error') {
                throw new Error(response.error?.message || 'Failed to get user');
              }
              
              set({
                user: response.body,
                isAuthenticated: true,
                isLoading: false,
              });
            } catch (apiError) {
              // If API call fails, try to get user from token
              const user = getCurrentUser();
              if (user) {
                set({
                  user,
                  isAuthenticated: true,
                  isLoading: false,
                });
              } else {
                throw apiError;
              }
            }
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Error refreshing user:', error);
          // Clear invalid tokens
          removeClientAuthToken();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // Set user manually
      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: user !== null,
        });
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Check authentication status
      checkAuth: () => {
        const state = get();
        return state.isAuthenticated && state.user !== null;
      },
    }),
    {
      name: 'auth-storage',
      // Only persist authentication status, not user data
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Custom hook for easier usage
export function useAuth() {
  const auth = useAuthStore();
  
  // Initialize user from token on mount
  const initializeAuth = async () => {
    if (typeof window !== 'undefined') {
      await auth.refreshUser();
    }
  };

  return {
    ...auth,
    initializeAuth,
  };
}

// Hook for checking specific permissions
export function usePermission(permission: string) {
  const { user } = useAuth();
  
  // This would need to be implemented based on your RBAC system
  const hasPermission = user?.roles.some(role => 
    // Add your permission checking logic here
    true // Placeholder
  ) ?? false;
  
  return hasPermission;
}

// Hook for checking specific roles
export function useRole(role: UserRole) {
  const { user } = useAuth();
  
  const hasRole = user?.roles.includes(role) ?? false;
  
  return hasRole;
}

// Hook for admin check
export function useIsAdmin() {
  return useRole(UserRole.ADMIN) || useRole(UserRole.SUPER_ADMIN);
}

// Hook that redirects to login if not authenticated
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (typeof window !== 'undefined' && !isLoading && !isAuthenticated) {
    window.location.href = '/login';
  }
  
  return { isAuthenticated, isLoading };
}
