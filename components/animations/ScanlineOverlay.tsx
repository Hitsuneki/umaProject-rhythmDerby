import { motion } from 'framer-motion';

interface ScanlineOverlayProps {
  duration?: number;
  delay?: number;
  opacity?: number;
  color?: string;
}

export function ScanlineOverlay({ 
  duration = 4, 
  delay = 2, 
  opacity = 0.2,
  color = 'cyan-400'
}: ScanlineOverlayProps) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-10"
      initial={{ y: '-100%' }}
      animate={{ y: '100%' }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
        repeatDelay: delay
      }}
    >
      <div 
        className={`w-full h-px bg-gradient-to-r from-transparent via-${color}/${Math.round(opacity * 100)} to-transparent`}
      />
    </motion.div>
  );
}
