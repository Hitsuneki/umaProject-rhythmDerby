import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatProgressBarProps {
  label: string;
  value: number;
  maxValue?: number;
  icon?: ReactNode;
  color?: 'cyan' | 'green' | 'orange' | 'yellow' | 'purple' | 'red';
  delay?: number;
}

export function StatProgressBar({
  label,
  value,
  maxValue = 100,
  icon,
  color = 'cyan',
  delay = 0
}: StatProgressBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  const colorClasses = {
    cyan: 'bg-cyan-600',
    green: 'bg-green-600',
    orange: 'bg-orange-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
    red: 'bg-red-600'
  };

  const iconColorClasses = {
    cyan: 'text-cyan-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    red: 'text-red-600'
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-6 h-6 flex items-center justify-center">
            <span className={iconColorClasses[color]}>{icon}</span>
          </div>
        )}
        <span className="font-mono text-sm font-bold uppercase tracking-wide text-gray-700">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-32 h-2 bg-gray-200 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, delay }}
            className={`h-full ${colorClasses[color]}`}
          />
        </div>
        <span className="font-mono text-sm font-bold text-gray-900 w-12 text-right">
          {value}/{maxValue}
        </span>
      </div>
    </div>
  );
}
