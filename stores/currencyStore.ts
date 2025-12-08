import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CurrencyTransaction } from '@/types';

interface CurrencyStore {
  balance: number;
  transactions: CurrencyTransaction[];
  addCurrency: (amount: number, reason: string) => void;
  spendCurrency: (amount: number, reason: string) => boolean;
  getTransactions: () => CurrencyTransaction[];
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      balance: 1000, // Starting balance
      transactions: [],

      addCurrency: (amount, reason) => {
        const transaction: CurrencyTransaction = {
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          amount,
          reason,
          timestamp: Date.now(),
        };
        
        set((state) => ({
          balance: state.balance + amount,
          transactions: [...state.transactions, transaction],
        }));
      },

      spendCurrency: (amount, reason) => {
        const currentBalance = get().balance;
        
        if (currentBalance < amount) {
          return false;
        }

        const transaction: CurrencyTransaction = {
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          amount: -amount,
          reason,
          timestamp: Date.now(),
        };

        set((state) => ({
          balance: state.balance - amount,
          transactions: [...state.transactions, transaction],
        }));

        return true;
      },

      getTransactions: () => {
        return get().transactions.sort((a, b) => b.timestamp - a.timestamp);
      },
    }),
    {
      name: 'currency-storage',
    }
  )
);