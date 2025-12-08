import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Item, InventoryItem, ItemType, Rarity } from '@/types';

// Predefined items
const ITEMS: Item[] = [
  {
    id: 'energy-drink',
    name: 'Energy Drink',
    type: 'energy_drink',
    description: 'Restores 50 energy points',
    rarity: 'common',
    effect: { type: 'restore_energy', value: 50 },
  },
  {
    id: 'mega-energy-drink',
    name: 'Mega Energy Drink',
    type: 'energy_drink',
    description: 'Fully restores energy',
    rarity: 'rare',
    effect: { type: 'restore_energy', value: 100 },
  },
  {
    id: 'training-charm',
    name: 'Training Charm',
    type: 'training_charm',
    description: '+10% training quality for next session',
    rarity: 'rare',
    effect: { type: 'training_boost', value: 10 },
  },
  {
    id: 'golden-charm',
    name: 'Golden Training Charm',
    type: 'training_charm',
    description: '+25% training quality for next session',
    rarity: 'epic',
    effect: { type: 'training_boost', value: 25 },
  },
  {
    id: 'race-ticket',
    name: 'Race Ticket',
    type: 'race_ticket',
    description: 'Entry ticket for special races',
    rarity: 'common',
    effect: { type: 'race_entry' },
  },
];

interface InventoryStore {
  inventory: InventoryItem[];
  activeBoost: { type: string; value: number } | null;
  addItem: (itemId: string, quantity?: number) => void;
  removeItem: (itemId: string, quantity?: number) => boolean;
  useItem: (itemId: string, umaId?: string) => boolean;
  getItem: (itemId: string) => Item | undefined;
  getInventoryItem: (itemId: string) => InventoryItem | undefined;
  getAllItems: () => Item[];
  clearActiveBoost: () => void;
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      inventory: [
        { itemId: 'energy-drink', quantity: 3 },
        { itemId: 'training-charm', quantity: 1 },
      ],
      activeBoost: null,

      addItem: (itemId, quantity = 1) => {
        set((state) => {
          const existing = state.inventory.find((i) => i.itemId === itemId);
          
          if (existing) {
            return {
              inventory: state.inventory.map((i) =>
                i.itemId === itemId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }

          return {
            inventory: [...state.inventory, { itemId, quantity }],
          };
        });
      },

      removeItem: (itemId, quantity = 1) => {
        const existing = get().inventory.find((i) => i.itemId === itemId);
        
        if (!existing || existing.quantity < quantity) {
          return false;
        }

        set((state) => ({
          inventory: state.inventory
            .map((i) =>
              i.itemId === itemId
                ? { ...i, quantity: i.quantity - quantity }
                : i
            )
            .filter((i) => i.quantity > 0),
        }));

        return true;
      },

      useItem: (itemId, umaId) => {
        const item = ITEMS.find((i) => i.id === itemId);
        if (!item) return false;

        const removed = get().removeItem(itemId, 1);
        if (!removed) return false;

        // Apply effect based on item type
        if (item.effect.type === 'restore_energy' && umaId) {
          // This will be handled by the component calling this
          return true;
        } else if (item.effect.type === 'training_boost') {
          set({ activeBoost: { type: 'training', value: item.effect.value || 0 } });
          return true;
        } else if (item.effect.type === 'race_entry') {
          return true;
        }

        return false;
      },

      getItem: (itemId) => {
        return ITEMS.find((i) => i.id === itemId);
      },

      getInventoryItem: (itemId) => {
        return get().inventory.find((i) => i.itemId === itemId);
      },

      getAllItems: () => {
        return ITEMS;
      },

      clearActiveBoost: () => {
        set({ activeBoost: null });
      },
    }),
    {
      name: 'inventory-storage',
    }
  )
);