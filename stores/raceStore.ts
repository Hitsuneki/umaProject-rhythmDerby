import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Race, RaceParticipant, DistanceType } from '@/types';
import { useCurrencyStore } from './currencyStore';

interface RaceStore {
  races: Race[];
  participants: RaceParticipant[];
  activeRace: {
    umaId: string;
    distanceType: DistanceType;
    startTime: number;
  } | null;
  addRace: (race: Omit<Race, 'id' | 'timestamp'>, participant: Omit<RaceParticipant, 'raceId'>) => void;
  getRacesByUmaId: (umaId: string) => Race[];
  getLatestRace: (umaId: string) => Race | undefined;
  getParticipantByRaceId: (raceId: string) => RaceParticipant | undefined;
  startRace: (umaId: string, distanceType: DistanceType) => void;
  endRace: () => void;
  deleteRace: (id: string) => void;
}

export const useRaceStore = create<RaceStore>()(
  persist(
    (set, get) => ({
      races: [],
      participants: [],
      activeRace: null,

      addRace: (race, participant) => {
        const raceId = `race-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newRace: Race = {
          ...race,
          id: raceId,
          timestamp: Date.now(),
        };
        const newParticipant: RaceParticipant = {
          ...participant,
          raceId,
        };
        set((state) => ({
          races: [...state.races, newRace],
          participants: [...state.participants, newParticipant],
        }));

        // Award currency based on placement
        const placementRewards = [100, 50, 25, 10]; // 1st, 2nd, 3rd, 4th
        const coinsEarned = placementRewards[race.placement - 1] || 5;
        useCurrencyStore.getState().addCurrency(
          coinsEarned,
          `Race ${race.placement === 1 ? 'victory' : `${race.placement}${race.placement === 2 ? 'nd' : race.placement === 3 ? 'rd' : 'th'} place`}`
        );
      },

      getRacesByUmaId: (umaId) => {
        return get().races.filter((race) => race.umaId === umaId);
      },

      getLatestRace: (umaId) => {
        const races = get().races.filter((race) => race.umaId === umaId);
        return races.sort((a, b) => b.timestamp - a.timestamp)[0];
      },

      getParticipantByRaceId: (raceId) => {
        return get().participants.find((p) => p.raceId === raceId);
      },

      startRace: (umaId, distanceType) => {
        set({
          activeRace: {
            umaId,
            distanceType,
            startTime: Date.now(),
          },
        });
      },

      endRace: () => {
        set({ activeRace: null });
      },

      deleteRace: (id) => {
        set((state) => ({
          races: state.races.filter((race) => race.id !== id),
          participants: state.participants.filter((p) => p.raceId !== id),
        }));
      },
    }),
    {
      name: 'race-storage',
    }
  )
);