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
  setClientAuthToken,
  removeClientAuthToken,
} from '@/lib/auth';
import { httpClient } from '@/lib/http';

// Mock users for development (remove in production)
const MOCK_USERS = {
  'admin@example.com': {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    roles: [UserRole.ADMIN],
    isActive: true,
    createdAt: new Date(),
  },
  'operator@example.com': {
    id: '2',
    email: 'operator@example.com',
    name: 'Operator User',
    roles: [UserRole.OPERATOR],
    isActive: true,
    createdAt: new Date(),
  },
  'auditor@example.com': {
    id: '3',
    email: 'auditor@example.com',
    name: 'Auditor User',
    roles: [UserRole.AUDITOR],
    isActive: true,
    createdAt: new Date(),
  },
};

const MOCK_PASSWORDS = {
  'admin@example.com': 'admin123',
  'operator@example.com': 'operator123',
  'auditor@example.com': 'auditor123',
};

// Authentication state interface
interface AuthState {
  // State
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => boolean;
}

// Mock login function (replace with real API call)
async function mockLogin(email: string, password: string): Promise<{ user: User; token: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockUser = MOCK_USERS[email as keyof typeof MOCK_USERS];
  const mockPassword = MOCK_PASSWORDS[email as keyof typeof MOCK_PASSWORDS];
  
  if (!mockUser || mockPassword !== password) {
    throw new Error('Invalid email or password');
  }
  
  // Generate a mock JWT token
  const mockToken = `mock-jwt-token-${Date.now()}`;
  
  return {
    user: mockUser,
    token: mockToken,
  };
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
      login: async (email: string, password: string, remember = false) => {
        set({ isLoading: true });
        
        try {
          // For development, use mock login
          const { user, token } = await mockLogin(email, password);
          
          // In production, this would be:
          // const response = await httpClient.post('/auth/login', {
          //   email,
          //   password,
          // }, { skipAuth: true });
          
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
          
          // In production, also call logout API
          // await authLogout();
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
      refreshUser: () => {
        try {
          // In production, this would validate the token and get user data
          const stored = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
          
          if (stored && stored.startsWith('mock-jwt-token')) {
            // For mock, get the first user as logged in
            const firstUser = Object.values(MOCK_USERS)[0];
            set({
              user: firstUser,
              isAuthenticated: true,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
            });
          }
        } catch (error) {
          console.error('Error refreshing user:', error);
          set({
            user: null,
            isAuthenticated: false,
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
  const initializeAuth = () => {
    if (typeof window !== 'undefined') {
      auth.refreshUser();
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
