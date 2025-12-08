import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Uma } from '@/types';

const ENERGY_REGEN_RATE = 1; // 1 energy point
const ENERGY_REGEN_INTERVAL = 5 * 60 * 1000; // 5 minutes in ms

interface UmaStore {
  umas: Uma[];
  selectedUmaId: string | null;
  addUma: (uma: Omit<Uma, 'id' | 'createdAt' | 'lastEnergyUpdate'>) => void;
  updateUma: (id: string, updates: Partial<Uma>) => void;
  deleteUma: (id: string) => void;
  selectUma: (id: string | null) => void;
  getUmaById: (id: string) => Uma | undefined;
  regenerateEnergy: (id: string) => void;
  getTimeToNextEnergy: (id: string) => number;
}

export const useUmaStore = create<UmaStore>()(
  persist(
    (set, get) => ({
      umas: [],
      selectedUmaId: null,

      addUma: (uma) => {
        const newUma: Uma = {
          ...uma,
          id: `uma-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
          lastEnergyUpdate: Date.now(),
        };
        set((state) => ({ umas: [...state.umas, newUma] }));
      },

      updateUma: (id, updates) => {
        set((state) => ({
          umas: state.umas.map((uma) =>
            uma.id === id ? { ...uma, ...updates } : uma
          ),
        }));
      },

      deleteUma: (id) => {
        set((state) => ({
          umas: state.umas.filter((uma) => uma.id !== id),
          selectedUmaId: state.selectedUmaId === id ? null : state.selectedUmaId,
        }));
      },

      selectUma: (id) => {
        set({ selectedUmaId: id });
      },

      getUmaById: (id) => {
        return get().umas.find((uma) => uma.id === id);
      },

      regenerateEnergy: (id) => {
        const uma = get().umas.find((u) => u.id === id);
        if (!uma) return;

        const now = Date.now();
        const timeSinceLastUpdate = now - uma.lastEnergyUpdate;
        const intervalsElapsed = Math.floor(timeSinceLastUpdate / ENERGY_REGEN_INTERVAL);

        if (intervalsElapsed > 0) {
          const energyToAdd = intervalsElapsed * ENERGY_REGEN_RATE;
          const newEnergy = Math.min(uma.maxEnergy, uma.energy + energyToAdd);

          set((state) => ({
            umas: state.umas.map((u) =>
              u.id === id
                ? { ...u, energy: newEnergy, lastEnergyUpdate: now }
                : u
            ),
          }));
        }
      },

      getTimeToNextEnergy: (id) => {
        const uma = get().umas.find((u) => u.id === id);
        if (!uma || uma.energy >= uma.maxEnergy) return 0;

        const now = Date.now();
        const timeSinceLastUpdate = now - uma.lastEnergyUpdate;
        const timeToNext = ENERGY_REGEN_INTERVAL - (timeSinceLastUpdate % ENERGY_REGEN_INTERVAL);

        return Math.ceil(timeToNext / 1000); // Return in seconds
      },
    }),
    {
      name: 'uma-storage',
    }
  )
);