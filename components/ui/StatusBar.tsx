import { motion } from 'framer-motion';

interface StatusBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  showValue?: boolean;
  className?: string;
}

export function StatusBar({ 
  label, 
  value, 
  maxValue = 100, 
  color = 'primary',
  showValue = true,
  className = '' 
}: StatusBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  const colorClasses = {
    primary: 'bg-cyan-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600',
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="label text-xs">{label}</span>
        {showValue && (
          <span className="text-mono text-xs text-gray-600">
            {value}/{maxValue}
          </span>
        )}
      </div>
      <div className="progress">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`progress-bar ${colorClasses[color]}`}
        />
      </div>
    </div>
  );
}
