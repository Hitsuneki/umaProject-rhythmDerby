import { motion } from 'framer-motion';
import { formatCombo } from '@/lib/formatters';

interface ComboDisplayProps {
  combo: number;
  maxCombo?: number;
  className?: string;
}

export function ComboDisplay({ combo, maxCombo = 999, className = '' }: ComboDisplayProps) {
  const percentage = Math.min((combo / maxCombo) * 100, 100);

  return (
    <div className={`hud-element ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="hud-label">COMBO</span>
        <motion.span 
          key={combo}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="hud-value"
        >
          {formatCombo(combo)}
        </motion.span>
      </div>
      <div className="progress-bar h-2">
        <motion.div
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.2 }}
          className="progress-bar-fill"
          style={{ background: 'var(--accent-primary)' }}
        />
      </div>
    </div>
  );
}