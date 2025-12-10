import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface TransitionWrapperProps {
  children: ReactNode;
  transitionKey: string | number;
  duration?: number;
  className?: string;
}

export function TransitionWrapper({ 
  children, 
  transitionKey, 
  duration = 0.25,
  className = ''
}: TransitionWrapperProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration, ease: 'easeInOut' }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
