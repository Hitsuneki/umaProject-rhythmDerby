import { motion } from 'framer-motion';

interface StatusBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  showValue?: boolean;
  animated?: boolean;
}

export function StatusBar({ 
  label, 
  value, 
  maxValue = 100, 
  color = 'primary',
  showValue = true,
  animated = true
}: StatusBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  const colorClasses = {
    primary: 'from-blue-600 to-blue-500',
    secondary: 'from-red-600 to-red-500',
    success: 'from-green-600 to-green-500',
    warning: 'from-yellow-600 to-yellow-500',
    danger: 'from-red-600 to-red-500',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="tech-label text-gray-700">{label}</span>
        {showValue && (
          <span className="tech-mono text-sm text-gray-900 font-medium">
            {value}/{maxValue}
          </span>
        )}
      </div>
      <div className="status-bar h-3 bg-gray-100 border border-gray-200">
        <motion.div
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 0.8 : 0, ease: 'easeOut' }}
          className={`status-bar-fill bg-gradient-to-r ${colorClasses[color]} h-full`}
        />
      </div>
    </div>
  );
}
