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
  color = 'var(--accent)',
  showValue = true 
}: StatBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-display uppercase tracking-wider text-(--grey-dark)">
          {label}
        </span>
        {showValue && (
          <span className="stat-mono text-sm font-semibold text-(--charcoal)">
            {value}/{maxValue}
          </span>
        )}
      </div>
      <div className="h-2 bg-(--grey-light) rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}