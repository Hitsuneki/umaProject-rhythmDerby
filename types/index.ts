export type Temperament = 'calm' | 'energetic' | 'stubborn' | 'gentle';
export type Style = 'runner' | 'leader' | 'chaser' | 'closer';
export type Trait = 'speed_boost' | 'stamina_regen' | 'technique_master' | 'all_rounder';
export type SessionType = 'speed' | 'stamina' | 'technique' | 'mixed';
export type DistanceType = '1200m' | '1600m' | '2000m' | '2400m';
export type ItemType = 'energy_drink' | 'training_charm' | 'race_ticket';
export type GachaRewardType = 'uma' | 'item';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Uma {
  id: string;
  name: string;
  level: number;
  speed: number;
  stamina: number;
  technique: number;
  temperament: Temperament;
  style: Style;
  trait: Trait;
  energy: number;
  maxEnergy: number;
  lastEnergyUpdate: number;
  comfortZone: number;
  createdAt: number;
}

export interface TrainingLog {
  id: string;
  umaId: string;
  sessionType: SessionType;
  quality: number;
  statGains: {
    speed: number;
    stamina: number;
    technique: number;
  };
  timestamp: number;
}

export interface Race {
  id: string;
  umaId: string;
  distanceType: DistanceType;
  placement: number;
  score: number;
  timestamp: number;
}

export interface RaceParticipant {
  raceId: string;
  umaId: string;
  phaseQuality: number[];
  chargesUsed: number;
}

export interface CurrencyTransaction {
  id: string;
  amount: number;
  reason: string;
  timestamp: number;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  rarity: Rarity;
  effect: {
    type: 'restore_energy' | 'training_boost' | 'race_entry';
    value?: number;
  };
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

export interface GachaPoolEntry {
  id: string;
  rarity: Rarity;
  rewardType: GachaRewardType;
  rewardId: string;
  weight: number;
}

export interface GachaPull {
  id: string;
  rewardType: GachaRewardType;
  rewardId: string;
  rarity: Rarity;
  timestamp: number;
}