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
    easy: 'difficulty-easy',
    normal: 'difficulty-normal',
    hard: 'difficulty-hard',
    expert: 'difficulty-expert',
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
          <h3 className="display-font text-base text-(--text-primary) mb-1">
            {title}
          </h3>
          <p className="text-sm text-(--text-secondary)">{artist}</p>
        </div>
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-(--accent-primary)" />
          <span className={`tech-mono text-xs font-bold ${difficultyColors[difficulty]}`}>
            {difficulty.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-(--text-tertiary)" />
            <span className="tech-mono text-(--text-tertiary)">{bpm} BPM</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-(--text-tertiary)" />
            <span className="tech-mono text-(--text-tertiary)">{duration}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-(--accent-warning)" />
          <span className="tech-mono text-(--text-secondary)">{rating.toFixed(1)}</span>
        </div>
      </div>
    </motion.div>
  );
}
