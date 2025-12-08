import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TrainingLog, SessionType } from '@/types';
import { useCurrencyStore } from './currencyStore';

interface TrainingStore {
  logs: TrainingLog[];
  activeSession: {
    umaId: string;
    sessionType: SessionType;
    startTime: number;
  } | null;
  addLog: (log: Omit<TrainingLog, 'id' | 'timestamp'>) => void;
  getLogsByUmaId: (umaId: string) => TrainingLog[];
  getLatestLog: (umaId: string) => TrainingLog | undefined;
  startSession: (umaId: string, sessionType: SessionType) => void;
  endSession: () => void;
  deleteLog: (id: string) => void;
}

export const useTrainingStore = create<TrainingStore>()(
  persist(
    (set, get) => ({
      logs: [],
      activeSession: null,

      addLog: (log) => {
        const newLog: TrainingLog = {
          ...log,
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };
        set((state) => ({ logs: [...state.logs, newLog] }));

        // Award currency based on quality
        const coinsEarned = Math.floor(log.quality / 10);
        if (coinsEarned > 0) {
          useCurrencyStore.getState().addCurrency(coinsEarned, `Training session (${log.quality}% quality)`);
        }
      },

      getLogsByUmaId: (umaId) => {
        return get().logs.filter((log) => log.umaId === umaId);
      },

      getLatestLog: (umaId) => {
        const logs = get().logs.filter((log) => log.umaId === umaId);
        return logs.sort((a, b) => b.timestamp - a.timestamp)[0];
      },

      startSession: (umaId, sessionType) => {
        set({
          activeSession: {
            umaId,
            sessionType,
            startTime: Date.now(),
          },
        });
      },

      endSession: () => {
        set({ activeSession: null });
      },

      deleteLog: (id) => {
        set((state) => ({
          logs: state.logs.filter((log) => log.id !== id),
        }));
      },
    }),
    {
      name: 'training-storage',
    }
  )
);