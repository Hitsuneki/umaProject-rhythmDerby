export interface RacingGameState {
  currentLane: number;
  position: number;
  totalPlayers: number;
  progress: number;
  goodRhythm: number;
  offBeatClicks: number;
  isOnBeat: boolean;
  beatProgress: number;
  gameActive: boolean;
  raceTime: number;
}

export interface RacingOpponent {
  id: number;
  name: string;
  avatar: string;
  lane: number;
  position?: number;
}

export interface RacingUma {
  name: string;
  level: number;
  stats: {
    speed: number;
    stamina: number;
    technique: number;
  };
  distance: string;
  avatar: string;
}

export interface BeatFeedback {
  type: 'good' | 'miss';
  timestamp: number;
  lane?: number;
}

export interface RaceStats {
  accuracy: number;
  time: number;
  position: number;
  goodRhythm: number;
  offBeatClicks: number;
}

export interface RaceConfig {
  distance: string;
  duration: number;
  beatInterval: number;
  sweetZoneSize: number;
}

export interface Opponent {
  id: number;
  name: string;
  avatar: string;
  lane: number;
  stats: {
    speed: number;
    stamina: number;
    technique: number;
  };
}

export interface RaceResult {
  placement: number;
  score: number;
  time: number;
  accuracy: number;
  stats: RaceStats;
}
