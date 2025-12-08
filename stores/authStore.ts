import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: number;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Mock authentication - in production, this would call an API
        // For demo purposes, accept any email/password combination
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        
        const user: User = {
          id: `user-${Date.now()}`,
          email,
          username: email.split('@')[0],
          createdAt: Date.now(),
        };

        set({ user, isAuthenticated: true });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      register: async (email: string, username: string, password: string) => {
        // Mock registration - in production, this would call an API
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        
        const user: User = {
          id: `user-${Date.now()}`,
          email,
          username,
          createdAt: Date.now(),
        };

        set({ user, isAuthenticated: true });
        return true;
      },

      deleteAccount: async () => {
        // Mock account deletion - in production, this would call an API
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        
        // Clear user data
        set({ user: null, isAuthenticated: false });
        
        // In production, you would also clear all related data from other stores
        // For now, we'll just clear auth state
        return true;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);