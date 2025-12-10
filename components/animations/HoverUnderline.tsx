import { motion } from 'framer-motion';

interface HoverUnderlineProps {
  color?: string;
  height?: string;
  duration?: number;
}

export function HoverUnderline({ 
  color = 'bg-cyan-600/60', 
  height = 'h-0.5',
  duration = 0.25 
}: HoverUnderlineProps) {
  return (
    <motion.div
      className={`absolute bottom-0 left-0 ${height} ${color}`}
      initial={{ width: 0 }}
      whileHover={{ width: '100%' }}
      transition={{ duration, ease: 'easeOut' }}
    />
  );
}
