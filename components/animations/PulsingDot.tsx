import { motion } from 'framer-motion';

interface PulsingDotProps {
  color: 'green' | 'cyan' | 'blue' | 'yellow' | 'red';
  delay?: number;
  duration?: number;
}

export function PulsingDot({ color, delay = 0, duration = 2.5 }: PulsingDotProps) {
  const colorClasses = {
    green: 'bg-green-500',
    cyan: 'bg-cyan-500',
    blue: 'bg-blue-500```tsx:components/animations/PulsingDot.tsx
import { motion } from 'framer-motion';

interface PulsingDotProps {
  color: 'green' | 'cyan' | 'blue' | 'yellow' | 'red';
  delay?: number;
  duration?: number;
}

export function PulsingDot({ color, delay = 0, duration = 2.5 }: PulsingDotProps) {
  const colorClasses = {
    green: 'bg-green-500',
    cyan: 'bg-cyan-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <motion.div 
      className={`w-2 h-2 ${colorClasses[color]}`}
      animate={{ 
        scale: [0.9, 1.1, 0.9],
        opacity: [0.6, 1, 0.6] 
      }}
      transition={{ 
        duration, 
        repeat: Infinity,
        ease: 'easeInOut',
        delay
      }}
    />
  );
}
