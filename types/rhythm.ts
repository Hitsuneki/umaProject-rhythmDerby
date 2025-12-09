// Difficulty levels
export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';

// Game modes
export type GameMode = 'story' | 'freeplay' | 'challenge' | 'training';

// Rank grades
export type Rank = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

// Hit judgments
export type HitJudgment = 'perfect' | 'great' | 'good' | 'miss';

// Character roles
export type CharacterRole = 'rhythm_specialist' | 'combo_master' | 'accuracy_expert' | 'speed_demon';

// Music genres
export type MusicGenre = 'electronic' | 'rock' | 'pop' | 'classical' | 'jazz' | 'metal';

// Screen states
export type ScreenState = 'main_menu' | 'song_selection' | 'character_selection' | 'gameplay' | 'results' | 'settings' | 'paused';

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

// Card variants
export type CardVariant = 'default' | 'selected' | 'disabled';

// Song data types
export interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  bpm: number;
  length: number; // in seconds
  genre: MusicGenre;
  difficulties: {
    easy?: DifficultyData;
    normal?: DifficultyData;
    hard?: DifficultyData;
    expert?: DifficultyData;
  };
  bestScore?: number;
  bestRank?: Rank;
  bestAccuracy?: number;
}

export interface DifficultyData {
  level: number; // 1-10
  noteCount: number;
  available: boolean;
}

// Character data types
export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  level: number;
  avatar: string;
  render: string; // Large character image
  stats: {
    accuracy: number; // 0-100
    speed: number; // 0-100
    stamina: number; // 0-100
    skill: number; // 0-100;
  };
  abilities: string[];
  isActive: boolean;
}

// Gameplay data types
export interface GameplayState {
  currentCombo: number;
  maxCombo: number;
  score: number;
  health: number; // 0-100
  skillMeter: number; // 0-100
  timeRemaining: number; // in seconds
  hitCounts: {
    perfect: number;
    great: number;
    good: number;
    miss: number;
  };
}

// Results data types
export interface GameResults {
  songId: string;
  difficulty: Difficulty;
  rank: Rank;
  score: number;
  accuracy: number;
  maxCombo: number;
  hitCounts: {
    perfect: number;
    great: number;
    good: number;
    miss: number;
  };
  timestamp: Date;
}

// Settings data types
export interface GameSettings {
  audio: {
    masterVolume: number; // 0-100
    musicVolume: number;
    sfxVolume: number;
  };
  video: {
    resolution: string;
    fullscreen: boolean;
    vsync: boolean;
    frameRate: number;
  };
  gameplay: {
    noteSpeed: number; // 1-10
    hitWindow: 'strict' | 'normal' | 'lenient';
    showJudgment: boolean;
    showCombo: boolean;
  };
  controls: {
    keyBindings: Record<string, string>;
  };
}

// UI State types
export interface UIState {
  currentScreen: ScreenState;
  selectedSongId: string | null;
  selectedCharacterId: string | null;
  selectedDifficulty: Difficulty | null;
  songFilter: MusicGenre | 'all';
  songSort: 'name' | 'bpm' | 'difficulty';
  isPaused: boolean;
  showSettings: boolean;
}