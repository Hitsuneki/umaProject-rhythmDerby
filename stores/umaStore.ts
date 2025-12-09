import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Uma } from '@/types';

const ENERGY_REGEN_RATE = 1; // 1 energy point
const ENERGY_REGEN_INTERVAL = 5 * 60 * 1000; // 5 minutes in ms

interface UmaStore {
  umas: Uma[];
  selectedUmaId: string | null;
  loading: boolean;
  error: string | null;
  fetchUmas: () => Promise<void>;
  setUmas: (umas: Uma[]) => void;
  addUma: (uma: Omit<Uma, 'id' | 'createdAt' | 'lastEnergyUpdate' | 'copiesOwned' | 'bondShards' | 'bondRank' | 'limitBreakLevel' | 'maxLimitBreak'>) => void;
  addOrProcessDuplicate: (uma: Omit<Uma, 'id' | 'createdAt' | 'lastEnergyUpdate' | 'copiesOwned' | 'bondShards' | 'bondRank' | 'limitBreakLevel' | 'maxLimitBreak'>, rarity: string) => { isDuplicate: boolean; shardsGained?: number; limitBreakGained?: boolean };
  updateUma: (id: string, updates: Partial<Uma>) => void;
  deleteUma: (id: string) => void;
  selectUma: (id: string | null) => void;
  getUmaById: (id: string) => Uma | undefined;
  regenerateEnergy: (id: string) => void;
  getTimeToNextEnergy: (id: string) => number;
  addBondShards: (id: string, amount: number) => void;
  upgradeBondRank: (id: string) => boolean;
  applyLimitBreak: (id: string) => boolean;
}

export const useUmaStore = create<UmaStore>()(
  persist(
    (set, get) => ({
      umas: [],
      selectedUmaId: null,
      loading: false,
      error: null,

      fetchUmas: async () => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/uma');
          if (!response.ok) {
            throw new Error('Failed to fetch characters');
          }
          const data = await response.json();
          set({ umas: data, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load characters',
            loading: false 
          });
        }
      },

      setUmas: (umas) => {
        set({ umas });
      },

      addUma: (uma) => {
        const newUma: Uma = {
          ...uma,
          id: `uma-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
          lastEnergyUpdate: Date.now(),
          copiesOwned: 1,
          bondShards: 0,
          bondRank: 0,
          limitBreakLevel: 0,
          maxLimitBreak: 5,
        };
        set((state) => ({ umas: [...state.umas, newUma] }));
      },

      addOrProcessDuplicate: (uma, rarity) => {
        const state = get();
        // Check if Uma with same name and trait already exists
        const existingUma = state.umas.find(
          (u) => u.name === uma.name && u.trait === uma.trait
        );

        if (existingUma) {
          // It's a duplicate!
          const shardAmounts: Record<string, number> = {
            common: 5,
            rare: 10,
            epic: 25,
            legendary: 50,
          };

          const shardsGained = shardAmounts[rarity] || 5;

          // Check if we can apply limit break
          if (existingUma.limitBreakLevel < existingUma.maxLimitBreak) {
            // Apply limit break
            set((state) => ({
              umas: state.umas.map((u) =>
                u.id === existingUma.id
                  ? {
                      ...u,
                      copiesOwned: u.copiesOwned + 1,
                      limitBreakLevel: u.limitBreakLevel + 1,
                      bondShards: u.bondShards + shardsGained,
                    }
                  : u
              ),
            }));

            return { isDuplicate: true, shardsGained, limitBreakGained: true };
          } else {
            // Max limit break reached, just add shards
            set((state) => ({
              umas: state.umas.map((u) =>
                u.id === existingUma.id
                  ? {
                      ...u,
                      copiesOwned: u.copiesOwned + 1,
                      bondShards: u.bondShards + shardsGained,
                    }
                  : u
              ),
            }));

            return { isDuplicate: true, shardsGained, limitBreakGained: false };
          }
        } else {
          // New Uma
          get().addUma(uma);
          return { isDuplicate: false };
        }
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

      addBondShards: (id, amount) => {
        set((state) => ({
          umas: state.umas.map((u) =>
            u.id === id ? { ...u, bondShards: u.bondShards + amount } : u
          ),
        }));
      },

      upgradeBondRank: (id) => {
        const uma = get().umas.find((u) => u.id === id);
        if (!uma) return false;

        // Cost increases with rank: 10, 20, 30, 40, 50 shards per rank
        const costPerRank = (uma.bondRank + 1) * 10;

        if (uma.bondShards >= costPerRank) {
          set((state) => ({
            umas: state.umas.map((u) =>
              u.id === id
                ? {
                    ...u,
                    bondShards: u.bondShards - costPerRank,
                    bondRank: u.bondRank + 1,
                  }
                : u
            ),
          }));
          return true;
        }

        return false;
      },

      applyLimitBreak: (id) => {
        const uma = get().umas.find((u) => u.id === id);
        if (!uma || uma.limitBreakLevel >= uma.maxLimitBreak) return false;

        set((state) => ({
          umas: state.umas.map((u) =>
            u.id === id
              ? {
                  ...u,
                  limitBreakLevel: u.limitBreakLevel + 1,
                  level: u.level + 5, // Increase max level cap
                }
              : u
          ),
        }));

        return true;
      },
    }),
    {
      name: 'uma-storage',
    }
  )
);