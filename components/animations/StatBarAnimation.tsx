import { motion } from 'framer-motion';

interface StatBarAnimationProps {
  value: number;
  maxValue?: number;
  delay?: number;
  duration?: number;
  color?: string;
  className?: string;
}

export function StatBarAnimation({ 
  value, 
  maxValue = 100, 
  delay = 0, 
  duration = 0.8,
  color = 'bg-cyan-600',
  className = 'w-32 h-2'
}: StatBarAnimationProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className={`${className} bg-gray-300 border border-gray-400 overflow-hidden`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration, delay, ease: 'easeOut' }}
        className={`h-full ${color}`}
      />
    </div>
  );
}
