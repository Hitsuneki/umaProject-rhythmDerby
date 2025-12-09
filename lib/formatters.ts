import type { Difficulty, Rank, HitJudgment, MusicGenre, CharacterRole } from '@/types/rhythm';

export const formatDifficulty = (difficulty: Difficulty): string => {
  const map: Record<Difficulty, string> = {
    easy: 'EASY',
    normal: 'NORMAL',
    hard: 'HARD',
    expert: 'EXPERT'
  };
  return map[difficulty];
};

export const formatRank = (rank: Rank): string => {
  return rank; // Already uppercase single letter
};

export const formatScore = (score: number): string => {
  return score.toLocaleString('en-US');
};

export const formatAccuracy = (accuracy: number): string => {
  return `${accuracy.toFixed(1)}%`;
};

export const formatBPM = (bpm: number): string => {
  return `${bpm} BPM`;
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatCombo = (combo: number): string => {
  return `${combo}x`;
};

export const formatGenre = (genre: MusicGenre): string => {
  const map: Record<MusicGenre, string> = {
    electronic: 'Electronic',
    rock: 'Rock',
    pop: 'Pop',
    classical: 'Classical',
    jazz: 'Jazz',
    metal: 'Metal'
  };
  return map[genre];
};

export const formatRole = (role: CharacterRole): string => {
  const map: Record<CharacterRole, string> = {
    rhythm_specialist: 'Rhythm Specialist',
    combo_master: 'Combo Master',
    accuracy_expert: 'Accuracy Expert',
    speed_demon: 'Speed Demon'
  };
  return map[role];
};

export const formatHitJudgment = (judgment: HitJudgment): string => {
  const map: Record<HitJudgment, string> = {
    perfect: 'PERFECT',
    great: 'GREAT',
    good: 'GOOD',
    miss: 'MISS'
  };
  return map[judgment];
};