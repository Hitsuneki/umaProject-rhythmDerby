import { motion } from 'framer-motion';

interface DataStreamProps {
  className?: string;
  segments?: number;
}

export function DataStream({ className = '', segments = 3 }: DataStreamProps) {
  const streamSegments = Array.from({ length: segments }, (_, i) => ({
    id: i,
    height: `h-${32 - i * 8}`,
    opacity: 60 - i * 20,
    duration: 6 - i * 1,
    delay: i * 1.5
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {streamSegments.map((segment) => (
        <motion.div
          key={segment.id}
          className={`absolute w-full ${segment.height} bg-gradient-to-b from-transparent via-cyan-600/${segment.opacity} to-transparent`}
          animate={{
            y: ['-100%', '400%'],
          }}
          transition={{
            duration: segment.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: segment.delay
          }}
        />
      ))}
    </div>
  );
}
