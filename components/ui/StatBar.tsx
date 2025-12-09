import { motion } from 'framer-motion';

interface StatBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
  showValue?: boolean;
}

export function StatBar({ 
  label, 
  value, 
  maxValue = 100, 
  color = 'var(--accent-primary)',
  showValue = true 
}: StatBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className="stat-bar">
      <span className="stat-bar-label">{label}</span>
      <div className="stat-bar-track">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ 
            height: '100%', 
            background: color,
            borderRadius: 'var(--radius-sm)'
          }}
        />
      </div>
      {showValue && (
        <span className="stat-bar-value">{value}</span>
      )}
    </div>
  );
}