import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export function Card({ 
  children, 
  className = '', 
  hover = false,
  selected = false,
  onClick 
}: CardProps) {
  const baseClass = selected ? 'card-selected' : 'card';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={hover && !selected ? { y: -2 } : {}}
      className={`${baseClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}