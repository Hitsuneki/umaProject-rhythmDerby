import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GachaPoolEntry, GachaPull, Rarity, GachaRewardType } from '@/types';

// Gacha pool configuration
const GACHA_POOL: GachaPoolEntry[] = [
  // Common Uma templates
  { id: 'uma-common-1', rarity: 'common', rewardType: 'uma', rewardId: 'template-runner', weight: 40 },
  { id: 'uma-common-2', rarity: 'common', rewardType: 'uma', rewardId: 'template-leader', weight: 40 },
  
  // Rare Uma templates
  { id: 'uma-rare-1', rarity: 'rare', rewardType: 'uma', rewardId: 'template-chaser', weight: 15 },
  { id: 'uma-rare-2', rarity: 'rare', rewardType: 'uma', rewardId: 'template-closer', weight: 15 },
  
  // Epic Uma templates
  { id: 'uma-epic-1', rarity: 'epic', rewardType: 'uma', rewardId: 'template-speedster', weight: 5 },
  { id: 'uma-epic-2', rarity: 'epic', rewardType: 'uma', rewardId: 'template-endurance', weight: 5 },
  
  // Legendary Uma templates
  { id: 'uma-legend-1', rarity: 'legendary', rewardType: 'uma', rewardId: 'template-champion', weight: 2 },
  
  // Items
  { id: 'item-energy', rarity: 'common', rewardType: 'item', rewardId: 'energy-drink', weight: 30 },
  { id: 'item-charm', rarity: 'rare', rewardType: 'item', rewardId: 'training-charm', weight: 10 },
  { id: 'item-golden', rarity: 'epic', rewardType: 'item', rewardId: 'golden-charm', weight: 3 },
];

const UMA_TEMPLATES = {
  'template-runner': { name: 'Swift Runner', style: 'runner', temperament: 'energetic', trait: 'speed_boost', baseStats: { speed: 60, stamina: 50, technique: 45 } },
  'template-leader': { name: 'Pace Leader', style: 'leader', temperament: 'calm', trait: 'all_rounder', baseStats: { speed: 55, stamina: 55, technique: 50 } },
  'template-chaser': { name: 'Determined Chaser', style: 'chaser', temperament: 'stubborn', trait: 'stamina_regen', baseStats: { speed: 50, stamina: 60, technique: 50 } },
  'template-closer': { name: 'Final Closer', style: 'closer', temperament: 'gentle', trait: 'technique_master', baseStats: { speed: 55, stamina: 50, technique: 60 } },
  'template-speedster': { name: 'Lightning Bolt', style: 'runner', temperament: 'energetic', trait: 'speed_boost', baseStats: { speed: 70, stamina: 50, technique: 55 } },
  'template-endurance': { name: 'Iron Will', style: 'chaser', temperament: 'stubborn', trait: 'stamina_regen', baseStats: { speed: 50, stamina: 70, technique: 55 } },
  'template-champion': { name: 'Ultimate Champion', style: 'leader', temperament: 'calm', trait: 'all_rounder', baseStats: { speed: 70, stamina: 70, technique: 70 } },
};

interface GachaStore {
  history: GachaPull[];
  pull: () => GachaPull;
  multiPull: (count: number) => GachaPull[];
  getHistory: () => GachaPull[];
  getTemplate: (templateId: string) => any;
}

export const useGachaStore = create<GachaStore>()(
  persist(
    (set, get) => ({
      history: [],

      pull: () => {
        // Calculate total weight
        const totalWeight = GACHA_POOL.reduce((sum, entry) => sum + entry.weight, 0);
        
        // Random selection
        let random = Math.random() * totalWeight;
        let selectedEntry: GachaPoolEntry | null = null;

        for (const entry of GACHA_POOL) {
          random -= entry.weight;
          if (random <= 0) {
            selectedEntry = entry;
            break;
          }
        }

        if (!selectedEntry) {
          selectedEntry = GACHA_POOL[0];
        }

        const pull: GachaPull = {
          id: `pull-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          rewardType: selectedEntry.rewardType,
          rewardId: selectedEntry.rewardId,
          rarity: selectedEntry.rarity,
          timestamp: Date.now(),
        };

        set((state) => ({
          history: [...state.history, pull],
        }));

        return pull;
      },

      multiPull: (count) => {
        const pulls: GachaPull[] = [];
        for (let i = 0; i < count; i++) {
          pulls.push(get().pull());
        }
        return pulls;
      },

      getHistory: () => {
        return get().history.sort((a, b) => b.timestamp - a.timestamp);
      },

      getTemplate: (templateId) => {
        return UMA_TEMPLATES[templateId as keyof typeof UMA_TEMPLATES];
      },
    }),
    {
      name: 'gacha-storage',
    }
  )
);