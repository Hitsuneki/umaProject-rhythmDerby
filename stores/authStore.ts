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
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  register: (email: string, username: string, password: string) => Promise<{ success: boolean; message?: string }>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (identifier: string, password: string) => {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password }),
        });

        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          return { success: false, message: error?.message || 'Login failed' };
        }

        const data = await res.json();
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          createdAt: Date.now(),
        };

        set({ user, isAuthenticated: true });
        return { success: true };
      },

      logout: () => {
        fetch('/api/auth/login', { method: 'DELETE' }).catch(() => undefined);
        set({ user: null, isAuthenticated: false });
      },

      register: async (email: string, username: string, password: string) => {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, username, password }),
        });

        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          return { success: false, message: error?.message || 'Registration failed' };
        }

        const data = await res.json();
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          createdAt: Date.now(),
        };

        set({ user, isAuthenticated: true });
        return { success: true };
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);