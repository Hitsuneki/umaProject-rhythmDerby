import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatBarProps {
  label: string;
  value: number;
  maxValue?: number;
  icon?: ReactNode;
  color?: 'cyan' | 'green' | 'orange' | 'purple' | 'red';
  showValue?: boolean;
}

export function StatBar({
  label,
  value,
  maxValue = 100,
  icon,
  color = 'cyan',
  showValue = true
}: StatBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  const colorClasses = {
    cyan: 'bg-cyan-600',
    green: 'bg-green-600',
    orange: 'bg-orange-600',
    purple: 'bg-purple-600',
    red: 'bg-red-600'
  };

  const iconColorClasses = {
    cyan: 'text-cyan-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
    red: 'text-red-600'
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className={iconColorClasses[color]}>{icon}</span>}
          <span className="font-mono text-xs font-bold uppercase tracking-wide text-gray-700">
            {label}
          </span>
        </div>
        {showValue && (
          <span className="font-mono text-sm font-bold text-gray-900">
            {value}/{maxValue}
          </span>
        )}
      </div>
      <div className="h-2 bg-gray-200 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full ${colorClasses[color]}`}
        />
      </div>
    </div>
  );
}
