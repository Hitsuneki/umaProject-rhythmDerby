import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  color?: string;
  showValue?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  color = 'var(--accent-primary)',
  showValue = false,
  label,
  className = '' 
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="tech-label">{label}</span>}
          {showValue && (
            <span className="tech-mono text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className="progress-bar">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="progress-bar-fill"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}