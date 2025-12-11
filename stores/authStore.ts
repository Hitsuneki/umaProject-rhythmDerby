import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  username: string;
  currency_balance: number;
  createdAt: number;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  register: (email: string, username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  fetchUser: () => Promise<void>;
  updateBalance: (newBalance: number) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      fetchUser: async () => {
        try {
          const res = await fetch('/api/me');
          if (!res.ok) {
            // If unauthorized, clear user state
            if (res.status === 401) {
              set({ user: null, isAuthenticated: false });
            }
            return;
          }

          const data = await res.json();
          set((state) => ({
            user: state.user ? {
              ...state.user,
              currency_balance: data.currency_balance,
              username: data.username,
              email: data.email,
            } : {
              id: data.id,
              username: data.username,
              email: data.email,
              currency_balance: data.currency_balance,
              createdAt: Date.now(),
            },
            isAuthenticated: true,
          }));
        } catch (error) {
          console.error('Failed to fetch user:', error);
        }
      },

      updateBalance: (newBalance: number) => {
        set((state) => ({
          user: state.user ? { ...state.user, currency_balance: newBalance } : null,
        }));
      },

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
          currency_balance: data.user.currency_balance || 0,
          createdAt: Date.now(),
        };

        set({ user, isAuthenticated: true });

        // Fetch latest user data to ensure currency_balance is up to date
        get().fetchUser();

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
          currency_balance: data.user.currency_balance || 0,
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