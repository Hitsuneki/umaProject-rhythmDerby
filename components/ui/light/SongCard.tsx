import { motion } from 'framer-motion';
import { Play, Star, Clock, Zap } from 'lucide-react';

interface SongCardProps {
  title: string;
  artist: string;
  bpm: number;
  duration: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  rating: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export function SongCard({
  title,
  artist,
  bpm,
  duration,
  difficulty,
  rating,
  isSelected = false,
  onClick
}: SongCardProps) {
  const difficultyColors = {
    easy: 'text-green-600',
    normal: 'text-yellow-600',
    hard: 'text-red-600',
    expert: 'text-purple-600',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`song-card p-4 cursor-pointer ${isSelected ? 'selected' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h3 className="display-font text-base text-gray-900 mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-600">{artist}</p>
        </div>
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-blue-600" />
          <span className={`tech-mono text-xs font-bold ${difficultyColors[difficulty]}`}>
            {difficulty.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-gray-500" />
            <span className="tech-mono text-gray-600">{bpm} BPM</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="tech-mono text-gray-600">{duration}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-500" />
          <span className="tech-mono text-gray-700">{rating.toFixed(1)}</span>
        </div>
      </div>
    </motion.div>
  );
}
}: SongCardProps) {
  const difficultyColors = {
    easy: 'text-green-600',
    normal: 'text-yellow-600',
    hard: 'text-red-600',
    expert: 'text-purple-600',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`song-card p-4 cursor-pointer ${isSelected ? 'selected' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h3 className="display-font text-base text-gray-900 mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-600">{artist}</p>
        </div>
        <div className="flex items-center gap-2">
